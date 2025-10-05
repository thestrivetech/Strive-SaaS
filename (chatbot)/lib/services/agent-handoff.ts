// lib/services/agent-handoff.ts
import 'server-only';

import { PrismaClient } from '@prisma/client';
import { getLeadSummary } from './crm-integration';
import { getConversationMemory } from './conversation-memory';
import { PropertyPreferences } from '../ai/data-extraction';

const prisma = new PrismaClient();

export interface AgentHandoffRequest {
  sessionId: string;
  organizationId: string;
  reason: 'complex_question' | 'technical_issue' | 'user_request' | 'scheduling' | 'pricing_negotiation' | 'other';
  userMessage?: string;
  notes?: string;
}

export interface AgentHandoffResponse {
  success: boolean;
  agentInfo?: {
    id: string;
    name: string;
    email: string;
    phone: string;
    title?: string;
    photoUrl?: string;
  };
  leadSummary: string;
  conversationTranscript: string;
  estimatedResponseTime: string;
  message: string;
}

/**
 * Initiate handoff from chatbot to human agent
 */
export async function initiateAgentHandoff(
  request: AgentHandoffRequest
): Promise<AgentHandoffResponse> {
  const { sessionId, organizationId, reason, userMessage, notes } = request;

  try {
    // Get lead summary from CRM
    const { lead, preferences, engagementMetrics } = await getLeadSummary(sessionId, organizationId);

    // Get conversation memory
    const memory = getConversationMemory(sessionId);

    // Find best available agent
    const agent = await findBestAgent(organizationId, preferences, reason);

    if (!agent) {
      return {
        success: false,
        leadSummary: '',
        conversationTranscript: '',
        estimatedResponseTime: '',
        message: "I'm having trouble connecting you with an agent right now. Please email support@strivetech.ai or call (555) 123-4567 for immediate assistance.",
      };
    }

    // Create handoff record in database
    await createHandoffRecord({
      leadId: lead.id,
      agentId: agent.id,
      reason,
      sessionId,
      organizationId,
    });

    // Build conversation transcript
    const transcript = buildConversationTranscript(memory);

    // Build lead summary for agent
    const leadSummary = buildLeadSummaryForAgent(lead, preferences, engagementMetrics, memory);

    // Notify agent (via email/SMS/platform notification)
    await notifyAgent({
      agent,
      lead,
      reason,
      transcript,
      summary: leadSummary,
      userMessage,
    });

    // Update lead status
    await prisma.leads.update({
      where: { id: lead.id },
      data: {
        status: 'CONTACTED',
        assigned_to_id: agent.id,
      },
    });

    const estimatedResponseTime = getEstimatedResponseTime(reason);

    return {
      success: true,
      agentInfo: {
        id: agent.id,
        name: agent.full_name || 'Your Agent',
        email: agent.email,
        phone: agent.phone || '',
        title: agent.job_title || 'Real Estate Agent',
        photoUrl: agent.avatar_url || undefined,
      },
      leadSummary,
      conversationTranscript: transcript,
      estimatedResponseTime,
      message: buildHandoffMessage(agent, estimatedResponseTime, reason),
    };
  } catch (error) {
    console.error('❌ Agent handoff error:', error);

    return {
      success: false,
      leadSummary: '',
      conversationTranscript: '',
      estimatedResponseTime: '',
      message: "I apologize, but I'm having trouble connecting you with an agent. Please contact us directly at support@strivetech.ai.",
    };
  }
}

/**
 * Find the best available agent for the lead
 */
async function findBestAgent(
  organizationId: string,
  preferences: PropertyPreferences | null,
  reason: string
): Promise<any> {
  try {
    // Priority 1: Agents with matching location expertise
    if (preferences?.location) {
      const locationAgents = await prisma.users.findMany({
        where: {
          organization_id: organizationId,
          role: { in: ['ADMIN', 'EMPLOYEE'] },
          custom_fields: {
            path: ['territories'],
            array_contains: preferences.location,
          },
        },
        orderBy: { created_at: 'asc' },
        take: 1,
      });

      if (locationAgents.length > 0) {
        return locationAgents[0];
      }
    }

    // Priority 2: Agents with lowest active lead count (round-robin)
    const agents = await prisma.users.findMany({
      where: {
        organization_id: organizationId,
        role: { in: ['ADMIN', 'EMPLOYEE'] },
      },
      include: {
        _count: {
          select: {
            leads_assigned: true,
          },
        },
      },
      orderBy: {
        leads_assigned: {
          _count: 'asc',
        },
      },
      take: 1,
    });

    if (agents.length > 0) {
      return agents[0];
    }

    // Priority 3: Any admin
    const admin = await prisma.users.findFirst({
      where: {
        organization_id: organizationId,
        role: 'ADMIN',
      },
    });

    return admin;
  } catch (error) {
    console.error('❌ Error finding agent:', error);
    return null;
  }
}

