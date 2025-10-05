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
import { randomUUID } from "crypto";
import { db } from "../db";
import { eq, desc, and, gte, lte, sql } from "drizzle-orm";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  getLeads(): Promise<Lead[]>;
  getLead(id: string): Promise<Lead | undefined>;
  createLead(lead: InsertLead): Promise<Lead>;
  updateLead(id: string, lead: Partial<InsertLead>): Promise<Lead | undefined>;
  deleteLead(id: string): Promise<boolean>;
  getClientLeads(): Promise<Lead[]>;
  
  getContacts(): Promise<Contact[]>;
  getContact(id: string): Promise<Contact | undefined>;
  createContact(contact: InsertContact): Promise<Contact>;
  updateContact(id: string, contact: Partial<InsertContact>): Promise<Contact | undefined>;
  deleteContact(id: string): Promise<boolean>;
  getClientContacts(): Promise<Contact[]>;
  
  getDeals(): Promise<Deal[]>;
  getDeal(id: string): Promise<Deal | undefined>;
  createDeal(deal: InsertDeal): Promise<Deal>;
  updateDeal(id: string, deal: Partial<InsertDeal>): Promise<Deal | undefined>;
  deleteDeal(id: string): Promise<boolean>;
  
  getListings(): Promise<Listing[]>;
  getListing(id: string): Promise<Listing | undefined>;
  createListing(listing: InsertListing): Promise<Listing>;
  updateListing(id: string, listing: Partial<InsertListing>): Promise<Listing | undefined>;
  deleteListing(id: string): Promise<boolean>;
  
  getActivities(limit?: number): Promise<Activity[]>;
  createActivity(activity: InsertActivity): Promise<Activity>;
  
  getFollowUps(leadId?: string, contactId?: string): Promise<FollowUp[]>;
  createFollowUp(followUp: InsertFollowUp): Promise<FollowUp>;
  updateFollowUp(id: string, followUp: Partial<InsertFollowUp>): Promise<FollowUp | undefined>;
  deleteFollowUp(id: string): Promise<boolean>;
  
  getNotes(leadId?: string, contactId?: string, dealId?: string): Promise<Note[]>;
  createNote(note: InsertNote): Promise<Note>;
  deleteNote(id: string): Promise<boolean>;
  
  getAnalytics(): Promise<Analytics | undefined>;
  createOrUpdateAnalytics(analytics: InsertAnalytics): Promise<Analytics>;
  
  getAgents(): Promise<Agent[]>;
  getAgent(id: string): Promise<Agent | undefined>;
  createAgent(agent: InsertAgent): Promise<Agent>;
  updateAgent(id: string, agent: Partial<InsertAgent>): Promise<Agent | undefined>;
  
  getCalendarEvents(start?: Date, end?: Date): Promise<CalendarEvent[]>;
  createCalendarEvent(event: InsertCalendarEvent): Promise<CalendarEvent>;
  updateCalendarEvent(id: string, event: Partial<InsertCalendarEvent>): Promise<CalendarEvent | undefined>;
  deleteCalendarEvent(id: string): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private leadsList: Map<string, Lead>;
  private contactsList: Map<string, Contact>;
  private dealsList: Map<string, Deal>;
  private listingsList: Map<string, Listing>;
  private activitiesList: Map<string, Activity>;
  private followUpsList: Map<string, FollowUp>;
  private notesList: Map<string, Note>;
  private analyticsList: Map<string, Analytics>;
  private agentsList: Map<string, Agent>;
  private eventsList: Map<string, CalendarEvent>;

  constructor() {
    this.users = new Map();
    this.leadsList = new Map();
    this.contactsList = new Map();
    this.dealsList = new Map();
    this.listingsList = new Map();
    this.activitiesList = new Map();
    this.followUpsList = new Map();
    this.notesList = new Map();
    this.analyticsList = new Map();
    this.agentsList = new Map();
    this.eventsList = new Map();
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

  async getLeads(): Promise<Lead[]> {
    return Array.from(this.leadsList.values()).sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  async getLead(id: string): Promise<Lead | undefined> {
    return this.leadsList.get(id);
  }

  async createLead(insertLead: InsertLead): Promise<Lead> {
    const id = randomUUID();
    const lead: Lead = { 
      id,
      name: insertLead.name,
      email: insertLead.email,
      phone: insertLead.phone,
      avatar: insertLead.avatar ?? null,
      score: insertLead.score,
      source: insertLead.source,
      createdAt: new Date(),
      agentId: insertLead.agentId ?? null,
      agentName: insertLead.agentName ?? null,
      agentAvatar: insertLead.agentAvatar ?? null,
      phase: insertLead.phase ?? 'new-lead',
      lastContact: insertLead.lastContact || new Date(),
      nextReminder: insertLead.nextReminder ?? null,
      value: insertLead.value ?? null,
      isClient: insertLead.isClient ?? false,
      closedDate: insertLead.closedDate ?? null,
    };
    this.leadsList.set(id, lead);
    return lead;
  }

  async updateLead(id: string, updateData: Partial<InsertLead>): Promise<Lead | undefined> {
    const existing = this.leadsList.get(id);
    if (!existing) return undefined;
    
    const updated = { ...existing, ...updateData };
    this.leadsList.set(id, updated);
    return updated;
  }

  async deleteLead(id: string): Promise<boolean> {
    return this.leadsList.delete(id);
  }

  async getClientLeads(): Promise<Lead[]> {
    return Array.from(this.leadsList.values())
      .filter(lead => lead.isClient)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async getContacts(): Promise<Contact[]> {
    return Array.from(this.contactsList.values()).sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  async getContact(id: string): Promise<Contact | undefined> {
    return this.contactsList.get(id);
  }

  async createContact(insertContact: InsertContact): Promise<Contact> {
    const id = randomUUID();
    const contact: Contact = { 
      id,
      name: insertContact.name,
      email: insertContact.email,
      phone: insertContact.phone,
      avatar: insertContact.avatar ?? null,
      company: insertContact.company ?? null,
      role: insertContact.role ?? null,
      createdAt: new Date(),
      agentId: insertContact.agentId ?? null,
      agentName: insertContact.agentName ?? null,
      agentAvatar: insertContact.agentAvatar ?? null,
      isClient: insertContact.isClient ?? false,
      closedDate: insertContact.closedDate ?? null,
    };
    this.contactsList.set(id, contact);
    return contact;
  }

  async updateContact(id: string, updateData: Partial<InsertContact>): Promise<Contact | undefined> {
    const existing = this.contactsList.get(id);
    if (!existing) return undefined;
    
    const updated = { ...existing, ...updateData };
    this.contactsList.set(id, updated);
    return updated;
  }

  async deleteContact(id: string): Promise<boolean> {
    return this.contactsList.delete(id);
  }

  async getClientContacts(): Promise<Contact[]> {
    return Array.from(this.contactsList.values())
      .filter(contact => contact.isClient)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async getDeals(): Promise<Deal[]> {
    return Array.from(this.dealsList.values()).sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  async getDeal(id: string): Promise<Deal | undefined> {
    return this.dealsList.get(id);
  }

  async createDeal(insertDeal: InsertDeal): Promise<Deal> {
    const id = randomUUID();
    const deal: Deal = {
      id,
      title: insertDeal.title,
      value: insertDeal.value,
      stage: insertDeal.stage,
      contactName: insertDeal.contactName,
      contactAvatar: insertDeal.contactAvatar ?? null,
      agentId: insertDeal.agentId ?? null,
      agentName: insertDeal.agentName ?? null,
      agentAvatar: insertDeal.agentAvatar ?? null,
      closingDate: insertDeal.closingDate ?? null,
      createdAt: new Date(),
      probability: insertDeal.probability ?? null,
      notes: insertDeal.notes ?? null,
    };
    this.dealsList.set(id, deal);
    return deal;
  }

  async updateDeal(id: string, updateData: Partial<InsertDeal>): Promise<Deal | undefined> {
    const existing = this.dealsList.get(id);
    if (!existing) return undefined;
    
    const updated = { ...existing, ...updateData };
    this.dealsList.set(id, updated);
    return updated;
  }

  async deleteDeal(id: string): Promise<boolean> {
    return this.dealsList.delete(id);
  }

  async getListings(): Promise<Listing[]> {
    return Array.from(this.listingsList.values()).sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  async getListing(id: string): Promise<Listing | undefined> {
    return this.listingsList.get(id);
  }

  async createListing(insertListing: InsertListing): Promise<Listing> {
    const id = randomUUID();
    const listing: Listing = {
      id,
      address: insertListing.address,
      city: insertListing.city,
      state: insertListing.state,
      price: insertListing.price,
      bedrooms: insertListing.bedrooms,
      bathrooms: insertListing.bathrooms,
      sqft: insertListing.sqft,
      status: insertListing.status,
      image: insertListing.image ?? null,
      type: insertListing.type,
      createdAt: new Date(),
      agentId: insertListing.agentId ?? null,
      agentName: insertListing.agentName ?? null,
      agentAvatar: insertListing.agentAvatar ?? null,
    };
    this.listingsList.set(id, listing);
    return listing;
  }

  async updateListing(id: string, updateData: Partial<InsertListing>): Promise<Listing | undefined> {
    const existing = this.listingsList.get(id);
    if (!existing) return undefined;
    
    const updated = { ...existing, ...updateData };
    this.listingsList.set(id, updated);
    return updated;
  }

  async deleteListing(id: string): Promise<boolean> {
    return this.listingsList.delete(id);
  }

  async getActivities(limit = 50): Promise<Activity[]> {
    return Array.from(this.activitiesList.values())
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, limit);
  }

  async createActivity(insertActivity: InsertActivity): Promise<Activity> {
    const id = randomUUID();
    const activity: Activity = {
      id,
      type: insertActivity.type,
      title: insertActivity.title,
      description: insertActivity.description ?? null,
      timestamp: new Date(),
      agentId: insertActivity.agentId ?? null,
      agentName: insertActivity.agentName ?? null,
      agentAvatar: insertActivity.agentAvatar ?? null,
      relatedEntityType: insertActivity.relatedEntityType ?? null,
      relatedEntityId: insertActivity.relatedEntityId ?? null,
    };
    this.activitiesList.set(id, activity);
    return activity;
  }

  async getFollowUps(leadId?: string, contactId?: string): Promise<FollowUp[]> {
    return Array.from(this.followUpsList.values())
      .filter(f => {
        if (leadId && f.leadId !== leadId) return false;
        if (contactId && f.contactId !== contactId) return false;
        return true;
      })
      .sort((a, b) => new Date(a.scheduledDate).getTime() - new Date(b.scheduledDate).getTime());
  }

  async createFollowUp(insertFollowUp: InsertFollowUp): Promise<FollowUp> {
    const id = randomUUID();
    const followUp: FollowUp = {
      id,
      leadId: insertFollowUp.leadId ?? null,
      contactId: insertFollowUp.contactId ?? null,
      type: insertFollowUp.type,
      title: insertFollowUp.title,
      description: insertFollowUp.description ?? null,
      scheduledDate: insertFollowUp.scheduledDate,
      recurring: insertFollowUp.recurring ?? null,
      completed: false,
      createdAt: new Date(),
    };
    this.followUpsList.set(id, followUp);
    return followUp;
  }

  async updateFollowUp(id: string, updateData: Partial<InsertFollowUp>): Promise<FollowUp | undefined> {
    const existing = this.followUpsList.get(id);
    if (!existing) return undefined;
    
    const updated = { ...existing, ...updateData };
    this.followUpsList.set(id, updated);
    return updated;
  }

  async deleteFollowUp(id: string): Promise<boolean> {
    return this.followUpsList.delete(id);
  }

  async getNotes(leadId?: string, contactId?: string, dealId?: string): Promise<Note[]> {
    return Array.from(this.notesList.values())
      .filter(n => {
        if (leadId && n.leadId !== leadId) return false;
        if (contactId && n.contactId !== contactId) return false;
        if (dealId && n.dealId !== dealId) return false;
        return true;
      })
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async createNote(insertNote: InsertNote): Promise<Note> {
    const id = randomUUID();
    const note: Note = {
      id,
      leadId: insertNote.leadId ?? null,
      contactId: insertNote.contactId ?? null,
      dealId: insertNote.dealId ?? null,
      content: insertNote.content,
      createdAt: new Date(),
      createdBy: insertNote.createdBy,
    };
    this.notesList.set(id, note);
    return note;
  }

  async deleteNote(id: string): Promise<boolean> {
    return this.notesList.delete(id);
  }

  async getAnalytics(): Promise<Analytics | undefined> {
    const all = Array.from(this.analyticsList.values());
    if (all.length === 0) return undefined;
    return all[all.length - 1];
  }

  async createOrUpdateAnalytics(insertAnalytics: InsertAnalytics): Promise<Analytics> {
    const existing = await this.getAnalytics();
    if (existing) {
      const updated = { ...existing, ...insertAnalytics };
      this.analyticsList.set(existing.id, updated);
      return updated;
    }
    
    const id = randomUUID();
    const analytics: Analytics = {
      id,
      date: insertAnalytics.date,
      newLeads: insertAnalytics.newLeads ?? null,
      pipelineValue: insertAnalytics.pipelineValue ?? null,
      conversionRate: insertAnalytics.conversionRate ?? null,
      dealsClosed: insertAnalytics.dealsClosed ?? null,
      revenueBySource: insertAnalytics.revenueBySource ?? null,
      createdAt: new Date(),
    };
    this.analyticsList.set(id, analytics);
    return analytics;
  }

  async getAgents(): Promise<Agent[]> {
    return Array.from(this.agentsList.values()).sort((a, b) => 
      Number(b.revenue) - Number(a.revenue)
    );
  }

  async getAgent(id: string): Promise<Agent | undefined> {
    return this.agentsList.get(id);
  }

  async createAgent(insertAgent: InsertAgent): Promise<Agent> {
    const id = randomUUID();
    const agent: Agent = { 
      id,
      name: insertAgent.name,
      email: insertAgent.email,
      avatar: insertAgent.avatar ?? null,
      deals: insertAgent.deals ?? null,
      revenue: insertAgent.revenue ?? null,
      conversion: insertAgent.conversion ?? null,
      createdAt: new Date(),
    };
    this.agentsList.set(id, agent);
    return agent;
  }

  async updateAgent(id: string, updateData: Partial<InsertAgent>): Promise<Agent | undefined> {
    const existing = this.agentsList.get(id);
    if (!existing) return undefined;
    
    const updated = { ...existing, ...updateData };
    this.agentsList.set(id, updated);
    return updated;
  }

  async getCalendarEvents(start?: Date, end?: Date): Promise<CalendarEvent[]> {
    return Array.from(this.eventsList.values())
      .filter(e => {
        if (start && new Date(e.startTime) < start) return false;
        if (end && new Date(e.endTime) > end) return false;
        return true;
      })
      .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());
  }

  async createCalendarEvent(insertEvent: InsertCalendarEvent): Promise<CalendarEvent> {
    const id = randomUUID();
    const event: CalendarEvent = {
      id,
      title: insertEvent.title,
      description: insertEvent.description ?? null,
      startTime: insertEvent.startTime,
      endTime: insertEvent.endTime,
      type: insertEvent.type,
      agentId: insertEvent.agentId ?? null,
      agentName: insertEvent.agentName ?? null,
      relatedEntityType: insertEvent.relatedEntityType ?? null,
      relatedEntityId: insertEvent.relatedEntityId ?? null,
      createdAt: new Date(),
    };
    this.eventsList.set(id, event);
    return event;
  }

  async updateCalendarEvent(id: string, updateData: Partial<InsertCalendarEvent>): Promise<CalendarEvent | undefined> {
    const existing = this.eventsList.get(id);
    if (!existing) return undefined;
    
    const updated = { ...existing, ...updateData };
    this.eventsList.set(id, updated);
    return updated;
  }

  async deleteCalendarEvent(id: string): Promise<boolean> {
    return this.eventsList.delete(id);
  }
}

import { DbStorage } from "./db-storage";

export const storage = new DbStorage();
