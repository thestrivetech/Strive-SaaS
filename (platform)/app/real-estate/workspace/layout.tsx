import { getCurrentUser } from '@/lib/auth/auth-helpers';
import { canAccessWorkspaceModule } from '@/lib/modules/workspace/core/permissions';
import { redirect } from 'next/navigation';

export default async function WorkspaceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();

  if (!user) {
    redirect('/login?callbackUrl=/real-estate/workspace');
  }

  // Check tier access (GROWTH minimum required)
  if (!canAccessWorkspaceModule(user)) {
    redirect('/pricing?upgrade=workspace-management&tier=GROWTH');
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex-1 overflow-auto">
        {children}
      </div>
    </div>
  );
}
