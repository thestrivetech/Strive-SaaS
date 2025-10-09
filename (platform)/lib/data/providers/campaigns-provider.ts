/**
 * Campaigns Data Provider
 *
 * Switches between mock data and real Prisma queries for campaigns
 * Usage: Import from this file instead of directly from Prisma or mocks
 */

import { dataConfig, simulateDelay, maybeThrowError } from '../config';
import {
  CMS_MOCK_DATA,
  type MockCampaign,
  type MockEmailCampaign,
} from '../mocks/content';

// ============================================================================
// TYPES
// ============================================================================

export interface CampaignFilters {
  status?: 'DRAFT' | 'PLANNING' | 'ACTIVE' | 'PAUSED' | 'COMPLETED' | 'CANCELLED';
  type?: 'EMAIL' | 'SOCIAL' | 'SMS' | 'MULTI_CHANNEL';
  search?: string;
  limit?: number;
  offset?: number;
}

export interface CampaignMetrics {
  total: number;
  active: number;
  completed: number;
  draft: number;
  paused: number;
}

export interface RecentCampaign {
  id: string;
  name: string;
  type: string;
  status: string;
  created_at: Date;
}

export interface EmailMetrics {
  emails: MockEmailCampaign[];
  totals: {
    sent: number;
    opened: number;
    clicked: number;
    bounced: number;
    unsubscribed: number;
  };
  metrics: {
    deliveryRate: number;
    openRate: number;
    clickRate: number;
    bounceRate: number;
  };
}

// ============================================================================
// CAMPAIGNS PROVIDER
// ============================================================================

