import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertEventSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Get all events
  app.get("/api/events", async (req, res) => {
    try {
      const { search, type, relation } = req.query;
      
      let events;
      if (search) {
        events = await storage.searchEvents(search as string);
      } else if (type || relation) {
        events = await storage.filterEvents(type as string, relation as string);
      } else {
        events = await storage.getAllEvents();
      }
      
      res.json(events);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch events" });
    }
  });

  // Get single event
  app.get("/api/events/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const event = await storage.getEvent(id);
      
      if (!event) {
        return res.status(404).json({ message: "Event not found" });
      }
      
      res.json(event);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch event" });
    }
  });

  // Create new event
  app.post("/api/events", async (req, res) => {
    try {
      const validatedData = insertEventSchema.parse(req.body);
      const event = await storage.createEvent(validatedData);
      res.status(201).json(event);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid event data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create event" });
    }
  });

  // Update event
  app.put("/api/events/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = insertEventSchema.partial().parse(req.body);
      const event = await storage.updateEvent(id, validatedData);
      
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

  // Delete event
  app.delete("/api/events/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteEvent(id);
      
      if (!success) {
        return res.status(404).json({ message: "Event not found" });
      }
      
      res.json({ message: "Event deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete event" });
    }
  });

  // Get event statistics
  app.get("/api/events/stats", async (req, res) => {
    try {
      const events = await storage.getAllEvents();
      const now = new Date();
      
      const thisWeekEnd = new Date(now);
      thisWeekEnd.setDate(now.getDate() + 7);
      
      const thisMonthEnd = new Date(now);
      thisMonthEnd.setMonth(now.getMonth() + 1);
      
      const upcomingThisWeek = events.filter(event => {
        const eventDate = new Date(event.eventDate);
        return eventDate >= now && eventDate <= thisWeekEnd;
      }).length;
      
      const upcomingThisMonth = events.filter(event => {
        const eventDate = new Date(event.eventDate);
        return eventDate >= now && eventDate <= thisMonthEnd;
      }).length;
      
      const totalEvents = events.length;
      const birthdayCount = events.filter(event => event.eventType === 'birthday').length;
      const anniversaryCount = events.filter(event => event.eventType === 'anniversary').length;
      
      res.json({
        upcomingThisWeek,
        upcomingThisMonth,
        totalEvents,
        birthdayCount,
        anniversaryCount
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch statistics" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
