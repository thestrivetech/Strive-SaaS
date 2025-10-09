/**
 * Mock CMS & Marketing Data
 *
 * Generate realistic mock data for CMS module (content items, campaigns, email campaigns)
 */

import {
  generateId,
  randomFromArray,
  randomName,
  randomEmail,
  randomPastDate,
  randomFutureDate,
  randomBoolean,
  randomInt,
  randomCurrency,
} from './generators';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export interface MockContentItem {
  id: string;
  organization_id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  type: 'BLOG_POST' | 'PAGE' | 'ARTICLE' | 'LANDING_PAGE';
  status: 'PUBLISHED' | 'DRAFT' | 'SCHEDULED' | 'ARCHIVED';
  author_id: string;
  published_at: Date | null;
  scheduled_at: Date | null;
  view_count: number;
  share_count: number;
  like_count: number;
  comment_count: number;
  category_id: string | null;
  tags: string[];
  seo_title: string | null;
  seo_description: string | null;
  featured_image: string | null;
  created_at: Date;
  updated_at: Date;
}

export interface MockCampaign {
  id: string;
  organization_id: string;
  name: string;
  description: string;
  type: 'EMAIL' | 'SOCIAL' | 'SMS' | 'MULTI_CHANNEL';
  status: 'DRAFT' | 'PLANNING' | 'ACTIVE' | 'PAUSED' | 'COMPLETED' | 'CANCELLED';
  start_date: Date | null;
  end_date: Date | null;
  target_audience: string | null;
  budget: number | null;
  created_by: string;
  created_at: Date;
  updated_at: Date;
}

export interface MockEmailCampaign {
  id: string;
  campaign_id: string;
  subject: string;
  from_name: string;
  from_email: string;
  preview_text: string;
  html_content: string;
  sent_count: number;
  opened_count: number;
  clicked_count: number;
  bounced_count: number;
  unsubscribed_count: number;
  created_at: Date;
  updated_at: Date;
}

// ============================================================================
// SAMPLE DATA POOLS
// ============================================================================

const CONTENT_TYPES: MockContentItem['type'][] = ['BLOG_POST', 'PAGE', 'ARTICLE', 'LANDING_PAGE'];
const CONTENT_STATUSES: MockContentItem['status'][] = ['PUBLISHED', 'DRAFT', 'SCHEDULED', 'ARCHIVED'];
const CAMPAIGN_TYPES: MockCampaign['type'][] = ['EMAIL', 'SOCIAL', 'SMS', 'MULTI_CHANNEL'];
const CAMPAIGN_STATUSES: MockCampaign['status'][] = ['DRAFT', 'PLANNING', 'ACTIVE', 'PAUSED', 'COMPLETED', 'CANCELLED'];

const BLOG_TITLES = [
  'Ultimate Guide to Real Estate Investment in 2025',
  '10 Tips for First-Time Home Buyers',
  'Market Trends: What to Expect in Q1 2025',
  'How to Stage Your Home for Maximum Value',
  'Understanding Property Taxes: A Complete Guide',
  'The Future of Commercial Real Estate',
  'Smart Home Technology Buyers Actually Want',
  'Negotiating Your Best Deal: Expert Strategies',
  'Investment Properties: ROI Analysis Made Simple',
  'Mortgage Pre-Approval: Step-by-Step Guide',
  'Urban vs Suburban: Where Should You Invest?',
  'Real Estate Photography Tips for Listings',
  'Legal Considerations for Property Buyers',
  'Maximizing Rental Income in 2025',
  'The Impact of Interest Rates on Housing',
  'Green Building: Eco-Friendly Real Estate',
  'Property Management Best Practices',
  'Flipping Houses: Complete Beginner Guide',
  'Commercial Lease Negotiations Explained',
  'Real Estate Market Analysis Tools',
  'Downsizing: Making the Transition Smooth',
  'Investment Strategies for Growing Markets',
  'The Home Inspection Checklist',
  'Building Wealth Through Real Estate',
  'Virtual Tours: The New Home Showing Standard',
];

const CAMPAIGN_NAMES = [
  'Q4 2024 New Listing Promotion',
  'Spring 2025 Open House Campaign',
  'Luxury Property Portfolio Launch',
  'First-Time Buyer Education Series',
  'Commercial Property Investment Webinar',
  'Holiday Home Seller Special',
  'New Year New Home Initiative',
  'Summer Property Showcase',
  'Investment Opportunity Alert',
  'Referral Rewards Program Launch',
  'Market Update Newsletter Series',
  'VIP Client Appreciation Event',
  'New Development Announcement',
  'Rental Property Management Tips',
  'Community Spotlight Campaign',
];

const CATEGORIES = ['market-trends', 'buyer-guides', 'seller-tips', 'investment', 'legal', 'technology'];

