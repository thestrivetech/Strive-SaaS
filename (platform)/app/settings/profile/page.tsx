import { getCurrentUser } from '@/lib/auth/auth-helpers';
import { ProfileSettingsForm } from '@/components/settings/profile-settings-form';
import { redirect } from 'next/navigation';

export default async function ProfilePage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect('/login');
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Profile Settings</h1>
        <p className="text-muted-foreground">
          Manage your personal information and preferences
        </p>
      </div>

      <ProfileSettingsForm
        initialUser={{
          id: user.id,
          name: user.name,
          email: user.email,
          avatar_url: user.avatar_url,
          role: user.role,
        }}
      />
    </div>
  );
}
