import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FileText, File, Image as ImageIcon, MoreVertical, Download, Eye, Trash2 } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

export interface DocumentCardProps {
  id: string;
  name: string;
  type: "pdf" | "doc" | "docx" | "jpg" | "png" | "image" | "other";
  size: string;
  version: number;
  lastModified: string;
  uploadedBy: string;
  status: "pending" | "signed" | "reviewed" | "draft" | "approved";
  onView?: () => void;
  onDownload?: () => void;
  onDelete?: () => void;
}

const typeIcons = {
  pdf: FileText,
  doc: File,
  docx: File,
  jpg: ImageIcon,
  png: ImageIcon,
  image: ImageIcon,
  other: File,
};

const statusConfig = {
  pending: { label: "Pending", className: "bg-[hsl(38,92%,50%)] text-white" },
  signed: { label: "Signed", className: "bg-[hsl(142,71%,45%)] text-white" },
  reviewed: { label: "Reviewed", className: "bg-[hsl(221,83%,53%)] text-white" },
  approved: { label: "Approved", className: "bg-[hsl(142,71%,45%)] text-white" },
  draft: { label: "Draft", className: "bg-[hsl(220,13%,69%)] text-white" },
};

export default function DocumentCard({
  name,
  type,
  size,
  version,
  lastModified,
  uploadedBy,
  status,
  onView,
  onDownload,
  onDelete,
}: DocumentCardProps) {
  const Icon = typeIcons[type] || typeIcons.other;
  const statusInfo = statusConfig[status] || statusConfig.draft;

  return (
    <Card className="p-4 hover-elevate cursor-pointer" onClick={onView} data-testid={`card-document-${name}`}>
      <div className="flex items-start gap-3">
        <div className="p-2 bg-muted rounded-md">
          <Icon className="w-5 h-5 text-muted-foreground" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <h4 className="font-medium text-sm truncate" data-testid="text-document-name">{name}</h4>
              <p className="text-xs text-muted-foreground">
                Version {version} • {size} • {uploadedBy}
              </p>
            </div>
            <Badge className={statusInfo.className} data-testid={`badge-status-${status}`}>
              {statusInfo.label}
            </Badge>
          </div>
          <div className="flex items-center justify-between mt-3">
            <span className="text-xs text-muted-foreground" data-testid="text-last-modified">
              Modified {lastModified}
            </span>
            <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
              <Button size="icon" variant="ghost" className="h-7 w-7" onClick={onView} data-testid="button-view-document">
                <Eye className="w-3.5 h-3.5" />
              </Button>
              <Button size="icon" variant="ghost" className="h-7 w-7" onClick={onDownload} data-testid="button-download-document">
                <Download className="w-3.5 h-3.5" />
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button size="icon" variant="ghost" className="h-7 w-7" data-testid="button-document-menu">
                    <MoreVertical className="w-3.5 h-3.5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={onDelete} className="text-destructive" data-testid="button-delete-document">
                    <Trash2 className="w-3.5 h-3.5 mr-2" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
