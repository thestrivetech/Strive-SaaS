// Check if mock mode is enabled
import { dataConfig } from '@/lib/data/config';

// Export public API
export {
  createLead,
  updateLead,
  deleteLead,
  updateLeadScore,
  updateLeadStatus,
  bulkAssignLeads,
  convertLead,
} from './actions';

// Queries - Use mock data if enabled
export const getLeads = dataConfig.useMocks
  ? async (filters?: any) => (await import('@/lib/data/providers/leads-provider')).getLeads(filters)
  : async (filters?: any) => (await import('./queries')).getLeads(filters);

export const getLeadsCount = dataConfig.useMocks
  ? async () => 15
  : async (filters?: any) => (await import('./queries')).getLeadsCount(filters);

export const getLeadById = dataConfig.useMocks
  ? async (id: string) => (await import('@/lib/data/providers/leads-provider')).getLeadById(id)
  : async (id: string) => (await import('./queries')).getLeadById(id);

export const getLeadStats = dataConfig.useMocks
  ? async () => ({ totalLeads: 15, newLeads: 5, qualifiedLeads: 8, hotLeads: 3, warmLeads: 7, coldLeads: 5 })
  : async () => (await import('./queries')).getLeadStats();

export const searchLeads = dataConfig.useMocks
  ? async () => []
  : async (query: string, limit?: number) => (await import('./queries')).searchLeads(query, limit);

export const getLeadsByAssignee = dataConfig.useMocks
  ? async () => []
  : async (userId: string) => (await import('./queries')).getLeadsByAssignee(userId);

// Re-export Prisma types
export type { leads as Lead } from '@prisma/client';
