import { 
  type User, 
  type InsertUser,
  type DashboardSettings,
  type InsertDashboardSettings,
  type KpiMetric,
  type InsertKpiMetric,
  type Activity,
  type InsertActivity,
  type Lead,
  type InsertLead,
  type Deal,
  type InsertDeal,
  type Notification,
  type InsertNotification,
  users,
  dashboardSettings,
  kpiMetrics,
  activities,
  leads,
  deals,
  notifications
} from "@shared/schema";
import { randomUUID } from "crypto";
import { db } from "./db";
import { eq, desc } from "drizzle-orm";

export interface IStorage {
  // Users
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Dashboard Settings
  getDashboardSettings(userId: string): Promise<DashboardSettings | undefined>;
  upsertDashboardSettings(settings: InsertDashboardSettings): Promise<DashboardSettings>;
  
  // KPI Metrics
  getKpiMetrics(): Promise<KpiMetric[]>;
  createKpiMetric(metric: InsertKpiMetric): Promise<KpiMetric>;
  updateKpiMetric(id: string, metric: Partial<InsertKpiMetric>): Promise<KpiMetric>;
  
  // Activities
  getActivities(limit?: number): Promise<Activity[]>;
  createActivity(activity: InsertActivity): Promise<Activity>;
  
  // Leads
  getLeads(): Promise<Lead[]>;
  getLeadById(id: string): Promise<Lead | undefined>;
  createLead(lead: InsertLead): Promise<Lead>;
  updateLead(id: string, lead: Partial<InsertLead>): Promise<Lead>;
  
  // Deals
  getDeals(): Promise<Deal[]>;
  getDealById(id: string): Promise<Deal | undefined>;
  createDeal(deal: InsertDeal): Promise<Deal>;
  updateDeal(id: string, deal: Partial<InsertDeal>): Promise<Deal>;
  
  // Notifications
  getUserNotifications(userId: string): Promise<Notification[]>;
  createNotification(notification: InsertNotification): Promise<Notification>;
  markNotificationRead(id: string): Promise<void>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private dashboardSettings: Map<string, DashboardSettings>;
  private kpiMetrics: Map<string, KpiMetric>;
  private activities: Map<string, Activity>;
  private leads: Map<string, Lead>;
  private deals: Map<string, Deal>;
  private notifications: Map<string, Notification>;

  constructor() {
    this.users = new Map();
    this.dashboardSettings = new Map();
    this.kpiMetrics = new Map();
    this.activities = new Map();
    this.leads = new Map();
    this.deals = new Map();
    this.notifications = new Map();
    
    // Initialize with sample data
    this.initializeSampleData();
  }

