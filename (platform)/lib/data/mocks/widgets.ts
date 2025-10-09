/**
 * Mock Widgets Data
 *
 * Generate mock data for User Dashboard customization (widgets, layouts, quick actions)
 */

import {
  generateId,
  randomFromArray,
  randomPastDate,
  randomBoolean,
  randomInt,
} from './generators';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export type MockWidget = {
  id: string;
  type: 'STATS' | 'CHART' | 'LIST' | 'QUICK_ACTIONS' | 'CALENDAR' | 'ACTIVITY_FEED' | 'CUSTOM';
  title: string;
  description: string | null;
  data_source: string; // e.g., "crm.contacts", "transactions.loops", etc.
  size: 'SMALL' | 'MEDIUM' | 'LARGE' | 'FULL_WIDTH';
  refresh_interval: number | null; // seconds, null = manual only
  config: any; // Widget-specific configuration
  is_active: boolean;
  created_at: Date;
};

export type MockDashboardLayout = {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  is_default: boolean;
  layout: Array<{
    widget_id: string;
    position: { x: number; y: number; w: number; h: number };
  }>;
  created_at: Date;
  updated_at: Date;
};

export type MockQuickAction = {
  id: string;
  user_id: string;
  label: string;
  icon: string;
  action_type: 'NAVIGATE' | 'MODAL' | 'EXTERNAL_LINK' | 'FUNCTION';
  action_config: {
    url?: string;
    modal?: string;
    function?: string;
  };
  order: number;
  is_active: boolean;
  created_at: Date;
};

// ============================================================================
// DATA POOLS
// ============================================================================

const WIDGET_DEFINITIONS: Array<{
  type: MockWidget['type'];
  title: string;
  description: string;
  data_source: string;
  size: MockWidget['size'];
  refresh_interval: number | null;
}> = [
  // STATS widgets
  {
    type: 'STATS',
    title: 'Total Contacts',
    description: 'Total number of contacts in CRM',
    data_source: 'crm.contacts',
    size: 'SMALL',
    refresh_interval: 300, // 5 minutes
  },
  {
    type: 'STATS',
    title: 'Active Deals',
    description: 'Number of deals in progress',
    data_source: 'crm.deals',
    size: 'SMALL',
    refresh_interval: 300,
  },
  {
    type: 'STATS',
    title: 'Monthly Revenue',
    description: 'Total revenue for current month',
    data_source: 'finance.revenue',
    size: 'SMALL',
    refresh_interval: 3600, // 1 hour
  },
  {
    type: 'STATS',
    title: 'Open Tasks',
    description: 'Number of pending tasks',
    data_source: 'transactions.tasks',
    size: 'SMALL',
    refresh_interval: 300,
  },

  // CHART widgets
  {
    type: 'CHART',
    title: 'Sales Pipeline',
    description: 'Visual representation of sales pipeline stages',
    data_source: 'crm.pipeline',
    size: 'MEDIUM',
    refresh_interval: 600,
  },
  {
    type: 'CHART',
    title: 'Revenue Trend',
    description: 'Monthly revenue trend over time',
    data_source: 'finance.revenue_trend',
    size: 'MEDIUM',
    refresh_interval: 3600,
  },
  {
    type: 'CHART',
    title: 'Deal Conversion',
    description: 'Conversion rates by stage',
    data_source: 'crm.conversion',
    size: 'MEDIUM',
    refresh_interval: 3600,
  },
  {
    type: 'CHART',
    title: 'Task Completion',
    description: 'Task completion rate over time',
    data_source: 'transactions.task_completion',
    size: 'MEDIUM',
    refresh_interval: 600,
  },

  // LIST widgets
  {
    type: 'LIST',
    title: 'Recent Contacts',
    description: 'Recently added or updated contacts',
    data_source: 'crm.contacts.recent',
    size: 'MEDIUM',
    refresh_interval: 300,
  },
  {
    type: 'LIST',
    title: 'Upcoming Tasks',
    description: 'Tasks due in the next 7 days',
    data_source: 'transactions.tasks.upcoming',
    size: 'MEDIUM',
    refresh_interval: 300,
  },
  {
    type: 'LIST',
    title: 'Hot Leads',
    description: 'High-priority leads requiring attention',
    data_source: 'crm.leads.hot',
    size: 'MEDIUM',
    refresh_interval: 600,
  },
  {
    type: 'LIST',
    title: 'Recent Transactions',
    description: 'Latest transaction loops',
    data_source: 'transactions.loops.recent',
    size: 'MEDIUM',
    refresh_interval: 300,
  },

  // CALENDAR widgets
  {
    type: 'CALENDAR',
    title: 'Appointments',
    description: 'Upcoming appointments and meetings',
    data_source: 'crm.appointments',
    size: 'LARGE',
    refresh_interval: 300,
  },
  {
    type: 'CALENDAR',
    title: 'Task Calendar',
    description: 'Tasks organized by due date',
    data_source: 'transactions.tasks.calendar',
    size: 'LARGE',
    refresh_interval: 300,
  },

  // ACTIVITY_FEED widgets
  {
    type: 'ACTIVITY_FEED',
    title: 'Recent Activity',
    description: 'Latest activities across all modules',
    data_source: 'activity.recent',
    size: 'MEDIUM',
    refresh_interval: 120, // 2 minutes
  },
  {
    type: 'ACTIVITY_FEED',
    title: 'Team Activity',
    description: 'What your team is working on',
    data_source: 'activity.team',
    size: 'MEDIUM',
    refresh_interval: 300,
  },

  // QUICK_ACTIONS widgets
  {
    type: 'QUICK_ACTIONS',
    title: 'Quick Actions',
    description: 'Frequently used actions and shortcuts',
    data_source: 'user.quick_actions',
    size: 'SMALL',
    refresh_interval: null,
  },

  // CUSTOM widgets
  {
    type: 'CUSTOM',
    title: 'Market Insights',
    description: 'AI-generated market insights',
    data_source: 'ai.insights',
    size: 'LARGE',
    refresh_interval: 3600,
  },
  {
    type: 'CUSTOM',
    title: 'Performance Score',
    description: 'Personal performance metrics',
    data_source: 'analytics.performance',
    size: 'MEDIUM',
    refresh_interval: 3600,
  },
  {
    type: 'CUSTOM',
    title: 'Goals Progress',
    description: 'Progress towards monthly goals',
    data_source: 'goals.progress',
    size: 'MEDIUM',
    refresh_interval: 3600,
  },
];

