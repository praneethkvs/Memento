import {
  pgTable,
  text,
  varchar,
  timestamp,
  jsonb,
  index,
  serial,
  integer,
  boolean,
  date,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table.
// (IMPORTANT) This table is mandatory for Replit Auth, don't drop it.
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table.
// (IMPORTANT) This table is mandatory for Replit Auth, don't drop it.
export const users = pgTable("users", {
  id: varchar("id").primaryKey().notNull(),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const events = pgTable("events", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  personName: text("person_name").notNull(),
  eventType: text("event_type").notNull(), // 'birthday', 'anniversary', or 'other'
  eventDate: date("event_date").notNull(), // Full date (YYYY-MM-DD) - can be partial if year unknown
  monthDay: text("month_day").notNull(), // MM-DD format for yearly reminders
  eventYear: integer("event_year"), // Optional year field
  hasYear: boolean("has_year").notNull().default(true), // Whether the year is known
  relation: text("relation").notNull(), // 'family', 'friend', 'colleague', 'partner', 'other'
  notes: text("notes"),
  reminders: text("reminders").array(), // Array of reminder days like ['30', '15', '7', '3', '1']
});

export const insertEventSchema = createInsertSchema(events).pick({
  personName: true,
  eventType: true,
  eventDate: true,
  monthDay: true,
  eventYear: true,
  hasYear: true,
  relation: true,
  notes: true,
  reminders: true,
}).extend({
  eventType: z.enum(['birthday', 'anniversary', 'other']),
  relation: z.enum(['family', 'friend', 'colleague', 'partner', 'other']),
  reminders: z.array(z.string()).optional().default(['30', '15', '7', '3', '1']),
  hasYear: z.boolean().default(true),
  eventYear: z.number().optional(),
});

export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;
export type InsertEvent = z.infer<typeof insertEventSchema>;
export type Event = typeof events.$inferSelect;
