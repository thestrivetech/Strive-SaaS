import { redirect } from 'next/navigation';

/**
 * Signup Page - Redirects to Login Page with Signup Tab Active
 *
 * The login page contains both login and signup forms in tabs.
 * This page simply redirects users to the signup tab.
 */
export default function SignupPage() {
  redirect('/login?tab=signup');
}
