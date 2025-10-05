// lib/services/crm-integration.ts
import 'server-only';

import { PrismaClient } from '@prisma/client';
import { PropertyPreferences, ContactInfo } from '@/lib/ai/data-extraction';

const prisma = new PrismaClient();

/**
 * Lead score calculation based on engagement and preferences
 */
export enum LeadScore {
  COLD = 'COLD',
  WARM = 'WARM',
  HOT = 'HOT',
  QUALIFIED = 'QUALIFIED',
}

/**
 * Calculate lead score based on conversation engagement
 */
function calculateLeadScore(
  messageCount: number,
  hasContactInfo: boolean,
  hasCompleteCriteria: boolean,
  viewedProperties: number,
  budget?: number
): { score: LeadScore; scoreValue: number } {
  let scoreValue = 0;

  // Engagement points
  scoreValue += messageCount * 5; // 5 points per message
  if (hasContactInfo) scoreValue += 30; // Big boost for contact info
  if (hasCompleteCriteria) scoreValue += 20; // Complete search criteria
  scoreValue += viewedProperties * 10; // 10 points per property viewed

  // Budget qualifier
  if (budget && budget >= 500000) scoreValue += 15; // Higher budget = more serious

  // Determine score tier
  let score: LeadScore;
  if (scoreValue >= 80 && hasContactInfo) {
    score = LeadScore.QUALIFIED; // Ready for agent contact
  } else if (scoreValue >= 50) {
    score = LeadScore.HOT; // Very engaged
  } else if (scoreValue >= 25) {
    score = LeadScore.WARM; // Moderately engaged
  } else {
    score = LeadScore.COLD; // Just started
  }

  return { score, scoreValue };
}

/**
 * Determine lead status based on conversation stage
 */
function determineLeadStatus(
  canSearch: boolean,
  hasSearched: boolean,
  hasScheduledShowing: boolean
): string {
  if (hasScheduledShowing) return 'CONTACTED'; // Agent engaged
  if (hasSearched) return 'QUALIFIED'; // Saw properties
  if (canSearch) return 'WORKING'; // Has criteria, ready to search
  return 'NEW_LEAD'; // Just started conversation
}

/**
 * Create or update lead in CRM from chatbot conversation
 */
export async function syncLeadToCRM(params: {
  sessionId: string;
  organizationId: string;
  contactInfo?: ContactInfo;
  propertyPreferences?: PropertyPreferences;
  messageCount: number;
  hasSearched?: boolean;
  viewedProperties?: string[];
  lastMessage: string;
}): Promise<{ leadId: string; isNew: boolean }> {
  const {
    sessionId,
    organizationId,
    contactInfo,
    propertyPreferences,
    messageCount,
    hasSearched = false,
    viewedProperties = [],
    lastMessage,
  } = params;

  try {
    // Check if lead already exists for this session
    const existingLead = await prisma.leads.findFirst({
      where: {
        organization_id: organizationId,
        custom_fields: {
          path: ['chatbot_session_id'],
          equals: sessionId,
        },
      },
    });

    // Calculate lead score
    const hasContactInfo = !!(contactInfo?.email || contactInfo?.phone || contactInfo?.name);
    const hasCompleteCriteria = !!(propertyPreferences?.location && propertyPreferences?.maxPrice);
    const { score, scoreValue } = calculateLeadScore(
      messageCount,
      hasContactInfo,
      hasCompleteCriteria,
      viewedProperties.length,
      propertyPreferences?.maxPrice
    );

    // Determine status
    const status = determineLeadStatus(hasCompleteCriteria, hasSearched, false);

    // Build custom fields JSON
    const customFields = {
      chatbot_session_id: sessionId,
      property_preferences: propertyPreferences ? {
        location: propertyPreferences.location,
        maxPrice: propertyPreferences.maxPrice,
        minBedrooms: propertyPreferences.minBedrooms,
        minBathrooms: propertyPreferences.minBathrooms,
        mustHaveFeatures: propertyPreferences.mustHaveFeatures || [],
        niceToHaveFeatures: propertyPreferences.niceToHaveFeatures || [],
        propertyType: propertyPreferences.propertyType,
        timeline: propertyPreferences.timeline,
        isFirstTimeBuyer: propertyPreferences.isFirstTimeBuyer,
        currentSituation: propertyPreferences.currentSituation,
      } : undefined,
      last_property_search: hasSearched ? new Date().toISOString() : undefined,
      viewed_properties: viewedProperties,
      chatbot_engagement: {
        message_count: messageCount,
        last_message: lastMessage,
        last_interaction: new Date().toISOString(),
      },
    };

    if (existingLead) {
      // Update existing lead
      const updatedLead = await prisma.leads.update({
        where: { id: existingLead.id },
        data: {
          name: contactInfo?.name || existingLead.name,
          email: contactInfo?.email || existingLead.email,
          phone: contactInfo?.phone || existingLead.phone,
          budget: propertyPreferences?.maxPrice ? propertyPreferences.maxPrice.toString() : existingLead.budget,
          timeline: propertyPreferences?.timeline || existingLead.timeline,
          score: score,
          score_value: scoreValue,
          status: status as any,
          notes: `Last message: "${lastMessage.slice(0, 200)}"`,
          custom_fields: customFields as any,
          last_contact_at: new Date(),
          updated_at: new Date(),
        },
      });

      console.log(`✅ Updated lead ${updatedLead.id} (score: ${score}, status: ${status})`);

      return { leadId: updatedLead.id, isNew: false };
    } else {
      // Create new lead
      const newLead = await prisma.leads.create({
        data: {
          organization_id: organizationId,
          name: contactInfo?.name || 'Chatbot Lead',
          email: contactInfo?.email || undefined,
          phone: contactInfo?.phone || undefined,
          source: 'CHATBOT',
          status: status as any,
          score: score,
          score_value: scoreValue,
          budget: propertyPreferences?.maxPrice ? propertyPreferences.maxPrice.toString() : undefined,
          timeline: propertyPreferences?.timeline,
          notes: `First message: "${lastMessage.slice(0, 200)}"`,
          tags: ['chatbot', 'real-estate'],
          custom_fields: customFields as any,
          last_contact_at: new Date(),
        },
      });

      console.log(`✅ Created new lead ${newLead.id} (score: ${score}, status: ${status})`);

      return { leadId: newLead.id, isNew: true };
    }
  } catch (error) {
    console.error('❌ CRM sync error:', error);
    throw new Error('Failed to sync lead to CRM');
  }
}

