/**
 * Leads Mock Data Provider
 *
 * Provides mock leads data that matches the real Prisma query structure
 */

import { dataConfig, simulateDelay } from '../config';
import { leadsProvider } from './crm-provider';
import type { LeadFilters } from '@/lib/modules/crm/leads/schemas';

/**
 * Get leads with filters (mock-aware)
 */
export async function getLeads(filters?: LeadFilters) {
  if (dataConfig.useMocks) {
    await simulateDelay();

    // Get mock leads from the CRM provider
    const mockLeads = await leadsProvider.findMany('demo-org');

    // Transform mock leads to match Prisma structure
    const transformedLeads = mockLeads.map((lead) => ({
      ...lead,
      assigned_to: lead.assigned_to_id ? {
        id: lead.assigned_to_id,
        name: 'Demo Agent',
        email: 'agent@demo.com',
        avatar_url: null,
      } : null,
    }));

    // Apply filters
    let filteredLeads = transformedLeads;

    if (filters?.status) {
      const statuses = Array.isArray(filters.status) ? filters.status : [filters.status];
      filteredLeads = filteredLeads.filter(l => statuses.includes(l.status as any));
    }

    if (filters?.search) {
      const search = filters.search.toLowerCase();
      filteredLeads = filteredLeads.filter(l =>
        l.name?.toLowerCase().includes(search) ||
        l.email?.toLowerCase().includes(search) ||
        l.company?.toLowerCase().includes(search)
      );
    }

    // Apply sorting
    if (filters?.sort_by === 'created_at') {
      filteredLeads.sort((a, b) => {
        const aTime = new Date(a.created_at).getTime();
        const bTime = new Date(b.created_at).getTime();
        return filters.sort_order === 'asc' ? aTime - bTime : bTime - aTime;
      });
    }

    // Apply pagination
    const offset = filters?.offset || 0;
    const limit = filters?.limit || 50;
    return filteredLeads.slice(offset, offset + limit);
  }

  throw new Error('Real leads queries not implemented - enable mock mode');
}

/**
 * Get lead by ID (mock-aware)
 */
export async function getLeadById(leadId: string) {
  if (dataConfig.useMocks) {
    await simulateDelay();
    const lead = await leadsProvider.findById(leadId, 'demo-org');

    if (!lead) return null;

    return {
      ...lead,
      assigned_to: lead.assigned_to_id ? {
        id: lead.assigned_to_id,
        name: 'Demo Agent',
        email: 'agent@demo.com',
        avatar_url: null,
      } : null,
      activities: [],
      deals: [],
    };
  }

  throw new Error('Real leads queries not implemented - enable mock mode');
}