  private initializeSampleData() {
    // Create default user
    const defaultUser: User = {
      id: "user-1",
      username: "alex.morgan",
      password: "password",
      firstName: "Alex",
      lastName: "Morgan",
      email: "alex@realestate.com",
      role: "admin",
      createdAt: new Date(),
    };
    this.users.set(defaultUser.id, defaultUser);

    // Default dashboard settings
    const defaultSettings: DashboardSettings = {
      id: "settings-1",
      userId: defaultUser.id,
      layout: null,
      theme: "dark",
      accentColor: "#00D2FF",
      favorites: ["crm", "analytics", "calendar"],
      updatedAt: new Date(),
    };
    this.dashboardSettings.set(defaultUser.id, defaultSettings);

    // Sample KPI metrics
    const sampleKpis: KpiMetric[] = [
      {
        id: "kpi-1",
        name: "Revenue MTD",
        value: "$847K",
        change: 23,
        changeType: "percentage",
        icon: "trending-up",
        color: "#00D2FF",
        updatedAt: new Date(),
      },
      {
        id: "kpi-2", 
        name: "New Leads Today",
        value: "47",
        change: 12,
        changeType: "absolute",
        icon: "users",
        color: "#39FF14",
        updatedAt: new Date(),
      },
      {
        id: "kpi-3",
        name: "Deals Closed",
        value: "12",
        change: 2.3,
        changeType: "absolute",
        icon: "check-circle",
        color: "#8B5CF6",
        updatedAt: new Date(),
      },
      {
        id: "kpi-4",
        name: "Expense Saved",
        value: "$34K",
        change: 15,
        changeType: "percentage",
        icon: "dollar-sign",
        color: "#00D2FF",
        updatedAt: new Date(),
      },
    ];
    sampleKpis.forEach(kpi => this.kpiMetrics.set(kpi.id, kpi));

    // Sample activities
    const sampleActivities: Activity[] = [
      {
        id: "activity-1",
        userId: defaultUser.id,
        type: "deal_closed",
        title: "Deal closed",
        description: "Sarah Chen closed a deal worth $450K",
        icon: "user",
        color: "#00D2FF",
        amount: "$450K",
        createdAt: new Date(Date.now() - 2 * 60 * 1000), // 2 minutes ago
      },
      {
        id: "activity-2",
        userId: defaultUser.id,
        type: "lead_added",
        title: "New lead added",
        description: "New lead Marcus Rivera added to pipeline",
        icon: "user-plus",
        color: "#39FF14",
        amount: null,
        createdAt: new Date(Date.now() - 15 * 60 * 1000), // 15 minutes ago
      },
      {
        id: "activity-3",
        userId: defaultUser.id,
        type: "payment_received",
        title: "Payment received",
        description: "Payment of $125K received from Acme Corp",
        icon: "dollar-sign",
        color: "#8B5CF6",
        amount: "$125K",
        createdAt: new Date(Date.now() - 60 * 60 * 1000), // 1 hour ago
      },
    ];
    sampleActivities.forEach(activity => this.activities.set(activity.id, activity));

    // Sample notifications
    const sampleNotifications: Notification[] = [
      {
        id: "notif-1",
        userId: defaultUser.id,
        title: "New Lead",
        message: "High-value lead from LinkedIn campaign",
        type: "success",
        read: false,
        createdAt: new Date(Date.now() - 10 * 60 * 1000),
      },
      {
        id: "notif-2",
        userId: defaultUser.id,
        title: "Deal Update",
        message: "TechStart Inc deal moved to negotiation stage",
        type: "info",
        read: false,
        createdAt: new Date(Date.now() - 30 * 60 * 1000),
      },
      {
        id: "notif-3",
        userId: defaultUser.id,
        title: "Payment Reminder",
        message: "Follow up on pending payment from Global Corp",
        type: "warning",
        read: false,
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
      },
    ];
    sampleNotifications.forEach(notif => this.notifications.set(notif.id, notif));
  }

