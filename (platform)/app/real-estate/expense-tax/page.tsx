import { redirect } from 'next/navigation';

/**
 * Expense & Tax Module Root
 *
 * Redirects to the module dashboard
 */
export default function ExpenseTaxPage() {
  redirect('/real-estate/expense-tax/dashboard');
}
