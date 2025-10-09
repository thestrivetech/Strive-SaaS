import { getCurrentUser } from '@/lib/auth/auth-helpers';
import { redirect } from 'next/navigation';
import { getSubscription, getPaymentMethods, getInvoices } from '@/lib/modules/settings';
import { BillingSettingsForm } from '@/components/settings/billing-settings-form';

export default async function BillingPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect('/login');
  }

  // Get organization ID from the user's organization memberships
  const organizationId = user.organization_members[0]?.organizations.id;

  if (!organizationId) {
    redirect('/onboarding/organization');
  }

  const [subscription, paymentMethods, invoices] = await Promise.all([
    getSubscription(organizationId),
    getPaymentMethods(organizationId),
    getInvoices(organizationId),
  ]);

  return (
    <BillingSettingsForm
      subscription={subscription}
      paymentMethods={paymentMethods}
      invoices={invoices}
    />
  );
}