/**
 * Build conversation transcript for agent
 */
function buildConversationTranscript(memory: any): string {
  const transcript: string[] = [
    '## 💬 Conversation Transcript',
    '',
    '*Note: This is a summary of the chatbot conversation.*',
    '',
  ];

  // Add conversation history if available
  if (memory.conversationSummary) {
    transcript.push(memory.conversationSummary);
  } else {
    transcript.push('*(Conversation history not available)*');
  }

  return transcript.join('\n');
}

/**
 * Build lead summary for agent
 */
function buildLeadSummaryForAgent(
  lead: any,
  preferences: PropertyPreferences | null,
  metrics: any,
  memory: any
): string {
  const summary: string[] = [
    '## 📋 Lead Summary',
    '',
    `**Name:** ${lead.name}`,
    `**Email:** ${lead.email || 'Not provided'}`,
    `**Phone:** ${lead.phone || 'Not provided'}`,
    `**Lead Score:** ${lead.score} (${lead.score_value} points)`,
    `**Status:** ${lead.status}`,
    '',
    '### 🏠 Property Preferences:',
    '',
  ];

  if (preferences) {
    if (preferences.location) summary.push(`- **Location:** ${preferences.location}`);
    if (preferences.maxPrice) summary.push(`- **Max Budget:** $${preferences.maxPrice.toLocaleString()}`);
    if (preferences.minBedrooms) summary.push(`- **Bedrooms:** ${preferences.minBedrooms}+ bed`);
    if (preferences.minBathrooms) summary.push(`- **Bathrooms:** ${preferences.minBathrooms}+ bath`);
    if (preferences.propertyType) summary.push(`- **Type:** ${preferences.propertyType}`);

    if (preferences.mustHaveFeatures && preferences.mustHaveFeatures.length > 0) {
      summary.push(`- **Must-Haves:** ${preferences.mustHaveFeatures.join(', ')}`);
    }

    if (preferences.timeline) summary.push(`- **Timeline:** ${preferences.timeline}`);
  } else {
    summary.push('*No preferences collected yet*');
  }

  summary.push('');
  summary.push('### 📊 Engagement Metrics:');
  summary.push('');
  summary.push(`- **Messages:** ${metrics.messageCount}`);
  summary.push(`- **Properties Viewed:** ${metrics.viewedProperties}`);
  summary.push(`- **Lead Quality:** ${metrics.score}`);

  if (memory.propertiesFavorited && memory.propertiesFavorited.length > 0) {
    summary.push(`- **Favorites:** ${memory.propertiesFavorited.length} properties`);
  }

  return summary.join('\n');
}

/**
 * Notify agent about handoff
 */
async function notifyAgent(params: {
  agent: any;
  lead: any;
  reason: string;
  transcript: string;
  summary: string;
  userMessage?: string;
}): Promise<void> {
  const { agent, lead, reason, transcript, summary, userMessage } = params;

  try {
    // Create activity for agent
    await prisma.activities.create({
      data: {
        organization_id: lead.organization_id,
        lead_id: lead.id,
        assigned_to_id: agent.id,
        type: 'CALL', // Agent needs to follow up
        title: `Chatbot Handoff: ${reason}`,
        description: `${summary}\n\n${transcript}\n\n**User's Last Message:**\n${userMessage || 'N/A'}`,
        metadata: {
          handoff_reason: reason,
          chatbot_session: true,
        } as any,
      },
    });

    // TODO: Send email/SMS notification to agent
    // await sendEmailNotification(agent.email, { lead, summary });

    console.log(`✅ Agent ${agent.full_name} notified about handoff for lead ${lead.id}`);
  } catch (error) {
    console.error('❌ Error notifying agent:', error);
    // Non-critical - don't throw
  }
}

