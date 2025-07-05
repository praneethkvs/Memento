import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertEventSchema } from "@shared/schema";
import { z } from "zod";
import { getNextOccurrence } from "./date-utils";
import { setupAuth, isAuthenticated } from "./replitAuth";

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
      
      const thisWeekEnd = new Date(now);
      thisWeekEnd.setDate(now.getDate() + 7);
      
      const thisMonthEnd = new Date(now);
      thisMonthEnd.setMonth(now.getMonth() + 1);
      
      const upcomingThisWeek = events.filter(event => {
        const nextOccurrence = getNextOccurrence(event.monthDay);
        return nextOccurrence >= now && nextOccurrence <= thisWeekEnd;
      }).length;
      
      const upcomingThisMonth = events.filter(event => {
        const nextOccurrence = getNextOccurrence(event.monthDay);
        return nextOccurrence >= now && nextOccurrence <= thisMonthEnd;
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

  const httpServer = createServer(app);
  return httpServer;
}
