/**
 * Dashboard Data Provider
 *
 * Switches between mock data and real Prisma queries
 * Usage: Import from this file instead of directly from Prisma or mocks
 */

import { dataConfig, simulateDelay, maybeThrowError } from '../config';
import {
  generateMockWidget,
  generateMockWidgets,
  generateMockDashboardLayout,
  generateMockDashboardLayouts,
  generateMockQuickAction,
  generateMockQuickActions,
  type MockWidget,
  type MockDashboardLayout,
  type MockQuickAction,
} from '../mocks/widgets';

// ============================================================================
// IN-MEMORY MOCK STORAGE
// ============================================================================

let mockWidgetsStore: MockWidget[] = [];
let mockLayoutsStore: MockDashboardLayout[] = [];
let mockQuickActionsStore: MockQuickAction[] = [];

/**
 * Initialize mock data stores
 */
function initializeMockData(userId: string = 'demo-user') {
  if (mockWidgetsStore.length === 0) {
    // Generate 20 available widgets
    mockWidgetsStore = generateMockWidgets(20);

    // Generate 3 dashboard layouts for demo user
    mockLayoutsStore = generateMockDashboardLayouts(userId, 3);

    // Generate 8 quick actions for demo user
    mockQuickActionsStore = generateMockQuickActions(userId, 8);
  }
}

// ============================================================================
// WIDGETS PROVIDER
// ============================================================================

export const widgetsProvider = {
  /**
   * Find all available widgets
   */
  async findAll(): Promise<MockWidget[]> {
    if (dataConfig.useMocks) {
      initializeMockData();
      await simulateDelay();
      maybeThrowError('Failed to fetch widgets');

      // Return only active widgets
      return mockWidgetsStore.filter((w) => w.is_active);
    }

    // TODO: Replace with real Prisma query when schema is ready
    throw new Error('Real database not implemented yet - enable mock mode');
  },

  /**
   * Find widget by ID
   */
  async findById(id: string): Promise<MockWidget | null> {
    if (dataConfig.useMocks) {
      initializeMockData();
      await simulateDelay();
      maybeThrowError('Failed to fetch widget');

      return mockWidgetsStore.find((w) => w.id === id) || null;
    }

    // TODO: Replace with real Prisma query
    throw new Error('Real database not implemented yet - enable mock mode');
  },

  /**
   * Create a new widget
   */
  async create(data: Partial<MockWidget>): Promise<MockWidget> {
    if (dataConfig.useMocks) {
      initializeMockData();
      await simulateDelay();
      maybeThrowError('Failed to create widget');

      const newWidget = generateMockWidget(data.type || 'STATS', data);
      mockWidgetsStore.push(newWidget);

      return newWidget;
    }

    // TODO: Replace with real Prisma query
    throw new Error('Real database not implemented yet - enable mock mode');
  },

  /**
   * Update widget
   */
  async update(id: string, data: Partial<MockWidget>): Promise<MockWidget> {
    if (dataConfig.useMocks) {
      initializeMockData();
      await simulateDelay();
      maybeThrowError('Failed to update widget');

      const index = mockWidgetsStore.findIndex((w) => w.id === id);
      if (index === -1) throw new Error('Widget not found');

      mockWidgetsStore[index] = {
        ...mockWidgetsStore[index],
        ...data,
      };

      return mockWidgetsStore[index];
    }

    // TODO: Replace with real Prisma query
    throw new Error('Real database not implemented yet - enable mock mode');
  },

  /**
   * Delete widget
   */
  async delete(id: string): Promise<void> {
    if (dataConfig.useMocks) {
      initializeMockData();
      await simulateDelay();
      maybeThrowError('Failed to delete widget');

      const index = mockWidgetsStore.findIndex((w) => w.id === id);
      if (index === -1) throw new Error('Widget not found');

      mockWidgetsStore.splice(index, 1);
      return;
    }

    // TODO: Replace with real Prisma query
    throw new Error('Real database not implemented yet - enable mock mode');
  },
};

// ============================================================================
// DASHBOARD LAYOUTS PROVIDER
// ============================================================================

