import { NotificationSettingsForm } from '@/components/settings/notification-settings-form';

export default async function NotificationsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Notification Settings</h1>
        <p className="text-muted-foreground">
          Choose what notifications you want to receive
        </p>
      </div>

      <NotificationSettingsForm />
    </div>
  );
}
