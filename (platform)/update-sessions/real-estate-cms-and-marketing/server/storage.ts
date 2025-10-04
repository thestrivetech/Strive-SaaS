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
      {
        id: randomUUID(),
        title: "Holiday Home Showcase",
        status: "completed",
        type: "email",
        content: "<p>View our featured holiday listings!</p>",
        scheduledDate: new Date("2024-12-20"),
        createdAt: new Date("2024-12-15"),
        updatedAt: new Date("2024-12-20"),
        metrics: { sends: 2340, opens: 892, clicks: 234 },
        platforms: null,
      },
      {
        id: randomUUID(),
        title: "New Year Property Deals",
        status: "active",
        type: "social",
        content: "Start 2025 with amazing property deals! Limited time offers.",
        scheduledDate: new Date("2025-01-01"),
        createdAt: new Date("2024-12-28"),
        updatedAt: new Date("2025-01-01"),
        metrics: { impressions: 12500, engagement: 5.8, clicks: 420 },
        platforms: ["facebook", "instagram", "linkedin"],
      },
      {
        id: randomUUID(),
        title: "First-Time Buyer Workshop",
        status: "scheduled",
        type: "social",
        content: "Join our free workshop for first-time home buyers this Saturday!",
        scheduledDate: new Date("2025-02-05"),
        createdAt: new Date("2025-01-15"),
        updatedAt: new Date("2025-01-15"),
        metrics: { impressions: 0, engagement: 0, clicks: 0 },
        platforms: ["linkedin", "twitter"],
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
      {
        id: randomUUID(),
        title: "Market Report 2025",
        slug: "market-report-2025",
        status: "draft",
        content: null,
        metaDescription: "Comprehensive 2025 real estate market analysis",
        metaTitle: "2025 Market Report | Elite Realty",
        views: 0,
        createdAt: new Date("2025-01-12"),
        updatedAt: new Date("2025-01-14"),
      },
      {
        id: randomUUID(),
        title: "First-Time Buyer Guide",
        slug: "first-time-buyer-guide",
        status: "published",
        content: null,
        metaDescription: "Everything you need to know about buying your first home",
        metaTitle: "First-Time Buyer Guide | Elite Realty",
        views: 3421,
        createdAt: new Date("2024-10-05"),
        updatedAt: new Date("2024-12-20"),
      },
    ];

    samplePages.forEach(p => this.pages.set(p.id, p));

    const sampleMedia: Media[] = [
      {
        id: randomUUID(),
        name: "downtown-condo-exterior.jpg",
        type: "image",
        url: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800",
        size: 245600,
        tags: ["condo", "exterior", "downtown", "properties"],
        uploadedAt: new Date("2024-12-10"),
      },
      {
        id: randomUUID(),
        name: "luxury-kitchen.jpg",
        type: "image",
        url: "https://images.unsplash.com/photo-1556911220-bff31c812dba?w=800",
        size: 312400,
        tags: ["interior", "kitchen", "luxury", "properties"],
        uploadedAt: new Date("2024-12-12"),
      },
      {
        id: randomUUID(),
        name: "agent-headshot.jpg",
        type: "image",
        url: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400",
        size: 89300,
        tags: ["agent", "headshot", "team"],
        uploadedAt: new Date("2024-11-18"),
      },
      {
        id: randomUUID(),
        name: "property-brochure.pdf",
        type: "document",
        url: "/media/property-brochure.pdf",
        size: 1250000,
        tags: ["brochure", "pdf", "marketing"],
        uploadedAt: new Date("2025-01-05"),
      },
      {
        id: randomUUID(),
        name: "virtual-tour.mp4",
        type: "video",
        url: "/media/virtual-tour.mp4",
        size: 15600000,
        tags: ["video", "tour", "properties"],
        uploadedAt: new Date("2024-12-28"),
      },
      {
        id: randomUUID(),
        name: "open-house-banner.jpg",
        type: "image",
        url: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=1200",
        size: 456700,
        tags: ["banner", "open house", "event", "marketing"],
        uploadedAt: new Date("2025-01-08"),
      },
    ];

    sampleMedia.forEach(m => this.mediaItems.set(m.id, m));
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
      content: insertCampaign.content ?? null,
      status: insertCampaign.status || "draft",
      scheduledDate: insertCampaign.scheduledDate ?? null,
      platforms: insertCampaign.platforms ? [...insertCampaign.platforms] : null,
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
      content: insertPage.content ?? null,
      status: insertPage.status || "draft",
      metaDescription: insertPage.metaDescription ?? null,
      metaTitle: insertPage.metaTitle ?? null,
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
      tags: insertMedia.tags ? [...insertMedia.tags] : null,
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