export const dashboardLayoutsProvider = {
  /**
   * Find all layouts for a user
   */
  async findMany(userId: string): Promise<MockDashboardLayout[]> {
    if (dataConfig.useMocks) {
      initializeMockData(userId);
      await simulateDelay();
      maybeThrowError('Failed to fetch dashboard layouts');

      return mockLayoutsStore
        .filter((l) => l.user_id === userId)
        .sort((a, b) => {
          // Default layout first
          if (a.is_default && !b.is_default) return -1;
          if (!a.is_default && b.is_default) return 1;
          return b.created_at.getTime() - a.created_at.getTime();
        });
    }

    // TODO: Replace with real Prisma query
    throw new Error('Real database not implemented yet - enable mock mode');
  },

  /**
   * Find layout by ID
   */
  async findById(id: string, userId: string): Promise<MockDashboardLayout | null> {
    if (dataConfig.useMocks) {
      initializeMockData(userId);
      await simulateDelay();
      maybeThrowError('Failed to fetch dashboard layout');

      return mockLayoutsStore.find((l) => l.id === id && l.user_id === userId) || null;
    }

    // TODO: Replace with real Prisma query
    throw new Error('Real database not implemented yet - enable mock mode');
  },

  /**
   * Get default layout for user
   */
  async getDefault(userId: string): Promise<MockDashboardLayout | null> {
    if (dataConfig.useMocks) {
      initializeMockData(userId);
      await simulateDelay();
      maybeThrowError('Failed to fetch default layout');

      return mockLayoutsStore.find((l) => l.user_id === userId && l.is_default) || null;
    }

    // TODO: Replace with real Prisma query
    throw new Error('Real database not implemented yet - enable mock mode');
  },

  /**
   * Create a new layout
   */
  async create(
    data: Partial<MockDashboardLayout>,
    userId: string
  ): Promise<MockDashboardLayout> {
    if (dataConfig.useMocks) {
      initializeMockData(userId);
      await simulateDelay();
      maybeThrowError('Failed to create dashboard layout');

      const newLayout = generateMockDashboardLayout(userId, data);
      mockLayoutsStore.push(newLayout);

      return newLayout;
    }

    // TODO: Replace with real Prisma query
    throw new Error('Real database not implemented yet - enable mock mode');
  },

  /**
   * Update layout
   */
  async update(
    id: string,
    data: Partial<MockDashboardLayout>,
    userId: string
  ): Promise<MockDashboardLayout> {
    if (dataConfig.useMocks) {
      initializeMockData(userId);
      await simulateDelay();
      maybeThrowError('Failed to update dashboard layout');

      const index = mockLayoutsStore.findIndex((l) => l.id === id && l.user_id === userId);
      if (index === -1) throw new Error('Dashboard layout not found');

      mockLayoutsStore[index] = {
        ...mockLayoutsStore[index],
        ...data,
        updated_at: new Date(),
      };

      return mockLayoutsStore[index];
    }

    // TODO: Replace with real Prisma query
    throw new Error('Real database not implemented yet - enable mock mode');
  },

  /**
   * Set layout as default
   */
  async setDefault(id: string, userId: string): Promise<MockDashboardLayout> {
    if (dataConfig.useMocks) {
      initializeMockData(userId);
      await simulateDelay();
      maybeThrowError('Failed to set default layout');

      // Find the layout
      const layout = mockLayoutsStore.find((l) => l.id === id && l.user_id === userId);
      if (!layout) throw new Error('Dashboard layout not found');

      // Unset all other layouts as default for this user
      mockLayoutsStore.forEach((l) => {
        if (l.user_id === userId && l.id !== id) {
          l.is_default = false;
        }
      });

      // Set this layout as default
      layout.is_default = true;
      layout.updated_at = new Date();

      return layout;
    }

    // TODO: Replace with real Prisma query
    throw new Error('Real database not implemented yet - enable mock mode');
  },

  /**
   * Delete layout
   */
  async delete(id: string, userId: string): Promise<void> {
    if (dataConfig.useMocks) {
      initializeMockData(userId);
      await simulateDelay();
      maybeThrowError('Failed to delete dashboard layout');

      const index = mockLayoutsStore.findIndex((l) => l.id === id && l.user_id === userId);
      if (index === -1) throw new Error('Dashboard layout not found');

      const layout = mockLayoutsStore[index];

      // Prevent deleting default layout if it's the only one
      if (layout.is_default) {
        const userLayouts = mockLayoutsStore.filter((l) => l.user_id === userId);
        if (userLayouts.length === 1) {
          throw new Error('Cannot delete the only layout');
        }

        // Set another layout as default before deleting
        const nextLayout = userLayouts.find((l) => l.id !== id);
        if (nextLayout) {
          nextLayout.is_default = true;
        }
      }

      mockLayoutsStore.splice(index, 1);
      return;
    }

    // TODO: Replace with real Prisma query
    throw new Error('Real database not implemented yet - enable mock mode');
  },
};

