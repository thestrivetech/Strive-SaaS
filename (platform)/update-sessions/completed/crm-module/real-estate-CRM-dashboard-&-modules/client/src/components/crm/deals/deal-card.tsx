import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Home, Calendar, DollarSign } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface DealCardProps {
  id: string;
  propertyAddress: string;
  clientName: string;
  value: string;
  stage: string;
  daysInStage: number;
  nextAction: string;
  nextActionDate: Date;
  agentAvatar?: string;
}

export function DealCard({
  propertyAddress,
  clientName,
  value,
  daysInStage,
  nextAction,
  nextActionDate,
  agentAvatar,
}: DealCardProps) {
  const initials = clientName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();

  return (
    <Card className="cursor-grab active:cursor-grabbing hover-elevate" data-testid="card-deal">
      <CardHeader className="pb-3">
        <div className="flex items-start gap-2">
          <Home className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
          <div className="min-w-0 flex-1">
            <h4 className="font-semibold text-sm line-clamp-1" data-testid="text-deal-address">
              {propertyAddress}
            </h4>
            <p className="text-xs text-muted-foreground">{clientName}</p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1 text-sm font-semibold">
            <DollarSign className="h-4 w-4 text-primary" />
            <span>{value}</span>
          </div>
          <Badge variant="secondary" className="text-xs">
            {daysInStage}d in stage
          </Badge>
        </div>
        <div className="space-y-2">
          <div className="text-xs text-muted-foreground">Next Action</div>
          <div className="flex items-center gap-2">
            <Calendar className="h-3 w-3 text-muted-foreground" />
            <div className="flex-1 min-w-0">
              <div className="text-xs font-medium line-clamp-1">{nextAction}</div>
              <div className="text-xs text-muted-foreground">
                {formatDistanceToNow(nextActionDate, { addSuffix: true })}
              </div>
            </div>
          </div>
        </div>
        {agentAvatar && (
          <div className="flex items-center gap-2 pt-2 border-t">
            <Avatar className="h-5 w-5">
              <AvatarImage src={agentAvatar} />
              <AvatarFallback className="text-xs">{initials}</AvatarFallback>
            </Avatar>
            <span className="text-xs text-muted-foreground">
              {clientName.split(" ")[0]}'s deal
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
