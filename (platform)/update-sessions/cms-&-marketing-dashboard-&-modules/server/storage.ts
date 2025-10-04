import { 
  type User, type InsertUser,
  type Campaign, type InsertCampaign,
  type Page, type InsertPage,
  type Media, type InsertMedia
} from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  getCampaigns(): Promise<Campaign[]>;
  getCampaign(id: string): Promise<Campaign | undefined>;
  createCampaign(campaign: InsertCampaign): Promise<Campaign>;
  updateCampaign(id: string, campaign: Partial<InsertCampaign>): Promise<Campaign | undefined>;
  deleteCampaign(id: string): Promise<boolean>;
  
  getPages(): Promise<Page[]>;
  getPage(id: string): Promise<Page | undefined>;
  getPageBySlug(slug: string): Promise<Page | undefined>;
  createPage(page: InsertPage): Promise<Page>;
  updatePage(id: string, page: Partial<InsertPage>): Promise<Page | undefined>;
  deletePage(id: string): Promise<boolean>;
  
  getMediaItems(): Promise<Media[]>;
  getMediaItem(id: string): Promise<Media | undefined>;
  createMediaItem(media: InsertMedia): Promise<Media>;
  deleteMediaItem(id: string): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private campaigns: Map<string, Campaign>;
  private pages: Map<string, Page>;
  private mediaItems: Map<string, Media>;

  constructor() {
    this.users = new Map();
    this.campaigns = new Map();
    this.pages = new Map();
    this.mediaItems = new Map();
    this.seedData();
  }

  private seedData() {
    const sampleCampaigns: Campaign[] = [
      {
        id: randomUUID(),
        title: "New Listing: Luxury Downtown Condo",
        status: "active",
        type: "email",
        content: "<p>Check out our latest luxury listing in downtown!</p>",
        scheduledDate: new Date("2025-01-15"),
        createdAt: new Date("2025-01-10"),
        updatedAt: new Date("2025-01-10"),
        metrics: { sends: 1245, opens: 425, clicks: 87 },
        platforms: null,
      },
      {
        id: randomUUID(),
        title: "Market Update: Q1 2025",
        status: "scheduled",
        type: "email",
        content: "<p>Get insights into the Q1 2025 real estate market trends.</p>",
        scheduledDate: new Date("2025-01-25"),
        createdAt: new Date("2025-01-08"),
        updatedAt: new Date("2025-01-08"),
        metrics: { sends: 0, opens: 0, clicks: 0 },
        platforms: null,
      },
      {
        id: randomUUID(),
        title: "Open House This Weekend",
        status: "scheduled",
        type: "social",
        content: "Join us this weekend for an exclusive open house! 🏡",
        scheduledDate: new Date("2025-01-20"),
        createdAt: new Date("2025-01-12"),
        updatedAt: new Date("2025-01-12"),
        metrics: { impressions: 5240, engagement: 4.2, clicks: 156 },
        platforms: ["facebook", "instagram"],
      },
      {
        id: randomUUID(),
        title: "Spring Buying Guide 2025",
        status: "draft",
        type: "email",
        content: null,
        scheduledDate: null,
        createdAt: new Date("2025-01-02"),
        updatedAt: new Date("2025-01-03"),
        metrics: { sends: 0, opens: 0, clicks: 0 },
        platforms: null,
      },
    ];

    sampleCampaigns.forEach(c => this.campaigns.set(c.id, c));

    const samplePages: Page[] = [
      {
        id: randomUUID(),
        title: "Luxury Downtown Condos",
        slug: "luxury-downtown-condos",
        status: "published",
        content: null,
        metaDescription: "Explore our luxury downtown condo listings",
        metaTitle: "Luxury Downtown Condos | Elite Realty",
        views: 2845,
        createdAt: new Date("2024-12-15"),
        updatedAt: new Date("2025-01-10"),
      },
      {
        id: randomUUID(),
        title: "Spring Open House Event",
        slug: "spring-open-house",
        status: "scheduled",
        content: null,
        metaDescription: "Join us for our spring open house event",
        metaTitle: "Spring Open House | Elite Realty",
        views: 0,
        createdAt: new Date("2025-01-08"),
        updatedAt: new Date("2025-01-08"),
      },
      {
        id: randomUUID(),
        title: "Agent Profile - Sarah Johnson",
        slug: "agent-sarah-johnson",
        status: "published",
        content: null,
        metaDescription: "Meet Sarah Johnson, your trusted real estate agent",
        metaTitle: "Sarah Johnson | Elite Realty",
        views: 1456,
        createdAt: new Date("2024-11-20"),
        updatedAt: new Date("2025-01-05"),
      },
    ];

    samplePages.forEach(p => this.pages.set(p.id, p));
  }

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
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async getCampaigns(): Promise<Campaign[]> {
    return Array.from(this.campaigns.values()).sort((a, b) => 
      b.updatedAt.getTime() - a.updatedAt.getTime()
    );
  }

  async getCampaign(id: string): Promise<Campaign | undefined> {
    return this.campaigns.get(id);
  }

  async createCampaign(insertCampaign: InsertCampaign): Promise<Campaign> {
    const id = randomUUID();
    const now = new Date();
    const campaign: Campaign = {
      ...insertCampaign,
      id,
      createdAt: now,
      updatedAt: now,
      metrics: insertCampaign.metrics || ({ sends: 0, opens: 0, clicks: 0 } as any),
    };
    this.campaigns.set(id, campaign);
    return campaign;
  }

  async updateCampaign(id: string, updates: Partial<InsertCampaign>): Promise<Campaign | undefined> {
    const campaign = this.campaigns.get(id);
    if (!campaign) return undefined;

    const updated: Campaign = {
      ...campaign,
      ...updates as any,
      updatedAt: new Date(),
    };
    this.campaigns.set(id, updated);
    return updated;
  }

  async deleteCampaign(id: string): Promise<boolean> {
    return this.campaigns.delete(id);
  }

  async getPages(): Promise<Page[]> {
    return Array.from(this.pages.values()).sort((a, b) => 
      b.updatedAt.getTime() - a.updatedAt.getTime()
    );
  }

  async getPage(id: string): Promise<Page | undefined> {
    return this.pages.get(id);
  }

  async getPageBySlug(slug: string): Promise<Page | undefined> {
    return Array.from(this.pages.values()).find(p => p.slug === slug);
  }

  async createPage(insertPage: InsertPage): Promise<Page> {
    const id = randomUUID();
    const now = new Date();
    const page: Page = {
      ...insertPage,
      id,
      status: insertPage.status || "draft",
      views: 0,
      createdAt: now,
      updatedAt: now,
    };
    this.pages.set(id, page);
    return page;
  }

  async updatePage(id: string, updates: Partial<InsertPage>): Promise<Page | undefined> {
    const page = this.pages.get(id);
    if (!page) return undefined;

    const updated: Page = {
      ...page,
      ...updates,
      updatedAt: new Date(),
    };
    this.pages.set(id, updated);
    return updated;
  }

  async deletePage(id: string): Promise<boolean> {
    return this.pages.delete(id);
  }

  async getMediaItems(): Promise<Media[]> {
    return Array.from(this.mediaItems.values()).sort((a, b) => 
      b.uploadedAt.getTime() - a.uploadedAt.getTime()
    );
  }

  async getMediaItem(id: string): Promise<Media | undefined> {
    return this.mediaItems.get(id);
  }

  async createMediaItem(insertMedia: InsertMedia): Promise<Media> {
    const id = randomUUID();
    const media: Media = {
      ...insertMedia,
      id,
      tags: insertMedia.tags || null,
      uploadedAt: new Date(),
    };
    this.mediaItems.set(id, media);
    return media;
  }

  async deleteMediaItem(id: string): Promise<boolean> {
    return this.mediaItems.delete(id);
  }
}

export const storage = new MemStorage();
