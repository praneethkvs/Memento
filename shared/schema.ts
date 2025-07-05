import { pgTable, text, serial, integer, boolean, date } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const events = pgTable("events", {
  id: serial("id").primaryKey(),
  personName: text("person_name").notNull(),
  eventType: text("event_type").notNull(), // 'birthday' or 'anniversary'
  eventDate: date("event_date").notNull(),
  relation: text("relation").notNull(), // 'family', 'friend', 'colleague', 'partner', 'other'
  notes: text("notes"),
  reminders: text("reminders").array(), // Array of reminder days like ['7', '3', '1']
});

export const insertEventSchema = createInsertSchema(events).pick({
  personName: true,
  eventType: true,
  eventDate: true,
  relation: true,
  notes: true,
  reminders: true,
}).extend({
  eventType: z.enum(['birthday', 'anniversary']),
  relation: z.enum(['family', 'friend', 'colleague', 'partner', 'other']),
  reminders: z.array(z.string()).optional().default([]),
});

export type InsertEvent = z.infer<typeof insertEventSchema>;
export type Event = typeof events.$inferSelect;
