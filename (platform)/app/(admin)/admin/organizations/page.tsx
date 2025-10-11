import { getAllOrganizations } from '@/lib/modules/admin';
import OrganizationsClient from './OrganizationsClient';

export default async function AdminOrganizationsPage() {
  // Fetch organizations from database
  const { organizations } = await getAllOrganizations();

  return <OrganizationsClient initialOrganizations={organizations} />;
}
