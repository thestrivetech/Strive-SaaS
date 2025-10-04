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
  updateParty(id: string, party: Partial<InsertParty>): Promise<Party | undefined>;
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
      propertyAddress: "123 Maple Street, Springfield, IL 62701",
      transactionType: "Purchase Agreement",
      status: "active",
      listingPrice: "450000",
      closingDate: "2025-12-15",
      progress: 65,
      createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000),
      updatedAt: now,
    };
    
    const loop2: Loop = {
      id: loop2Id,
      propertyAddress: "456 Oak Avenue, Portland, OR 97201",
      transactionType: "Purchase Agreement",
      status: "underContract",
      listingPrice: "625000",
      closingDate: "2025-12-20",
      progress: 80,
      createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
      updatedAt: now,
    };
    
    const loop3: Loop = {
      id: loop3Id,
      propertyAddress: "789 Pine Road, Seattle, WA 98101",
      transactionType: "Listing Agreement",
      status: "closing",
      listingPrice: "550000",
      closingDate: "2025-12-28",
      progress: 90,
      createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
      updatedAt: now,
    };
    
    this.loops.set(loop1Id, loop1);
    this.loops.set(loop2Id, loop2);
    this.loops.set(loop3Id, loop3);
    
    const documents: Document[] = [
      {
        id: randomUUID(),
        loopId: loop1Id,
        name: "Purchase_Agreement_Final.pdf",
        type: "pdf",
        size: "2.4 MB",
        version: 3,
        uploadedBy: "John Smith",
        status: "signed",
        createdAt: new Date(Date.now() - 18 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      },
      {
        id: randomUUID(),
        loopId: loop1Id,
        name: "Inspection_Report.pdf",
        type: "pdf",
        size: "1.2 MB",
        version: 1,
        uploadedBy: "Sarah Johnson",
        status: "pending",
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      },
      {
        id: randomUUID(),
        loopId: loop1Id,
        name: "Title_Insurance_Policy.pdf",
        type: "pdf",
        size: "3.1 MB",
        version: 1,
        uploadedBy: "Michael Chen",
        status: "approved",
        createdAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      },
      {
        id: randomUUID(),
        loopId: loop1Id,
        name: "Appraisal_Report.pdf",
        type: "pdf",
        size: "1.8 MB",
        version: 2,
        uploadedBy: "Sarah Johnson",
        status: "approved",
        createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
      },
      {
        id: randomUUID(),
        loopId: loop2Id,
        name: "Purchase_Agreement.pdf",
        type: "pdf",
        size: "2.1 MB",
        version: 1,
        uploadedBy: "Emily Davis",
        status: "signed",
        createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      },
      {
        id: randomUUID(),
        loopId: loop2Id,
        name: "HOA_Documents.pdf",
        type: "pdf",
        size: "4.5 MB",
        version: 1,
        uploadedBy: "Robert Wilson",
        status: "approved",
        createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      },
      {
        id: randomUUID(),
        loopId: loop2Id,
        name: "Disclosure_Statement.pdf",
        type: "pdf",
        size: "0.9 MB",
        version: 1,
        uploadedBy: "Emily Davis",
        status: "pending",
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      },
      {
        id: randomUUID(),
        loopId: loop3Id,
        name: "Listing_Agreement.pdf",
        type: "pdf",
        size: "1.5 MB",
        version: 2,
        uploadedBy: "Jennifer Martinez",
        status: "signed",
        createdAt: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      },
      {
        id: randomUUID(),
        loopId: loop3Id,
        name: "Closing_Disclosure.pdf",
        type: "pdf",
        size: "2.2 MB",
        version: 1,
        uploadedBy: "Michael Chen",
        status: "approved",
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      },
    ];
    
    documents.forEach(doc => this.documents.set(doc.id, doc));
    
    const tasks: Task[] = [
      {
        id: randomUUID(),
        loopId: loop1Id,
        title: "Order home inspection",
        description: "Schedule and complete property inspection",
        completed: true,
        assigneeName: "John Smith",
        dueDate: "2025-12-05",
        priority: "high",
        createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
      },
      {
        id: randomUUID(),
        loopId: loop1Id,
        title: "Submit loan application",
        description: "Complete and submit all required documentation",
        completed: false,
        assigneeName: "Sarah Johnson",
        dueDate: "2025-12-18",
        priority: "high",
        createdAt: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000),
      },
      {
        id: randomUUID(),
        loopId: loop1Id,
        title: "Review title report",
        description: "Review preliminary title report for any issues",
        completed: true,
        assigneeName: "Michael Chen",
        dueDate: "2025-12-08",
        priority: "medium",
        createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000),
      },
      {
        id: randomUUID(),
        loopId: loop1Id,
        title: "Schedule appraisal",
        description: "Coordinate with appraiser for property valuation",
        completed: false,
        assigneeName: "Sarah Johnson",
        dueDate: "2025-12-10",
        priority: "high",
        createdAt: new Date(Date.now() - 16 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(Date.now() - 16 * 24 * 60 * 60 * 1000),
      },
      {
        id: randomUUID(),
        loopId: loop1Id,
        title: "Finalize closing details",
        description: "Confirm final walkthrough and closing appointment",
        completed: false,
        assigneeName: "John Smith",
        dueDate: "2025-12-14",
        priority: "medium",
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      },
      {
        id: randomUUID(),
        loopId: loop2Id,
        title: "Review HOA documents",
        description: "Review homeowners association documents and bylaws",
        completed: true,
        assigneeName: "Emily Davis",
        dueDate: "2025-12-12",
        priority: "medium",
        createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000),
      },
      {
        id: randomUUID(),
        loopId: loop2Id,
        title: "Complete buyer's inspection",
        description: "Schedule and complete buyer's inspection contingency",
        completed: false,
        assigneeName: "Robert Wilson",
        dueDate: "2025-12-16",
        priority: "high",
        createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      },
      {
        id: randomUUID(),
        loopId: loop2Id,
        title: "Obtain homeowner's insurance",
        description: "Secure homeowner's insurance policy",
        completed: false,
        assigneeName: "Emily Davis",
        dueDate: "2025-12-19",
        priority: "high",
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      },
      {
        id: randomUUID(),
        loopId: loop3Id,
        title: "Final walkthrough",
        description: "Conduct final property walkthrough before closing",
        completed: false,
        assigneeName: "Jennifer Martinez",
        dueDate: "2025-12-27",
        priority: "high",
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      },
      {
        id: randomUUID(),
        loopId: loop3Id,
        title: "Wire transfer instructions",
        description: "Provide wire transfer details to buyer",
        completed: false,
        assigneeName: "Michael Chen",
        dueDate: "2025-12-26",
        priority: "high",
        createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
      },
    ];
    
    tasks.forEach(task => this.tasks.set(task.id, task));
    
    const milestones: Milestone[] = [
      {
        id: randomUUID(),
        loopId: loop1Id,
        title: "Offer Accepted",
        date: "2024-11-15",
        completed: true,
        description: "Purchase offer accepted by seller",
        createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000),
      },
      {
        id: randomUUID(),
        loopId: loop1Id,
        title: "Inspection Complete",
        date: "2024-12-05",
        completed: true,
        description: "Home inspection completed successfully",
        createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
      },
      {
        id: randomUUID(),
        loopId: loop1Id,
        title: "Appraisal Complete",
        date: "2024-12-10",
        completed: true,
        description: "Property appraisal completed",
        createdAt: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000),
      },
      {
        id: randomUUID(),
        loopId: loop1Id,
        title: "Loan Approval",
        date: "2024-12-18",
        completed: false,
        description: "Final loan approval from lender",
        createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
      },
      {
        id: randomUUID(),
        loopId: loop1Id,
        title: "Closing",
        date: "2024-12-15",
        completed: false,
        description: "Final closing and transfer of ownership",
        createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
      },
      {
        id: randomUUID(),
        loopId: loop2Id,
        title: "Listing Active",
        date: "2024-11-20",
        completed: true,
        description: "Property listed on MLS",
        createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
      },
      {
        id: randomUUID(),
        loopId: loop2Id,
        title: "Offer Received",
        date: "2024-12-01",
        completed: true,
        description: "First offer received from buyer",
        createdAt: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000),
      },
      {
        id: randomUUID(),
        loopId: loop2Id,
        title: "Under Contract",
        date: "2024-12-05",
        completed: true,
        description: "Purchase agreement signed",
        createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
      },
      {
        id: randomUUID(),
        loopId: loop2Id,
        title: "Inspection Contingency",
        date: "2024-12-16",
        completed: false,
        description: "Buyer inspection contingency period",
        createdAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000),
      },
      {
        id: randomUUID(),
        loopId: loop2Id,
        title: "Closing",
        date: "2024-12-20",
        completed: false,
        description: "Final closing date",
        createdAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000),
      },
      {
        id: randomUUID(),
        loopId: loop3Id,
        title: "Listing Agreement Signed",
        date: "2024-11-25",
        completed: true,
        description: "Seller signed listing agreement",
        createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
      },
      {
        id: randomUUID(),
        loopId: loop3Id,
        title: "Buyer Secured",
        date: "2024-12-10",
        completed: true,
        description: "Buyer secured and contract signed",
        createdAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000),
      },
      {
        id: randomUUID(),
        loopId: loop3Id,
        title: "Title Search Complete",
        date: "2024-12-20",
        completed: true,
        description: "Title search and insurance secured",
        createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
      },
      {
        id: randomUUID(),
        loopId: loop3Id,
        title: "Final Walkthrough",
        date: "2024-12-27",
        completed: false,
        description: "Buyer final walkthrough",
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      },
      {
        id: randomUUID(),
        loopId: loop3Id,
        title: "Closing",
        date: "2024-12-28",
        completed: false,
        description: "Final closing and settlement",
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      },
    ];
    
    milestones.forEach(milestone => this.milestones.set(milestone.id, milestone));
    
    const parties: Party[] = [
      {
        id: randomUUID(),
        loopId: loop1Id,
        name: "John Smith",
        role: "Buyer",
        email: "john.smith@email.com",
        phone: "+1 (555) 123-4567",
        permissions: ["View Documents", "Sign Documents"],
        createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000),
      },
      {
        id: randomUUID(),
        loopId: loop1Id,
        name: "Sarah Johnson",
        role: "Listing Agent",
        email: "sarah.j@realty.com",
        phone: "+1 (555) 987-6543",
        permissions: ["View Documents", "Edit Documents", "Sign Documents"],
        createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000),
      },
      {
        id: randomUUID(),
        loopId: loop1Id,
        name: "Michael Chen",
        role: "Title Company",
        email: "mchen@securetitle.com",
        phone: "+1 (555) 234-5678",
        permissions: ["View Documents", "Edit Documents"],
        createdAt: new Date(Date.now() - 18 * 24 * 60 * 60 * 1000),
      },
      {
        id: randomUUID(),
        loopId: loop1Id,
        name: "Lisa Anderson",
        role: "Seller",
        email: "lisa.anderson@email.com",
        phone: "+1 (555) 345-6789",
        permissions: ["View Documents", "Sign Documents"],
        createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000),
      },
      {
        id: randomUUID(),
        loopId: loop2Id,
        name: "Emily Davis",
        role: "Buyer",
        email: "emily.davis@email.com",
        phone: "+1 (555) 456-7890",
        permissions: ["View Documents", "Sign Documents"],
        createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
      },
      {
        id: randomUUID(),
        loopId: loop2Id,
        name: "Robert Wilson",
        role: "Buyer's Agent",
        email: "rwilson@homefinders.com",
        phone: "+1 (555) 567-8901",
        permissions: ["View Documents", "Edit Documents", "Sign Documents"],
        createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
      },
      {
        id: randomUUID(),
        loopId: loop2Id,
        name: "Amanda Thompson",
        role: "Seller",
        email: "athompson@email.com",
        phone: "+1 (555) 678-9012",
        permissions: ["View Documents", "Sign Documents"],
        createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
      },
      {
        id: randomUUID(),
        loopId: loop3Id,
        name: "Jennifer Martinez",
        role: "Listing Agent",
        email: "jmartinez@premierrealty.com",
        phone: "+1 (555) 789-0123",
        permissions: ["View Documents", "Edit Documents", "Sign Documents"],
        createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
      },
      {
        id: randomUUID(),
        loopId: loop3Id,
        name: "David Brown",
        role: "Seller",
        email: "dbrown@email.com",
        phone: "+1 (555) 890-1234",
        permissions: ["View Documents", "Sign Documents"],
        createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
      },
      {
        id: randomUUID(),
        loopId: loop3Id,
        name: "Christina Lee",
        role: "Buyer",
        email: "clee@email.com",
        phone: "+1 (555) 901-2345",
        permissions: ["View Documents", "Sign Documents"],
        createdAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000),
      },
    ];
    
    parties.forEach(party => this.parties.set(party.id, party));
    
    const activities: Activity[] = [
      {
        id: randomUUID(),
        loopId: loop1Id,
        type: "signature",
        userName: "John Smith",
        action: "signed",
        target: "Purchase Agreement",
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
      },
      {
        id: randomUUID(),
        loopId: loop1Id,
        type: "upload",
        userName: "Sarah Johnson",
        action: "uploaded",
        target: "Inspection Report",
        createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000),
      },
      {
        id: randomUUID(),
        loopId: loop1Id,
        type: "document",
        userName: "Michael Chen",
        action: "approved",
        target: "Title Insurance Policy",
        createdAt: new Date(Date.now() - 8 * 60 * 60 * 1000),
      },
      {
        id: randomUUID(),
        loopId: loop1Id,
        type: "task",
        userName: "John Smith",
        action: "completed",
        target: "Order home inspection",
        createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
      },
      {
        id: randomUUID(),
        loopId: loop1Id,
        type: "party",
        userName: "Sarah Johnson",
        action: "invited",
        target: "Lisa Anderson",
        createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000),
      },
      {
        id: randomUUID(),
        loopId: loop2Id,
        type: "signature",
        userName: "Emily Davis",
        action: "signed",
        target: "Purchase Agreement",
        createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
      },
      {
        id: randomUUID(),
        loopId: loop2Id,
        type: "upload",
        userName: "Robert Wilson",
        action: "uploaded",
        target: "HOA Documents",
        createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      },
      {
        id: randomUUID(),
        loopId: loop2Id,
        type: "status",
        userName: "Robert Wilson",
        action: "updated status to",
        target: "Under Contract",
        createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
      },
      {
        id: randomUUID(),
        loopId: loop3Id,
        type: "signature",
        userName: "David Brown",
        action: "signed",
        target: "Listing Agreement",
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      },
      {
        id: randomUUID(),
        loopId: loop3Id,
        type: "document",
        userName: "Michael Chen",
        action: "approved",
        target: "Closing Disclosure",
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      },
      {
        id: randomUUID(),
        loopId: loop3Id,
        type: "party",
        userName: "Jennifer Martinez",
        action: "invited",
        target: "Christina Lee",
        createdAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000),
      },
      {
        id: randomUUID(),
        loopId: loop3Id,
        type: "status",
        userName: "Jennifer Martinez",
        action: "updated status to",
        target: "Closing",
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      },
    ];
    
    activities.forEach(activity => this.activities.set(activity.id, activity));
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

  async updateParty(id: string, updates: Partial<InsertParty>): Promise<Party | undefined> {
    const existing = this.parties.get(id);
    if (!existing) return undefined;
    
    const updated: Party = {
      ...existing,
      ...updates,
      id: existing.id,
      loopId: existing.loopId,
      createdAt: existing.createdAt,
    };
    this.parties.set(id, updated);
    return updated;
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
