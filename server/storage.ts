import {
  users,
  events,
  eventMessages,
  type User,
  type UpsertUser,
  type Event,
  type InsertEvent,
  type EventMessage,
  type InsertEventMessage,
} from "@shared/schema";
import { db } from "./db";
import { eq, and, like, or } from "drizzle-orm";

// Interface for storage operations
export interface IStorage {
  // User operations
  // (IMPORTANT) these user operations are mandatory for Replit Auth.
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // Event operations (now user-scoped)
  getEvent(id: number, userId: string): Promise<Event | undefined>;
  getAllEvents(userId: string): Promise<Event[]>;
  createEvent(event: InsertEvent, userId: string): Promise<Event>;
  updateEvent(id: number, event: Partial<InsertEvent>, userId: string): Promise<Event | undefined>;
  deleteEvent(id: number, userId: string): Promise<boolean>;
  searchEvents(query: string, userId: string): Promise<Event[]>;
  filterEvents(type?: string, relation?: string, userId?: string): Promise<Event[]>;
  
  // Message operations
  getEventMessage(eventId: number, userId: string): Promise<EventMessage | undefined>;
  createEventMessage(eventId: number, message: InsertEventMessage, userId: string): Promise<EventMessage>;
  updateEventMessage(eventId: number, message: Partial<InsertEventMessage>, userId: string): Promise<EventMessage | undefined>;
  deleteEventMessage(eventId: number, userId: string): Promise<boolean>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  // (IMPORTANT) these user operations are mandatory for Replit Auth.

  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // Event operations (user-scoped)
  async getEvent(id: number, userId: string): Promise<Event | undefined> {
    const [event] = await db
      .select()
      .from(events)
      .where(and(eq(events.id, id), eq(events.userId, userId)));
    return event;
  }

  async getAllEvents(userId: string): Promise<Event[]> {
    return await db
      .select()
      .from(events)
      .where(eq(events.userId, userId))
      .orderBy(events.monthDay);
  }

  async createEvent(insertEvent: InsertEvent, userId: string): Promise<Event> {
    const [event] = await db
      .insert(events)
      .values({
        ...insertEvent,
        userId,
      })
      .returning();
    return event;
  }

  async updateEvent(id: number, updateData: Partial<InsertEvent>, userId: string): Promise<Event | undefined> {
    const [event] = await db
      .update(events)
      .set(updateData)
      .where(and(eq(events.id, id), eq(events.userId, userId)))
      .returning();
    return event;
  }

  async deleteEvent(id: number, userId: string): Promise<boolean> {
    const result = await db
      .delete(events)
      .where(and(eq(events.id, id), eq(events.userId, userId)));
    return (result.rowCount || 0) > 0;
  }

  async searchEvents(query: string, userId: string): Promise<Event[]> {
    return await db
      .select()
      .from(events)
      .where(
        and(
          eq(events.userId, userId),
          or(
            like(events.personName, `%${query}%`),
            like(events.notes, `%${query}%`)
          )
        )
      )
      .orderBy(events.monthDay);
  }

  async filterEvents(type?: string, relation?: string, userId?: string): Promise<Event[]> {
    if (!userId) return [];
    
    let conditions = [eq(events.userId, userId)];
    
    if (type && type !== 'all') {
      conditions.push(eq(events.eventType, type));
    }
    
    if (relation && relation !== 'all') {
      conditions.push(eq(events.relation, relation));
    }

    return await db
      .select()
      .from(events)
      .where(and(...conditions))
      .orderBy(events.monthDay);
  }

  // Message operations
  async getEventMessage(eventId: number, userId: string): Promise<EventMessage | undefined> {
    const [message] = await db
      .select()
      .from(eventMessages)
      .where(and(
        eq(eventMessages.eventId, eventId),
        eq(eventMessages.userId, userId)
      ))
      .orderBy(eventMessages.createdAt);
    
    return message;
  }

  async createEventMessage(eventId: number, messageData: InsertEventMessage, userId: string): Promise<EventMessage> {
    const [message] = await db
      .insert(eventMessages)
      .values({
        eventId,
        userId,
        ...messageData,
      })
      .returning();
    
    return message;
  }

  async updateEventMessage(eventId: number, messageData: Partial<InsertEventMessage>, userId: string): Promise<EventMessage | undefined> {
    const [message] = await db
      .update(eventMessages)
      .set({
        ...messageData,
        updatedAt: new Date(),
      })
      .where(and(
        eq(eventMessages.eventId, eventId),
        eq(eventMessages.userId, userId)
      ))
      .returning();
    
    return message;
  }

  async deleteEventMessage(eventId: number, userId: string): Promise<boolean> {
    const result = await db
      .delete(eventMessages)
      .where(and(
        eq(eventMessages.eventId, eventId),
        eq(eventMessages.userId, userId)
      ));
    
    return (result.rowCount || 0) > 0;
  }
}

export const storage = new DatabaseStorage();