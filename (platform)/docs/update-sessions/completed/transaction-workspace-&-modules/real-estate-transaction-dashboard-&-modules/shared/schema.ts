import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, timestamp, boolean, decimal } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const loops = pgTable("loops", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  propertyAddress: text("property_address").notNull(),
  transactionType: text("transaction_type").notNull(),
  status: text("status").notNull().default('draft'),
  listingPrice: decimal("listing_price", { precision: 12, scale: 2 }),
  closingDate: text("closing_date"),
  progress: integer("progress").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const documents = pgTable("documents", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  loopId: varchar("loop_id").notNull().references(() => loops.id, { onDelete: 'cascade' }),
  name: text("name").notNull(),
  type: text("type").notNull(),
  size: text("size").notNull(),
  version: integer("version").notNull().default(1),
  uploadedBy: text("uploaded_by").notNull(),
  status: text("status").notNull().default('draft'),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const tasks = pgTable("tasks", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  loopId: varchar("loop_id").notNull().references(() => loops.id, { onDelete: 'cascade' }),
  title: text("title").notNull(),
  description: text("description"),
  completed: boolean("completed").notNull().default(false),
  assigneeName: text("assignee_name"),
  dueDate: text("due_date"),
  priority: text("priority").notNull().default('medium'),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const parties = pgTable("parties", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  loopId: varchar("loop_id").notNull().references(() => loops.id, { onDelete: 'cascade' }),
  name: text("name").notNull(),
  role: text("role").notNull(),
  email: text("email").notNull(),
  phone: text("phone"),
  permissions: text("permissions").array().notNull().default(sql`ARRAY[]::text[]`),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const milestones = pgTable("milestones", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  loopId: varchar("loop_id").notNull().references(() => loops.id, { onDelete: 'cascade' }),
  title: text("title").notNull(),
  date: text("date").notNull(),
  completed: boolean("completed").notNull().default(false),
  description: text("description"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const activities = pgTable("activities", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  loopId: varchar("loop_id").references(() => loops.id, { onDelete: 'cascade' }),
  type: text("type").notNull(),
  userName: text("user_name").notNull(),
  action: text("action").notNull(),
  target: text("target").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).omit({ id: true });
export const insertLoopSchema = createInsertSchema(loops).omit({ id: true, createdAt: true, updatedAt: true });
export const insertDocumentSchema = createInsertSchema(documents).omit({ id: true, createdAt: true, updatedAt: true });
export const insertTaskSchema = createInsertSchema(tasks).omit({ id: true, createdAt: true, updatedAt: true });
export const insertPartySchema = createInsertSchema(parties).omit({ id: true, createdAt: true });
export const insertMilestoneSchema = createInsertSchema(milestones).omit({ id: true, createdAt: true });
export const insertActivitySchema = createInsertSchema(activities).omit({ id: true, createdAt: true });

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertLoop = z.infer<typeof insertLoopSchema>;
export type Loop = typeof loops.$inferSelect;

export type InsertDocument = z.infer<typeof insertDocumentSchema>;
export type Document = typeof documents.$inferSelect;

export type InsertTask = z.infer<typeof insertTaskSchema>;
export type Task = typeof tasks.$inferSelect;

export type InsertParty = z.infer<typeof insertPartySchema>;
export type Party = typeof parties.$inferSelect;

export type InsertMilestone = z.infer<typeof insertMilestoneSchema>;
export type Milestone = typeof milestones.$inferSelect;

export type InsertActivity = z.infer<typeof insertActivitySchema>;
export type Activity = typeof activities.$inferSelect;