  // Users
  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { 
      ...insertUser,
      role: insertUser.role ?? null,
      email: insertUser.email ?? null,
      firstName: insertUser.firstName ?? null,
      lastName: insertUser.lastName ?? null,
      id,
      createdAt: new Date(),
    };
    this.users.set(id, user);
    return user;
  }

  // Dashboard Settings
  async getDashboardSettings(userId: string): Promise<DashboardSettings | undefined> {
    return this.dashboardSettings.get(userId);
  }

  async upsertDashboardSettings(settings: InsertDashboardSettings): Promise<DashboardSettings> {
    const existing = this.dashboardSettings.get(settings.userId);
    const id = existing?.id || randomUUID();
    const dashboardSetting: DashboardSettings = {
      ...settings,
      layout: settings.layout ?? null,
      theme: settings.theme ?? null,
      accentColor: settings.accentColor ?? null,
      favorites: settings.favorites ?? null,
      id,
      updatedAt: new Date(),
    };
    this.dashboardSettings.set(settings.userId, dashboardSetting);
    return dashboardSetting;
  }

  // KPI Metrics
  async getKpiMetrics(): Promise<KpiMetric[]> {
    return Array.from(this.kpiMetrics.values());
  }

  async createKpiMetric(metric: InsertKpiMetric): Promise<KpiMetric> {
    const id = randomUUID();
    const kpiMetric: KpiMetric = {
      ...metric,
      change: metric.change ?? null,
      changeType: metric.changeType ?? null,
      icon: metric.icon ?? null,
      color: metric.color ?? null,
      id,
      updatedAt: new Date(),
    };
    this.kpiMetrics.set(id, kpiMetric);
    return kpiMetric;
  }

  async updateKpiMetric(id: string, metric: Partial<InsertKpiMetric>): Promise<KpiMetric> {
    const existing = this.kpiMetrics.get(id);
    if (!existing) throw new Error('KPI metric not found');
    
    const updated: KpiMetric = {
      ...existing,
      ...metric,
      updatedAt: new Date(),
    };
    this.kpiMetrics.set(id, updated);
    return updated;
  }

  // Activities
  async getActivities(limit = 20): Promise<Activity[]> {
    const activities = Array.from(this.activities.values());
    return activities
      .sort((a, b) => b.createdAt!.getTime() - a.createdAt!.getTime())
      .slice(0, limit);
  }

  async createActivity(activity: InsertActivity): Promise<Activity> {
    const id = randomUUID();
    const newActivity: Activity = {
      ...activity,
      userId: activity.userId ?? null,
      description: activity.description ?? null,
      icon: activity.icon ?? null,
      color: activity.color ?? null,
      amount: activity.amount ?? null,
      id,
      createdAt: new Date(),
    };
    this.activities.set(id, newActivity);
    return newActivity;
  }

  // Leads
  async getLeads(): Promise<Lead[]> {
    return Array.from(this.leads.values());
  }

  async getLeadById(id: string): Promise<Lead | undefined> {
    return this.leads.get(id);
  }

  async createLead(lead: InsertLead): Promise<Lead> {
    const id = randomUUID();
    const newLead: Lead = {
      ...lead,
      email: lead.email ?? null,
      phone: lead.phone ?? null,
      source: lead.source ?? null,
      status: lead.status ?? null,
      priority: lead.priority ?? null,
      assignedTo: lead.assignedTo ?? null,
      value: lead.value ?? null,
      id,
      createdAt: new Date(),
    };
    this.leads.set(id, newLead);
    return newLead;
  }

  async updateLead(id: string, lead: Partial<InsertLead>): Promise<Lead> {
    const existing = this.leads.get(id);
    if (!existing) throw new Error('Lead not found');
    
    const updated: Lead = {
      ...existing,
      ...lead,
    };
    this.leads.set(id, updated);
    return updated;
  }

  // Deals
  async getDeals(): Promise<Deal[]> {
    return Array.from(this.deals.values());
  }

  async getDealById(id: string): Promise<Deal | undefined> {
    return this.deals.get(id);
  }

  async createDeal(deal: InsertDeal): Promise<Deal> {
    const id = randomUUID();
    const newDeal: Deal = {
      ...deal,
      leadId: deal.leadId ?? null,
      status: deal.status ?? null,
      stage: deal.stage ?? null,
      closeProbability: deal.closeProbability ?? null,
      expectedCloseDate: deal.expectedCloseDate ?? null,
      actualCloseDate: deal.actualCloseDate ?? null,
      assignedTo: deal.assignedTo ?? null,
      id,
      createdAt: new Date(),
    };
    this.deals.set(id, newDeal);
    return newDeal;
  }

  async updateDeal(id: string, deal: Partial<InsertDeal>): Promise<Deal> {
    const existing = this.deals.get(id);
    if (!existing) throw new Error('Deal not found');
    
    const updated: Deal = {
      ...existing,
      ...deal,
    };
    this.deals.set(id, updated);
    return updated;
  }

  // Notifications
  async getUserNotifications(userId: string): Promise<Notification[]> {
    return Array.from(this.notifications.values())
      .filter(notif => notif.userId === userId)
      .sort((a, b) => b.createdAt!.getTime() - a.createdAt!.getTime());
  }

  async createNotification(notification: InsertNotification): Promise<Notification> {
    const id = randomUUID();
    const newNotification: Notification = {
      ...notification,
      message: notification.message ?? null,
      type: notification.type ?? null,
      read: notification.read ?? null,
      id,
      createdAt: new Date(),
    };
    this.notifications.set(id, newNotification);
    return newNotification;
  }

  async markNotificationRead(id: string): Promise<void> {
    const notification = this.notifications.get(id);
    if (notification) {
      notification.read = true;
      this.notifications.set(id, notification);
    }
  }
}

