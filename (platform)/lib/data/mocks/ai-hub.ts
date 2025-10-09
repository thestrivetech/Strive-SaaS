/**
 * Mock AI Hub Data
 *
 * Generate mock data for AI Hub module (conversations, automations, insights, content generation, usage tracking)
 */

import {
  generateId,
  randomFromArray,
  randomName,
  randomEmail,
  randomCurrency,
  randomPastDate,
  randomFutureDate,
  randomBoolean,
  randomInt,
  randomDate,
} from './generators';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export type MockConversation = {
  id: string;
  organization_id: string;
  user_id: string;
  title: string;
  summary: string | null;
  status: 'ACTIVE' | 'ARCHIVED';
  message_count: number;
  started_at: Date;
  last_message_at: Date;
  created_at: Date;
};

export type MockMessage = {
  id: string;
  conversation_id: string;
  role: 'USER' | 'ASSISTANT' | 'SYSTEM';
  content: string;
  timestamp: Date;
  tokens_used: number | null;
};

export type MockAutomation = {
  id: string;
  organization_id: string;
  name: string;
  description: string;
  trigger_type: 'SCHEDULE' | 'EVENT' | 'MANUAL' | 'WEBHOOK';
  trigger_config: {
    schedule?: string; // cron expression for SCHEDULE
    event_type?: string; // for EVENT
  };
  action_type: 'EMAIL' | 'SMS' | 'API_CALL' | 'CREATE_TASK' | 'UPDATE_RECORD' | 'NOTIFICATION';
  action_config: any; // JSON config for action
  status: 'ACTIVE' | 'PAUSED' | 'DRAFT' | 'ERROR';
  last_run_at: Date | null;
  next_run_at: Date | null;
  run_count: number;
  success_count: number;
  error_count: number;
  created_at: Date;
  updated_at: Date;
  created_by_id: string;
};

export type MockInsight = {
  id: string;
  organization_id: string;
  title: string;
  category: 'SALES' | 'MARKETING' | 'OPERATIONS' | 'FINANCE' | 'TRENDS' | 'OPPORTUNITIES';
  insight_type: 'PREDICTION' | 'RECOMMENDATION' | 'ALERT' | 'ANALYSIS';
  description: string;
  data_source: string; // e.g., "CRM Analysis", "Market Trends", etc.
  confidence_score: number; // 0-100
  impact_level: 'HIGH' | 'MEDIUM' | 'LOW';
  action_items: string[]; // Recommended actions
  metadata: any; // Additional structured data
  is_read: boolean;
  is_dismissed: boolean;
  generated_at: Date;
  expires_at: Date | null;
};

export type MockGeneratedContent = {
  id: string;
  organization_id: string;
  content_type: 'LISTING_DESCRIPTION' | 'EMAIL' | 'SOCIAL_POST' | 'BLOG_POST' | 'AD_COPY' | 'OTHER';
  title: string;
  content: string;
  prompt: string; // Original user prompt
  model: string; // AI model used
  tokens_used: number;
  status: 'DRAFT' | 'APPROVED' | 'PUBLISHED' | 'ARCHIVED';
  used_in: string | null; // Reference to where it was used
  generated_at: Date;
  generated_by_id: string;
};

export type MockAIUsage = {
  id: string;
  organization_id: string;
  user_id: string;
  feature: 'CHAT' | 'AUTOMATION' | 'INSIGHTS' | 'CONTENT_GEN' | 'ANALYSIS';
  action: string; // e.g., "message_sent", "automation_run", "insight_generated"
  tokens_used: number;
  cost_cents: number; // Cost in cents
  timestamp: Date;
  metadata: any;
};

// ============================================================================
// DATA POOLS
// ============================================================================

