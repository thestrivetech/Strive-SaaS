/**
 * Appointments Mock Data Provider
 *
 * Provides mock appointment data for showcase mode
 */

import { dataConfig, simulateDelay } from '../config';

/**
 * Get upcoming appointments (mock data)
 */
export async function getUpcomingAppointments(userId: string, limit: number = 5) {
  if (dataConfig.useMocks) {
    await simulateDelay();

    const now = new Date();
    const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    const twoDays = new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000);

    return [
      {
        id: 'apt-1',
        title: 'Property Viewing - 123 Main St',
        start_time: new Date(tomorrow.setHours(10, 0, 0)),
        end_time: new Date(tomorrow.setHours(11, 0, 0)),
        location: '123 Main St, Downtown',
        description: 'Show luxury condo to prospective buyers',
        user_id: userId,
        organization_id: 'demo-org',
        created_at: now,
        updated_at: now,
      },
      {
        id: 'apt-2',
        title: 'Client Meeting - Smith Family',
        start_time: new Date(tomorrow.setHours(14, 30, 0)),
        end_time: new Date(tomorrow.setHours(15, 30, 0)),
        location: 'Office - Conference Room A',
        description: 'Discuss financing options',
        user_id: userId,
        organization_id: 'demo-org',
        created_at: now,
        updated_at: now,
      },
      {
        id: 'apt-3',
        title: 'Home Inspection - 456 Oak Ave',
        start_time: new Date(twoDays.setHours(9, 0, 0)),
        end_time: new Date(twoDays.setHours(10, 30, 0)),
        location: '456 Oak Ave, Westside',
        description: 'Final walkthrough with inspector',
        user_id: userId,
        organization_id: 'demo-org',
        created_at: now,
        updated_at: now,
      },
    ];
  }

  throw new Error('Real appointments not implemented - enable mock mode');
}
