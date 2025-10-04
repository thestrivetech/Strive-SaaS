import { PhaseStatus } from "@/lib/phase-status";

export interface Lead {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar?: string;
  score: "hot" | "warm" | "cold";
  source: string;
  createdAt: Date;
  agentName?: string;
  agentAvatar?: string;
  phase: PhaseStatus;
  lastContact: Date;
  nextReminder?: Date;
  value?: string;
  isClient?: boolean;
  closedDate?: Date;
  followUps?: FollowUp[];
  notes?: Note[];
}

export interface Client extends Lead {
  isClient: true;
  closedDate: Date;
  followUps: FollowUp[];
  notes: Note[];
}

export interface FollowUp {
  id: string;
  type: "email" | "call" | "card" | "meeting";
  title: string;
  description?: string;
  scheduledDate: Date;
  recurring?: "quarterly" | "biannual" | "annual";
  completed: boolean;
}

export interface Note {
  id: string;
  content: string;
  createdAt: Date;
  createdBy: string;
}