const CONVERSATION_TITLES = [
  'Property Listing Q&A',
  'Market Analysis Discussion',
  'Lead Qualification Chat',
  'Transaction Documentation Help',
  'Marketing Strategy Planning',
  'Pricing Strategy Analysis',
  'Comparative Market Analysis',
  'Investment Property Research',
  'Client Communication Tips',
  'Contract Review Questions',
  'Listing Description Ideas',
  'Social Media Content Planning',
  'Email Campaign Strategy',
  'Property Valuation Discussion',
  'Neighborhood Research',
  'Open House Planning',
  'Negotiation Strategies',
  'Closing Process Questions',
  'First-Time Buyer Guidance',
  'Luxury Market Insights',
  'Commercial Property Analysis',
  'Rental Market Research',
  'Property Staging Ideas',
  'Virtual Tour Planning',
  'SEO Strategy for Listings',
  'Client Retention Strategies',
  'Referral Program Design',
  'Market Trend Analysis',
  'Competitive Analysis',
  'Budget Planning Assistance',
];

const AUTOMATION_NAMES = [
  'Send Weekly Reports',
  'Lead Follow-up Sequence',
  'Property Alert Notifications',
  'Contract Reminder Emails',
  'Birthday Greetings',
  'Market Update Newsletter',
  'Task Assignment Automation',
  'Invoice Generation',
  'Client Check-in Emails',
  'Review Request Sequence',
  'Listing Syndication',
  'Open House Reminders',
  'Document Request Follow-ups',
  'Status Update Notifications',
  'Price Drop Alerts',
  'New Listing Announcements',
  'Appointment Confirmations',
  'Feedback Collection',
  'CRM Data Sync',
  'Lead Score Updates',
];

const INSIGHT_TITLES: { [K in MockInsight['category']]: string[] } = {
  SALES: [
    'Top Performing Listings This Month',
    'Conversion Rate Improvement Opportunity',
    'High-Value Lead Identification',
    'Pricing Strategy Optimization',
    'Deal Velocity Trending Up',
    'Closing Ratio Analysis',
    'Revenue Forecast for Q4',
    'Sales Pipeline Health Check',
  ],
  MARKETING: [
    'Social Media Engagement Spike',
    'Email Campaign Performance Peak',
    'Content Marketing ROI Increase',
    'Best Performing Ad Creatives',
    'SEO Rankings Improvement',
    'Website Traffic Growth',
    'Lead Generation Channel Analysis',
    'Brand Awareness Metrics',
  ],
  OPERATIONS: [
    'Task Completion Rate Improvement',
    'Team Productivity Insights',
    'Resource Allocation Optimization',
    'Process Bottleneck Identified',
    'Workflow Efficiency Gains',
    'Time Management Analysis',
    'Communication Pattern Insights',
    'Collaboration Opportunities',
  ],
  FINANCE: [
    'Expense Category Review',
    'Revenue Growth Trend',
    'Profit Margin Analysis',
    'Cost Reduction Opportunities',
    'Budget Variance Alert',
    'Cash Flow Projection',
    'Commission Structure Analysis',
    'ROI Optimization Recommendations',
  ],
  TRENDS: [
    'Market Price Trend Alert',
    'Neighborhood Growth Pattern',
    'Inventory Level Changes',
    'Buyer Demand Shift',
    'Seasonal Pattern Detection',
    'Property Type Preferences',
    'Price Point Sweet Spot',
    'Days on Market Trending',
  ],
  OPPORTUNITIES: [
    'Undervalued Property Alert',
    'High-Potential Lead Identified',
    'Market Entry Opportunity',
    'Partnership Opportunity',
    'Upsell Opportunity Detected',
    'Cross-Sell Recommendation',
    'Client Re-engagement Chance',
    'Referral Network Expansion',
  ],
};

const SAMPLE_PROMPTS = [
  'Write a compelling property description for a 3-bedroom modern home',
  'Create an email template for lead follow-up',
  'Generate social media posts for new listing',
  'Write blog post about local market trends',
  'Create ad copy for luxury property campaign',
  'Draft client appreciation email',
  'Write newsletter about investment opportunities',
  'Generate FAQ content for first-time buyers',
];

