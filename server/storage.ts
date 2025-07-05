import { events, type Event, type InsertEvent } from "@shared/schema";
import { getNextOccurrence } from "./date-utils";
import { db } from "./db";
import { eq } from "drizzle-orm";

export interface IStorage {
  getEvent(id: number): Promise<Event | undefined>;
  getAllEvents(): Promise<Event[]>;
  createEvent(event: InsertEvent): Promise<Event>;
  updateEvent(id: number, event: Partial<InsertEvent>): Promise<Event | undefined>;
  deleteEvent(id: number): Promise<boolean>;
  searchEvents(query: string): Promise<Event[]>;
  filterEvents(type?: string, relation?: string): Promise<Event[]>;
}

export class MemStorage implements IStorage {
  private events: Map<number, Event>;
  private currentId: number;

  constructor() {
    this.events = new Map();
    this.currentId = 1;
  }

  async getEvent(id: number): Promise<Event | undefined> {
    return this.events.get(id);
  }

  async getAllEvents(): Promise<Event[]> {
    return Array.from(this.events.values()).sort((a, b) => {
      const nextA = getNextOccurrence(a.monthDay);
      const nextB = getNextOccurrence(b.monthDay);
      return nextA.getTime() - nextB.getTime();
    });
  }

  async createEvent(insertEvent: InsertEvent): Promise<Event> {
    const id = this.currentId++;
    const event: Event = { 
      id,
      personName: insertEvent.personName,
      eventType: insertEvent.eventType,
      eventDate: insertEvent.eventDate,
      monthDay: insertEvent.monthDay,
      eventYear: insertEvent.eventYear || null,
      hasYear: insertEvent.hasYear,
      relation: insertEvent.relation,
      notes: insertEvent.notes || null,
      reminders: insertEvent.reminders || ['30', '15', '7', '3', '1']
    };
    this.events.set(id, event);
    return event;
  }

  async updateEvent(id: number, updateData: Partial<InsertEvent>): Promise<Event | undefined> {
    const existingEvent = this.events.get(id);
    if (!existingEvent) return undefined;

    const updatedEvent: Event = { 
      ...existingEvent, 
      ...updateData,
      notes: updateData.notes !== undefined ? updateData.notes || null : existingEvent.notes
    };
    this.events.set(id, updatedEvent);
    return updatedEvent;
  }

  async deleteEvent(id: number): Promise<boolean> {
    return this.events.delete(id);
  }

  async searchEvents(query: string): Promise<Event[]> {
    const allEvents = await this.getAllEvents();
    const searchLower = query.toLowerCase();
    
    return allEvents.filter(event => 
      event.personName.toLowerCase().includes(searchLower) ||
      event.notes?.toLowerCase().includes(searchLower) ||
      event.relation.toLowerCase().includes(searchLower)
    );
  }

  async filterEvents(type?: string, relation?: string): Promise<Event[]> {
    const allEvents = await this.getAllEvents();
    
    return allEvents.filter(event => {
      const matchesType = !type || type === 'all' || event.eventType === type;
      const matchesRelation = !relation || relation === 'all' || event.relation === relation;
      return matchesType && matchesRelation;
    });
  }
}

export class DatabaseStorage implements IStorage {
  async getEvent(id: number): Promise<Event | undefined> {
    const [event] = await db.select().from(events).where(eq(events.id, id));
    return event || undefined;
  }

  async getAllEvents(): Promise<Event[]> {
    const allEvents = await db.select().from(events);
    return allEvents.sort((a, b) => {
      const nextA = getNextOccurrence(a.monthDay);
      const nextB = getNextOccurrence(b.monthDay);
      return nextA.getTime() - nextB.getTime();
    });
  }

  async createEvent(insertEvent: InsertEvent): Promise<Event> {
    const [event] = await db
      .insert(events)
      .values(insertEvent)
      .returning();
    return event;
  }

  async updateEvent(id: number, updateData: Partial<InsertEvent>): Promise<Event | undefined> {
    const [updatedEvent] = await db
      .update(events)
      .set(updateData)
      .where(eq(events.id, id))
      .returning();
    return updatedEvent || undefined;
  }

  async deleteEvent(id: number): Promise<boolean> {
    const result = await db.delete(events).where(eq(events.id, id));
    return result.rowCount > 0;
  }

  async searchEvents(query: string): Promise<Event[]> {
    const allEvents = await db.select().from(events);
    const filtered = allEvents.filter(event => 
      event.personName.toLowerCase().includes(query.toLowerCase()) ||
      event.notes?.toLowerCase().includes(query.toLowerCase())
    );
    return filtered.sort((a, b) => {
      const nextA = getNextOccurrence(a.monthDay);
      const nextB = getNextOccurrence(b.monthDay);
      return nextA.getTime() - nextB.getTime();
    });
  }

  async filterEvents(type?: string, relation?: string): Promise<Event[]> {
    const allEvents = await db.select().from(events);
    const filtered = allEvents.filter(event => {
      let matches = true;
      if (type && event.eventType !== type) {
        matches = false;
      }
      if (relation && event.relation !== relation) {
        matches = false;
      }
      return matches;
    });
    return filtered.sort((a, b) => {
      const nextA = getNextOccurrence(a.monthDay);
      const nextB = getNextOccurrence(b.monthDay);
      return nextA.getTime() - nextB.getTime();
    });
  }
}

export const storage = new MemStorage();