const CONTENT_TAGS = [
  'real-estate',
  'investment',
  'market-trends',
  'buyer-guide',
  'seller-tips',
  'property-management',
  'commercial',
  'residential',
  'luxury',
  'first-time-buyer',
];

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

export function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}

export function generateExcerpt(content: string, maxLength: number = 150): string {
  const stripped = content.replace(/<[^>]*>/g, '');
  return stripped.length > maxLength
    ? stripped.substring(0, maxLength).trim() + '...'
    : stripped;
}

export function generateViewCount(): number {
  return Math.floor(Math.random() * 5000);
}

export function generateEngagementMetrics(viewCount: number) {
  const shareRate = 0.02 + Math.random() * 0.05; // 2-7%
  const likeRate = 0.05 + Math.random() * 0.10; // 5-15%
  const commentRate = 0.01 + Math.random() * 0.03; // 1-4%

  return {
    share_count: Math.floor(viewCount * shareRate),
    like_count: Math.floor(viewCount * likeRate),
    comment_count: Math.floor(viewCount * commentRate),
  };
}

export function generateCampaignMetrics(sentCount: number) {
  const openRate = 0.25 + Math.random() * 0.2; // 25-45%
  const clickRate = 0.08 + Math.random() * 0.07; // 8-15% of opens
  const bounceRate = 0.005 + Math.random() * 0.015; // 0.5-2%
  const unsubscribeRate = 0.003 + Math.random() * 0.007; // 0.3-1%

  const opened = Math.floor(sentCount * openRate);
  const clicked = Math.floor(opened * clickRate);
  const bounced = Math.floor(sentCount * bounceRate);
  const unsubscribed = Math.floor(sentCount * unsubscribeRate);

  return { opened, clicked, bounced, unsubscribed };
}

// ============================================================================
// MOCK DATA GENERATORS
// ============================================================================

export function generateMockContentItem(orgId: string, overrides?: Partial<MockContentItem>): MockContentItem {
  const title = randomFromArray(BLOG_TITLES);
  const slug = generateSlug(title);
  const type = randomFromArray(CONTENT_TYPES);
  const status = randomFromArray(CONTENT_STATUSES);
  const createdAt = randomPastDate(180);

  const content = `<h2>${title}</h2><p>This is comprehensive ${type.toLowerCase().replace('_', ' ')} content about real estate. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p><p>Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.</p>`;

  const excerpt = generateExcerpt(content);
  const publishedAt = status === 'PUBLISHED' ? randomPastDate(90) : null;
  const scheduledAt = status === 'SCHEDULED' ? randomFutureDate(30) : null;
  const viewCount = status === 'PUBLISHED' ? generateViewCount() : 0;
  const engagement = generateEngagementMetrics(viewCount);

  return {
    id: generateId(),
    organization_id: orgId,
    title,
    slug,
    content,
    excerpt,
    type,
    status,
    author_id: 'demo-user',
    published_at: publishedAt,
    scheduled_at: scheduledAt,
    view_count: viewCount,
    share_count: engagement.share_count,
    like_count: engagement.like_count,
    comment_count: engagement.comment_count,
    category_id: randomBoolean() ? randomFromArray(CATEGORIES) : null,
    tags: Array.from({ length: randomInt(2, 5) }, () => randomFromArray(CONTENT_TAGS)),
    seo_title: `${title} | Strive Real Estate`,
    seo_description: excerpt,
    featured_image: `/images/content/${slug}.jpg`,
    created_at: createdAt,
    updated_at: publishedAt || createdAt,
    ...overrides,
  };
}

export function generateMockCampaign(orgId: string, overrides?: Partial<MockCampaign>): MockCampaign {
  const name = randomFromArray(CAMPAIGN_NAMES);
  const type = randomFromArray(CAMPAIGN_TYPES);
  const status = randomFromArray(CAMPAIGN_STATUSES);
  const createdAt = randomPastDate(180);

  let startDate: Date | null = null;
  let endDate: Date | null = null;

  if (status === 'ACTIVE' || status === 'COMPLETED') {
    startDate = randomPastDate(60);
    endDate = status === 'COMPLETED' ? randomPastDate(30) : randomFutureDate(30);
  } else if (status === 'PLANNING') {
    startDate = randomFutureDate(15);
    endDate = randomFutureDate(45);
  }

  const description = `Comprehensive ${type.toLowerCase()} campaign targeting ${randomFromArray(['luxury buyers', 'first-time buyers', 'investors', 'sellers', 'renters'])}`;

  return {
    id: generateId(),
    organization_id: orgId,
    name,
    description,
    type,
    status,
    start_date: startDate,
    end_date: endDate,
    target_audience: randomFromArray(['High-net-worth buyers, luxury segment', 'First-time homebuyers, 25-40 age range', 'Real estate investors', 'Home sellers in suburban areas', 'Rental property seekers']),
    budget: randomBoolean() ? randomCurrency(1000, 10000) : null,
    created_by: 'demo-user',
    created_at: createdAt,
    updated_at: createdAt,
    ...overrides,
  };
}

