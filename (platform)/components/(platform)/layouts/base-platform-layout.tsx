import { Header } from '../shared/navigation/header';
import { SidebarNav } from '../shared/navigation/sidebar-nav';
import type { defaultNavItems } from '../shared/navigation/sidebar-nav';

interface BasePlatformLayoutProps {
  children: React.ReactNode;
  navItems: typeof defaultNavItems;
}

export async function BasePlatformLayout({
  children,
  navItems,
}: BasePlatformLayoutProps) {
  return (
    <div className="flex min-h-screen">
      <SidebarNav items={navItems} />
      <div className="flex flex-1 flex-col">
        <Header />
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}
