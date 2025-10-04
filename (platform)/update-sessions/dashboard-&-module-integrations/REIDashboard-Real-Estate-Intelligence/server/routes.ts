import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertNeighborhoodInsightSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  app.get("/api/v1/reid/insights", async (req, res) => {
    try {
      const areaCode = req.query.area as string | undefined;
      const insights = await storage.getNeighborhoodInsights(areaCode);
      res.json({ data: insights });
    } catch (error) {
      console.error("Error fetching insights:", error);
      res.status(500).json({ error: "Failed to fetch insights" });
    }
  });

  app.get("/api/v1/reid/insights/:areaCode", async (req, res) => {
    try {
      const { areaCode } = req.params;
      const insight = await storage.getNeighborhoodInsightByAreaCode(areaCode);
      
      if (!insight) {
        return res.status(404).json({ error: "Insight not found" });
      }
      
      res.json({ data: insight });
    } catch (error) {
      console.error("Error fetching insight:", error);
      res.status(500).json({ error: "Failed to fetch insight" });
    }
  });

  app.post("/api/v1/reid/insights", async (req, res) => {
    try {
      const validatedData = insertNeighborhoodInsightSchema.parse(req.body);
      const newInsight = await storage.createNeighborhoodInsight(validatedData);
      res.status(201).json({ data: newInsight });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid data", details: error.errors });
      }
      console.error("Error creating insight:", error);
      res.status(500).json({ error: "Failed to create insight" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
