import { getCurrentUser } from '@/lib/auth/auth-helpers';
import { canAccessTransactionModule } from '@/lib/modules/transactions/core/permissions';
import { redirect } from 'next/navigation';

export default async function TransactionLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();

  if (!user) {
    redirect('/login?callbackUrl=/real-estate/workspace');
  }

  // Check tier access (GROWTH minimum required)
  if (!canAccessTransactionModule(user)) {
    redirect('/pricing?upgrade=transaction-management&tier=GROWTH');
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex-1 overflow-auto">
        {children}
      </div>
    </div>
  );
}
