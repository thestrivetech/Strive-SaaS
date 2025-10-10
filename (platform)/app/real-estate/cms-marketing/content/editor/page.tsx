import { requireAuth } from '@/lib/auth/auth-helpers';
import { canAccessContent } from '@/lib/auth/rbac';
import { ContentEditor } from '@/components/real-estate/content/content-editor';
import { Card, CardContent } from '@/components/ui/card';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';

export default async function NewContentPage() {
  const user = await requireAuth();

  // Check RBAC permissions
  if (!canAccessContent(user)) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-muted-foreground">
              You don&apos;t have permission to create content.
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              Please contact your administrator to request access.
            </p>
          </CardContent>
        </Card>
      </div>
    );
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
