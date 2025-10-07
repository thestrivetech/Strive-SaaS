import { redirect } from 'next/navigation';
import { requireAuth } from '@/lib/auth/auth-helpers';
import { canAccessContent } from '@/lib/auth/rbac';
import { ContentEditor } from '@/components/real-estate/content/content-editor';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';

export default async function NewContentPage() {
  const user = await requireAuth();

  // Check RBAC permissions
  if (!canAccessContent(user)) {
    redirect('/real-estate/dashboard');
  }

  return (
    <div className="space-y-6 p-6">
      {/* Breadcrumbs */}
      <nav className="flex items-center text-sm text-muted-foreground">
        <Link href="/real-estate/cms-marketing" className="hover:text-foreground">
          CMS & Marketing
        </Link>
        <ChevronRight className="h-4 w-4 mx-2" />
        <Link href="/real-estate/cms-marketing/content" className="hover:text-foreground">
          Content
        </Link>
        <ChevronRight className="h-4 w-4 mx-2" />
        <span className="text-foreground">New</span>
      </nav>

      {/* Content Editor */}
      <ContentEditor organizationId={user.organizationId} />
    </div>
  );
}