/**
 * Log conversation activity to CRM
 */
export async function logActivity(params: {
  organizationId: string;
  leadId: string;
  activityType: 'message' | 'property_view' | 'property_search' | 'showing_request';
  description: string;
  metadata?: Record<string, any>;
}): Promise<void> {
  const { organizationId, leadId, activityType, description, metadata } = params;

  try {
    // Find the lead to get assigned user
    const lead = await prisma.leads.findUnique({
      where: { id: leadId },
      select: { assigned_to_id: true },
    });

    await prisma.activities.create({
      data: {
        organization_id: organizationId,
        lead_id: leadId,
        contact_id: undefined, // Chatbot leads are in leads table, not contacts
        type: activityType === 'message' ? 'NOTE' : 'CALL', // Map to CRM activity types
        title: `Chatbot: ${activityType}`,
        description,
        metadata: metadata as any,
        completed_at: new Date(),
        assigned_to_id: lead?.assigned_to_id || undefined,
      },
    });

    console.log(`📝 Logged activity: ${activityType} for lead ${leadId}`);
  } catch (error) {
    console.error('❌ Activity logging error:', error);
    // Don't throw - activity logging is non-critical
  }
}

/**
 * Track property views for a lead
 */
export async function trackPropertyView(params: {
  sessionId: string;
  organizationId: string;
  propertyId: string;
  propertyAddress: string;
}): Promise<void> {
  const { sessionId, organizationId, propertyId, propertyAddress } = params;

  try {
    // Find lead by session
    const lead = await prisma.leads.findFirst({
      where: {
        organization_id: organizationId,
        custom_fields: {
          path: ['chatbot_session_id'],
          equals: sessionId,
        },
      },
    });

    if (!lead) {
      console.warn('⚠️ No lead found for property view tracking');
      return;
    }

    // Update viewed properties
    const customFields = lead.custom_fields as any;
    const viewedProperties = customFields?.viewed_properties || [];

    if (!viewedProperties.includes(propertyId)) {
      viewedProperties.push(propertyId);

      await prisma.leads.update({
        where: { id: lead.id },
        data: {
          custom_fields: {
            ...customFields,
            viewed_properties: viewedProperties,
          } as any,
        },
      });

      // Log activity
      await logActivity({
        organizationId,
        leadId: lead.id,
        activityType: 'property_view',
        description: `Viewed property: ${propertyAddress}`,
        metadata: { property_id: propertyId, property_address: propertyAddress },
      });
    }
  } catch (error) {
    console.error('❌ Property view tracking error:', error);
    // Don't throw - tracking is non-critical
  }
}