export const campaignsProvider = {
  /**
   * Find many campaigns with filters
   */
  async findMany(organizationId: string, filters?: CampaignFilters): Promise<MockCampaign[]> {
    if (dataConfig.useMocks) {
      await simulateDelay();
      maybeThrowError('Failed to fetch campaigns');

      let campaigns = CMS_MOCK_DATA.campaigns.filter(
        (campaign) => campaign.organization_id === organizationId
      );

      // Apply filters
      if (filters?.status) {
        campaigns = campaigns.filter((c) => c.status === filters.status);
      }

      if (filters?.type) {
        campaigns = campaigns.filter((c) => c.type === filters.type);
      }

      if (filters?.search) {
        const searchLower = filters.search.toLowerCase();
        campaigns = campaigns.filter(
          (c) =>
            c.name.toLowerCase().includes(searchLower) ||
            c.description.toLowerCase().includes(searchLower)
        );
      }

      // Sort by created_at descending
      campaigns = campaigns.sort((a, b) => b.created_at.getTime() - a.created_at.getTime());

      // Apply pagination
      const offset = filters?.offset || 0;
      const limit = filters?.limit || 50;
      campaigns = campaigns.slice(offset, offset + limit);

      return campaigns;
    }

    // TODO: Replace with real Prisma query when schema is ready
    throw new Error('Real database not implemented yet - enable mock mode');
  },

  /**
   * Find single campaign by ID
   */
  async findById(id: string, organizationId: string): Promise<MockCampaign | null> {
    if (dataConfig.useMocks) {
      await simulateDelay();
      maybeThrowError('Failed to fetch campaign');

      const campaign = CMS_MOCK_DATA.campaigns.find(
        (campaign) => campaign.id === id && campaign.organization_id === organizationId
      );

      return campaign || null;
    }

    // TODO: Replace with real Prisma query
    throw new Error('Real database not implemented yet - enable mock mode');
  },

  /**
   * Get campaign metrics/statistics
   */
  async getMetrics(organizationId: string): Promise<CampaignMetrics> {
    if (dataConfig.useMocks) {
      await simulateDelay();
      maybeThrowError('Failed to fetch campaign metrics');

      const campaigns = CMS_MOCK_DATA.campaigns.filter(
        (c) => c.organization_id === organizationId
      );

      return {
        total: campaigns.length,
        active: campaigns.filter((c) => c.status === 'ACTIVE').length,
        completed: campaigns.filter((c) => c.status === 'COMPLETED').length,
        draft: campaigns.filter((c) => c.status === 'DRAFT').length,
        paused: campaigns.filter((c) => c.status === 'PAUSED').length,
      };
    }

    // TODO: Replace with real Prisma query
    throw new Error('Real database not implemented yet - enable mock mode');
  },

  /**
   * Get recent campaigns
   */
  async getRecent(organizationId: string, limit: number = 5): Promise<RecentCampaign[]> {
    if (dataConfig.useMocks) {
      await simulateDelay();
      maybeThrowError('Failed to fetch recent campaigns');

      const campaigns = CMS_MOCK_DATA.campaigns
        .filter((c) => c.organization_id === organizationId)
        .sort((a, b) => b.created_at.getTime() - a.created_at.getTime())
        .slice(0, limit);

      return campaigns.map((campaign) => ({
        id: campaign.id,
        name: campaign.name,
        type: campaign.type,
        status: campaign.status,
        created_at: campaign.created_at,
      }));
    }

    // TODO: Replace with real Prisma query
    throw new Error('Real database not implemented yet - enable mock mode');
  },

  /**
   * Get email campaigns for a specific campaign
   */
  async getEmailCampaigns(campaignId: string): Promise<MockEmailCampaign[]> {
    if (dataConfig.useMocks) {
      await simulateDelay();
      maybeThrowError('Failed to fetch email campaigns');

      return CMS_MOCK_DATA.emailCampaigns.filter((ec) => ec.campaign_id === campaignId);
    }

    // TODO: Replace with real Prisma query
    throw new Error('Real database not implemented yet - enable mock mode');
  },

  /**
   * Get email campaign metrics
   */
  async getEmailMetrics(organizationId: string): Promise<EmailMetrics> {
    if (dataConfig.useMocks) {
      await simulateDelay();
      maybeThrowError('Failed to fetch email metrics');

      // Filter email campaigns by organization via campaign relationship
      const orgCampaigns = CMS_MOCK_DATA.campaigns.filter(
        (c) => c.organization_id === organizationId && (c.type === 'EMAIL' || c.type === 'MULTI_CHANNEL')
      );
      const orgCampaignIds = orgCampaigns.map((c) => c.id);

      const emailCampaigns = CMS_MOCK_DATA.emailCampaigns.filter((ec) =>
        orgCampaignIds.includes(ec.campaign_id)
      );

      const totals = emailCampaigns.reduce(
        (acc, ec) => ({
          sent: acc.sent + ec.sent_count,
          opened: acc.opened + ec.opened_count,
          clicked: acc.clicked + ec.clicked_count,
          bounced: acc.bounced + ec.bounced_count,
          unsubscribed: acc.unsubscribed + ec.unsubscribed_count,
        }),
        { sent: 0, opened: 0, clicked: 0, bounced: 0, unsubscribed: 0 }
      );

      return {
        emails: emailCampaigns,
        totals,
        metrics: {
          deliveryRate: totals.sent > 0 ? ((totals.sent - totals.bounced) / totals.sent) * 100 : 0,
          openRate: totals.sent > 0 ? (totals.opened / totals.sent) * 100 : 0,
          clickRate: totals.opened > 0 ? (totals.clicked / totals.opened) * 100 : 0,
          bounceRate: totals.sent > 0 ? (totals.bounced / totals.sent) * 100 : 0,
        },
      };
    }

    // TODO: Replace with real Prisma query
    throw new Error('Real database not implemented yet - enable mock mode');
  },

  /**
   * Get count of campaigns with filters
   */
  async getCount(organizationId: string, filters?: CampaignFilters): Promise<number> {
    if (dataConfig.useMocks) {
      await simulateDelay();

      const campaigns = await this.findMany(organizationId, { ...filters, limit: 999999 });
      return campaigns.length;
    }

    // TODO: Replace with real Prisma query
    throw new Error('Real database not implemented yet - enable mock mode');
  },
};
