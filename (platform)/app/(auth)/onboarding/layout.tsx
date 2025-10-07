import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Get Started - Strive',
  description: 'Set up your Strive account in minutes',
};

export default function OnboardingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <div className="container mx-auto px-4 py-8">
        {children}
      </div>
    </div>
  );
}
