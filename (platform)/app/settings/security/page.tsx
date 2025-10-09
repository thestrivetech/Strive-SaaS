import { getCurrentUser } from '@/lib/auth/auth-helpers';
import { redirect } from 'next/navigation';
import { getActiveSessions, getSecurityLog, get2FAStatus } from '@/lib/modules/settings';
import { SecuritySettingsForm } from '@/components/settings/security-settings-form';

export default async function SecurityPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect('/login');
  }

  const [sessions, securityLog, twoFactorStatus] = await Promise.all([
    getActiveSessions(user.id),
    getSecurityLog(user.id),
    get2FAStatus(user.id),
  ]);

  return (
    <SecuritySettingsForm
      sessions={sessions}
      securityLog={securityLog}
      twoFactorEnabled={twoFactorStatus.enabled}
    />
  );
}