/**
 * Create showing appointment request
 */
export async function requestShowing(params: {
  sessionId: string;
  organizationId: string;
  propertyId: string;
  propertyAddress: string;
  requestedDate?: Date;
  requestedTime?: string;
}): Promise<{ appointmentId: string }> {
  const { sessionId, organizationId, propertyId, propertyAddress, requestedDate, requestedTime } = params;

  try {
    // Find lead by session
    const lead = await prisma.leads.findFirst({
      where: {
        organization_id: organizationId,
        custom_fields: {
          path: ['chatbot_session_id'],
          equals: sessionId,
        },
      },
    });

    if (!lead) {
      throw new Error('Lead not found for showing request');
    }

    // Find or assign default agent
    const assignedAgent = lead.assigned_to_id || await getDefaultAgent(organizationId);

    if (!assignedAgent) {
      throw new Error('No agent available for showing');
    }

    // Create appointment (showing request)
    const appointment = await prisma.appointments.create({
      data: {
        organization_id: organizationId,
        contact_id: undefined, // Link to lead via activity log instead
        assigned_to: assignedAgent,
        title: `Property Showing: ${propertyAddress}`,
        description: `Chatbot showing request for property ${propertyId}\nRequested by: ${lead.name || 'Unknown'}\nEmail: ${lead.email || 'N/A'}\nPhone: ${lead.phone || 'N/A'}`,
        start_time: requestedDate || new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow by default
        end_time: requestedDate ? new Date(requestedDate.getTime() + 60 * 60 * 1000) : new Date(Date.now() + 25 * 60 * 60 * 1000), // 1 hour duration
        status: 'PENDING',
        location: propertyAddress,
      },
    });

    // Update lead status
    await prisma.leads.update({
      where: { id: lead.id },
      data: {
        status: 'CONTACTED',
        score: LeadScore.QUALIFIED,
      },
    });

    // Log activity
    await logActivity({
      organizationId,
      leadId: lead.id,
      activityType: 'showing_request',
      description: `Requested showing for ${propertyAddress}${requestedDate ? ` on ${requestedDate.toDateString()}` : ''}`,
      metadata: {
        property_id: propertyId,
        property_address: propertyAddress,
        appointment_id: appointment.id,
      },
    });

    console.log(`📅 Created showing request ${appointment.id} for lead ${lead.id}`);

    return { appointmentId: appointment.id };
  } catch (error) {
    console.error('❌ Showing request error:', error);
    throw new Error('Failed to create showing request');
  }
}

/**
 * Get default agent for organization (for auto-assignment)
 */
async function getDefaultAgent(organizationId: string): Promise<string | null> {
  try {
    // Find first active admin or employee
    const user = await prisma.users.findFirst({
      where: {
        organization_id: organizationId,
        role: {
          in: ['ADMIN', 'EMPLOYEE'],
        },
      },
      orderBy: { created_at: 'asc' },
    });

    return user?.id || null;
  } catch (error) {
    console.error('❌ Default agent lookup error:', error);
    return null;
  }
}

/**
 * Get lead summary for agent handoff
 */
export async function getLeadSummary(sessionId: string, organizationId: string): Promise<{
  lead: any;
  preferences: PropertyPreferences | null;
  engagementMetrics: {
    messageCount: number;
    viewedProperties: number;
    score: string;
    status: string;
  };
}> {
  try {
    const lead = await prisma.leads.findFirst({
      where: {
        organization_id: organizationId,
        custom_fields: {
          path: ['chatbot_session_id'],
          equals: sessionId,
        },
      },
    });

    if (!lead) {
      throw new Error('Lead not found');
    }

    const customFields = lead.custom_fields as any;
    const preferences = customFields?.property_preferences || null;
    const engagement = customFields?.chatbot_engagement || {};
    const viewedProperties = customFields?.viewed_properties || [];

    return {
      lead,
      preferences,
      engagementMetrics: {
        messageCount: engagement.message_count || 0,
        viewedProperties: viewedProperties.length,
        score: lead.score,
        status: lead.status,
      },
    };
  } catch (error) {
    console.error('❌ Lead summary error:', error);
    throw new Error('Failed to get lead summary');
  }
}
