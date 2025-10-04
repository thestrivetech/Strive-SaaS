import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MoreVertical, Mail, Users, MousePointer, Edit2, Trash2, Copy } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

export interface Campaign {
  id: string;
  title: string;
  status: "draft" | "scheduled" | "active" | "completed" | "paused";
  type: "email" | "social";
  scheduledDate?: string;
  metrics?: {
    sends?: number;
    opens?: number;
    clicks?: number;
    impressions?: number;
    engagement?: number;
  } | null;
}

interface CampaignCardProps {
  campaign: Campaign;
  onEdit?: (id: string) => void;
  onView?: (id: string) => void;
  onDelete?: (id: string) => void;
  onDuplicate?: (id: string) => void;
}

const statusConfig = {
  draft: { label: "Draft", className: "bg-muted text-muted-foreground" },
  scheduled: { label: "Scheduled", className: "bg-chart-4/20 text-chart-4" },
  active: { label: "Active", className: "bg-chart-3/20 text-chart-3" },
  completed: { label: "Completed", className: "bg-chart-1/20 text-chart-1" },
  paused: { label: "Paused", className: "bg-destructive/20 text-destructive" },
};

export default function CampaignCard({ campaign, onEdit, onView, onDelete, onDuplicate }: CampaignCardProps) {
  const statusInfo = statusConfig[campaign.status];

  return (
    <Card className="hover-elevate" data-testid={`card-campaign-${campaign.id}`}>
      <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-3">
        <div className="flex-1 min-w-0">
          <CardTitle className="text-base truncate" data-testid={`text-campaign-title-${campaign.id}`}>
            {campaign.title}
          </CardTitle>
          <p className="text-xs text-muted-foreground mt-1">
            {campaign.type === "email" ? "Email Campaign" : "Social Media"}
          </p>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              data-testid={`button-campaign-menu-${campaign.id}`}
            >
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onEdit?.(campaign.id)} data-testid={`menu-edit-${campaign.id}`}>
              <Edit2 className="mr-2 h-4 w-4" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onDuplicate?.(campaign.id)} data-testid={`menu-duplicate-${campaign.id}`}>
              <Copy className="mr-2 h-4 w-4" />
              Duplicate
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              onClick={() => onDelete?.(campaign.id)} 
              className="text-destructive focus:text-destructive"
              data-testid={`menu-delete-${campaign.id}`}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center gap-2">
          <Badge className={cn("text-xs", statusInfo.className)} data-testid={`badge-status-${campaign.id}`}>
            {statusInfo.label}
          </Badge>
          {campaign.scheduledDate && (
            <span className="text-xs text-muted-foreground">
              {new Date(campaign.scheduledDate).toLocaleDateString()}
            </span>
          )}
        </div>
        {campaign.metrics && (
          <div className="grid grid-cols-3 gap-2 pt-2 border-t">
            {campaign.type === "email" ? (
              <>
                <div className="flex flex-col">
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <Mail className="h-3 w-3" />
                    Sent
                  </span>
                  <span className="text-sm font-medium">{campaign.metrics.sends?.toLocaleString() || 0}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <Users className="h-3 w-3" />
                    Opens
                  </span>
                  <span className="text-sm font-medium">{campaign.metrics.opens?.toLocaleString() || 0}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <MousePointer className="h-3 w-3" />
                    Clicks
                  </span>
                  <span className="text-sm font-medium">{campaign.metrics.clicks?.toLocaleString() || 0}</span>
                </div>
              </>
            ) : (
              <>
                <div className="flex flex-col">
                  <span className="text-xs text-muted-foreground">Impressions</span>
                  <span className="text-sm font-medium">{campaign.metrics.impressions?.toLocaleString() || 0}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs text-muted-foreground">Engagement</span>
                  <span className="text-sm font-medium">{campaign.metrics.engagement?.toFixed(1) || 0}%</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs text-muted-foreground">Clicks</span>
                  <span className="text-sm font-medium">{campaign.metrics.clicks?.toLocaleString() || 0}</span>
                </div>
              </>
            )}
          </div>
        )}
      </CardContent>
      <CardFooter className="flex gap-2 pt-3 border-t">
        <Button
          variant="outline"
          size="sm"
          className="flex-1"
          onClick={() => onView?.(campaign.id)}
          data-testid={`button-view-${campaign.id}`}
        >
          View
        </Button>
        <Button
          size="sm"
          className="flex-1"
          onClick={() => onEdit?.(campaign.id)}
          data-testid={`button-edit-${campaign.id}`}
        >
          Edit
        </Button>
      </CardFooter>
    </Card>
  );
}
