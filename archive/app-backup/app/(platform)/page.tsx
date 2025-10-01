import { redirect } from 'next/navigation';

export default function PlatformHome() {
  // Redirect to dashboard (middleware will handle auth check)
  redirect('/dashboard');
}