// Database storage implementation
export class DatabaseStorage implements IStorage {
  // Users
  async getUser(id: string): Promise<User | undefined> {
    try {
      const result = await db.select().from(users).where(eq(users.id, id));
      return result[0];
    } catch (error) {
      console.error('Error fetching user:', error);
      throw new Error('Failed to fetch user');
    }
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    try {
      const result = await db.select().from(users).where(eq(users.username, username));
      return result[0];
    } catch (error) {
      console.error('Error fetching user by username:', error);
      throw new Error('Failed to fetch user');
    }
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    try {
      const result = await db.insert(users).values(insertUser).returning();
      if (!result[0]) throw new Error('Failed to create user');
      return result[0];
    } catch (error) {
      console.error('Error creating user:', error);
      throw new Error('Failed to create user');
    }
  }

  // Dashboard Settings
  async getDashboardSettings(userId: string): Promise<DashboardSettings | undefined> {
    try {
      const result = await db.select().from(dashboardSettings).where(eq(dashboardSettings.userId, userId));
      return result[0];
    } catch (error) {
      console.error('Error fetching dashboard settings:', error);
      throw new Error('Failed to fetch dashboard settings');
    }
  }

  async upsertDashboardSettings(settings: InsertDashboardSettings): Promise<DashboardSettings> {
    try {
      const existing = await this.getDashboardSettings(settings.userId);
      
      if (existing) {
        const result = await db
          .update(dashboardSettings)
          .set({ ...settings, updatedAt: new Date() })
          .where(eq(dashboardSettings.userId, settings.userId))
          .returning();
        if (!result[0]) throw new Error('Failed to update dashboard settings');
        return result[0];
      } else {
        const result = await db.insert(dashboardSettings).values(settings).returning();
        if (!result[0]) throw new Error('Failed to create dashboard settings');
        return result[0];
      }
    } catch (error) {
      console.error('Error upserting dashboard settings:', error);
      throw new Error('Failed to upsert dashboard settings');
    }
  }

  // KPI Metrics
  async getKpiMetrics(): Promise<KpiMetric[]> {
    try {
      return await db.select().from(kpiMetrics);
    } catch (error) {
      console.error('Error fetching KPI metrics:', error);
      throw new Error('Failed to fetch KPI metrics');
    }
  }

  async createKpiMetric(metric: InsertKpiMetric): Promise<KpiMetric> {
    try {
      const result = await db.insert(kpiMetrics).values(metric).returning();
      if (!result[0]) throw new Error('Failed to create KPI metric');
      return result[0];
    } catch (error) {
      console.error('Error creating KPI metric:', error);
      throw new Error('Failed to create KPI metric');
    }
  }

  async updateKpiMetric(id: string, metric: Partial<InsertKpiMetric>): Promise<KpiMetric> {
    try {
      const result = await db
        .update(kpiMetrics)
        .set({ ...metric, updatedAt: new Date() })
        .where(eq(kpiMetrics.id, id))
        .returning();
      
      if (!result[0]) throw new Error('KPI metric not found');
      return result[0];
    } catch (error) {
      console.error('Error updating KPI metric:', error);
      throw new Error('Failed to update KPI metric');
    }
  }

  // Activities
  async getActivities(limit = 20): Promise<Activity[]> {
    try {
      return await db
        .select()
        .from(activities)
        .orderBy(desc(activities.createdAt))
        .limit(limit);
    } catch (error) {
      console.error('Error fetching activities:', error);
      throw new Error('Failed to fetch activities');
    }
  }

