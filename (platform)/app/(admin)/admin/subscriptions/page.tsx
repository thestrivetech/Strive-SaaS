import { getAllSubscriptions } from '@/lib/modules/admin';
import SubscriptionsClient from './SubscriptionsClient';

export default async function AdminSubscriptionsPage() {
  // Fetch subscriptions from database
  const { subscriptions } = await getAllSubscriptions();

  return <SubscriptionsClient initialSubscriptions={subscriptions} />;
}
