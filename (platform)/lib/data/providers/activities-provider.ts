/**
 * Activities Mock Data Provider
 *
 * Provides mock activity data for showcase mode
 */

import { dataConfig, simulateDelay } from '../config';

/**
 * Get recent activities (mock data)
 */
export async function getRecentActivities(options: { limit?: number } = {}) {
  if (dataConfig.useMocks) {
    await simulateDelay();

    const now = new Date();
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
    const twoHoursAgo = new Date(now.getTime() - 2 * 60 * 60 * 1000);
    const fiveHoursAgo = new Date(now.getTime() - 5 * 60 * 60 * 1000);

    return [
      {
        id: 'act-1',
        type: 'call',
        title: 'Called John Smith',
        description: 'Discussed property requirements and budget',
        created_at: oneHourAgo,
        created_by: {
          id: 'demo-user',
          name: 'Demo User',
          avatar_url: null,
        },
      },
      {
        id: 'act-2',
        type: 'email',
        title: 'Sent listing details',
        description: 'Emailed 5 property options to Sarah Johnson',
        created_at: twoHoursAgo,
        created_by: {
          id: 'demo-user',
          name: 'Demo User',
          avatar_url: null,
        },
      },
      {
        id: 'act-3',
        type: 'meeting',
        title: 'Client consultation',
        description: 'Met with Chen family to discuss investment properties',
        created_at: fiveHoursAgo,
        created_by: {
          id: 'demo-user',
          name: 'Demo User',
          avatar_url: null,
        },
      },
    ].slice(0, options.limit || 10);
  }

  throw new Error('Real activities not implemented - enable mock mode');
}
