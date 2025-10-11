import { getPlatformSettings } from '@/lib/modules/admin';
import SettingsClient from './SettingsClient';

export default async function AdminSettingsPage() {
  // Fetch platform settings
  const settings = await getPlatformSettings();

  return <SettingsClient initialSettings={settings} />;
}
