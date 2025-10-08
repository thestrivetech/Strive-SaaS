import { notFound } from 'next/navigation';
import { requireAuth } from '@/lib/auth/auth-helpers';
import { canAccessContent } from '@/lib/auth/rbac';
import { getContentItemById } from '@/lib/modules/content/content';
import { ContentEditor } from '@/components/real-estate/content/content-editor';
import { Card, CardContent } from '@/components/ui/card';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';

interface EditContentPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function EditContentPage({ params }: EditContentPageProps) {
  const user = await requireAuth();

  // Check RBAC permissions
  if (!canAccessContent(user)) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-muted-foreground">
              You don't have permission to edit content.
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              Please contact your administrator to request access.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const { id } = await params;

  // Fetch content by ID
  const content = await getContentItemById(id);

  // 404 if content not found or doesn't belong to user's organization
  if (!content || content.organization_id !== user.organizationId) {
    notFound();
  }

  // Prepare initial content for the form
  const initialContent = {
    title: content.title,
    slug: content.slug,
    content: content.content,
    excerpt: content.excerpt || '',
    type: content.type,
    status: content.status,
    language: content.language,
    meta_title: content.meta_title || '',
    meta_description: content.meta_description || '',
    keywords: content.keywords || [],
    canonical_url: content.canonical_url || '',
    featured_image: content.featured_image || '',
    gallery: content.gallery || [],
    video_url: content.video_url || '',
    audio_url: content.audio_url || '',
    scheduled_for: content.scheduled_for || undefined,
    expires_at: content.expires_at || undefined,
    category_id: content.category_id || undefined,
    organization_id: content.organization_id,
  };

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
        <span className="text-foreground truncate max-w-[200px]">{content.title}</span>
      </nav>

      {/* Content Editor */}
      <ContentEditor
        contentId={content.id}
        initialContent={initialContent}
        organizationId={user.organizationId}
      />
    </div>
  );
}
