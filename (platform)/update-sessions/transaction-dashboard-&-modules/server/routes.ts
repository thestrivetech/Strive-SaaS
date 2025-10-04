import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertLoopSchema, insertDocumentSchema, insertTaskSchema, insertPartySchema, insertMilestoneSchema, insertActivitySchema } from "@shared/schema";
import { fromZodError } from "zod-validation-error";

export async function registerRoutes(app: Express): Promise<Server> {
  app.get("/api/loops", async (_req, res) => {
    try {
      const loops = await storage.getLoops();
      res.json(loops);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch loops" });
    }
  });

  app.get("/api/loops/:id", async (req, res) => {
    try {
      const loop = await storage.getLoop(req.params.id);
      if (!loop) {
        return res.status(404).json({ error: "Loop not found" });
      }
      res.json(loop);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch loop" });
    }
  });

  app.post("/api/loops", async (req, res) => {
    try {
      const validated = insertLoopSchema.parse(req.body);
      const loop = await storage.createLoop(validated);
      
      await storage.createActivity({
        loopId: loop.id,
        type: "loop",
        userName: "System",
        action: "created",
        target: loop.propertyAddress,
      });
      
      res.status(201).json(loop);
    } catch (error: any) {
      if (error.name === "ZodError") {
        const validationError = fromZodError(error);
        return res.status(400).json({ error: validationError.message });
      }
      res.status(500).json({ error: "Failed to create loop" });
    }
  });

  app.patch("/api/loops/:id", async (req, res) => {
    try {
      const updated = await storage.updateLoop(req.params.id, req.body);
      if (!updated) {
        return res.status(404).json({ error: "Loop not found" });
      }
      res.json(updated);
    } catch (error) {
      res.status(500).json({ error: "Failed to update loop" });
    }
  });

  app.delete("/api/loops/:id", async (req, res) => {
    try {
      const deleted = await storage.deleteLoop(req.params.id);
      if (!deleted) {
        return res.status(404).json({ error: "Loop not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete loop" });
    }
  });

  app.get("/api/documents", async (req, res) => {
    try {
      const loopId = req.query.loopId as string | undefined;
      const documents = await storage.getDocuments(loopId);
      res.json(documents);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch documents" });
    }
  });

  app.post("/api/documents", async (req, res) => {
    try {
      const validated = insertDocumentSchema.parse(req.body);
      const document = await storage.createDocument(validated);
      
      await storage.createActivity({
        loopId: document.loopId,
        type: "upload",
        userName: document.uploadedBy,
        action: "uploaded",
        target: document.name,
      });
      
      res.status(201).json(document);
    } catch (error: any) {
      if (error.name === "ZodError") {
        const validationError = fromZodError(error);
        return res.status(400).json({ error: validationError.message });
      }
      res.status(500).json({ error: "Failed to create document" });
    }
  });

  app.delete("/api/documents/:id", async (req, res) => {
    try {
      const deleted = await storage.deleteDocument(req.params.id);
      if (!deleted) {
        return res.status(404).json({ error: "Document not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete document" });
    }
  });

  app.get("/api/tasks", async (req, res) => {
    try {
      const loopId = req.query.loopId as string | undefined;
      const tasks = await storage.getTasks(loopId);
      res.json(tasks);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch tasks" });
    }
  });

  app.post("/api/tasks", async (req, res) => {
    try {
      const validated = insertTaskSchema.parse(req.body);
      const task = await storage.createTask(validated);
      res.status(201).json(task);
    } catch (error: any) {
      if (error.name === "ZodError") {
        const validationError = fromZodError(error);
        return res.status(400).json({ error: validationError.message });
      }
      res.status(500).json({ error: "Failed to create task" });
    }
  });

  app.patch("/api/tasks/:id", async (req, res) => {
    try {
      const updated = await storage.updateTask(req.params.id, req.body);
      if (!updated) {
        return res.status(404).json({ error: "Task not found" });
      }
      
      if (req.body.completed !== undefined) {
        await storage.createActivity({
          loopId: updated.loopId,
          type: "task",
          userName: updated.assigneeName || "User",
          action: req.body.completed ? "completed" : "reopened",
          target: updated.title,
        });
      }
      
      res.json(updated);
    } catch (error) {
      res.status(500).json({ error: "Failed to update task" });
    }
  });

  app.delete("/api/tasks/:id", async (req, res) => {
    try {
      const deleted = await storage.deleteTask(req.params.id);
      if (!deleted) {
        return res.status(404).json({ error: "Task not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete task" });
    }
  });

  app.get("/api/parties", async (req, res) => {
    try {
      const loopId = req.query.loopId as string | undefined;
      const parties = await storage.getParties(loopId);
      res.json(parties);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch parties" });
    }
  });

  app.post("/api/parties", async (req, res) => {
    try {
      const validated = insertPartySchema.parse(req.body);
      const party = await storage.createParty(validated);
      
      await storage.createActivity({
        loopId: party.loopId,
        type: "party",
        userName: "System",
        action: "added",
        target: `${party.name} as ${party.role}`,
      });
      
      res.status(201).json(party);
    } catch (error: any) {
      if (error.name === "ZodError") {
        const validationError = fromZodError(error);
        return res.status(400).json({ error: validationError.message });
      }
      res.status(500).json({ error: "Failed to create party" });
    }
  });

  app.delete("/api/parties/:id", async (req, res) => {
    try {
      const deleted = await storage.deleteParty(req.params.id);
      if (!deleted) {
        return res.status(404).json({ error: "Party not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete party" });
    }
  });

  app.get("/api/milestones", async (req, res) => {
    try {
      const loopId = req.query.loopId as string | undefined;
      const milestones = await storage.getMilestones(loopId);
      res.json(milestones);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch milestones" });
    }
  });

  app.post("/api/milestones", async (req, res) => {
    try {
      const validated = insertMilestoneSchema.parse(req.body);
      const milestone = await storage.createMilestone(validated);
      res.status(201).json(milestone);
    } catch (error: any) {
      if (error.name === "ZodError") {
        const validationError = fromZodError(error);
        return res.status(400).json({ error: validationError.message });
      }
      res.status(500).json({ error: "Failed to create milestone" });
    }
  });

  app.patch("/api/milestones/:id", async (req, res) => {
    try {
      const updated = await storage.updateMilestone(req.params.id, req.body);
      if (!updated) {
        return res.status(404).json({ error: "Milestone not found" });
      }
      res.json(updated);
    } catch (error) {
      res.status(500).json({ error: "Failed to update milestone" });
    }
  });

  app.get("/api/activities", async (req, res) => {
    try {
      const loopId = req.query.loopId as string | undefined;
      const activities = await storage.getActivities(loopId);
      res.json(activities);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch activities" });
    }
  });

  app.post("/api/activities", async (req, res) => {
    try {
      const validated = insertActivitySchema.parse(req.body);
      const activity = await storage.createActivity(validated);
      res.status(201).json(activity);
    } catch (error: any) {
      if (error.name === "ZodError") {
        const validationError = fromZodError(error);
        return res.status(400).json({ error: validationError.message });
      }
      res.status(500).json({ error: "Failed to create activity" });
    }
  });

  app.get("/api/analytics", async (_req, res) => {
    try {
      const loops = await storage.getLoops();
      const tasks = await storage.getTasks();
      const parties = await storage.getParties();
      
      const activeCount = loops.filter(l => l.status === 'active' || l.status === 'underContract' || l.status === 'closing').length;
      const pendingSignatures = loops.filter(l => l.status === 'active' || l.status === 'underContract').length * 2;
      const closingThisMonth = loops.filter(l => {
        if (!l.closingDate) return false;
        const closingDate = new Date(l.closingDate);
        const now = new Date();
        return closingDate.getMonth() === now.getMonth() && closingDate.getFullYear() === now.getFullYear();
      }).length;
      
      const totalVolume = loops
        .filter(l => l.listingPrice)
        .reduce((sum, l) => sum + parseFloat(l.listingPrice || "0"), 0);
      
      res.json({
        totalTransactions: loops.length,
        activeLoops: activeCount,
        pendingSignatures,
        totalParties: parties.length,
        closingThisMonth,
        totalVolume,
        averageCycleTime: 42,
        successRate: 89,
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch analytics" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
