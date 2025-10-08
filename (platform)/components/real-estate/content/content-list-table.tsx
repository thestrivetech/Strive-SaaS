'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Pencil, Trash2, MoreHorizontal } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { formatDistanceToNow } from 'date-fns';
import { deleteContent } from '@/lib/modules/content/content';
import { useToast } from '@/hooks/use-toast';

interface ContentItem {
  id: string;
  title: string;
  slug: string;
  type: string;
  status: string;
  updated_at: Date;
  author: {
    id: string;
    name: string | null;
    email: string;
  } | null;
}

interface ContentListTableProps {
  content: ContentItem[];
  organizationId: string;
}

// Status badge variants
const statusVariants: Record<string, { label: string; className: string }> = {
  DRAFT: { label: 'Draft', className: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' },
  PUBLISHED: { label: 'Published', className: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' },
  ARCHIVED: { label: 'Archived', className: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200' },
  REVIEW: { label: 'Review', className: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' },
  APPROVED: { label: 'Approved', className: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200' },
  SCHEDULED: { label: 'Scheduled', className: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200' },
};

// Type labels
const typeLabels: Record<string, string> = {
  PAGE: 'Page',
  BLOG_POST: 'Blog Post',
  DOCUMENTATION: 'Documentation',
  TEMPLATE: 'Template',
  ARTICLE: 'Article',
  LANDING_PAGE: 'Landing Page',
  EMAIL_TEMPLATE: 'Email Template',
  SOCIAL_POST: 'Social Post',
  PRESS_RELEASE: 'Press Release',
  NEWSLETTER: 'Newsletter',
  CASE_STUDY: 'Case Study',
  WHITEPAPER: 'Whitepaper',
};

export function ContentListTable({ content, organizationId }: ContentListTableProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleRowClick = (contentId: string) => {
    router.push(`/real-estate/cms-marketing/content/editor/${contentId}`);
  };

  const handleEdit = (e: React.MouseEvent, contentId: string) => {
    e.stopPropagation();
    router.push(`/real-estate/cms-marketing/content/editor/${contentId}`);
  };

  const handleDelete = async (e: React.MouseEvent, contentId: string) => {
    e.stopPropagation();

    if (!confirm('Are you sure you want to delete this content? This action cannot be undone.')) {
      return;
    }

    setDeletingId(contentId);

    try {
      await deleteContent(contentId);
      toast({
        title: 'Success',
        description: 'Content deleted successfully',
      });
      router.refresh();
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to delete content',
        variant: 'destructive',
      });
    } finally {
      setDeletingId(null);
    }
  };

  if (content.length === 0) {
    return (
      <div className="text-center py-12 border rounded-lg">
        <p className="text-muted-foreground">No content found. Create your first content item to get started.</p>
      </div>
    );
  }

  return (
    <>
      {/* Desktop Table View */}
      <div className="hidden md:block rounded-md border overflow-x-auto">
        <Table aria-label="Content items table">
          <TableHeader>
            <TableRow>
              <TableHead className="w-[300px]">Title</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Author</TableHead>
              <TableHead>Updated</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {content.map((item) => {
              const statusConfig = statusVariants[item.status] || statusVariants.DRAFT;
              const typeLabel = typeLabels[item.type] || item.type;

              return (
                <TableRow
                  key={item.id}
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => handleRowClick(item.id)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      handleRowClick(item.id);
                    }
                  }}
                  aria-label={`Edit ${item.title}`}
                >
                  <TableCell>
                    <div>
                      <div className="font-medium">{item.title}</div>
                      <div className="text-xs text-muted-foreground truncate max-w-[280px]">
                        /{item.slug}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm">{typeLabel}</span>
                  </TableCell>
                  <TableCell>
                    <Badge className={statusConfig.className}>
                      {statusConfig.label}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm">
                    {item.author?.name || item.author?.email || 'Unknown'}
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(item.updated_at), { addSuffix: true })}
                  </TableCell>
                  <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          aria-label={`More actions for ${item.title}`}
                          className="min-h-[44px] min-w-[44px]"
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={(e) => handleEdit(e, item.id)}>
                          <Pencil className="mr-2 h-4 w-4" aria-hidden="true" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={(e) => handleDelete(e, item.id)}
                          disabled={deletingId === item.id}
                          className="text-destructive focus:text-destructive"
                        >
                          <Trash2 className="mr-2 h-4 w-4" aria-hidden="true" />
                          {deletingId === item.id ? 'Deleting...' : 'Delete'}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden space-y-4">
        {content.map((item) => {
          const statusConfig = statusVariants[item.status] || statusVariants.DRAFT;
          const typeLabel = typeLabels[item.type] || item.type;

          return (
            <div
              key={item.id}
              className="border rounded-lg p-4 space-y-3 hover:bg-muted/50 transition-colors cursor-pointer"
              onClick={() => handleRowClick(item.id)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  handleRowClick(item.id);
                }
              }}
              aria-label={`Edit ${item.title}`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium truncate">{item.title}</h3>
                  <p className="text-xs text-muted-foreground truncate">/{item.slug}</p>
                </div>
                <div onClick={(e) => e.stopPropagation()}>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        aria-label={`More actions for ${item.title}`}
                        className="min-h-[44px] min-w-[44px] p-3"
                      >
                        <MoreHorizontal className="h-5 w-5" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={(e) => handleEdit(e, item.id)}>
                        <Pencil className="mr-2 h-4 w-4" aria-hidden="true" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={(e) => handleDelete(e, item.id)}
                        disabled={deletingId === item.id}
                        className="text-destructive focus:text-destructive"
                      >
                        <Trash2 className="mr-2 h-4 w-4" aria-hidden="true" />
                        {deletingId === item.id ? 'Deleting...' : 'Delete'}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2 text-sm">
                <Badge className={statusConfig.className}>
                  {statusConfig.label}
                </Badge>
                <span className="text-muted-foreground">•</span>
                <span className="text-muted-foreground">{typeLabel}</span>
              </div>

              <div className="flex items-center justify-between text-sm text-muted-foreground pt-2 border-t">
                <span>{item.author?.name || item.author?.email || 'Unknown'}</span>
                <span className="text-xs">
                  {formatDistanceToNow(new Date(item.updated_at), { addSuffix: true })}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}
