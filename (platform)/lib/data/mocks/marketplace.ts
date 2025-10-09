/**
 * Mock Marketplace Data
 *
 * Generate mock data for Marketplace module (tools, bundles, purchases, reviews, cart)
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
} from './generators';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export type MockTool = {
  id: string;
  name: string;
  slug: string;
  description: string;
  long_description: string | null;
  category: 'FOUNDATION' | 'GROWTH' | 'ELITE' | 'CUSTOM' | 'ADVANCED' | 'INTEGRATION';
  tier: 'T1' | 'T2' | 'T3';
  price: number; // in cents
  billing_period: 'MONTHLY' | 'YEARLY' | 'ONE_TIME';
  features: string[];
  icon_url: string | null;
  tags: string[];
  is_active: boolean;
  install_count: number;
  average_rating: number;
  review_count: number;
  created_at: Date;
  updated_at: Date;
};

export type MockBundle = {
  id: string;
  name: string;
  slug: string;
  description: string;
  bundle_type: 'STARTER_PACK' | 'GROWTH_PACK' | 'ELITE_PACK' | 'CUSTOM_PACK';
  price: number; // in cents
  discount_percentage: number;
  tool_ids: string[];
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
};

export type MockPurchase = {
  id: string;
  tool_id: string;
  tool?: { id: string; name: string }; // Populated relation for convenience
  organization_id: string;
  user_id: string;
  price_at_purchase: number;
  status: 'ACTIVE' | 'CANCELLED' | 'EXPIRED' | 'TRIAL';
  purchased_at: Date;
  expires_at: Date | null;
};

export type MockReview = {
  id: string;
  tool_id: string;
  user_id: string;
  organization_id: string;
  rating: number; // 1-5
  review_text: string | null;
  created_at: Date;
};

export type MockCart = {
  id: string;
  user_id: string;
  tools: string[]; // tool IDs
  bundles: string[]; // bundle IDs
  total_price: number;
  updated_at: Date;
};

// ============================================================================
// DATA POOLS
// ============================================================================

const TOOL_NAMES = [
  'Email Automation Pro',
  'DocuSign Integration',
  'Analytics Dashboard',
  'CRM Sync Hub',
  'Lead Capture Widget',
  'Report Builder Plus',
  'Calendar Sync Pro',
  'SMS Gateway',
  'Virtual Tour Creator',
  'Property Valuation AI',
  'Contract Manager',
  'Marketing Automation Suite',
  'Social Media Publisher',
  'Video Chat Integration',
  'E-Signature Pro',
  'Document Scanner',
  'Invoice Generator',
  'Payment Gateway',
  'Appointment Scheduler',
  'Task Automation',
  'Data Export Pro',
  'API Connector',
  'Webhook Manager',
  'Form Builder',
  'Survey Creator',
  'Feedback Collector',
  'Live Chat Widget',
  'Help Desk Integration',
  'Knowledge Base Pro',
  'SEO Optimizer',
  'Landing Page Builder',
  'A/B Testing Suite',
  'Heat Map Analytics',
  'Conversion Tracker',
  'Email Validator',
  'Phone Verifier',
  'Address Autocomplete',
  'Identity Verification',
  'Credit Check Pro',
  'Background Checker',
  'MLS Integration',
  'Zillow Sync',
  'Realtor.com Connector',
  'Property Listing Sync',
  'Market Data Pro',
  'Comparative Market Analysis',
  'Transaction Coordinator',
];

const TOOL_DESCRIPTIONS = [
  'Automate email campaigns and lead nurturing workflows',
  'Digital document signing and contract management',
  'Advanced analytics and data visualization platform',
  'Connect and sync data with external CRM systems',
  'Customizable lead capture forms and popups',
  'Create custom reports and automated dashboards',
  'Sync calendars across platforms and teams',
  'Send automated SMS notifications and reminders',
  'Create immersive virtual property tours',
  'AI-powered property valuation and pricing',
  'Manage contracts and legal documents',
  'Complete marketing automation platform',
  'Schedule and publish social media content',
  'Embedded video conferencing for consultations',
  'Professional electronic signature solution',
  'Scan and digitize physical documents',
  'Generate professional invoices and receipts',
  'Accept payments and process transactions',
  'Schedule and manage appointments efficiently',
  'Automate repetitive tasks and workflows',
  'Export data to multiple formats',
  'Connect to external APIs and services',
  'Manage webhooks and event notifications',
  'Build custom forms with drag-and-drop',
  'Create surveys and collect feedback',
  'Gather customer feedback and reviews',
  'Add live chat support to your workflow',
  'Integrate with help desk systems',
  'Build searchable knowledge bases',
  'Optimize content for search engines',
  'Create high-converting landing pages',
  'Run A/B tests on pages and campaigns',
  'Visualize user behavior with heat maps',
  'Track conversions and ROI',
  'Validate email addresses in real-time',
  'Verify phone numbers and formats',
  'Auto-complete addresses as you type',
  'Verify customer identity securely',
  'Run credit checks on prospects',
  'Perform background checks compliantly',
  'Sync with MLS databases',
  'Connect to Zillow listings',
  'Sync with Realtor.com',
  'Automatically sync property listings',
  'Access comprehensive market data',
  'Generate CMAs automatically',
  'Coordinate transactions end-to-end',
];

const FEATURE_TEMPLATES = {
  FOUNDATION: [
    'Basic functionality',
    'Email support',
    'Standard updates',
    'Single user access',
    'Basic reporting',
  ],
  GROWTH: [
    'Advanced features',
    'Priority support',
    'Weekly updates',
    'Team collaboration',
    'Advanced analytics',
    'Custom branding',
  ],
  ELITE: [
    'Premium features',
    'Dedicated support',
    'Daily updates',
    'Unlimited users',
    'White-label options',
    'API access',
    'Custom integrations',
    'Advanced security',
  ],
  CUSTOM: [
    'Pay-per-use pricing',
    'No subscription required',
    'Flexible scaling',
    'Standard support',
  ],
  ADVANCED: [
    'Enterprise features',
    '24/7 support',
    'Real-time updates',
    'Advanced permissions',
    'Compliance tools',
    'Audit logs',
  ],
  INTEGRATION: [
    'Seamless integration',
    'Webhook support',
    'API documentation',
    'Developer support',
    'Auto-sync',
  ],
};

const TAGS = [
  'Popular',
  'Trending',
  'New',
  'Featured',
  'Recommended',
  'Best Value',
  'Top Rated',
  'Essential',
  'Premium',
  'Integration',
  'Automation',
  'Analytics',
  'Marketing',
  'Communication',
  'Productivity',
  'Legal',
  'Finance',
  'Real Estate',
];

const REVIEW_COMMENTS = [
  'Excellent tool! Has saved us countless hours.',
  'Great integration with our workflow.',
  'Easy to use and very powerful.',
  'Customer support is outstanding.',
  'Worth every penny!',
  'Game changer for our business.',
  'Highly recommend to anyone in real estate.',
  'The features are exactly what we needed.',
  'Simple setup and reliable performance.',
  'Best tool in this category.',
  'Could use some improvements but overall solid.',
  'Good value for the price.',
  'Does what it promises.',
  'Nice addition to our toolkit.',
  'Helpful for daily tasks.',
];

// ============================================================================
// TOOL GENERATORS
// ============================================================================

export function generateMockTool(overrides?: Partial<MockTool>): MockTool {
  const category = overrides?.category || randomFromArray([
    'FOUNDATION',
    'FOUNDATION',
    'FOUNDATION',
    'FOUNDATION',
    'GROWTH',
    'GROWTH',
    'GROWTH',
    'ELITE',
    'ELITE',
    'INTEGRATION',
  ] as MockTool['category'][]);

  const tier = overrides?.tier || randomFromArray([
    'T1',
    'T1',
    'T1',
    'T1',
    'T1',
    'T2',
    'T2',
    'T2',
    'T3',
    'T3',
  ] as MockTool['tier'][]);

  // Pricing based on tier (in cents)
  let price = 0;
  if (!overrides?.price) {
    switch (tier) {
      case 'T1':
        price = randomInt(0, 10) === 0 ? 0 : randomInt(19, 39) * 100; // 10% free, rest $19-39
        break;
      case 'T2':
        price = randomInt(49, 79) * 100; // $49-79
        break;
      case 'T3':
        price = randomInt(99, 149) * 100; // $99-149
        break;
    }
  }

  const name = overrides?.name || randomFromArray(TOOL_NAMES);
  const slug = name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
  const description = overrides?.description || randomFromArray(TOOL_DESCRIPTIONS);
  const createdAt = randomPastDate(180);

  // Generate features based on category
  const featureTemplate = FEATURE_TEMPLATES[category];
  const numFeatures = randomInt(3, Math.min(8, featureTemplate.length));
  const features = Array.from(
    { length: numFeatures },
    (_, i) => featureTemplate[i] || `Feature ${i + 1}`
  );

  return {
    id: generateId(),
    name,
    slug,
    description,
    long_description: randomBoolean()
      ? `${description} This comprehensive solution provides everything you need to streamline your workflow and boost productivity.`
      : null,
    category,
    tier,
    price: overrides?.price ?? price,
    billing_period: randomFromArray(['MONTHLY', 'MONTHLY', 'MONTHLY', 'YEARLY', 'ONE_TIME']),
    features,
    icon_url: null,
    tags: Array.from({ length: randomInt(1, 4) }, () => randomFromArray(TAGS)),
    is_active: true,
    install_count: randomInt(50, 5000),
    average_rating: randomInt(35, 50) / 10, // 3.5 to 5.0
    review_count: randomInt(5, 200),
    created_at: createdAt,
    updated_at: createdAt,
    ...overrides,
  };
}

export function generateMockTools(count: number = 47): MockTool[] {
  const tools: MockTool[] = [];

  // Generate mix of categories
  const categoryCounts = {
    FOUNDATION: Math.floor(count * 0.4), // 40%
    GROWTH: Math.floor(count * 0.3), // 30%
    ELITE: Math.floor(count * 0.2), // 20%
    INTEGRATION: Math.floor(count * 0.1), // 10%
    CUSTOM: 0,
    ADVANCED: 0,
  };

  // Adjust for exact count
  const totalAssigned = Object.values(categoryCounts).reduce((a, b) => a + b, 0);
  categoryCounts.FOUNDATION += count - totalAssigned;

  // Generate tools for each category
  for (const [category, catCount] of Object.entries(categoryCounts)) {
    for (let i = 0; i < catCount; i++) {
      tools.push(
        generateMockTool({
          category: category as MockTool['category'],
        })
      );
    }
  }

  // Ensure at least 5 FREE tools
  const freeCount = tools.filter((t) => t.price === 0).length;
  if (freeCount < 5) {
    for (let i = 0; i < 5 - freeCount; i++) {
      if (tools[i]) {
        tools[i].price = 0;
      }
    }
  }

  return tools;
}

// ============================================================================
// BUNDLE GENERATORS
// ============================================================================

export function generateMockBundle(
  toolIds: string[],
  overrides?: Partial<MockBundle>
): MockBundle {
  const bundleType =
    overrides?.bundle_type ||
    randomFromArray([
      'STARTER_PACK',
      'GROWTH_PACK',
      'ELITE_PACK',
      'CUSTOM_PACK',
    ] as MockBundle['bundle_type'][]);

  let name = '';
  let description = '';
  let price = 0;
  let discount = 0;
  let toolCount = 0;

  switch (bundleType) {
    case 'STARTER_PACK':
      name = 'Starter Pack';
      description = 'Essential tools to get started with real estate business';
      price = 9900; // $99
      discount = 20;
      toolCount = randomInt(3, 5);
      break;
    case 'GROWTH_PACK':
      name = 'Growth Pack';
      description = 'Advanced tools for scaling your real estate operations';
      price = 29900; // $299
      discount = 30;
      toolCount = randomInt(5, 8);
      break;
    case 'ELITE_PACK':
      name = 'Elite Pack';
      description = 'Premium bundle with all essential and advanced tools';
      price = 79900; // $799
      discount = 40;
      toolCount = randomInt(10, 15);
      break;
    case 'CUSTOM_PACK':
      name = 'Custom Pack';
      description = 'Customizable bundle with your choice of tools';
      price = 0; // Calculated based on selections
      discount = 15;
      toolCount = randomInt(3, 10);
      break;
  }

  const slug = name.toLowerCase().replace(/\s+/g, '-');
  const createdAt = randomPastDate(90);
  const selectedToolIds = toolIds.slice(0, toolCount);

  return {
    id: generateId(),
    name: overrides?.name || name,
    slug,
    description: overrides?.description || description,
    bundle_type: bundleType,
    price: overrides?.price ?? price,
    discount_percentage: discount,
    tool_ids: overrides?.tool_ids || selectedToolIds,
    is_active: true,
    created_at: createdAt,
    updated_at: createdAt,
    ...overrides,
  };
}

export function generateMockBundles(toolIds: string[], count: number = 6): MockBundle[] {
  const bundles: MockBundle[] = [];

  // Ensure at least one of each type
  const types: MockBundle['bundle_type'][] = [
    'STARTER_PACK',
    'STARTER_PACK',
    'GROWTH_PACK',
    'GROWTH_PACK',
    'ELITE_PACK',
    'CUSTOM_PACK',
  ];

  for (let i = 0; i < count; i++) {
    bundles.push(
      generateMockBundle(toolIds, {
        bundle_type: types[i % types.length],
      })
    );
  }

  return bundles;
}

// ============================================================================
// PURCHASE GENERATORS
// ============================================================================

export function generateMockPurchase(
  toolId: string,
  orgId: string,
  userId: string,
  overrides?: Partial<MockPurchase>
): MockPurchase {
  const status = overrides?.status || randomFromArray([
    'ACTIVE',
    'ACTIVE',
    'ACTIVE',
    'ACTIVE',
    'ACTIVE',
    'ACTIVE',
    'ACTIVE',
    'ACTIVE',
    'TRIAL',
    'TRIAL',
    'TRIAL',
    'EXPIRED',
  ] as MockPurchase['status'][]);

  const purchasedAt = randomPastDate(180);
  const expiresAt =
    status === 'TRIAL'
      ? randomFutureDate(30)
      : status === 'EXPIRED'
      ? randomPastDate(30)
      : null;

  return {
    id: generateId(),
    tool_id: toolId,
    organization_id: orgId,
    user_id: userId,
    price_at_purchase: randomInt(0, 149) * 100,
    status,
    purchased_at: purchasedAt,
    expires_at: expiresAt,
    ...overrides,
  };
}

// ============================================================================
// REVIEW GENERATORS
// ============================================================================

export function generateMockReview(
  toolId: string,
  userId: string,
  orgId: string,
  overrides?: Partial<MockReview>
): MockReview {
  // Weight toward 4-5 stars (70%)
  const rating = overrides?.rating || randomFromArray([5, 5, 5, 5, 4, 4, 4, 3, 3, 2]);

  // 60% have text, 40% rating only
  const hasText = randomBoolean() && randomBoolean() && randomBoolean();
  const reviewText = hasText ? randomFromArray(REVIEW_COMMENTS) : null;

  return {
    id: generateId(),
    tool_id: toolId,
    user_id: userId,
    organization_id: orgId,
    rating,
    review_text: overrides?.review_text !== undefined ? overrides.review_text : reviewText,
    created_at: randomPastDate(365),
    ...overrides,
  };
}

// ============================================================================
// CART GENERATORS
// ============================================================================

export function generateMockCart(userId: string, overrides?: Partial<MockCart>): MockCart {
  return {
    id: generateId(),
    user_id: userId,
    tools: [],
    bundles: [],
    total_price: 0,
    updated_at: new Date(),
    ...overrides,
  };
}

/**
 * Calculate cart total price from tools and bundles
 */
export function calculateCartTotal(
  toolIds: string[],
  bundleIds: string[],
  allTools: MockTool[],
  allBundles: MockBundle[]
): number {
  const toolsTotal = toolIds.reduce((sum, id) => {
    const tool = allTools.find((t) => t.id === id);
    return sum + (tool?.price || 0);
  }, 0);

  const bundlesTotal = bundleIds.reduce((sum, id) => {
    const bundle = allBundles.find((b) => b.id === id);
    return sum + (bundle?.price || 0);
  }, 0);

  return toolsTotal + bundlesTotal;
}
