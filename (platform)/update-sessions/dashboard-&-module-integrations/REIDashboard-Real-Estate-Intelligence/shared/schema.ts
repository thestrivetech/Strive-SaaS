import { sql } from "drizzle-orm";
import { pgTable, text, varchar, json, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const neighborhoodInsights = pgTable("neighborhood_insights", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  areaCode: text("area_code").notNull(),
  metrics: json("metrics").$type<{
    medianPrice: number;
    daysOnMarket: number;
    inventory: number;
    priceChange: number;
  }>().notNull(),
  demographics: json("demographics").$type<{
    medianAge: number;
    medianIncome: number;
    households: number;
    avgCommuteTime: number;
  }>().notNull(),
  amenities: json("amenities").$type<{
    schoolRating: number;
    walkScore: number;
    bikeScore: number;
    crimeIndex: number;
    parkProximity: number;
  }>().notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertNeighborhoodInsightSchema = createInsertSchema(neighborhoodInsights).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type NeighborhoodInsight = typeof neighborhoodInsights.$inferSelect;
export type InsertNeighborhoodInsight = z.infer<typeof insertNeighborhoodInsightSchema>;
