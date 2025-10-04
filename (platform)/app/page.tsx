// app/app/page.tsx
// Single root page that dispatches to web or platform based on hostname
// This prevents the "parallel pages" build error while maintaining
// clean separation between marketing (web) and SaaS (platform) sites

import HostDependent from '@/components/HostDependent';

export default function RootPage() {
  return <HostDependent />;
}