const SAMPLE_GENERATED_CONTENT: { [K in MockGeneratedContent['content_type']]: string[] } = {
  LISTING_DESCRIPTION: [
    'Welcome to this stunning 3-bedroom contemporary home featuring an open-concept layout, gourmet kitchen with granite countertops, and a spacious master suite. Located in a sought-after neighborhood with top-rated schools and easy access to shopping and dining.',
    'Discover luxury living in this beautifully appointed 4-bedroom estate. Featuring soaring ceilings, custom finishes throughout, and a resort-style backyard with pool and spa. Perfect for entertaining and everyday living.',
    'Charming starter home with endless potential! This cozy 2-bedroom bungalow sits on a generous lot with mature landscaping. Updates include new flooring, fresh paint, and modern fixtures. Move-in ready!',
  ],
  EMAIL: [
    'Subject: Just Listed - Your Dream Home Awaits!\n\nDear [Client],\n\nI\'m excited to share this exclusive new listing that matches your criteria perfectly. This beautiful property features everything on your wish list and more...',
    'Subject: Market Update - Great News for Sellers!\n\nHello [Client],\n\nI wanted to share some exciting news about the current market conditions in your area. Home values have increased by 8% this quarter...',
  ],
  SOCIAL_POST: [
    '🏡 NEW LISTING ALERT! Gorgeous 3BR home in [Neighborhood]. Open house this Saturday 1-4pm. Don\'t miss this opportunity! #RealEstate #JustListed',
    '✨ JUST SOLD! Another happy family found their dream home. Congratulations to my wonderful clients! Ready to make your move? Let\'s chat! #Realtor #JustSold',
  ],
  BLOG_POST: [
    'Top 5 Things to Know About Buying Your First Home\n\nBuying your first home is an exciting milestone, but it can also feel overwhelming. Here are the essential things every first-time buyer should know...',
    'Understanding the Current Real Estate Market: Trends and Insights\n\nThe real estate market is constantly evolving. In this post, we\'ll explore the latest trends and what they mean for buyers and sellers...',
  ],
  AD_COPY: [
    'Luxury Living Starts Here - Schedule Your Private Tour Today!',
    'Find Your Perfect Home - Expert Guidance Every Step of the Way',
  ],
  OTHER: [
    'General content piece for various uses.',
  ],
};

const AI_MODELS = [
  'GPT-4',
  'GPT-3.5-Turbo',
  'Claude-3-Sonnet',
  'Claude-3-Opus',
  'Gemini-Pro',
  'Llama-3-70B',
];

// ============================================================================
// CONVERSATION GENERATORS
// ============================================================================

/**
 * Generate a mock conversation
 */
export function generateMockConversation(
  orgId: string,
  userId: string,
  overrides?: Partial<MockConversation>
): MockConversation {
  const status = overrides?.status || (randomBoolean() && randomBoolean() ? 'ARCHIVED' : 'ACTIVE');
  const startedAt = overrides?.started_at || randomPastDate(30);
  const lastMessageAt = overrides?.last_message_at || randomDate(startedAt, new Date());
  const messageCount = overrides?.message_count || randomInt(3, 50);

  return {
    id: generateId(),
    organization_id: orgId,
    user_id: userId,
    title: randomFromArray(CONVERSATION_TITLES),
    summary: randomBoolean()
      ? 'Discussion about property analysis and market strategies with AI assistant.'
      : null,
    status,
    message_count: messageCount,
    started_at: startedAt,
    last_message_at: lastMessageAt,
    created_at: startedAt,
    ...overrides,
  };
}

/**
 * Generate multiple conversations
 */
