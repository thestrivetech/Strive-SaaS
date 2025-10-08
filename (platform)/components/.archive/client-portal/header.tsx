import { getCurrentUser } from '@/lib/auth/auth-helpers';
import { UserMenu } from './user-menu';
import { ThemeToggle } from './theme-toggle';
import { Breadcrumbs } from './breadcrumbs';

export async function Header() {
  const user = await getCurrentUser();

  if (!user) {
    return null;
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <Breadcrumbs />
        <div className="ml-auto flex items-center gap-2">
          <ThemeToggle />
          <UserMenu user={user} />
        </div>
      </div>
    </header>
  );
}