const QUICK_ACTION_DEFINITIONS: Array<{
  label: string;
  icon: string;
  action_type: MockQuickAction['action_type'];
  action_config: MockQuickAction['action_config'];
}> = [
  {
    label: 'New Contact',
    icon: 'UserPlus',
    action_type: 'MODAL',
    action_config: { modal: 'create-contact' },
  },
  {
    label: 'New Task',
    icon: 'Plus',
    action_type: 'MODAL',
    action_config: { modal: 'create-task' },
  },
  {
    label: 'New Transaction',
    icon: 'FileText',
    action_type: 'NAVIGATE',
    action_config: { url: '/real-estate/workspace/new' },
  },
  {
    label: 'Schedule Appointment',
    icon: 'Calendar',
    action_type: 'MODAL',
    action_config: { modal: 'schedule-appointment' },
  },
  {
    label: 'Send Email',
    icon: 'Mail',
    action_type: 'MODAL',
    action_config: { modal: 'compose-email' },
  },
  {
    label: 'View Reports',
    icon: 'BarChart',
    action_type: 'NAVIGATE',
    action_config: { url: '/real-estate/analytics/reports' },
  },
  {
    label: 'CRM Dashboard',
    icon: 'Users',
    action_type: 'NAVIGATE',
    action_config: { url: '/real-estate/crm/dashboard' },
  },
  {
    label: 'AI Assistant',
    icon: 'Bot',
    action_type: 'FUNCTION',
    action_config: { function: 'openAIChat' },
  },
  {
    label: 'Settings',
    icon: 'Settings',
    action_type: 'NAVIGATE',
    action_config: { url: '/settings' },
  },
  {
    label: 'Help Center',
    icon: 'HelpCircle',
    action_type: 'EXTERNAL_LINK',
    action_config: { url: 'https://help.strivetech.ai' },
  },
];

// ============================================================================
// WIDGET GENERATORS
// ============================================================================

/**
 * Generate a mock widget
 */
export function generateMockWidget(
  type: MockWidget['type'],
  overrides?: Partial<MockWidget>
): MockWidget {
  const definition = WIDGET_DEFINITIONS.find((w) => w.type === type) || WIDGET_DEFINITIONS[0];

  return {
    id: generateId(),
    type: definition.type,
    title: definition.title,
    description: definition.description,
    data_source: definition.data_source,
    size: definition.size,
    refresh_interval: definition.refresh_interval,
    config: {}, // Widget-specific config (empty for now)
    is_active: true,
    created_at: randomPastDate(180),
    ...overrides,
  };
}

/**
 * Generate multiple widgets (all available types)
 */
export function generateMockWidgets(count: number = 20): MockWidget[] {
  const widgets: MockWidget[] = [];

  // Generate one of each defined widget
  WIDGET_DEFINITIONS.slice(0, count).forEach((definition) => {
    widgets.push(
      generateMockWidget(definition.type, {
        title: definition.title,
        description: definition.description,
        data_source: definition.data_source,
        size: definition.size,
        refresh_interval: definition.refresh_interval,
      })
    );
  });

  return widgets;
}

