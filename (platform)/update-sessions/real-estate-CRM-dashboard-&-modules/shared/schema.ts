import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, integer, decimal, boolean, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const leads = pgTable("leads", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  email: text("email").notNull(),
  phone: text("phone").notNull(),
  avatar: text("avatar"),
  score: text("score").notNull(),
  source: text("source").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  agentId: varchar("agent_id"),
  agentName: text("agent_name"),
  agentAvatar: text("agent_avatar"),
  phase: text("phase").notNull().default('new_lead'),
  lastContact: timestamp("last_contact").notNull().defaultNow(),
  nextReminder: timestamp("next_reminder"),
  value: text("value"),
  isClient: boolean("is_client").default(false),
  closedDate: timestamp("closed_date"),
});

export const contacts = pgTable("contacts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  email: text("email").notNull(),
  phone: text("phone").notNull(),
  avatar: text("avatar"),
  company: text("company"),
  role: text("role"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  agentId: varchar("agent_id"),
  agentName: text("agent_name"),
  agentAvatar: text("agent_avatar"),
  isClient: boolean("is_client").default(false),
  closedDate: timestamp("closed_date"),
});

export const deals = pgTable("deals", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  value: decimal("value", { precision: 12, scale: 2 }).notNull(),
  stage: text("stage").notNull(),
  contactName: text("contact_name").notNull(),
  contactAvatar: text("contact_avatar"),
  agentId: varchar("agent_id"),
  agentName: text("agent_name"),
  agentAvatar: text("agent_avatar"),
  closingDate: timestamp("closing_date"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  probability: integer("probability"),
  notes: text("notes"),
});

export const listings = pgTable("listings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  address: text("address").notNull(),
  city: text("city").notNull(),
  state: text("state").notNull(),
  price: decimal("price", { precision: 12, scale: 2 }).notNull(),
  bedrooms: integer("bedrooms").notNull(),
  bathrooms: decimal("bathrooms", { precision: 3, scale: 1 }).notNull(),
  sqft: integer("sqft").notNull(),
  status: text("status").notNull(),
  image: text("image"),
  type: text("type").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  agentId: varchar("agent_id"),
  agentName: text("agent_name"),
  agentAvatar: text("agent_avatar"),
});

export const activities = pgTable("activities", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  type: text("type").notNull(),
  title: text("title").notNull(),
  description: text("description"),
  timestamp: timestamp("timestamp").notNull().defaultNow(),
  agentId: varchar("agent_id"),
  agentName: text("agent_name"),
  agentAvatar: text("agent_avatar"),
  relatedEntityType: text("related_entity_type"),
  relatedEntityId: varchar("related_entity_id"),
});

export const followUps = pgTable("follow_ups", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  leadId: varchar("lead_id"),
  contactId: varchar("contact_id"),
  type: text("type").notNull(),
  title: text("title").notNull(),
  description: text("description"),
  scheduledDate: timestamp("scheduled_date").notNull(),
  recurring: text("recurring"),
  completed: boolean("completed").default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const notes = pgTable("notes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  leadId: varchar("lead_id"),
  contactId: varchar("contact_id"),
  dealId: varchar("deal_id"),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  createdBy: text("created_by").notNull(),
});

export const analytics = pgTable("analytics", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  date: timestamp("date").notNull(),
  newLeads: integer("new_leads").default(0),
  pipelineValue: decimal("pipeline_value", { precision: 12, scale: 2 }).default('0'),
  conversionRate: decimal("conversion_rate", { precision: 5, scale: 2 }).default('0'),
  dealsClosed: integer("deals_closed").default(0),
  revenueBySource: jsonb("revenue_by_source"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const agents = pgTable("agents", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  email: text("email").notNull(),
  avatar: text("avatar"),
  deals: integer("deals").default(0),
  revenue: decimal("revenue", { precision: 12, scale: 2 }).default('0'),
  conversion: decimal("conversion", { precision: 5, scale: 2 }).default('0'),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const calendarEvents = pgTable("calendar_events", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  description: text("description"),
  startTime: timestamp("start_time").notNull(),
  endTime: timestamp("end_time").notNull(),
  type: text("type").notNull(),
  agentId: varchar("agent_id"),
  agentName: text("agent_name"),
  relatedEntityType: text("related_entity_type"),
  relatedEntityId: varchar("related_entity_id"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({ id: true });
export const insertLeadSchema = createInsertSchema(leads).omit({ id: true, createdAt: true }).extend({
  lastContact: z.string().datetime().optional(),
  isClient: z.boolean().optional(),
});
export const insertContactSchema = createInsertSchema(contacts).omit({ id: true, createdAt: true });
export const insertDealSchema = createInsertSchema(deals).omit({ id: true, createdAt: true });
export const insertListingSchema = createInsertSchema(listings).omit({ id: true, createdAt: true });
export const insertActivitySchema = createInsertSchema(activities).omit({ id: true, timestamp: true });
export const insertFollowUpSchema = createInsertSchema(followUps).omit({ id: true, createdAt: true });
export const insertNoteSchema = createInsertSchema(notes).omit({ id: true, createdAt: true });
export const insertAnalyticsSchema = createInsertSchema(analytics).omit({ id: true, createdAt: true });
export const insertAgentSchema = createInsertSchema(agents).omit({ id: true, createdAt: true });
export const insertCalendarEventSchema = createInsertSchema(calendarEvents).omit({ id: true, createdAt: true });

// Types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertLead = z.infer<typeof insertLeadSchema>;
export type Lead = typeof leads.$inferSelect;

export type InsertContact = z.infer<typeof insertContactSchema>;
export type Contact = typeof contacts.$inferSelect;

export type InsertDeal = z.infer<typeof insertDealSchema>;
export type Deal = typeof deals.$inferSelect;

export type InsertListing = z.infer<typeof insertListingSchema>;
export type Listing = typeof listings.$inferSelect;

export type InsertActivity = z.infer<typeof insertActivitySchema>;
export type Activity = typeof activities.$inferSelect;

export type InsertFollowUp = z.infer<typeof insertFollowUpSchema>;
export type FollowUp = typeof followUps.$inferSelect;

export type InsertNote = z.infer<typeof insertNoteSchema>;
export type Note = typeof notes.$inferSelect;

export type InsertAnalytics = z.infer<typeof insertAnalyticsSchema>;
export type Analytics = typeof analytics.$inferSelect;

export type InsertAgent = z.infer<typeof insertAgentSchema>;
export type Agent = typeof agents.$inferSelect;

export type InsertCalendarEvent = z.infer<typeof insertCalendarEventSchema>;
export type CalendarEvent = typeof calendarEvents.$inferSelect;
