import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertDashboardSettingsSchema, insertKpiMetricSchema, insertActivitySchema, insertNotificationSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  
  // Dashboard API routes
  app.get("/api/dashboard/kpis", async (req, res) => {
    try {
      const kpis = await storage.getKpiMetrics();
      res.json(kpis);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch KPI metrics" });
    }
  });

  app.get("/api/dashboard/activities", async (req, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 20;
      const activities = await storage.getActivities(limit);
      res.json(activities);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch activities" });
    }
  });

  app.post("/api/dashboard/activities", async (req, res) => {
    try {
      const validatedData = insertActivitySchema.parse(req.body);
      const activity = await storage.createActivity(validatedData);
      res.status(201).json(activity);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to create activity" });
      }
    }
  });

  app.get("/api/dashboard/settings/:userId", async (req, res) => {
    try {
      const { userId } = req.params;
      const settings = await storage.getDashboardSettings(userId);
      if (!settings) {
        // Return default settings if none exist
        const defaultSettings = {
          userId,
          layout: null,
          theme: "dark",
          accentColor: "#00D2FF",
          favorites: ["crm", "analytics", "calendar"],
        };
        const created = await storage.upsertDashboardSettings(defaultSettings);
        return res.json(created);
      }
      res.json(settings);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch dashboard settings" });
    }
  });

  app.get("/api/dashboard/settings", async (req, res) => {
    try {
      // For now, use the default user (alex.morgan)
      const defaultUser = await storage.getUserByUsername("alex.morgan");
      if (!defaultUser) {
        return res.status(404).json({ message: "Default user not found" });
      }
      
      let settings = await storage.getDashboardSettings(defaultUser.id);
      if (!settings) {
        // Return default settings if none exist
        const defaultSettings = {
          userId: defaultUser.id,
          layout: null,
          theme: "dark",
          accentColor: "#00D2FF",
          favorites: ["crm", "analytics", "calendar"],
        };
        settings = await storage.upsertDashboardSettings(defaultSettings);
      }
      res.json(settings);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch dashboard settings" });
    }
  });

  app.post("/api/dashboard/settings", async (req, res) => {
    try {
      // For now, use the default user (alex.morgan)
      const defaultUser = await storage.getUserByUsername("alex.morgan");
      if (!defaultUser) {
        return res.status(404).json({ message: "Default user not found" });
      }
      
      const validatedData = insertDashboardSettingsSchema.parse({
        ...req.body,
        userId: defaultUser.id,
      });
      const settings = await storage.upsertDashboardSettings(validatedData);
      res.json(settings);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to update dashboard settings" });
      }
    }
  });

  app.put("/api/dashboard/settings", async (req, res) => {
    try {
      const validatedData = insertDashboardSettingsSchema.parse(req.body);
      const settings = await storage.upsertDashboardSettings(validatedData);
      res.json(settings);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to update dashboard settings" });
      }
    }
  });

  // User notifications
  app.get("/api/notifications/:userId", async (req, res) => {
    try {
      const { userId } = req.params;
      const notifications = await storage.getUserNotifications(userId);
      res.json(notifications);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch notifications" });
    }
  });

  app.post("/api/notifications", async (req, res) => {
    try {
      const validatedData = insertNotificationSchema.parse(req.body);
      const notification = await storage.createNotification(validatedData);
      res.status(201).json(notification);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to create notification" });
      }
    }
  });

  app.patch("/api/notifications/:id/read", async (req, res) => {
    try {
      const { id } = req.params;
      await storage.markNotificationRead(id);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ message: "Failed to mark notification as read" });
    }
  });

  // Leads API
  app.get("/api/leads", async (req, res) => {
    try {
      const leads = await storage.getLeads();
      res.json(leads);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch leads" });
    }
  });

  app.get("/api/leads/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const lead = await storage.getLeadById(id);
      if (!lead) {
        return res.status(404).json({ message: "Lead not found" });
      }
      res.json(lead);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch lead" });
    }
  });

  // Deals API
  app.get("/api/deals", async (req, res) => {
    try {
      const deals = await storage.getDeals();
      res.json(deals);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch deals" });
    }
  });

  app.get("/api/deals/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const deal = await storage.getDealById(id);
      if (!deal) {
        return res.status(404).json({ message: "Deal not found" });
      }
      res.json(deal);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch deal" });
    }
  });

  // Weather API (simple mock for now, in production would integrate with real weather service)
  app.get("/api/weather", async (req, res) => {
    try {
      // In production, integrate with OpenWeatherMap or similar service
      const weatherData = {
        location: "San Francisco",
        temperature: "72°F",
        condition: "Partly Cloudy",
        icon: "partly-cloudy",
      };
      res.json(weatherData);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch weather data" });
    }
  });

  // AI Insights endpoint using OpenAI
  app.post("/api/ai/insights", async (req, res) => {
    try {
      const { query, context } = req.body;
      
      if (!process.env.OPENAI_API_KEY) {
        return res.status(500).json({ message: "OpenAI API key not configured" });
      }

      // Import OpenAI dynamically to avoid loading issues
      const { default: OpenAI } = await import("openai");
      
      const openai = new OpenAI({ 
        apiKey: process.env.OPENAI_API_KEY 
      });

      const response = await openai.chat.completions.create({
        model: "gpt-5", // the newest OpenAI model is "gpt-5" which was released August 7, 2025. do not change this unless explicitly requested by the user
        messages: [
          {
            role: "system",
            content: "You are Sai, an AI assistant for a real estate dashboard. Provide concise, actionable insights based on the user's query and dashboard context. Focus on metrics, trends, and actionable recommendations. Keep responses under 100 words and professional."
          },
          {
            role: "user",
            content: `Query: ${query}\n\nDashboard Context: ${JSON.stringify(context)}`
          }
        ],
        max_completion_tokens: 150,
      });

      const insight = response.choices[0].message.content;
      res.json({ insight, timestamp: new Date().toISOString() });
    } catch (error) {
      console.error("AI Insights error:", error);
      res.status(500).json({ message: "Failed to generate AI insights" });
    }
  });

  // Search endpoint for command bar
  app.get("/api/search", async (req, res) => {
    try {
      const { query } = req.query as { query: string };
      
      if (!query) {
        return res.json([]);
      }

      const lowerQuery = query.toLowerCase();
      const searchResults: any[] = [];

      // Search quick actions and navigation
      const quickActions = [
        {
          id: "create-lead",
          title: "Create New Lead",
          description: "Add a new lead to the pipeline",
          type: "action",
          action: "create-lead",
          icon: "user-plus",
          shortcut: "⌘N"
        },
        {
          id: "create-deal",
          title: "Create New Deal",
          description: "Start a new deal in the pipeline",
          type: "action",
          action: "create-deal",
          icon: "trending-up"
        },
        {
          id: "dashboard",
          title: "Go to Dashboard",
          description: "View main dashboard",
          type: "navigation",
          action: "/dashboard",
          icon: "layout-dashboard",
          shortcut: "⌘H"
        },
        {
          id: "settings",
          title: "Settings",
          description: "Configure dashboard preferences",
          type: "navigation",
          action: "/settings",
          icon: "settings"
        }
      ].filter(item => 
        item.title.toLowerCase().includes(lowerQuery) ||
        item.description.toLowerCase().includes(lowerQuery)
      );

      searchResults.push(...quickActions);

      // Search leads
      const leads = await storage.getLeads();
      const matchingLeads = leads
        .filter(lead => 
          lead.name.toLowerCase().includes(lowerQuery) ||
          (lead.email && lead.email.toLowerCase().includes(lowerQuery)) ||
          (lead.phone && lead.phone.toLowerCase().includes(lowerQuery))
        )
        .slice(0, 5)
        .map(lead => ({
          id: `lead-${lead.id}`,
          title: lead.name,
          description: lead.email || lead.phone || `${lead.status} lead`,
          type: "lead",
          action: `/leads/${lead.id}`,
          icon: "user",
          metadata: {
            status: lead.status,
            priority: lead.priority
          }
        }));

      searchResults.push(...matchingLeads);

      // Search deals
      const deals = await storage.getDeals();
      const matchingDeals = deals
        .filter(deal => 
          deal.title.toLowerCase().includes(lowerQuery) ||
          (deal.stage && deal.stage.toLowerCase().includes(lowerQuery))
        )
        .slice(0, 5)
        .map(deal => ({
          id: `deal-${deal.id}`,
          title: deal.title,
          description: `$${deal.value.toLocaleString()} - ${deal.stage || 'Open'}`,
          type: "deal",
          action: `/deals/${deal.id}`,
          icon: "dollar-sign",
          metadata: {
            value: deal.value,
            stage: deal.stage,
            status: deal.status
          }
        }));

      searchResults.push(...matchingDeals);

      res.json(searchResults);
    } catch (error) {
      console.error("Search error:", error);
      res.status(500).json({ message: "Search failed" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
