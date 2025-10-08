/**
 * Mock Subscriptions for Admin Dashboard
 *
 * Subscription records matching the 30 organizations
 * - Covers all subscription tiers
 * - Various billing cycles and statuses
 * - Realistic pricing and seat counts
 */

export interface MockSubscription {
  id: string;
  organization_id: string;
  organization_name: string;
  tier: 'FREE' | 'CUSTOM' | 'STARTER' | 'GROWTH' | 'ELITE' | 'ENTERPRISE';
  status: 'ACTIVE' | 'INACTIVE' | 'PAST_DUE' | 'CANCELLED';
  billing_cycle: 'MONTHLY' | 'ANNUAL';
  amount: number; // in cents
  seats: number;
  start_date: string;
  current_period_start: string;
  current_period_end: string;
  cancel_at: string | null;
  stripe_subscription_id: string;
}

export const MOCK_SUBSCRIPTIONS: MockSubscription[] = [
  // ELITE tier subscriptions
  {
    id: '1',
    organization_id: '1',
    organization_name: 'Acme Real Estate Group',
    tier: 'ELITE',
    status: 'ACTIVE',
    billing_cycle: 'MONTHLY',
    amount: 23976, // $999 per seat × 24 seats (in cents)
    seats: 24,
    start_date: '2024-01-15',
    current_period_start: '2024-12-15',
    current_period_end: '2025-01-15',
    cancel_at: null,
    stripe_subscription_id: 'sub_mock_elite_1',
  },
  {
    id: '10',
    organization_id: '10',
    organization_name: 'Lakeside Realty',
    tier: 'ELITE',
    status: 'ACTIVE',
    billing_cycle: 'ANNUAL',
    amount: 263868, // $999 per seat × 22 seats × 12 months (in cents)
    seats: 22,
    start_date: '2024-09-03',
    current_period_start: '2024-09-03',
    current_period_end: '2025-09-03',
    cancel_at: null,
    stripe_subscription_id: 'sub_mock_elite_10',
  },
  {
    id: '13',
    organization_id: '13',
    organization_name: 'Premier Estate Advisors',
    tier: 'ELITE',
    status: 'ACTIVE',
    billing_cycle: 'MONTHLY',
    amount: 27972, // $999 per seat × 28 seats (in cents)
    seats: 28,
    start_date: '2024-10-12',
    current_period_start: '2024-12-12',
    current_period_end: '2025-01-12',
    cancel_at: null,
    stripe_subscription_id: 'sub_mock_elite_13',
  },
  {
    id: '17',
    organization_id: '17',
    organization_name: 'Pinnacle Property Partners',
    tier: 'ELITE',
    status: 'ACTIVE',
    billing_cycle: 'ANNUAL',
    amount: 239760, // $999 per seat × 20 seats × 12 months (in cents)
    seats: 20,
    start_date: '2024-11-15',
    current_period_start: '2024-11-15',
    current_period_end: '2025-11-15',
    cancel_at: null,
    stripe_subscription_id: 'sub_mock_elite_17',
  },
  {
    id: '22',
    organization_id: '22',
    organization_name: 'Golden Gate Realty',
    tier: 'ELITE',
    status: 'ACTIVE',
    billing_cycle: 'MONTHLY',
    amount: 24975, // $999 per seat × 25 seats (in cents)
    seats: 25,
    start_date: '2024-12-20',
    current_period_start: '2024-12-20',
    current_period_end: '2025-01-20',
    cancel_at: null,
    stripe_subscription_id: 'sub_mock_elite_22',
  },
  {
    id: '28',
    organization_id: '28',
    organization_name: 'Venture Property Solutions',
    tier: 'ELITE',
    status: 'ACTIVE',
    billing_cycle: 'MONTHLY',
    amount: 18981, // $999 per seat × 19 seats (in cents)
    seats: 19,
    start_date: '2025-01-08',
    current_period_start: '2025-01-08',
    current_period_end: '2025-02-08',
    cancel_at: null,
    stripe_subscription_id: 'sub_mock_elite_28',
  },

  // ENTERPRISE tier subscriptions
  {
    id: '4',
    organization_id: '4',
    organization_name: 'Urban Living Realtors',
    tier: 'ENTERPRISE',
    status: 'ACTIVE',
    billing_cycle: 'ANNUAL',
    amount: 576000, // Custom pricing: $1,500 per seat × 32 seats × 12 months (in cents)
    seats: 32,
    start_date: '2024-04-05',
    current_period_start: '2024-04-05',
    current_period_end: '2025-04-05',
    cancel_at: null,
    stripe_subscription_id: 'sub_mock_enterprise_4',
  },
  {
    id: '8',
    organization_id: '8',
    organization_name: 'Prestige Properties International',
    tier: 'ENTERPRISE',
    status: 'ACTIVE',
    billing_cycle: 'ANNUAL',
    amount: 810000, // Custom pricing: $1,500 per seat × 45 seats × 12 months (in cents)
    seats: 45,
    start_date: '2024-08-01',
    current_period_start: '2024-08-01',
    current_period_end: '2025-08-01',
    cancel_at: null,
    stripe_subscription_id: 'sub_mock_enterprise_8',
  },
  {
    id: '15',
    organization_id: '15',
    organization_name: 'Global Realty Network',
    tier: 'ENTERPRISE',
    status: 'ACTIVE',
    billing_cycle: 'ANNUAL',
    amount: 900000, // Custom pricing: $1,500 per seat × 50 seats × 12 months (in cents)
    seats: 50,
    start_date: '2024-11-01',
    current_period_start: '2024-11-01',
    current_period_end: '2025-11-01',
    cancel_at: null,
    stripe_subscription_id: 'sub_mock_enterprise_15',
  },
  {
    id: '25',
    organization_id: '25',
    organization_name: 'Diamond Realty Group',
    tier: 'ENTERPRISE',
    status: 'ACTIVE',
    billing_cycle: 'MONTHLY',
    amount: 54000, // Custom pricing: $1,800 per seat × 30 seats (in cents)
    seats: 30,
    start_date: '2025-01-02',
    current_period_start: '2025-01-02',
    current_period_end: '2025-02-02',
    cancel_at: null,
    stripe_subscription_id: 'sub_mock_enterprise_25',
  },
  {
    id: '30',
    organization_id: '30',
    organization_name: 'Nexus Property Management',
    tier: 'ENTERPRISE',
    status: 'ACTIVE',
    billing_cycle: 'ANNUAL',
    amount: 630000, // Custom pricing: $1,500 per seat × 35 seats × 12 months (in cents)
    seats: 35,
    start_date: '2025-01-10',
    current_period_start: '2025-01-10',
    current_period_end: '2026-01-10',
    cancel_at: null,
    stripe_subscription_id: 'sub_mock_enterprise_30',
  },

  // GROWTH tier subscriptions
  {
    id: '2',
    organization_id: '2',
    organization_name: 'Summit Properties LLC',
    tier: 'GROWTH',
    status: 'ACTIVE',
    billing_cycle: 'MONTHLY',
    amount: 10485, // $699 per seat × 15 seats (in cents)
    seats: 15,
    start_date: '2024-02-20',
    current_period_start: '2024-12-20',
    current_period_end: '2025-01-20',
    cancel_at: null,
    stripe_subscription_id: 'sub_mock_growth_2',
  },
  {
    id: '6',
    organization_id: '6',
    organization_name: 'Elite Home Brokers',
    tier: 'GROWTH',
    status: 'ACTIVE',
    billing_cycle: 'ANNUAL',
    amount: 150984, // $699 per seat × 18 seats × 12 months (in cents)
    seats: 18,
    start_date: '2024-06-18',
    current_period_start: '2024-06-18',
    current_period_end: '2025-06-18',
    cancel_at: null,
    stripe_subscription_id: 'sub_mock_growth_6',
  },
  {
    id: '7',
    organization_id: '7',
    organization_name: 'Valley Realty Group',
    tier: 'GROWTH',
    status: 'PAST_DUE',
    billing_cycle: 'MONTHLY',
    amount: 8388, // $699 per seat × 12 seats (in cents)
    seats: 12,
    start_date: '2024-07-22',
    current_period_start: '2024-12-22',
    current_period_end: '2025-01-22',
    cancel_at: null,
    stripe_subscription_id: 'sub_mock_growth_7',
  },
  {
    id: '11',
    organization_id: '11',
    organization_name: 'Downtown Properties Inc',
    tier: 'GROWTH',
    status: 'ACTIVE',
    billing_cycle: 'MONTHLY',
    amount: 6990, // $699 per seat × 10 seats (in cents)
    seats: 10,
    start_date: '2024-09-20',
    current_period_start: '2024-12-20',
    current_period_end: '2025-01-20',
    cancel_at: null,
    stripe_subscription_id: 'sub_mock_growth_11',
  },
  {
    id: '14',
    organization_id: '14',
    organization_name: 'Riverside Property Management',
    tier: 'GROWTH',
    status: 'ACTIVE',
    billing_cycle: 'ANNUAL',
    amount: 134208, // $699 per seat × 16 seats × 12 months (in cents)
    seats: 16,
    start_date: '2024-10-25',
    current_period_start: '2024-10-25',
    current_period_end: '2025-10-25',
    cancel_at: null,
    stripe_subscription_id: 'sub_mock_growth_14',
  },
  {
    id: '19',
    organization_id: '19',
    organization_name: 'Skyline Property Group',
    tier: 'GROWTH',
    status: 'ACTIVE',
    billing_cycle: 'MONTHLY',
    amount: 9786, // $699 per seat × 14 seats (in cents)
    seats: 14,
    start_date: '2024-12-01',
    current_period_start: '2024-12-01',
    current_period_end: '2025-01-01',
    cancel_at: null,
    stripe_subscription_id: 'sub_mock_growth_19',
  },
  {
    id: '21',
    organization_id: '21',
    organization_name: 'Crystal Clear Properties',
    tier: 'GROWTH',
    status: 'ACTIVE',
    billing_cycle: 'MONTHLY',
    amount: 7689, // $699 per seat × 11 seats (in cents)
    seats: 11,
    start_date: '2024-12-15',
    current_period_start: '2024-12-15',
    current_period_end: '2025-01-15',
    cancel_at: null,
    stripe_subscription_id: 'sub_mock_growth_21',
  },
  {
    id: '26',
    organization_id: '26',
    organization_name: 'Atlantic Properties',
    tier: 'GROWTH',
    status: 'ACTIVE',
    billing_cycle: 'ANNUAL',
    amount: 109044, // $699 per seat × 13 seats × 12 months (in cents)
    seats: 13,
    start_date: '2025-01-05',
    current_period_start: '2025-01-05',
    current_period_end: '2026-01-05',
    cancel_at: null,
    stripe_subscription_id: 'sub_mock_growth_26',
  },

  // STARTER tier subscriptions
  {
    id: '3',
    organization_id: '3',
    organization_name: 'Coastal Realty Partners',
    tier: 'STARTER',
    status: 'ACTIVE',
    billing_cycle: 'MONTHLY',
    amount: 2392, // $299 per seat × 8 seats (in cents)
    seats: 8,
    start_date: '2024-03-10',
    current_period_start: '2024-12-10',
    current_period_end: '2025-01-10',
    cancel_at: null,
    stripe_subscription_id: 'sub_mock_starter_3',
  },
  {
    id: '5',
    organization_id: '5',
    organization_name: 'Mountain View Properties',
    tier: 'STARTER',
    status: 'ACTIVE',
    billing_cycle: 'ANNUAL',
    amount: 17940, // $299 per seat × 5 seats × 12 months (in cents)
    seats: 5,
    start_date: '2024-05-12',
    current_period_start: '2024-05-12',
    current_period_end: '2025-05-12',
    cancel_at: null,
    stripe_subscription_id: 'sub_mock_starter_5',
  },
  {
    id: '16',
    organization_id: '16',
    organization_name: 'Horizon Real Estate',
    tier: 'STARTER',
    status: 'ACTIVE',
    billing_cycle: 'MONTHLY',
    amount: 2691, // $299 per seat × 9 seats (in cents)
    seats: 9,
    start_date: '2024-11-08',
    current_period_start: '2024-12-08',
    current_period_end: '2025-01-08',
    cancel_at: null,
    stripe_subscription_id: 'sub_mock_starter_16',
  },
  {
    id: '18',
    organization_id: '18',
    organization_name: 'Heritage Homes Realty',
    tier: 'STARTER',
    status: 'ACTIVE',
    billing_cycle: 'MONTHLY',
    amount: 1794, // $299 per seat × 6 seats (in cents)
    seats: 6,
    start_date: '2024-11-22',
    current_period_start: '2024-12-22',
    current_period_end: '2025-01-22',
    cancel_at: null,
    stripe_subscription_id: 'sub_mock_starter_18',
  },
  {
    id: '20',
    organization_id: '20',
    organization_name: 'Beacon Real Estate',
    tier: 'STARTER',
    status: 'PAST_DUE',
    billing_cycle: 'MONTHLY',
    amount: 1196, // $299 per seat × 4 seats (in cents)
    seats: 4,
    start_date: '2024-12-08',
    current_period_start: '2024-12-08',
    current_period_end: '2025-01-08',
    cancel_at: null,
    stripe_subscription_id: 'sub_mock_starter_20',
  },
  {
    id: '23',
    organization_id: '23',
    organization_name: 'Maple Leaf Properties',
    tier: 'STARTER',
    status: 'ACTIVE',
    billing_cycle: 'ANNUAL',
    amount: 25116, // $299 per seat × 7 seats × 12 months (in cents)
    seats: 7,
    start_date: '2024-12-25',
    current_period_start: '2024-12-25',
    current_period_end: '2025-12-25',
    cancel_at: null,
    stripe_subscription_id: 'sub_mock_starter_23',
  },
  {
    id: '29',
    organization_id: '29',
    organization_name: 'Eclipse Realty Services',
    tier: 'STARTER',
    status: 'CANCELLED',
    billing_cycle: 'MONTHLY',
    amount: 2392, // $299 per seat × 8 seats (in cents)
    seats: 8,
    start_date: '2025-01-09',
    current_period_start: '2025-01-09',
    current_period_end: '2025-02-09',
    cancel_at: '2025-02-09',
    stripe_subscription_id: 'sub_mock_starter_29',
  },

  // CUSTOM tier subscription
  {
    id: '27',
    organization_id: '27',
    organization_name: 'Pacific Coast Realty',
    tier: 'CUSTOM',
    status: 'ACTIVE',
    billing_cycle: 'MONTHLY',
    amount: 150, // Pay-per-use pricing (in cents)
    seats: 1,
    start_date: '2025-01-07',
    current_period_start: '2025-01-07',
    current_period_end: '2025-02-07',
    cancel_at: null,
    stripe_subscription_id: 'sub_mock_custom_27',
  },

  // FREE tier subscriptions
  {
    id: '12',
    organization_id: '12',
    organization_name: 'Sunset Realty Services',
    tier: 'FREE',
    status: 'INACTIVE',
    billing_cycle: 'MONTHLY',
    amount: 0,
    seats: 3,
    start_date: '2024-10-05',
    current_period_start: '2024-12-05',
    current_period_end: '2025-01-05',
    cancel_at: null,
    stripe_subscription_id: 'sub_mock_free_12',
  },
  {
    id: '24',
    organization_id: '24',
    organization_name: 'Evergreen Real Estate',
    tier: 'FREE',
    status: 'INACTIVE',
    billing_cycle: 'MONTHLY',
    amount: 0,
    seats: 2,
    start_date: '2024-12-28',
    current_period_start: '2024-12-28',
    current_period_end: '2025-01-28',
    cancel_at: null,
    stripe_subscription_id: 'sub_mock_free_24',
  },

  // CANCELLED subscription (Metro Housing)
  {
    id: '9',
    organization_id: '9',
    organization_name: 'Metro Housing Solutions',
    tier: 'STARTER',
    status: 'CANCELLED',
    billing_cycle: 'MONTHLY',
    amount: 2093, // $299 per seat × 7 seats (in cents)
    seats: 7,
    start_date: '2024-08-15',
    current_period_start: '2024-11-15',
    current_period_end: '2024-12-15',
    cancel_at: '2024-11-20',
    stripe_subscription_id: 'sub_mock_starter_9',
  },
];

