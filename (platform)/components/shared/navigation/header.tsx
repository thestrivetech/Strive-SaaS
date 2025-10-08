import { UserMenu } from './user-menu';
import { Breadcrumbs } from './breadcrumbs';
import { getCurrentUser } from '@/lib/auth/auth-helpers';

/**
 * Header Component
 *
 * Global header used across admin and platform layouts
 * Includes breadcrumbs and user menu
 */
export async function Header() {
  const user = await getCurrentUser();

  if (!user) {
    return null;
  }

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center justify-between">
        <div className="flex items-center gap-4">
          <Breadcrumbs />
        </div>
        <div className="flex items-center gap-4">
          <UserMenu user={user} />
        </div>
      </div>
    </header>
  );
}
