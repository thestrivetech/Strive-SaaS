/**
 * Mock Feature Flags for Admin Dashboard
 *
 * Feature flags for A/B testing and gradual rollouts
 */

export interface MockFeatureFlag {
  id: string;
  name: string;
  key: string;
  description: string;
  enabled: boolean;
  rollout_percentage: number;
  target_tiers?: string[];
  created_at: string;
  updated_at: string;
}

export const MOCK_FEATURE_FLAGS: MockFeatureFlag[] = [
  {
    id: '1',
    name: 'AI Assistant v2',
    key: 'ai_assistant_v2',
    description: 'Enable new AI assistant with improved context understanding',
    enabled: true,
    rollout_percentage: 100,
    target_tiers: ['ELITE', 'ENTERPRISE'],
    created_at: '2024-11-01',
    updated_at: '2025-01-05',
  },
  {
    id: '2',
    name: 'Dark Mode',
    key: 'dark_mode',
    description: 'Enable dark mode theme for all users',
    enabled: true,
    rollout_percentage: 100,
    created_at: '2024-10-15',
    updated_at: '2024-12-20',
  },
  {
    id: '3',
    name: 'Advanced Analytics',
    key: 'advanced_analytics',
    description: 'New analytics dashboard with predictive insights',
    enabled: false,
    rollout_percentage: 0,
    target_tiers: ['GROWTH', 'ELITE', 'ENTERPRISE'],
    created_at: '2024-12-10',
    updated_at: '2025-01-03',
  },
  {
    id: '4',
    name: 'Mobile App Beta',
    key: 'mobile_app_beta',
    description: 'Access to mobile app beta testing program',
    enabled: true,
    rollout_percentage: 25,
    target_tiers: ['ELITE', 'ENTERPRISE'],
    created_at: '2024-12-01',
    updated_at: '2025-01-08',
  },
  {
    id: '5',
    name: 'Real-time Collaboration',
    key: 'realtime_collaboration',
    description: 'Enable real-time document collaboration features',
    enabled: true,
    rollout_percentage: 50,
    target_tiers: ['GROWTH', 'ELITE', 'ENTERPRISE'],
    created_at: '2024-11-20',
    updated_at: '2025-01-07',
  },
  {
    id: '6',
    name: 'Transaction Automation',
    key: 'transaction_automation',
    description: 'AI-powered transaction workflow automation',
    enabled: false,
    rollout_percentage: 0,
    target_tiers: ['ELITE', 'ENTERPRISE'],
    created_at: '2025-01-05',
    updated_at: '2025-01-05',
  },
  {
    id: '7',
    name: 'Expense OCR',
    key: 'expense_ocr',
    description: 'Automatic expense receipt scanning and categorization',
    enabled: true,
    rollout_percentage: 75,
    target_tiers: ['GROWTH', 'ELITE', 'ENTERPRISE'],
    created_at: '2024-12-15',
    updated_at: '2025-01-06',
  },
  {
    id: '8',
    name: 'Content AI Writer',
    key: 'content_ai_writer',
    description: 'AI-powered content generation for marketing',
    enabled: true,
    rollout_percentage: 100,
    target_tiers: ['ELITE', 'ENTERPRISE'],
    created_at: '2024-11-10',
    updated_at: '2024-12-28',
  },
  {
    id: '9',
    name: 'Video Meetings',
    key: 'video_meetings',
    description: 'Built-in video conferencing with screen sharing',
    enabled: false,
    rollout_percentage: 0,
    created_at: '2025-01-02',
    updated_at: '2025-01-02',
  },
  {
    id: '10',
    name: 'API Access v2',
    key: 'api_access_v2',
    description: 'New REST API with expanded endpoints',
    enabled: true,
    rollout_percentage: 100,
    target_tiers: ['ENTERPRISE'],
    created_at: '2024-10-01',
    updated_at: '2024-11-15',
  },
];

/**
 * Get feature flag statistics
 */
export function getFeatureFlagStats() {
  const total = MOCK_FEATURE_FLAGS.length;
  const enabled = MOCK_FEATURE_FLAGS.filter((flag) => flag.enabled).length;
  const disabled = total - enabled;
  const fullRollout = MOCK_FEATURE_FLAGS.filter((flag) => flag.rollout_percentage === 100).length;

  return {
    total,
    enabled,
    disabled,
    fullRollout,
    partialRollout: enabled - fullRollout,
  };
}
