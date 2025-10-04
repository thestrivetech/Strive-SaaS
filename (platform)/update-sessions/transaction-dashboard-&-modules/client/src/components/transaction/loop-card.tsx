import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Calendar, MapPin, Users, FileText, MoreVertical } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

export type LoopStatus = "draft" | "active" | "underContract" | "closing" | "closed" | "cancelled";

export interface LoopCardProps {
  id: string;
  propertyAddress: string;
  propertyImage?: string;
  status: LoopStatus;
  transactionType: string;
  listingPrice: number;
  closingDate: string;
  progress: number;
  parties: Array<{ name: string; role: string; avatar?: string }>;
  documentCount: number;
  onView?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
}

const statusConfig: Record<LoopStatus, { label: string; className: string }> = {
  draft: { label: "Draft", className: "bg-[hsl(220,13%,69%)] text-white" },
  active: { label: "Active", className: "bg-[hsl(221,83%,53%)] text-white" },
  underContract: { label: "Under Contract", className: "bg-[hsl(262,83%,58%)] text-white" },
  closing: { label: "Closing", className: "bg-[hsl(38,92%,50%)] text-white" },
  closed: { label: "Closed", className: "bg-[hsl(142,71%,45%)] text-white" },
  cancelled: { label: "Cancelled", className: "bg-[hsl(0,84%,60%)] text-white" },
};

export default function LoopCard({
  propertyAddress,
  propertyImage,
  status,
  transactionType,
  listingPrice,
  closingDate,
  progress,
  parties,
  documentCount,
  onView,
  onEdit,
  onDelete,
}: LoopCardProps) {
  const statusInfo = statusConfig[status];

  return (
    <Card className="hover-elevate overflow-hidden cursor-pointer" onClick={onView} data-testid={`card-loop-${propertyAddress}`}>
      <div className="relative h-32 bg-muted overflow-hidden">
        {propertyImage ? (
          <img src={propertyImage} alt={propertyAddress} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <MapPin className="w-8 h-8 text-muted-foreground" />
          </div>
        )}
        <div className="absolute top-2 right-2 flex gap-2">
          <Badge className={statusInfo.className} data-testid={`badge-status-${status}`}>
            {statusInfo.label}
          </Badge>
        </div>
      </div>
      <CardHeader className="flex flex-row items-start justify-between gap-2 space-y-0 pb-2">
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-base truncate" data-testid="text-property-address">
            {propertyAddress}
          </h3>
          <p className="text-xs text-muted-foreground">{transactionType}</p>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
            <Button size="icon" variant="ghost" data-testid="button-loop-menu">
              <MoreVertical className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onView?.(); }} data-testid="button-view-loop">
              View Details
            </DropdownMenuItem>
            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onEdit?.(); }} data-testid="button-edit-loop">
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onDelete?.(); }} className="text-destructive" data-testid="button-delete-loop">
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Listing Price</span>
          <span className="font-mono font-semibold" data-testid="text-listing-price">
            ${listingPrice.toLocaleString()}
          </span>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Calendar className="w-3 h-3" />
          <span data-testid="text-closing-date">Closing: {closingDate}</span>
        </div>
        <div className="space-y-1">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Progress</span>
            <span className="font-medium" data-testid="text-progress">{progress}%</span>
          </div>
          <Progress value={progress} className="h-1" />
        </div>
        <div className="flex items-center justify-between pt-2 border-t">
          <div className="flex items-center gap-1">
            <Users className="w-3 h-3 text-muted-foreground" />
            <div className="flex -space-x-2">
              {parties.slice(0, 3).map((party, idx) => (
                <Avatar key={idx} className="w-6 h-6 border-2 border-background">
                  <AvatarImage src={party.avatar} />
                  <AvatarFallback className="text-xs">{party.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                </Avatar>
              ))}
              {parties.length > 3 && (
                <div className="w-6 h-6 rounded-full bg-muted border-2 border-background flex items-center justify-center">
                  <span className="text-xs font-medium">+{parties.length - 3}</span>
                </div>
              )}
            </div>
          </div>
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <FileText className="w-3 h-3" />
            <span data-testid="text-document-count">{documentCount} docs</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
