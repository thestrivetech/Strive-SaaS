import { redirect } from 'next/navigation';

export default function RootPage() {
  // Root redirect - sends users to the platform login
  // Marketing site is accessed via hostname routing in middleware
  redirect('/dashboard');
}