  async createActivity(activity: InsertActivity): Promise<Activity> {
    try {
      const result = await db.insert(activities).values(activity).returning();
      if (!result[0]) throw new Error('Failed to create activity');
      return result[0];
    } catch (error) {
      console.error('Error creating activity:', error);
      throw new Error('Failed to create activity');
    }
  }

  // Leads
  async getLeads(): Promise<Lead[]> {
    try {
      return await db.select().from(leads);
    } catch (error) {
      console.error('Error fetching leads:', error);
      throw new Error('Failed to fetch leads');
    }
  }

  async getLeadById(id: string): Promise<Lead | undefined> {
    try {
      const result = await db.select().from(leads).where(eq(leads.id, id));
      return result[0];
    } catch (error) {
      console.error('Error fetching lead:', error);
      throw new Error('Failed to fetch lead');
    }
  }

  async createLead(lead: InsertLead): Promise<Lead> {
    try {
      const result = await db.insert(leads).values(lead).returning();
      if (!result[0]) throw new Error('Failed to create lead');
      return result[0];
    } catch (error) {
      console.error('Error creating lead:', error);
      throw new Error('Failed to create lead');
    }
  }

  async updateLead(id: string, lead: Partial<InsertLead>): Promise<Lead> {
    try {
      const result = await db
        .update(leads)
        .set(lead)
        .where(eq(leads.id, id))
        .returning();
      
      if (!result[0]) throw new Error('Lead not found');
      return result[0];
    } catch (error) {
      console.error('Error updating lead:', error);
      throw new Error('Failed to update lead');
    }
  }

  // Deals
  async getDeals(): Promise<Deal[]> {
    try {
      return await db.select().from(deals);
    } catch (error) {
      console.error('Error fetching deals:', error);
      throw new Error('Failed to fetch deals');
    }
  }

  async getDealById(id: string): Promise<Deal | undefined> {
    try {
      const result = await db.select().from(deals).where(eq(deals.id, id));
      return result[0];
    } catch (error) {
      console.error('Error fetching deal:', error);
      throw new Error('Failed to fetch deal');
    }
  }

  async createDeal(deal: InsertDeal): Promise<Deal> {
    try {
      const result = await db.insert(deals).values(deal).returning();
      if (!result[0]) throw new Error('Failed to create deal');
      return result[0];
    } catch (error) {
      console.error('Error creating deal:', error);
      throw new Error('Failed to create deal');
    }
  }

  async updateDeal(id: string, deal: Partial<InsertDeal>): Promise<Deal> {
    try {
      const result = await db
        .update(deals)
        .set(deal)
        .where(eq(deals.id, id))
        .returning();
      
      if (!result[0]) throw new Error('Deal not found');
      return result[0];
    } catch (error) {
      console.error('Error updating deal:', error);
      throw new Error('Failed to update deal');
    }
  }

  // Notifications
  async getUserNotifications(userId: string): Promise<Notification[]> {
    try {
      return await db
        .select()
        .from(notifications)
        .where(eq(notifications.userId, userId))
        .orderBy(desc(notifications.createdAt));
    } catch (error) {
      console.error('Error fetching notifications:', error);
      throw new Error('Failed to fetch notifications');
    }
  }

  async createNotification(notification: InsertNotification): Promise<Notification> {
    try {
      const result = await db.insert(notifications).values(notification).returning();
      if (!result[0]) throw new Error('Failed to create notification');
      return result[0];
    } catch (error) {
      console.error('Error creating notification:', error);
      throw new Error('Failed to create notification');
    }
  }

  async markNotificationRead(id: string): Promise<void> {
    try {
      const result = await db
        .update(notifications)
        .set({ read: true })
        .where(eq(notifications.id, id))
        .returning();
      
      if (!result[0]) throw new Error('Notification not found');
    } catch (error) {
      console.error('Error marking notification as read:', error);
      throw new Error('Failed to mark notification as read');
    }
  }
}

// Use database storage in production, memory storage for testing
export const storage = process.env.DATABASE_URL ? new DatabaseStorage() : new MemStorage();
