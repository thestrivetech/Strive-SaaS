import { redirect } from 'next/navigation';

/**
 * CRM Root Page
 *
 * Redirects to the CRM dashboard
 */
export default function CRMPage() {
  redirect('/crm/dashboard');
}
