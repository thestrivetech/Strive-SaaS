import { getAdminActionLogs } from '@/lib/modules/admin';
import AdminAuditLogsClient from './AuditLogsClient';

export default async function AdminAuditLogsPage() {
  // Fetch audit logs from database
  const auditLogs = await getAdminActionLogs({ limit: 1000 });

  return <AdminAuditLogsClient initialLogs={auditLogs} />;
}
