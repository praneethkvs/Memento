import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertEventSchema, insertEventMessageSchema } from "@shared/schema";
import { z } from "zod";
import { getNextOccurrence } from "./date-utils";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { generateGreetingMessage } from "./gemini";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });
  // Get all events (protected)
  app.get("/api/events", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { search, type, relation } = req.query;
      
      let events;
      if (search) {
        events = await storage.searchEvents(search as string, userId);
      } else if (type || relation) {
        events = await storage.filterEvents(type as string, relation as string, userId);
      } else {
        events = await storage.getAllEvents(userId);
      }
      
      res.json(events);
    } catch (error) {
      console.error("Error fetching events:", error);
      res.status(500).json({ message: "Failed to fetch events" });
    }
  });

  // Get event statistics (protected)
  app.get("/api/events/stats", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const events = await storage.getAllEvents(userId);
      const now = new Date();
      
      // Set to start of day for accurate date comparisons
      const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      
      const thisWeekEnd = new Date(todayStart);
      thisWeekEnd.setDate(todayStart.getDate() + 7);
      
      const thisMonthEnd = new Date(todayStart);
      thisMonthEnd.setMonth(todayStart.getMonth() + 1);
      
      const upcomingThisWeek = events.filter(event => {
        const nextOccurrence = getNextOccurrence(event.monthDay);
        // Set to start of day for consistent comparison
        const nextStart = new Date(nextOccurrence.getFullYear(), nextOccurrence.getMonth(), nextOccurrence.getDate());
        return nextStart >= todayStart && nextStart < thisWeekEnd;
      }).length;
      
      const upcomingThisMonth = events.filter(event => {
        const nextOccurrence = getNextOccurrence(event.monthDay);
        // Set to start of day for consistent comparison
        const nextStart = new Date(nextOccurrence.getFullYear(), nextOccurrence.getMonth(), nextOccurrence.getDate());
        return nextStart >= todayStart && nextStart < thisMonthEnd;
      }).length;
      
      const totalEvents = events.length;
      const birthdayCount = events.filter(event => event.eventType === 'birthday').length;
      const anniversaryCount = events.filter(event => event.eventType === 'anniversary').length;
      const otherCount = events.filter(event => event.eventType === 'other').length;
      
      res.json({
        upcomingThisWeek,
        upcomingThisMonth,
        totalEvents,
        birthdayCount,
        anniversaryCount,
        otherCount
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch statistics" });
    }
  });

  // Get single event (protected)
  app.get("/api/events/:id", isAuthenticated, async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      const userId = req.user.claims.sub;
      const event = await storage.getEvent(id, userId);
      
      if (!event) {
        return res.status(404).json({ message: "Event not found" });
      }
      
      res.json(event);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch event" });
    }
  });

  // Create new event (protected)
  app.post("/api/events", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const validatedData = insertEventSchema.parse(req.body);
      const event = await storage.createEvent(validatedData, userId);
      res.status(201).json(event);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid event data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create event" });
    }
  });

  // Update event (protected)
  app.put("/api/events/:id", isAuthenticated, async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      const userId = req.user.claims.sub;
      const validatedData = insertEventSchema.partial().parse(req.body);
      const event = await storage.updateEvent(id, validatedData, userId);
      
      if (!event) {
        return res.status(404).json({ message: "Event not found" });
      }
      
      res.json(event);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid event data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update event" });
    }
  });

  // Delete event (protected)
  app.delete("/api/events/:id", isAuthenticated, async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      const userId = req.user.claims.sub;
      const success = await storage.deleteEvent(id, userId);
      
      if (!success) {
        return res.status(404).json({ message: "Event not found" });
      }
      
      res.json({ message: "Event deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete event" });
    }
  });

  // Message generation routes
  
  // Get existing message for event
  app.get("/api/events/:id/message", isAuthenticated, async (req: any, res) => {
    try {
      const eventId = parseInt(req.params.id);
      const userId = req.user.claims.sub;
      
      const message = await storage.getEventMessage(eventId, userId);
      if (message) {
        res.json(message);
      } else {
        res.status(404).json({ message: "No message found" });
      }
    } catch (error) {
      console.error("Error fetching message:", error);
      res.status(500).json({ message: "Failed to fetch message" });
    }
  });
  
  // Generate message for event
  app.post("/api/events/:id/generate-message", isAuthenticated, async (req: any, res) => {
    try {
      const eventId = parseInt(req.params.id);
      const userId = req.user.claims.sub;
      const { tone, length } = req.body;
      
      // Validate tone and length
      const messageSchema = z.object({
        tone: z.enum(['cheerful', 'heartfelt', 'funny', 'formal']),
        length: z.enum(['short', 'medium', 'long'])
      });
      
      const validatedData = messageSchema.parse({ tone, length });
      
      // Get the event
      const event = await storage.getEvent(eventId, userId);
      if (!event) {
        return res.status(404).json({ message: "Event not found" });
      }
      
      // Calculate age for the message
      let age = null;
      if (event.hasYear && event.eventYear) {
        const currentYear = new Date().getFullYear();
        if (event.eventType === 'birthday') {
          age = currentYear - event.eventYear;
        } else if (event.eventType === 'anniversary') {
          age = currentYear - event.eventYear + 1; // +1 because first anniversary is year 1
        }
      }
      
      // Generate the message using Gemini
      const generatedMessage = await generateGreetingMessage(
        event.personName,
        event.eventType,
        event.relation,
        age,
        validatedData.tone,
        validatedData.length
      );
      
      // Store or update the message
      const existingMessage = await storage.getEventMessage(eventId, userId);
      let savedMessage;
      
      if (existingMessage) {
        savedMessage = await storage.updateEventMessage(eventId, {
          message: generatedMessage,
          tone: validatedData.tone,
          length: validatedData.length
        }, userId);
      } else {
        savedMessage = await storage.createEventMessage(eventId, {
          message: generatedMessage,
          tone: validatedData.tone,
          length: validatedData.length
        }, userId);
      }
      
      res.json(savedMessage);
    } catch (error) {
      console.error('Error generating message:', error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid message options", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to generate message" });
    }
  });
  
  // Get message for event
  app.get("/api/events/:id/message", isAuthenticated, async (req: any, res) => {
    try {
      const eventId = parseInt(req.params.id);
      const userId = req.user.claims.sub;
      
      const message = await storage.getEventMessage(eventId, userId);
      if (!message) {
        return res.status(404).json({ message: "Message not found" });
      }
      
      res.json(message);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch message" });
    }
  });
  
  // Delete message for event
  app.delete("/api/events/:id/message", isAuthenticated, async (req: any, res) => {
    try {
      const eventId = parseInt(req.params.id);
      const userId = req.user.claims.sub;
      
      const success = await storage.deleteEventMessage(eventId, userId);
      if (!success) {
        return res.status(404).json({ message: "Message not found" });
      }
      
      res.json({ message: "Message deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete message" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
