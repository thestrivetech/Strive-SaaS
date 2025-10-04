import { type NeighborhoodInsight, type InsertNeighborhoodInsight } from "@shared/schema";
import { db } from "./db";
import { neighborhoodInsights } from "@shared/schema";
import { eq, sql } from "drizzle-orm";

export interface IStorage {
  getNeighborhoodInsights(areaCode?: string): Promise<NeighborhoodInsight[]>;
  getNeighborhoodInsightByAreaCode(areaCode: string): Promise<NeighborhoodInsight | undefined>;
  createNeighborhoodInsight(insight: InsertNeighborhoodInsight): Promise<NeighborhoodInsight>;
}

export class DbStorage implements IStorage {
  async getNeighborhoodInsights(areaCode?: string): Promise<NeighborhoodInsight[]> {
    if (areaCode) {
      return await db
        .select()
        .from(neighborhoodInsights)
        .where(eq(neighborhoodInsights.areaCode, areaCode));
    }
    return await db.select().from(neighborhoodInsights);
  }

  async getNeighborhoodInsightByAreaCode(areaCode: string): Promise<NeighborhoodInsight | undefined> {
    const results = await db
      .select()
      .from(neighborhoodInsights)
      .where(eq(neighborhoodInsights.areaCode, areaCode))
      .limit(1);
    return results[0];
  }

  async createNeighborhoodInsight(insight: InsertNeighborhoodInsight): Promise<NeighborhoodInsight> {
    const result = await db
      .insert(neighborhoodInsights)
      .values(insight)
      .returning();
    return result[0];
  }
}

export const storage = new DbStorage();