// ============================================================================
// QUICK ACTIONS PROVIDER
// ============================================================================

export const quickActionsProvider = {
  /**
   * Find all quick actions for a user
   */
  async findMany(userId: string): Promise<MockQuickAction[]> {
    if (dataConfig.useMocks) {
      initializeMockData(userId);
      await simulateDelay();
      maybeThrowError('Failed to fetch quick actions');

      return mockQuickActionsStore
        .filter((a) => a.user_id === userId && a.is_active)
        .sort((a, b) => a.order - b.order);
    }

    // TODO: Replace with real Prisma query
    throw new Error('Real database not implemented yet - enable mock mode');
  },

  /**
   * Create a new quick action
   */
  async create(data: Partial<MockQuickAction>, userId: string): Promise<MockQuickAction> {
    if (dataConfig.useMocks) {
      initializeMockData(userId);
      await simulateDelay();
      maybeThrowError('Failed to create quick action');

      // Get highest order number
      const userActions = mockQuickActionsStore.filter((a) => a.user_id === userId);
      const maxOrder = userActions.length > 0 ? Math.max(...userActions.map((a) => a.order)) : -1;

      const newAction = generateMockQuickAction(userId, {
        ...data,
        order: maxOrder + 1,
      });
      mockQuickActionsStore.push(newAction);

      return newAction;
    }

    // TODO: Replace with real Prisma query
    throw new Error('Real database not implemented yet - enable mock mode');
  },

  /**
   * Update quick action
   */
  async update(
    id: string,
    data: Partial<MockQuickAction>,
    userId: string
  ): Promise<MockQuickAction> {
    if (dataConfig.useMocks) {
      initializeMockData(userId);
      await simulateDelay();
      maybeThrowError('Failed to update quick action');

      const index = mockQuickActionsStore.findIndex((a) => a.id === id && a.user_id === userId);
      if (index === -1) throw new Error('Quick action not found');

      mockQuickActionsStore[index] = {
        ...mockQuickActionsStore[index],
        ...data,
      };

      return mockQuickActionsStore[index];
    }

    // TODO: Replace with real Prisma query
    throw new Error('Real database not implemented yet - enable mock mode');
  },

  /**
   * Reorder quick actions
   */
  async reorder(userId: string, orderedIds: string[]): Promise<MockQuickAction[]> {
    if (dataConfig.useMocks) {
      initializeMockData(userId);
      await simulateDelay();
      maybeThrowError('Failed to reorder quick actions');

      // Update order for each action
      orderedIds.forEach((id, index) => {
        const action = mockQuickActionsStore.find((a) => a.id === id && a.user_id === userId);
        if (action) {
          action.order = index;
        }
      });

      // Return updated actions
      return mockQuickActionsStore
        .filter((a) => a.user_id === userId && a.is_active)
        .sort((a, b) => a.order - b.order);
    }

    // TODO: Replace with real Prisma query
    throw new Error('Real database not implemented yet - enable mock mode');
  },

  /**
   * Delete quick action
   */
  async delete(id: string, userId: string): Promise<void> {
    if (dataConfig.useMocks) {
      initializeMockData(userId);
      await simulateDelay();
      maybeThrowError('Failed to delete quick action');

      const index = mockQuickActionsStore.findIndex((a) => a.id === id && a.user_id === userId);
      if (index === -1) throw new Error('Quick action not found');

      const deletedAction = mockQuickActionsStore[index];
      mockQuickActionsStore.splice(index, 1);

      // Reorder remaining actions
      mockQuickActionsStore
        .filter((a) => a.user_id === userId && a.order > deletedAction.order)
        .forEach((a) => {
          a.order -= 1;
        });

      return;
    }

    // TODO: Replace with real Prisma query
    throw new Error('Real database not implemented yet - enable mock mode');
  },
};
