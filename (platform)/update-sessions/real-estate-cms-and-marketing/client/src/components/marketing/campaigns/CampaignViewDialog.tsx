import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Mail, Share2, Calendar, TrendingUp, MousePointer, Eye } from "lucide-react";
import { format } from "date-fns";

interface CampaignViewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  campaign: {
    id: string;
    title: string;
    content: string;
    type: "email" | "social";
    status: "draft" | "scheduled" | "active" | "completed" | "paused";
    scheduledDate?: string;
    platforms?: string[];
    metrics?: {
      sends?: number;
      opens?: number;
      clicks?: number;
      impressions?: number;
      engagement?: number;
    } | null;
  } | null;
}

export default function CampaignViewDialog({ open, onOpenChange, campaign }: CampaignViewDialogProps) {
  if (!campaign) return null;

  const getStatusBadge = (status: string) => {
    const config: Record<string, { label: string; className: string }> = {
      draft: { label: "Draft", className: "bg-muted text-muted-foreground" },
      scheduled: { label: "Scheduled", className: "bg-chart-4/20 text-chart-4" },
      active: { label: "Active", className: "bg-chart-3/20 text-chart-3" },
      completed: { label: "Completed", className: "bg-chart-1/20 text-chart-1" },
      paused: { label: "Paused", className: "bg-chart-2/20 text-chart-2" },
    };
    const info = config[status] || config.draft;
    return <Badge className={info.className}>{info.label}</Badge>;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto" data-testid="dialog-campaign-view">
        <DialogHeader>
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <DialogTitle className="text-2xl mb-2">{campaign.title}</DialogTitle>
              <DialogDescription className="flex items-center gap-2">
                {campaign.type === "email" ? (
                  <Mail className="h-4 w-4" />
                ) : (
                  <Share2 className="h-4 w-4" />
                )}
                <span>{campaign.type === "email" ? "Email Campaign" : "Social Media Campaign"}</span>
              </DialogDescription>
            </div>
            {getStatusBadge(campaign.status)}
          </div>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {campaign.scheduledDate && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <span>Scheduled for {format(new Date(campaign.scheduledDate), "PPP 'at' p")}</span>
            </div>
          )}

          {campaign.platforms && campaign.platforms.length > 0 && (
            <div>
              <h3 className="font-medium mb-2">Platforms</h3>
              <div className="flex flex-wrap gap-2">
                {campaign.platforms.map((platform) => (
                  <Badge key={platform} variant="outline">
                    {platform}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          <div>
            <h3 className="font-medium mb-2">Content</h3>
            <div className="bg-muted rounded-md p-4">
              <p className="text-sm whitespace-pre-wrap">{campaign.content}</p>
            </div>
          </div>

          {campaign.metrics && (
            <div>
              <h3 className="font-medium mb-3">Performance Metrics</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {campaign.type === "email" ? (
                  <>
                    {campaign.metrics.sends !== undefined && (
                      <div className="bg-muted rounded-md p-3">
                        <div className="flex items-center gap-2 text-muted-foreground mb-1">
                          <Mail className="h-4 w-4" />
                          <span className="text-xs">Sends</span>
                        </div>
                        <p className="text-2xl font-semibold">{campaign.metrics.sends.toLocaleString()}</p>
                      </div>
                    )}
                    {campaign.metrics.opens !== undefined && (
                      <div className="bg-muted rounded-md p-3">
                        <div className="flex items-center gap-2 text-muted-foreground mb-1">
                          <Eye className="h-4 w-4" />
                          <span className="text-xs">Opens</span>
                        </div>
                        <p className="text-2xl font-semibold">{campaign.metrics.opens.toLocaleString()}</p>
                        {campaign.metrics.sends && (
                          <p className="text-xs text-muted-foreground mt-1">
                            {((campaign.metrics.opens / campaign.metrics.sends) * 100).toFixed(1)}% rate
                          </p>
                        )}
                      </div>
                    )}
                    {campaign.metrics.clicks !== undefined && (
                      <div className="bg-muted rounded-md p-3">
                        <div className="flex items-center gap-2 text-muted-foreground mb-1">
                          <MousePointer className="h-4 w-4" />
                          <span className="text-xs">Clicks</span>
                        </div>
                        <p className="text-2xl font-semibold">{campaign.metrics.clicks.toLocaleString()}</p>
                        {campaign.metrics.sends && (
                          <p className="text-xs text-muted-foreground mt-1">
                            {((campaign.metrics.clicks / campaign.metrics.sends) * 100).toFixed(1)}% rate
                          </p>
                        )}
                      </div>
                    )}
                  </>
                ) : (
                  <>
                    {campaign.metrics.impressions !== undefined && (
                      <div className="bg-muted rounded-md p-3">
                        <div className="flex items-center gap-2 text-muted-foreground mb-1">
                          <Eye className="h-4 w-4" />
                          <span className="text-xs">Impressions</span>
                        </div>
                        <p className="text-2xl font-semibold">{campaign.metrics.impressions.toLocaleString()}</p>
                      </div>
                    )}
                    {campaign.metrics.engagement !== undefined && (
                      <div className="bg-muted rounded-md p-3">
                        <div className="flex items-center gap-2 text-muted-foreground mb-1">
                          <TrendingUp className="h-4 w-4" />
                          <span className="text-xs">Engagement</span>
                        </div>
                        <p className="text-2xl font-semibold">{campaign.metrics.engagement.toLocaleString()}</p>
                        {campaign.metrics.impressions && (
                          <p className="text-xs text-muted-foreground mt-1">
                            {((campaign.metrics.engagement / campaign.metrics.impressions) * 100).toFixed(1)}% rate
                          </p>
                        )}
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
