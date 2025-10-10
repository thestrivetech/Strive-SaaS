import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Eye, Globe, Calendar } from "lucide-react";
import { format } from "date-fns";

interface PageViewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  page: {
    id: string;
    title: string;
    slug: string;
    status: "draft" | "published" | "scheduled";
    metaTitle?: string | null;
    metaDescription?: string | null;
    views: number;
    updatedAt: string;
  } | null;
}

export default function PageViewDialog({ open, onOpenChange, page }: PageViewDialogProps) {
  if (!page) return null;

  const getStatusBadge = (status: string) => {
    const config: Record<string, { label: string; className: string }> = {
      published: { label: "Published", className: "bg-chart-3/20 text-chart-3" },
      draft: { label: "Draft", className: "bg-muted text-muted-foreground" },
      scheduled: { label: "Scheduled", className: "bg-chart-4/20 text-chart-4" },
    };
    const info = config[status] || config.draft;
    return <Badge className={info.className}>{info.label}</Badge>;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto" data-testid="dialog-page-view">
        <DialogHeader>
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <DialogTitle className="text-2xl mb-2">{page.title}</DialogTitle>
              <DialogDescription className="flex items-center gap-2">
                <Globe className="h-4 w-4" />
                <span>Landing Page</span>
              </DialogDescription>
            </div>
            {getStatusBadge(page.status)}
          </div>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          <div>
            <h3 className="font-medium mb-2">URL</h3>
            <div className="bg-muted rounded-md p-3">
              <code className="text-sm">/{page.slug}</code>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-muted rounded-md p-3">
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <Eye className="h-4 w-4" />
                <span className="text-xs">Total Views</span>
              </div>
              <p className="text-2xl font-semibold">{page.views.toLocaleString()}</p>
            </div>
            <div className="bg-muted rounded-md p-3">
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <Calendar className="h-4 w-4" />
                <span className="text-xs">Last Updated</span>
              </div>
              <p className="text-sm font-medium">{format(new Date(page.updatedAt), "PPP")}</p>
            </div>
          </div>

          {page.metaTitle && (
            <div>
              <h3 className="font-medium mb-2">Meta Title (SEO)</h3>
              <div className="bg-muted rounded-md p-3">
                <p className="text-sm">{page.metaTitle}</p>
              </div>
            </div>
          )}

          {page.metaDescription && (
            <div>
              <h3 className="font-medium mb-2">Meta Description (SEO)</h3>
              <div className="bg-muted rounded-md p-3">
                <p className="text-sm">{page.metaDescription}</p>
              </div>
            </div>
          )}

          <div className="bg-accent/50 border border-border rounded-md p-4">
            <p className="text-sm text-muted-foreground">
              <strong>Note:</strong> Full page content and design can be edited in the Page Editor. This view shows metadata and basic information only.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
