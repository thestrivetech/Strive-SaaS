import { 
  type User, type InsertUser,
  type Lead, type InsertLead,
  type Contact, type InsertContact,
  type Deal, type InsertDeal,
  type Listing, type InsertListing,
  type Activity, type InsertActivity,
  type FollowUp, type InsertFollowUp,
  type Note, type InsertNote,
  type Analytics, type InsertAnalytics,
  type Agent, type InsertAgent,
  type CalendarEvent, type InsertCalendarEvent,
  users, leads, contacts, deals, listings, activities, followUps, notes, analytics, agents, calendarEvents
} from "@shared/schema";
import { db } from "../db";
import { eq, desc, and, gte, lte } from "drizzle-orm";
import type { IStorage } from "./storage";

export class DbStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
    return result[0];
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.username, username)).limit(1);
    return result[0];
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const result = await db.insert(users).values(insertUser).returning();
    return result[0];
  }

  async getLeads(): Promise<Lead[]> {
    return await db.select().from(leads).orderBy(desc(leads.createdAt));
  }

  async getLead(id: string): Promise<Lead | undefined> {
    const result = await db.select().from(leads).where(eq(leads.id, id)).limit(1);
    return result[0];
  }

  async createLead(insertLead: InsertLead): Promise<Lead> {
    const result = await db.insert(leads).values(insertLead).returning();
    return result[0];
  }

  async updateLead(id: string, updateData: Partial<InsertLead>): Promise<Lead | undefined> {
    const result = await db.update(leads).set(updateData).where(eq(leads.id, id)).returning();
    return result[0];
  }

  async deleteLead(id: string): Promise<boolean> {
    const result = await db.delete(leads).where(eq(leads.id, id)).returning();
    return result.length > 0;
  }

  async getClientLeads(): Promise<Lead[]> {
    return await db.select().from(leads).where(eq(leads.isClient, true)).orderBy(desc(leads.createdAt));
  }

  async getContacts(): Promise<Contact[]> {
    return await db.select().from(contacts).orderBy(desc(contacts.createdAt));
  }

  async getContact(id: string): Promise<Contact | undefined> {
    const result = await db.select().from(contacts).where(eq(contacts.id, id)).limit(1);
    return result[0];
  }

  async createContact(insertContact: InsertContact): Promise<Contact> {
    const result = await db.insert(contacts).values(insertContact).returning();
    return result[0];
  }

  async updateContact(id: string, updateData: Partial<InsertContact>): Promise<Contact | undefined> {
    const result = await db.update(contacts).set(updateData).where(eq(contacts.id, id)).returning();
    return result[0];
  }

  async deleteContact(id: string): Promise<boolean> {
    const result = await db.delete(contacts).where(eq(contacts.id, id)).returning();
    return result.length > 0;
  }

  async getClientContacts(): Promise<Contact[]> {
    return await db.select().from(contacts).where(eq(contacts.isClient, true)).orderBy(desc(contacts.createdAt));
  }

  async getDeals(): Promise<Deal[]> {
    return await db.select().from(deals).orderBy(desc(deals.createdAt));
  }

  async getDeal(id: string): Promise<Deal | undefined> {
    const result = await db.select().from(deals).where(eq(deals.id, id)).limit(1);
    return result[0];
  }

  async createDeal(insertDeal: InsertDeal): Promise<Deal> {
    const result = await db.insert(deals).values(insertDeal).returning();
    return result[0];
  }

  async updateDeal(id: string, updateData: Partial<InsertDeal>): Promise<Deal | undefined> {
    const result = await db.update(deals).set(updateData).where(eq(deals.id, id)).returning();
    return result[0];
  }

  async deleteDeal(id: string): Promise<boolean> {
    const result = await db.delete(deals).where(eq(deals.id, id)).returning();
    return result.length > 0;
  }

  async getListings(): Promise<Listing[]> {
    return await db.select().from(listings).orderBy(desc(listings.createdAt));
  }

  async getListing(id: string): Promise<Listing | undefined> {
    const result = await db.select().from(listings).where(eq(listings.id, id)).limit(1);
    return result[0];
  }

  async createListing(insertListing: InsertListing): Promise<Listing> {
    const result = await db.insert(listings).values(insertListing).returning();
    return result[0];
  }

  async updateListing(id: string, updateData: Partial<InsertListing>): Promise<Listing | undefined> {
    const result = await db.update(listings).set(updateData).where(eq(listings.id, id)).returning();
    return result[0];
  }

  async deleteListing(id: string): Promise<boolean> {
    const result = await db.delete(listings).where(eq(listings.id, id)).returning();
    return result.length > 0;
  }

  async getActivities(limit = 50): Promise<Activity[]> {
    return await db.select().from(activities).orderBy(desc(activities.timestamp)).limit(limit);
  }

  async createActivity(insertActivity: InsertActivity): Promise<Activity> {
    const result = await db.insert(activities).values(insertActivity).returning();
    return result[0];
  }

  async getFollowUps(leadId?: string, contactId?: string): Promise<FollowUp[]> {
    if (leadId) {
      return await db.select().from(followUps).where(eq(followUps.leadId, leadId)).orderBy(followUps.scheduledDate);
    }
    if (contactId) {
      return await db.select().from(followUps).where(eq(followUps.contactId, contactId)).orderBy(followUps.scheduledDate);
    }
    return await db.select().from(followUps).orderBy(followUps.scheduledDate);
  }

  async createFollowUp(insertFollowUp: InsertFollowUp): Promise<FollowUp> {
    const result = await db.insert(followUps).values(insertFollowUp).returning();
    return result[0];
  }

  async updateFollowUp(id: string, updateData: Partial<InsertFollowUp>): Promise<FollowUp | undefined> {
    const result = await db.update(followUps).set(updateData).where(eq(followUps.id, id)).returning();
    return result[0];
  }

  async deleteFollowUp(id: string): Promise<boolean> {
    const result = await db.delete(followUps).where(eq(followUps.id, id)).returning();
    return result.length > 0;
  }

  async getNotes(leadId?: string, contactId?: string, dealId?: string): Promise<Note[]> {
    if (leadId) {
      return await db.select().from(notes).where(eq(notes.leadId, leadId)).orderBy(desc(notes.createdAt));
    }
    if (contactId) {
      return await db.select().from(notes).where(eq(notes.contactId, contactId)).orderBy(desc(notes.createdAt));
    }
    if (dealId) {
      return await db.select().from(notes).where(eq(notes.dealId, dealId)).orderBy(desc(notes.createdAt));
    }
    return await db.select().from(notes).orderBy(desc(notes.createdAt));
  }

  async createNote(insertNote: InsertNote): Promise<Note> {
    const result = await db.insert(notes).values(insertNote).returning();
    return result[0];
  }

  async deleteNote(id: string): Promise<boolean> {
    const result = await db.delete(notes).where(eq(notes.id, id)).returning();
    return result.length > 0;
  }

  async getAnalytics(): Promise<Analytics | undefined> {
    const result = await db.select().from(analytics).orderBy(desc(analytics.createdAt)).limit(1);
    return result[0];
  }

  async createOrUpdateAnalytics(insertAnalytics: InsertAnalytics): Promise<Analytics> {
    const existing = await this.getAnalytics();
    if (existing) {
      const result = await db.update(analytics).set(insertAnalytics).where(eq(analytics.id, existing.id)).returning();
      return result[0];
    }
    const result = await db.insert(analytics).values(insertAnalytics).returning();
    return result[0];
  }

  async getAgents(): Promise<Agent[]> {
    return await db.select().from(agents).orderBy(desc(agents.revenue));
  }

  async getAgent(id: string): Promise<Agent | undefined> {
    const result = await db.select().from(agents).where(eq(agents.id, id)).limit(1);
    return result[0];
  }

  async createAgent(insertAgent: InsertAgent): Promise<Agent> {
    const result = await db.insert(agents).values(insertAgent).returning();
    return result[0];
  }

  async updateAgent(id: string, updateData: Partial<InsertAgent>): Promise<Agent | undefined> {
    const result = await db.update(agents).set(updateData).where(eq(agents.id, id)).returning();
    return result[0];
  }

  async getCalendarEvents(start?: Date, end?: Date): Promise<CalendarEvent[]> {
    if (start && end) {
      return await db.select().from(calendarEvents)
        .where(and(gte(calendarEvents.startTime, start), lte(calendarEvents.endTime, end)))
        .orderBy(calendarEvents.startTime);
    }
    return await db.select().from(calendarEvents).orderBy(calendarEvents.startTime);
  }

  async createCalendarEvent(insertEvent: InsertCalendarEvent): Promise<CalendarEvent> {
    const result = await db.insert(calendarEvents).values(insertEvent).returning();
    return result[0];
  }

  async updateCalendarEvent(id: string, updateData: Partial<InsertCalendarEvent>): Promise<CalendarEvent | undefined> {
    const result = await db.update(calendarEvents).set(updateData).where(eq(calendarEvents.id, id)).returning();
    return result[0];
  }

  async deleteCalendarEvent(id: string): Promise<boolean> {
    const result = await db.delete(calendarEvents).where(eq(calendarEvents.id, id)).returning();
    return result.length > 0;
  }
}
