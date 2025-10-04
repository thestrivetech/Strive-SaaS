import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { LeadScoreBadge } from "./lead-score-badge";
import { Phone, Mail, Calendar } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface LeadCardProps {
  id: string;
  name: string;
  email: string;
  phone: string;
  score: "hot" | "warm" | "cold";
  source: string;
  createdAt: Date;
  agentName?: string;
  agentAvatar?: string;
}

export function LeadCard({
  name,
  email,
  phone,
  score,
  source,
  createdAt,
  agentName,
  agentAvatar,
}: LeadCardProps) {
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <Card className="hover-elevate" data-testid="card-lead">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-3 min-w-0">
            <Avatar>
              <AvatarFallback>{initials}</AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <h3 className="font-semibold truncate" data-testid="text-lead-name">{name}</h3>
              <p className="text-sm text-muted-foreground truncate">{source}</p>
            </div>
          </div>
          <LeadScoreBadge score={score} />
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Mail className="h-4 w-4 flex-shrink-0" />
            <span className="truncate">{email}</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Phone className="h-4 w-4 flex-shrink-0" />
            <span>{phone}</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Calendar className="h-4 w-4 flex-shrink-0" />
            <span>{formatDistanceToNow(createdAt, { addSuffix: true })}</span>
          </div>
        </div>
        {agentName && (
          <div className="flex items-center gap-2 pt-2 border-t">
            <Avatar className="h-6 w-6">
              <AvatarImage src={agentAvatar} />
              <AvatarFallback className="text-xs">
                {agentName.split(" ").map((n) => n[0]).join("")}
              </AvatarFallback>
            </Avatar>
            <span className="text-xs text-muted-foreground">
              Assigned to {agentName}
            </span>
          </div>
        )}
        <div className="flex gap-2 pt-2">
          <Button size="sm" className="flex-1" data-testid="button-call-lead">
            <Phone className="h-3 w-3 mr-1" />
            Call
          </Button>
          <Button size="sm" variant="outline" className="flex-1" data-testid="button-email-lead">
            <Mail className="h-3 w-3 mr-1" />
            Email
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
