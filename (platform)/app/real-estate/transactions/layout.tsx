import { getCurrentUser } from '@/lib/auth/auth-helpers';
import { TierGate } from '@/components/subscription/tier-gate';
import { redirect } from 'next/navigation';

export default async function TransactionLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();

  if (!user) {
    redirect('/login');
  }

  // Get user's subscription tier
  const userTier = user.subscription_tier || 'FREE';

  return (
    <TierGate
      requiredTier="STARTER"
      feature="Transaction Management"
      userTier={userTier}
    >
      <div className="flex h-full flex-col">
        <div className="flex-1 overflow-auto">
          {children}
        </div>
      </div>
    </TierGate>
  );
}