export function generateMockEmailCampaign(campaignId: string, overrides?: Partial<MockEmailCampaign>): MockEmailCampaign {
  const subjects = [
    'Exclusive: New Luxury Listings Just Added',
    'Your Dream Home Awaits - Open House This Weekend',
    'Market Update: Prices Trending Up in Your Area',
    'Limited Time: First-Time Buyer Incentives',
    'Investment Opportunity: High-ROI Properties',
    '🏡 Sold! See What Homes in Your Neighborhood Sold For',
    'Expert Tips: Preparing Your Home for Sale',
    'New Development Alert: Pre-Construction Pricing',
    'Mortgage Rates Update - Lock In Now',
    'Virtual Tour: Stunning Waterfront Property',
  ];

  const subject = randomFromArray(subjects);
  const sentCount = randomInt(500, 5000);
  const metrics = generateCampaignMetrics(sentCount);
  const createdAt = randomPastDate(90);

  return {
    id: generateId(),
    campaign_id: campaignId,
    subject,
    from_name: 'Strive Real Estate Team',
    from_email: 'listings@strivetech.ai',
    preview_text: `${subject.substring(0, 50)}...`,
    html_content: `<html><body><h1>${subject}</h1><p>Email content here...</p></body></html>`,
    sent_count: sentCount,
    opened_count: metrics.opened,
    clicked_count: metrics.clicked,
    bounced_count: metrics.bounced,
    unsubscribed_count: metrics.unsubscribed,
    created_at: createdAt,
    updated_at: createdAt,
    ...overrides,
  };
}

// ============================================================================
// GENERATE BULK DATA
// ============================================================================

export function generateMockContentItems(orgId: string, count: number): MockContentItem[] {
  // Distribute statuses: 60% published, 20% draft, 12% scheduled, 8% archived
  const statusDistribution: MockContentItem['status'][] = [
    ...Array(Math.floor(count * 0.6)).fill('PUBLISHED'),
    ...Array(Math.floor(count * 0.2)).fill('DRAFT'),
    ...Array(Math.floor(count * 0.12)).fill('SCHEDULED'),
    ...Array(Math.ceil(count * 0.08)).fill('ARCHIVED'),
  ];

  return statusDistribution.slice(0, count).map((status, index) =>
    generateMockContentItem(orgId, {
      status,
      title: BLOG_TITLES[index] || `Content Item ${index + 1}`,
    })
  );
}

export function generateMockCampaigns(orgId: string, count: number): MockCampaign[] {
  // Distribute statuses: 3 active, 6 completed, 3 draft, 2 paused, 1 cancelled
  const statusDistribution: MockCampaign['status'][] = [
    ...Array(3).fill('ACTIVE'),
    ...Array(6).fill('COMPLETED'),
    ...Array(3).fill('DRAFT'),
    ...Array(2).fill('PAUSED'),
    'CANCELLED',
  ];

  return statusDistribution.slice(0, count).map((status, index) =>
    generateMockCampaign(orgId, {
      status,
      name: CAMPAIGN_NAMES[index] || `Campaign ${index + 1}`,
    })
  );
}

export function generateMockEmailCampaigns(campaigns: MockCampaign[], count: number): MockEmailCampaign[] {
  // Only create email campaigns for EMAIL and MULTI_CHANNEL campaigns
  const eligibleCampaigns = campaigns.filter(c => c.type === 'EMAIL' || c.type === 'MULTI_CHANNEL');

  return Array.from({ length: Math.min(count, eligibleCampaigns.length) }, (_, i) =>
    generateMockEmailCampaign(eligibleCampaigns[i].id)
  );
}

// ============================================================================
// EXPORT MOCK DATA (initialized once)
// ============================================================================

const MOCK_ORG_ID = 'demo-org';

export const MOCK_CONTENT_ITEMS = generateMockContentItems(MOCK_ORG_ID, 25);
export const MOCK_CAMPAIGNS = generateMockCampaigns(MOCK_ORG_ID, 15);
export const MOCK_EMAIL_CAMPAIGNS = generateMockEmailCampaigns(MOCK_CAMPAIGNS, 10);

export const CMS_MOCK_DATA = {
  contentItems: MOCK_CONTENT_ITEMS,
  campaigns: MOCK_CAMPAIGNS,
  emailCampaigns: MOCK_EMAIL_CAMPAIGNS,
};