export function generateMockConversations(
  orgId: string,
  userId: string,
  count: number = 30
): MockConversation[] {
  const conversations: MockConversation[] = [];

  // Distribution: 80% active, 20% archived
  const activeCount = Math.floor(count * 0.8);
  const archivedCount = count - activeCount;

  for (let i = 0; i < activeCount; i++) {
    conversations.push(generateMockConversation(orgId, userId, { status: 'ACTIVE' }));
  }

  for (let i = 0; i < archivedCount; i++) {
    conversations.push(generateMockConversation(orgId, userId, { status: 'ARCHIVED' }));
  }

  return conversations;
}

// ============================================================================
// MESSAGE GENERATORS
// ============================================================================

/**
 * Generate a mock message
 */
export function generateMockMessage(
  conversationId: string,
  role: 'USER' | 'ASSISTANT' | 'SYSTEM',
  content: string,
  overrides?: Partial<MockMessage>
): MockMessage {
  const tokensUsed = role === 'ASSISTANT' ? randomInt(50, 500) : null;

  return {
    id: generateId(),
    conversation_id: conversationId,
    role,
    content,
    timestamp: randomPastDate(30),
    tokens_used: tokensUsed,
    ...overrides,
  };
}

/**
 * Generate multiple messages for a conversation
 */
export function generateMockMessages(
  conversationId: string,
  count: number = 10
): MockMessage[] {
  const messages: MockMessage[] = [];
  const now = new Date();

  for (let i = 0; i < count; i++) {
    const minutesAgo = (count - i) * 5; // Space messages 5 minutes apart
    const timestamp = new Date(now.getTime() - minutesAgo * 60 * 1000);

    if (i % 2 === 0) {
      // User message
      messages.push(
        generateMockMessage(
          conversationId,
          'USER',
          'Can you help me analyze the market trends for this property?',
          { timestamp }
        )
      );
    } else {
      // Assistant response
      messages.push(
        generateMockMessage(
          conversationId,
          'ASSISTANT',
          'Of course! Based on the data, I can see that the property is in a growing market with strong demand. The neighborhood has seen a 12% increase in property values over the past year, and inventory is relatively low, which is favorable for sellers.',
          { timestamp }
        )
      );
    }
  }

  return messages;
}

// ============================================================================
// AUTOMATION GENERATORS
// ============================================================================

/**
 * Generate a mock automation
 */
export function generateMockAutomation(
  orgId: string,
  userId: string,
  overrides?: Partial<MockAutomation>
): MockAutomation {
  const triggerType = overrides?.trigger_type || randomFromArray([
    'SCHEDULE',
    'EVENT',
    'MANUAL',
    'WEBHOOK',
  ] as MockAutomation['trigger_type'][]);

  const actionType = overrides?.action_type || randomFromArray([
    'EMAIL',
    'SMS',
    'API_CALL',
    'CREATE_TASK',
    'UPDATE_RECORD',
    'NOTIFICATION',
  ] as MockAutomation['action_type'][]);

  const status = overrides?.status || randomFromArray([
    'ACTIVE',
    'ACTIVE',
    'ACTIVE', // 75% active
    'PAUSED',
  ] as MockAutomation['status'][]);

  const triggerConfig: any = {};
  if (triggerType === 'SCHEDULE') {
    triggerConfig.schedule = randomFromArray([
      '0 9 * * 1', // Every Monday at 9am
      '0 0 * * *', // Daily at midnight
      '0 9 * * 1-5', // Weekdays at 9am
      '0 12 1 * *', // First of month at noon
    ]);
  } else if (triggerType === 'EVENT') {
    triggerConfig.event_type = randomFromArray([
      'lead_created',
      'deal_closed',
      'task_completed',
      'listing_published',
    ]);
  }

  const actionConfig: any = {
    template_id: generateId(),
    recipients: ['user@example.com'],
  };

  const createdAt = randomPastDate(180);
  const runCount = status === 'ACTIVE' ? randomInt(10, 200) : randomInt(0, 10);
  const successRate = randomInt(85, 100) / 100;
  const successCount = Math.floor(runCount * successRate);
  const errorCount = runCount - successCount;

  const lastRunAt = status === 'ACTIVE' && runCount > 0 ? randomPastDate(7) : null;
  const nextRunAt = status === 'ACTIVE' && triggerType === 'SCHEDULE'
    ? randomFutureDate(7)
    : null;

  return {
    id: generateId(),
    organization_id: orgId,
    name: randomFromArray(AUTOMATION_NAMES),
    description: 'Automated workflow to streamline operations and improve efficiency.',
    trigger_type: triggerType,
    trigger_config: triggerConfig,
    action_type: actionType,
    action_config: actionConfig,
    status,
    last_run_at: lastRunAt,
    next_run_at: nextRunAt,
    run_count: runCount,
    success_count: successCount,
    error_count: errorCount,
    created_at: createdAt,
    updated_at: createdAt,
    created_by_id: userId,
    ...overrides,
  };
}

