import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FileText, ArrowRight } from 'lucide-react';
import { getRecentContent } from '@/lib/modules/cms-marketing/dashboard-queries';
import { formatDistanceToNow } from 'date-fns';

/**
 * Recent Content Component
 *
 * Displays the most recently created/updated content items
 * Server component - fetches data directly
 *
 * @param organizationId - Current organization ID
 */
interface RecentContentProps {
  organizationId: string;
}

export async function RecentContent({ organizationId }: RecentContentProps) {
  const recentContent = await getRecentContent();

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Recent Content</CardTitle>
          <Button asChild variant="ghost" size="sm">
            <Link href="/real-estate/cms-marketing/content" className="flex items-center gap-1">
              View All
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {recentContent.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <FileText className="mx-auto h-12 w-12 mb-2 opacity-50" />
            <p>No content yet</p>
            <Button asChild variant="link" className="mt-2">
              <Link href="/real-estate/cms-marketing/content/editor">
                Create your first content
              </Link>
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {recentContent.map((item) => (
              <Link
                key={item.id}
                href={`/real-estate/cms-marketing/content/editor/${item.id}`}
                className="block p-3 rounded-lg border hover:bg-accent transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{item.title}</p>
                    <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                      <span className="capitalize">{item.type.toLowerCase()}</span>
                      <span>•</span>
                      <Badge
                        variant={getStatusVariant(item.status)}
                        className="text-xs"
                      >
                        {item.status}
                      </Badge>
                    </div>
                  </div>
                  <span className="text-xs text-muted-foreground whitespace-nowrap ml-2">
                    {formatDistanceToNow(new Date(item.updated_at), { addSuffix: true })}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function getStatusVariant(status: string): 'default' | 'secondary' | 'destructive' | 'outline' {
  switch (status) {
    case 'PUBLISHED':
      return 'default';
    case 'DRAFT':
      return 'secondary';
    case 'ARCHIVED':
      return 'outline';
    default:
      return 'secondary';
  }
}
