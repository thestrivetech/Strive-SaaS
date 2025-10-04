/**
 * CRM Basic Tool - Type Definitions
 */

export interface CRMBasicSettings {
  autoAssignLeads: boolean;
  leadScoring: boolean;
  notifyOnNewLead: boolean;
  roundRobinAssignment: boolean;
}

export interface LeadData {
  id: string;
  name: string;
  email: string;
  phone?: string;
  source: string;
  status: 'new' | 'contacted' | 'qualified' | 'lost';
  score?: number;
  assignedTo?: string;
  createdAt: Date;
}