/**
 * Generate multiple automations
 */
export function generateMockAutomations(
  orgId: string,
  userId: string,
  count: number = 12
): MockAutomation[] {
  return Array.from({ length: count }, () => generateMockAutomation(orgId, userId));
}

// ============================================================================
// INSIGHT GENERATORS
// ============================================================================

/**
 * Generate a mock insight
 */
export function generateMockInsight(
  orgId: string,
  overrides?: Partial<MockInsight>
): MockInsight {
  const category = overrides?.category || randomFromArray([
    'SALES',
    'MARKETING',
    'OPERATIONS',
    'FINANCE',
    'TRENDS',
    'OPPORTUNITIES',
  ] as MockInsight['category'][]);

  const insightType = overrides?.insight_type || randomFromArray([
    'PREDICTION',
    'RECOMMENDATION',
    'ALERT',
    'ANALYSIS',
  ] as MockInsight['insight_type'][]);

  const impactLevel = overrides?.impact_level || randomFromArray([
    'HIGH',
    'HIGH', // 33% high
    'MEDIUM',
    'MEDIUM', // 33% medium
    'LOW',
    'LOW', // 33% low
  ] as MockInsight['impact_level'][]);

  const title = randomFromArray(INSIGHT_TITLES[category]);
  const confidenceScore = randomInt(70, 98);
  const generatedAt = randomPastDate(14);
  const expiresAt = randomBoolean() ? randomFutureDate(30) : null;

  const actionItems = [
    'Review detailed analysis and supporting data',
    'Share insights with relevant team members',
    'Implement recommended strategies',
    'Monitor progress and track outcomes',
  ].slice(0, randomInt(2, 4));

  const dataSources = [
    'CRM Analysis',
    'Market Trends',
    'Sales Performance',
    'Customer Behavior',
    'Financial Reports',
    'Industry Benchmarks',
  ];

  const metadata: any = {
    data_points: randomInt(100, 5000),
    timeframe: '30 days',
    comparison_period: 'Previous quarter',
  };

  return {
    id: generateId(),
    organization_id: orgId,
    title,
    category,
    insight_type: insightType,
    description: `AI-generated insight based on ${randomFromArray(dataSources)} data. Analysis shows significant patterns and opportunities for improvement.`,
    data_source: randomFromArray(dataSources),
    confidence_score: confidenceScore,
    impact_level: impactLevel,
    action_items: actionItems,
    metadata,
    is_read: randomBoolean() && randomBoolean(), // 25% read
    is_dismissed: false,
    generated_at: generatedAt,
    expires_at: expiresAt,
    ...overrides,
  };
}

/**
 * Generate multiple insights
 */
export function generateMockInsights(orgId: string, count: number = 20): MockInsight[] {
  return Array.from({ length: count }, () => generateMockInsight(orgId));
}

// ============================================================================
// GENERATED CONTENT GENERATORS
// ============================================================================

/**
 * Generate mock generated content
 */
