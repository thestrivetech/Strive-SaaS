import { 
  type User, type InsertUser,
  type Loop, type InsertLoop,
  type Document, type InsertDocument,
  type Task, type InsertTask,
  type Party, type InsertParty,
  type Milestone, type InsertMilestone,
  type Activity, type InsertActivity
} from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  getLoops(): Promise<Loop[]>;
  getLoop(id: string): Promise<Loop | undefined>;
  createLoop(loop: InsertLoop): Promise<Loop>;
  updateLoop(id: string, loop: Partial<InsertLoop>): Promise<Loop | undefined>;
  deleteLoop(id: string): Promise<boolean>;
  
  getDocuments(loopId?: string): Promise<Document[]>;
  getDocument(id: string): Promise<Document | undefined>;
  createDocument(doc: InsertDocument): Promise<Document>;
  deleteDocument(id: string): Promise<boolean>;
  
  getTasks(loopId?: string): Promise<Task[]>;
  getTask(id: string): Promise<Task | undefined>;
  createTask(task: InsertTask): Promise<Task>;
  updateTask(id: string, task: Partial<InsertTask>): Promise<Task | undefined>;
  deleteTask(id: string): Promise<boolean>;
  
  getParties(loopId?: string): Promise<Party[]>;
  getParty(id: string): Promise<Party | undefined>;
  createParty(party: InsertParty): Promise<Party>;
  deleteParty(id: string): Promise<boolean>;
  
  getMilestones(loopId?: string): Promise<Milestone[]>;
  createMilestone(milestone: InsertMilestone): Promise<Milestone>;
  updateMilestone(id: string, milestone: Partial<InsertMilestone>): Promise<Milestone | undefined>;
  
  getActivities(loopId?: string): Promise<Activity[]>;
  createActivity(activity: InsertActivity): Promise<Activity>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private loops: Map<string, Loop>;
  private documents: Map<string, Document>;
  private tasks: Map<string, Task>;
  private parties: Map<string, Party>;
  private milestones: Map<string, Milestone>;
  private activities: Map<string, Activity>;

  constructor() {
    this.users = new Map();
    this.loops = new Map();
    this.documents = new Map();
    this.tasks = new Map();
    this.parties = new Map();
    this.milestones = new Map();
    this.activities = new Map();
    
    this.seedData();
  }

  private seedData() {
    const loop1Id = randomUUID();
    const loop2Id = randomUUID();
    const loop3Id = randomUUID();
    
    const now = new Date();
    
    const loop1: Loop = {
      id: loop1Id,
      propertyAddress: "123 Maple Street, Springfield",
      transactionType: "Purchase Agreement",
      status: "active",
      listingPrice: "450000",
      closingDate: "2025-12-15",
      progress: 65,
      createdAt: now,
      updatedAt: now,
    };
    
    const loop2: Loop = {
      id: loop2Id,
      propertyAddress: "456 Oak Avenue, Portland",
      transactionType: "Purchase Agreement",
      status: "underContract",
      listingPrice: "625000",
      closingDate: "2025-12-20",
      progress: 80,
      createdAt: now,
      updatedAt: now,
    };
    
    const loop3: Loop = {
      id: loop3Id,
      propertyAddress: "789 Pine Road, Seattle",
      transactionType: "Listing Agreement",
      status: "closing",
      listingPrice: "550000",
      closingDate: "2025-12-28",
      progress: 90,
      createdAt: now,
      updatedAt: now,
    };
    
    this.loops.set(loop1Id, loop1);
    this.loops.set(loop2Id, loop2);
    this.loops.set(loop3Id, loop3);
    
    const doc1: Document = {
      id: randomUUID(),
      loopId: loop1Id,
      name: "Purchase_Agreement_Final.pdf",
      type: "pdf",
      size: "2.4 MB",
      version: 3,
      uploadedBy: "John Smith",
      status: "signed",
      createdAt: now,
      updatedAt: now,
    };
    
    const doc2: Document = {
      id: randomUUID(),
      loopId: loop1Id,
      name: "Inspection_Report.pdf",
      type: "pdf",
      size: "1.2 MB",
      version: 1,
      uploadedBy: "Sarah Johnson",
      status: "pending",
      createdAt: now,
      updatedAt: now,
    };
    
    this.documents.set(doc1.id, doc1);
    this.documents.set(doc2.id, doc2);
    
    const task1: Task = {
      id: randomUUID(),
      loopId: loop1Id,
      title: "Order home inspection",
      description: "Schedule and complete property inspection",
      completed: true,
      assigneeName: "John Smith",
      dueDate: "2025-12-05",
      priority: "high",
      createdAt: now,
      updatedAt: now,
    };
    
    const task2: Task = {
      id: randomUUID(),
      loopId: loop1Id,
      title: "Submit loan application",
      description: "Complete and submit all required documentation",
      completed: false,
      assigneeName: "Sarah Johnson",
      dueDate: "2025-12-18",
      priority: "high",
      createdAt: now,
      updatedAt: now,
    };
    
    this.tasks.set(task1.id, task1);
    this.tasks.set(task2.id, task2);
    
    const party1: Party = {
      id: randomUUID(),
      loopId: loop1Id,
      name: "John Smith",
      role: "Buyer",
      email: "john.smith@email.com",
      phone: "+1 (555) 123-4567",
      permissions: ["View Documents", "Sign Documents"],
      createdAt: now,
    };
    
    const party2: Party = {
      id: randomUUID(),
      loopId: loop1Id,
      name: "Sarah Johnson",
      role: "Listing Agent",
      email: "sarah.j@realty.com",
      phone: "+1 (555) 987-6543",
      permissions: ["View Documents", "Edit Documents", "Sign Documents"],
      createdAt: now,
    };
    
    this.parties.set(party1.id, party1);
    this.parties.set(party2.id, party2);
    
    const activity1: Activity = {
      id: randomUUID(),
      loopId: loop1Id,
      type: "signature",
      userName: "John Smith",
      action: "signed",
      target: "Purchase Agreement",
      createdAt: new Date(Date.now() - 120000),
    };
    
    const activity2: Activity = {
      id: randomUUID(),
      loopId: loop1Id,
      type: "upload",
      userName: "Sarah Johnson",
      action: "uploaded",
      target: "Inspection Report",
      createdAt: new Date(Date.now() - 3600000),
    };
    
    this.activities.set(activity1.id, activity1);
    this.activities.set(activity2.id, activity2);
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

  async getLoops(): Promise<Loop[]> {
    return Array.from(this.loops.values()).sort((a, b) => 
      b.createdAt.getTime() - a.createdAt.getTime()
    );
  }

  async getLoop(id: string): Promise<Loop | undefined> {
    return this.loops.get(id);
  }

  async createLoop(insertLoop: InsertLoop): Promise<Loop> {
    const id = randomUUID();
    const now = new Date();
    const loop: Loop = { 
      id,
      propertyAddress: insertLoop.propertyAddress,
      transactionType: insertLoop.transactionType,
      status: insertLoop.status ?? 'draft',
      listingPrice: insertLoop.listingPrice ?? null,
      closingDate: insertLoop.closingDate ?? null,
      progress: insertLoop.progress ?? 0,
      createdAt: now,
      updatedAt: now
    };
    this.loops.set(id, loop);
    return loop;
  }

  async updateLoop(id: string, updates: Partial<InsertLoop>): Promise<Loop | undefined> {
    const loop = this.loops.get(id);
    if (!loop) return undefined;
    
    const updated: Loop = { 
      ...loop, 
      ...updates,
      updatedAt: new Date()
    };
    this.loops.set(id, updated);
    return updated;
  }

  async deleteLoop(id: string): Promise<boolean> {
    const deleted = this.loops.delete(id);
    if (deleted) {
      Array.from(this.documents.values())
        .filter(d => d.loopId === id)
        .forEach(d => this.documents.delete(d.id));
      Array.from(this.tasks.values())
        .filter(t => t.loopId === id)
        .forEach(t => this.tasks.delete(t.id));
      Array.from(this.parties.values())
        .filter(p => p.loopId === id)
        .forEach(p => this.parties.delete(p.id));
      Array.from(this.milestones.values())
        .filter(m => m.loopId === id)
        .forEach(m => this.milestones.delete(m.id));
      Array.from(this.activities.values())
        .filter(a => a.loopId === id)
        .forEach(a => this.activities.delete(a.id));
    }
    return deleted;
  }

  async getDocuments(loopId?: string): Promise<Document[]> {
    const docs = Array.from(this.documents.values());
    return loopId ? docs.filter(d => d.loopId === loopId) : docs;
  }

  async getDocument(id: string): Promise<Document | undefined> {
    return this.documents.get(id);
  }

  async createDocument(insertDoc: InsertDocument): Promise<Document> {
    const id = randomUUID();
    const now = new Date();
    const doc: Document = { 
      id,
      loopId: insertDoc.loopId,
      name: insertDoc.name,
      type: insertDoc.type,
      size: insertDoc.size,
      version: insertDoc.version ?? 1,
      uploadedBy: insertDoc.uploadedBy,
      status: insertDoc.status ?? 'draft',
      createdAt: now,
      updatedAt: now
    };
    this.documents.set(id, doc);
    return doc;
  }

  async deleteDocument(id: string): Promise<boolean> {
    return this.documents.delete(id);
  }

  async getTasks(loopId?: string): Promise<Task[]> {
    const tasks = Array.from(this.tasks.values());
    return loopId ? tasks.filter(t => t.loopId === loopId) : tasks;
  }

  async getTask(id: string): Promise<Task | undefined> {
    return this.tasks.get(id);
  }

  async createTask(insertTask: InsertTask): Promise<Task> {
    const id = randomUUID();
    const now = new Date();
    const task: Task = { 
      id,
      loopId: insertTask.loopId,
      title: insertTask.title,
      description: insertTask.description ?? null,
      completed: insertTask.completed ?? false,
      assigneeName: insertTask.assigneeName ?? null,
      dueDate: insertTask.dueDate ?? null,
      priority: insertTask.priority ?? 'medium',
      createdAt: now,
      updatedAt: now
    };
    this.tasks.set(id, task);
    return task;
  }

  async updateTask(id: string, updates: Partial<InsertTask>): Promise<Task | undefined> {
    const task = this.tasks.get(id);
    if (!task) return undefined;
    
    const updated: Task = { 
      ...task, 
      ...updates,
      updatedAt: new Date()
    };
    this.tasks.set(id, updated);
    return updated;
  }

  async deleteTask(id: string): Promise<boolean> {
    return this.tasks.delete(id);
  }

  async getParties(loopId?: string): Promise<Party[]> {
    const parties = Array.from(this.parties.values());
    return loopId ? parties.filter(p => p.loopId === loopId) : parties;
  }

  async getParty(id: string): Promise<Party | undefined> {
    return this.parties.get(id);
  }

  async createParty(insertParty: InsertParty): Promise<Party> {
    const id = randomUUID();
    const party: Party = { 
      id,
      loopId: insertParty.loopId,
      name: insertParty.name,
      role: insertParty.role,
      email: insertParty.email,
      phone: insertParty.phone ?? null,
      permissions: insertParty.permissions ?? [],
      createdAt: new Date()
    };
    this.parties.set(id, party);
    return party;
  }

  async deleteParty(id: string): Promise<boolean> {
    return this.parties.delete(id);
  }

  async getMilestones(loopId?: string): Promise<Milestone[]> {
    const allMilestones = Array.from(this.milestones.values());
    if (!loopId) return allMilestones;
    return allMilestones.filter(m => m.loopId === loopId);
  }

  async createMilestone(insertMilestone: InsertMilestone): Promise<Milestone> {
    const id = randomUUID();
    const milestone: Milestone = { 
      id,
      loopId: insertMilestone.loopId,
      title: insertMilestone.title,
      date: insertMilestone.date,
      completed: insertMilestone.completed ?? false,
      description: insertMilestone.description ?? null,
      createdAt: new Date()
    };
    this.milestones.set(id, milestone);
    return milestone;
  }

  async updateMilestone(id: string, updates: Partial<InsertMilestone>): Promise<Milestone | undefined> {
    const milestone = this.milestones.get(id);
    if (!milestone) return undefined;
    
    const updated: Milestone = { ...milestone, ...updates };
    this.milestones.set(id, updated);
    return updated;
  }

  async getActivities(loopId?: string): Promise<Activity[]> {
    const activities = Array.from(this.activities.values())
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    return loopId ? activities.filter(a => a.loopId === loopId) : activities;
  }

  async createActivity(insertActivity: InsertActivity): Promise<Activity> {
    const id = randomUUID();
    const activity: Activity = { 
      id,
      loopId: insertActivity.loopId ?? null,
      type: insertActivity.type,
      userName: insertActivity.userName,
      action: insertActivity.action,
      target: insertActivity.target,
      createdAt: new Date()
    };
    this.activities.set(id, activity);
    return activity;
  }
}

export const storage = new MemStorage();
