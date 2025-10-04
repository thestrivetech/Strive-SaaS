import { sql } from "drizzle-orm";
import { pgTable, text, varchar, jsonb, timestamp, integer, real, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  firstName: text("first_name"),
  lastName: text("last_name"),
  email: text("email"),
  role: text("role").default("user"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const dashboardSettings = pgTable("dashboard_settings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  layout: jsonb("layout"),
  theme: text("theme").default("dark"),
  accentColor: text("accent_color").default("#00D2FF"),
  favorites: jsonb("favorites").default("[]"),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const kpiMetrics = pgTable("kpi_metrics", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  value: text("value").notNull(),
  change: real("change").default(0),
  changeType: text("change_type").default("percentage"), // percentage, absolute
  icon: text("icon"),
  color: text("color").default("#00D2FF"),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const activities = pgTable("activities", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id),
  type: text("type").notNull(), // deal_closed, lead_added, payment_received, etc.
  title: text("title").notNull(),
  description: text("description"),
  icon: text("icon"),
  color: text("color").default("#00D2FF"),
  amount: text("amount"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const leads = pgTable("leads", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  email: text("email"),
  phone: text("phone"),
  source: text("source"),
  status: text("status").default("new"),
  priority: text("priority").default("medium"),
  assignedTo: varchar("assigned_to").references(() => users.id),
  value: real("value"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const deals = pgTable("deals", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  leadId: varchar("lead_id").references(() => leads.id),
  value: real("value").notNull(),
  status: text("status").default("open"), // open, closed_won, closed_lost
  stage: text("stage").default("qualification"),
  closeProbability: integer("close_probability").default(50),
  expectedCloseDate: timestamp("expected_close_date"),
  actualCloseDate: timestamp("actual_close_date"),
  assignedTo: varchar("assigned_to").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
});

export const notifications = pgTable("notifications", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  title: text("title").notNull(),
  message: text("message"),
  type: text("type").default("info"), // info, warning, error, success
  read: boolean("read").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
});

export const insertDashboardSettingsSchema = createInsertSchema(dashboardSettings).omit({
  id: true,
  updatedAt: true,
});

export const insertKpiMetricSchema = createInsertSchema(kpiMetrics).omit({
  id: true,
  updatedAt: true,
});

export const insertActivitySchema = createInsertSchema(activities).omit({
  id: true,
  createdAt: true,
});

export const insertLeadSchema = createInsertSchema(leads).omit({
  id: true,
  createdAt: true,
});

export const insertDealSchema = createInsertSchema(deals).omit({
  id: true,
  createdAt: true,
});

export const insertNotificationSchema = createInsertSchema(notifications).omit({
  id: true,
  createdAt: true,
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type DashboardSettings = typeof dashboardSettings.$inferSelect;
export type InsertDashboardSettings = z.infer<typeof insertDashboardSettingsSchema>;
export type KpiMetric = typeof kpiMetrics.$inferSelect;
export type InsertKpiMetric = z.infer<typeof insertKpiMetricSchema>;
export type Activity = typeof activities.$inferSelect;
export type InsertActivity = z.infer<typeof insertActivitySchema>;
export type Lead = typeof leads.$inferSelect;
export type InsertLead = z.infer<typeof insertLeadSchema>;
export type Deal = typeof deals.$inferSelect;
export type InsertDeal = z.infer<typeof insertDealSchema>;
export type Notification = typeof notifications.$inferSelect;
export type InsertNotification = z.infer<typeof insertNotificationSchema>;