export function generateMockGeneratedContent(
  orgId: string,
  userId: string,
  overrides?: Partial<MockGeneratedContent>
): MockGeneratedContent {
  const contentType = overrides?.content_type || randomFromArray([
    'LISTING_DESCRIPTION',
    'EMAIL',
    'SOCIAL_POST',
    'BLOG_POST',
    'AD_COPY',
    'OTHER',
  ] as MockGeneratedContent['content_type'][]);

  const status = overrides?.status || randomFromArray([
    'DRAFT',
    'DRAFT',
    'APPROVED',
    'PUBLISHED',
  ] as MockGeneratedContent['status'][]);

  const prompt = randomFromArray(SAMPLE_PROMPTS);
  const content = randomFromArray(SAMPLE_GENERATED_CONTENT[contentType]);
  const model = randomFromArray(AI_MODELS);
  const tokensUsed = randomInt(100, 1000);
  const generatedAt = randomPastDate(60);

  const titles = {
    LISTING_DESCRIPTION: 'Property Description',
    EMAIL: 'Email Campaign',
    SOCIAL_POST: 'Social Media Post',
    BLOG_POST: 'Blog Article',
    AD_COPY: 'Advertisement Copy',
    OTHER: 'Generated Content',
  };

  return {
    id: generateId(),
    organization_id: orgId,
    content_type: contentType,
    title: `${titles[contentType]} - ${generatedAt.toLocaleDateString()}`,
    content,
    prompt,
    model,
    tokens_used: tokensUsed,
    status,
    used_in: status === 'PUBLISHED' ? `listing_${generateId()}` : null,
    generated_at: generatedAt,
    generated_by_id: userId,
    ...overrides,
  };
}

/**
 * Generate multiple generated content items
 */
export function generateMockGeneratedContents(
  orgId: string,
  userId: string,
  count: number = 25
): MockGeneratedContent[] {
  return Array.from({ length: count }, () =>
    generateMockGeneratedContent(orgId, userId)
  );
}

// ============================================================================
// AI USAGE GENERATORS
// ============================================================================

/**
 * Generate mock AI usage entry
 */
export function generateMockAIUsage(
  orgId: string,
  userId: string,
  feature: MockAIUsage['feature'],
  overrides?: Partial<MockAIUsage>
): MockAIUsage {
  const actions = {
    CHAT: ['message_sent', 'conversation_started'],
    AUTOMATION: ['automation_run', 'automation_triggered'],
    INSIGHTS: ['insight_generated', 'insight_viewed'],
    CONTENT_GEN: ['content_generated', 'content_approved'],
    ANALYSIS: ['analysis_run', 'report_generated'],
  };

  const action = randomFromArray(actions[feature]);
  const tokensUsed = randomInt(50, 2000);
  const costCents = Math.floor(tokensUsed * 0.002); // ~$0.002 per 1k tokens
  const timestamp = randomPastDate(30);

  return {
    id: generateId(),
    organization_id: orgId,
    user_id: userId,
    feature,
    action,
    tokens_used: tokensUsed,
    cost_cents: costCents,
    timestamp,
    metadata: {},
    ...overrides,
  };
}

/**
 * Generate AI usage history
 */
export function generateMockAIUsageHistory(
  orgId: string,
  userId: string,
  days: number = 30
): MockAIUsage[] {
  const usage: MockAIUsage[] = [];
  const now = new Date();

  // Generate 5-20 usage entries per day
  for (let day = 0; day < days; day++) {
    const entriesPerDay = randomInt(5, 20);

    for (let i = 0; i < entriesPerDay; i++) {
      const feature = randomFromArray([
        'CHAT',
        'AUTOMATION',
        'INSIGHTS',
        'CONTENT_GEN',
        'ANALYSIS',
      ] as MockAIUsage['feature'][]);

      const daysAgo = day + (i / entriesPerDay); // Spread throughout the day
      const timestamp = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000);

      usage.push(
        generateMockAIUsage(orgId, userId, feature, { timestamp })
      );
    }
  }

  return usage;
}
