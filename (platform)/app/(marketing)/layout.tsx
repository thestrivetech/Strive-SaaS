import { MarketingNav } from '@/components/shared/layouts/marketing-nav';
import { Footer } from '@/components/shared/layouts/footer';

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <MarketingNav />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