/**
 * Get subscription statistics
 */
export function getSubscriptionStats() {
  const total = MOCK_SUBSCRIPTIONS.length;
  const active = MOCK_SUBSCRIPTIONS.filter((sub) => sub.status === 'ACTIVE').length;
  const pastDue = MOCK_SUBSCRIPTIONS.filter((sub) => sub.status === 'PAST_DUE').length;
  const cancelled = MOCK_SUBSCRIPTIONS.filter((sub) => sub.status === 'CANCELLED').length;
  const inactive = MOCK_SUBSCRIPTIONS.filter((sub) => sub.status === 'INACTIVE').length;

  // Group by tier
  const byTier = {
    FREE: MOCK_SUBSCRIPTIONS.filter((sub) => sub.tier === 'FREE').length,
    CUSTOM: MOCK_SUBSCRIPTIONS.filter((sub) => sub.tier === 'CUSTOM').length,
    STARTER: MOCK_SUBSCRIPTIONS.filter((sub) => sub.tier === 'STARTER').length,
    GROWTH: MOCK_SUBSCRIPTIONS.filter((sub) => sub.tier === 'GROWTH').length,
    ELITE: MOCK_SUBSCRIPTIONS.filter((sub) => sub.tier === 'ELITE').length,
    ENTERPRISE: MOCK_SUBSCRIPTIONS.filter((sub) => sub.tier === 'ENTERPRISE').length,
  };

  // Calculate MRR (Monthly Recurring Revenue)
  const monthlyRecurringRevenue = MOCK_SUBSCRIPTIONS
    .filter((sub) => sub.status === 'ACTIVE')
    .reduce((sum, sub) => {
      if (sub.billing_cycle === 'MONTHLY') {
        return sum + sub.amount;
      } else {
        // Convert annual to monthly
        return sum + (sub.amount / 12);
      }
    }, 0);

  // Calculate ARR (Annual Recurring Revenue)
  const annualRecurringRevenue = monthlyRecurringRevenue * 12;

  // Average revenue per active subscription
  const avgRevenuePerSub = active > 0 ? monthlyRecurringRevenue / active : 0;

  // Total seats across all active subscriptions
  const totalSeats = MOCK_SUBSCRIPTIONS
    .filter((sub) => sub.status === 'ACTIVE')
    .reduce((sum, sub) => sum + sub.seats, 0);

  return {
    total,
    active,
    pastDue,
    cancelled,
    inactive,
    byTier,
    monthlyRecurringRevenue: Math.round(monthlyRecurringRevenue),
    annualRecurringRevenue: Math.round(annualRecurringRevenue),
    avgRevenuePerSub: Math.round(avgRevenuePerSub),
    totalSeats,
    retentionRate: 95.2, // Mock value
    churnRate: 4.8, // Mock value
  };
}

/**
 * Get subscriptions expiring soon (next 30 days)
 */
export function getExpiringSoonSubscriptions(days: number = 30): MockSubscription[] {
  const now = new Date();
  const futureDate = new Date();
  futureDate.setDate(now.getDate() + days);

  return MOCK_SUBSCRIPTIONS.filter((sub) => {
    if (sub.status !== 'ACTIVE') return false;
    const endDate = new Date(sub.current_period_end);
    return endDate >= now && endDate <= futureDate;
  }).sort((a, b) =>
    new Date(a.current_period_end).getTime() - new Date(b.current_period_end).getTime()
  );
}
