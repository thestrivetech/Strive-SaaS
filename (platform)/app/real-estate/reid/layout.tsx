import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'REID Dashboard | Strive Tech',
  description: 'Real Estate Intelligence Dashboard - Market insights, analytics, and AI-powered tools for real estate professionals',
};

export default function REIDLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="reid-theme min-h-screen">
      {children}
    </div>
  );
}