// ============================================================================
// DASHBOARD LAYOUT GENERATORS
// ============================================================================

/**
 * Generate a mock dashboard layout
 */
export function generateMockDashboardLayout(
  userId: string,
  overrides?: Partial<MockDashboardLayout>
): MockDashboardLayout {
  const createdAt = randomPastDate(90);

  return {
    id: generateId(),
    user_id: userId,
    name: 'Custom Layout',
    description: 'Personalized dashboard layout',
    is_default: false,
    layout: [], // Will be populated with widget positions
    created_at: createdAt,
    updated_at: createdAt,
    ...overrides,
  };
}

/**
 * Generate multiple dashboard layouts
 */
export function generateMockDashboardLayouts(
  userId: string,
  count: number = 3
): MockDashboardLayout[] {
  const layouts: MockDashboardLayout[] = [];

  // Generate default layout
  const defaultLayout = generateMockDashboardLayout(userId, {
    name: 'Default Dashboard',
    description: 'Standard dashboard with all essential widgets',
    is_default: true,
    layout: [
      { widget_id: 'widget_1', position: { x: 0, y: 0, w: 3, h: 2 } },
      { widget_id: 'widget_2', position: { x: 3, y: 0, w: 3, h: 2 } },
      { widget_id: 'widget_3', position: { x: 6, y: 0, w: 3, h: 2 } },
      { widget_id: 'widget_4', position: { x: 9, y: 0, w: 3, h: 2 } },
      { widget_id: 'widget_5', position: { x: 0, y: 2, w: 6, h: 4 } },
      { widget_id: 'widget_6', position: { x: 6, y: 2, w: 6, h: 4 } },
      { widget_id: 'widget_7', position: { x: 0, y: 6, w: 6, h: 3 } },
      { widget_id: 'widget_8', position: { x: 6, y: 6, w: 6, h: 3 } },
    ],
  });
  layouts.push(defaultLayout);

  // Generate sales-focused layout
  if (count > 1) {
    const salesLayout = generateMockDashboardLayout(userId, {
      name: 'Sales Focus',
      description: 'Optimized for sales and deal tracking',
      is_default: false,
      layout: [
        { widget_id: 'widget_1', position: { x: 0, y: 0, w: 3, h: 2 } },
        { widget_id: 'widget_2', position: { x: 3, y: 0, w: 3, h: 2 } },
        { widget_id: 'widget_5', position: { x: 6, y: 0, w: 6, h: 4 } },
        { widget_id: 'widget_9', position: { x: 0, y: 2, w: 6, h: 4 } },
        { widget_id: 'widget_10', position: { x: 0, y: 6, w: 12, h: 3 } },
      ],
    });
    layouts.push(salesLayout);
  }

  // Generate analytics-focused layout
  if (count > 2) {
    const analyticsLayout = generateMockDashboardLayout(userId, {
      name: 'Analytics Dashboard',
      description: 'Data-driven insights and reports',
      is_default: false,
      layout: [
        { widget_id: 'widget_6', position: { x: 0, y: 0, w: 6, h: 4 } },
        { widget_id: 'widget_7', position: { x: 6, y: 0, w: 6, h: 4 } },
        { widget_id: 'widget_3', position: { x: 0, y: 4, w: 4, h: 2 } },
        { widget_id: 'widget_17', position: { x: 4, y: 4, w: 4, h: 2 } },
        { widget_id: 'widget_18', position: { x: 8, y: 4, w: 4, h: 2 } },
        { widget_id: 'widget_15', position: { x: 0, y: 6, w: 12, h: 4 } },
      ],
    });
    layouts.push(analyticsLayout);
  }

  return layouts;
}

// ============================================================================
// QUICK ACTION GENERATORS
// ============================================================================

/**
 * Generate a mock quick action
 */
export function generateMockQuickAction(
  userId: string,
  overrides?: Partial<MockQuickAction>
): MockQuickAction {
  const definition = randomFromArray(QUICK_ACTION_DEFINITIONS);

  return {
    id: generateId(),
    user_id: userId,
    label: definition.label,
    icon: definition.icon,
    action_type: definition.action_type,
    action_config: definition.action_config,
    order: 0, // Will be set in bulk generator
    is_active: true,
    created_at: randomPastDate(90),
    ...overrides,
  };
}

/**
 * Generate multiple quick actions
 */
export function generateMockQuickActions(
  userId: string,
  count: number = 8
): MockQuickAction[] {
  const actions: MockQuickAction[] = [];

  // Select first N actions from definitions
  QUICK_ACTION_DEFINITIONS.slice(0, count).forEach((definition, index) => {
    actions.push(
      generateMockQuickAction(userId, {
        label: definition.label,
        icon: definition.icon,
        action_type: definition.action_type,
        action_config: definition.action_config,
        order: index,
      })
    );
  });

  return actions;
}
