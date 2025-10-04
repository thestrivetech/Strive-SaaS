import type { Loop, Document, Task, Party, Milestone, Activity } from "@shared/schema";
import { apiRequest } from "./queryClient";
import type { ActivityItem } from "@/components/transaction/activity-feed";

export interface LoopWithDetails extends Loop {
  parties?: Array<{ name: string; role: string }>;
  documentCount?: number;
}

export interface Analytics {
  totalTransactions: number;
  activeLoops: number;
  pendingSignatures: number;
  totalParties: number;
  closingThisMonth: number;
  totalVolume: number;
  averageCycleTime: number;
  successRate: number;
}

export async function fetchLoops(): Promise<LoopWithDetails[]> {
  const response = await fetch("/api/loops");
  if (!response.ok) throw new Error("Failed to fetch loops");
  const loops = await response.json();
  
  const loopsWithDetails = await Promise.all(
    loops.map(async (loop: Loop) => {
      const parties = await fetch(`/api/parties?loopId=${loop.id}`).then(r => r.json());
      const documents = await fetch(`/api/documents?loopId=${loop.id}`).then(r => r.json());
      
      return {
        ...loop,
        parties: parties.slice(0, 3).map((p: Party) => ({ name: p.name, role: p.role })),
        documentCount: documents.length,
      };
    })
  );
  
  return loopsWithDetails;
}

export async function fetchLoop(id: string): Promise<Loop> {
  const response = await fetch(`/api/loops/${id}`);
  if (!response.ok) throw new Error("Failed to fetch loop");
  return response.json();
}

export async function createLoop(data: Partial<Loop>) {
  return apiRequest("POST", "/api/loops", data);
}

export async function updateLoop(id: string, data: Partial<Loop>) {
  return apiRequest("PATCH", `/api/loops/${id}`, data);
}

export async function deleteLoop(id: string) {
  return apiRequest("DELETE", `/api/loops/${id}`);
}

export async function fetchDocuments(loopId?: string): Promise<Document[]> {
  const url = loopId ? `/api/documents?loopId=${loopId}` : "/api/documents";
  const response = await fetch(url);
  if (!response.ok) throw new Error("Failed to fetch documents");
  return response.json();
}

export async function createDocument(data: Partial<Document>) {
  return apiRequest("POST", "/api/documents", data);
}

export async function deleteDocument(id: string) {
  return apiRequest("DELETE", `/api/documents/${id}`);
}

export async function fetchTasks(loopId?: string): Promise<Task[]> {
  const url = loopId ? `/api/tasks?loopId=${loopId}` : "/api/tasks";
  const response = await fetch(url);
  if (!response.ok) throw new Error("Failed to fetch tasks");
  return response.json();
}

export async function createTask(data: Partial<Task>) {
  return apiRequest("POST", "/api/tasks", data);
}

export async function updateTask(id: string, data: Partial<Task>) {
  return apiRequest("PATCH", `/api/tasks/${id}`, data);
}

export async function deleteTask(id: string) {
  return apiRequest("DELETE", `/api/tasks/${id}`);
}

export async function fetchParties(loopId?: string): Promise<Party[]> {
  const url = loopId ? `/api/parties?loopId=${loopId}` : "/api/parties";
  const response = await fetch(url);
  if (!response.ok) throw new Error("Failed to fetch parties");
  return response.json();
}

export async function createParty(data: Partial<Party>) {
  return apiRequest("POST", "/api/parties", data);
}

export async function deleteParty(id: string) {
  return apiRequest("DELETE", `/api/parties/${id}`);
}

export async function fetchMilestones(loopId?: string): Promise<Milestone[]> {
  const url = loopId ? `/api/milestones?loopId=${loopId}` : "/api/milestones";
  const response = await fetch(url);
  if (!response.ok) throw new Error("Failed to fetch milestones");
  return response.json();
}

export async function createMilestone(data: Partial<Milestone>) {
  return apiRequest("POST", "/api/milestones", data);
}

export async function updateMilestone(id: string, data: Partial<Milestone>) {
  return apiRequest("PATCH", `/api/milestones/${id}`, data);
}

export async function fetchActivities(loopId?: string): Promise<ActivityItem[]> {
  const url = loopId ? `/api/activities?loopId=${loopId}` : "/api/activities";
  const response = await fetch(url);
  if (!response.ok) throw new Error("Failed to fetch activities");
  const activities = await response.json();
  
  const validTypes = ["document", "signature", "message", "upload", "party", "status", "loop", "task"];
  
  return activities.map((activity: Activity): ActivityItem => {
    const now = Date.now();
    const created = new Date(activity.createdAt).getTime();
    const diffMinutes = Math.floor((now - created) / 60000);
    const diffHours = Math.floor(diffMinutes / 60);
    const diffDays = Math.floor(diffHours / 24);
    
    let timestamp = "";
    if (diffMinutes < 1) timestamp = "just now";
    else if (diffMinutes < 60) timestamp = `${diffMinutes} minute${diffMinutes > 1 ? 's' : ''} ago`;
    else if (diffHours < 24) timestamp = `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    else timestamp = `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    
    if (!validTypes.includes(activity.type)) {
      console.warn(`Invalid activity type: ${activity.type}. Defaulting to 'document'.`);
    }
    const type = validTypes.includes(activity.type) ? (activity.type as any) : "document";
    
    return {
      id: activity.id,
      type,
      user: { name: activity.userName },
      action: activity.action,
      target: activity.target,
      timestamp,
    };
  });
}

export async function createActivity(data: Partial<Activity>) {
  return apiRequest("POST", "/api/activities", data);
}

export async function fetchAnalytics(): Promise<Analytics> {
  const response = await fetch("/api/analytics");
  if (!response.ok) throw new Error("Failed to fetch analytics");
  return response.json();
}