/**
 * Create handoff record in database
 */
async function createHandoffRecord(params: {
  leadId: string;
  agentId: string;
  reason: string;
  sessionId: string;
  organizationId: string;
}): Promise<void> {
  const { leadId, agentId, reason, sessionId, organizationId } = params;

  try {
    // Log as activity
    await prisma.activities.create({
      data: {
        organization_id: organizationId,
        lead_id: leadId,
        assigned_to_id: agentId,
        type: 'NOTE',
        title: 'Chatbot Handoff',
        description: `Lead handed off from chatbot to agent. Reason: ${reason}`,
        metadata: {
          chatbot_session_id: sessionId,
          handoff_reason: reason,
          handoff_timestamp: new Date().toISOString(),
        } as any,
      },
    });
  } catch (error) {
    console.error('❌ Error creating handoff record:', error);
  }
}

/**
 * Get estimated response time based on reason
 */
function getEstimatedResponseTime(reason: string): string {
  const timeframes: Record<string, string> = {
    complex_question: 'within 2 hours',
    technical_issue: 'within 1 hour',
    user_request: 'within 30 minutes',
    scheduling: 'within 15 minutes',
    pricing_negotiation: 'within 1 hour',
    other: 'within 2 hours',
  };

  return timeframes[reason] || 'within 2 hours';
}

/**
 * Build handoff message for user
 */
function buildHandoffMessage(
  agent: any,
  estimatedResponseTime: string,
  reason: string
): string {
  const reasonMessages: Record<string, string> = {
    complex_question: "I've connected you with an expert who can better answer your questions.",
    technical_issue: "I've escalated this to our technical team.",
    user_request: "I've connected you with a specialist as requested.",
    scheduling: "I've connected you with an agent who can help you schedule your showing.",
    pricing_negotiation: "I've connected you with an agent who can discuss pricing and offers.",
    other: "I've connected you with a specialist who can help you further.",
  };

  return `🤝 **Connecting You with ${agent.full_name}**

${reasonMessages[reason] || "I've connected you with a specialist."}

**${agent.full_name}** will reach out to you ${estimatedResponseTime}.

In the meantime, feel free to continue exploring properties or ask me any other questions! I'm here to help. 😊`;
}

/**
 * Check if handoff should be triggered automatically
 */
export function shouldTriggerAutoHandoff(params: {
  conversationLength: number;
  leadScore: number;
  propertiesViewed: number;
  userFrustrationDetected: boolean;
  complexQuestionDetected: boolean;
}): { should: boolean; reason?: string } {
  const { conversationLength, leadScore, propertiesViewed, userFrustrationDetected, complexQuestionDetected } = params;

  // Auto-handoff if user is frustrated
  if (userFrustrationDetected) {
    return { should: true, reason: 'user_request' };
  }

  // Auto-handoff for highly qualified leads
  if (leadScore >= 80 && propertiesViewed >= 3) {
    return { should: true, reason: 'scheduling' };
  }

  // Auto-handoff for complex questions
  if (complexQuestionDetected) {
    return { should: true, reason: 'complex_question' };
  }

  // Auto-handoff for very long conversations (may be going in circles)
  if (conversationLength >= 20) {
    return { should: true, reason: 'other' };
  }

  return { should: false };
}

/**
 * Detect frustration in user message
 */
export function detectUserFrustration(message: string): boolean {
  const frustrationKeywords = [
    'speak to a person',
    'talk to someone',
    'human',
    'agent',
    'representative',
    'frustrated',
    'not helpful',
    "doesn't understand",
    'useless',
    'annoying',
    'stop',
  ];

  const lowerMessage = message.toLowerCase();

  return frustrationKeywords.some(keyword => lowerMessage.includes(keyword));
}

/**
 * Detect complex question that might need agent expertise
 */
export function detectComplexQuestion(message: string): boolean {
  const complexKeywords = [
    'legal',
    'contract',
    'negotiation',
    'offer',
    'inspection',
    'appraisal',
    'closing costs',
    'HOA',
    'mortgage',
    'financing',
    'pre-approval',
    'title',
    'escrow',
  ];

  const lowerMessage = message.toLowerCase();

  return complexKeywords.some(keyword => lowerMessage.includes(keyword));
}
