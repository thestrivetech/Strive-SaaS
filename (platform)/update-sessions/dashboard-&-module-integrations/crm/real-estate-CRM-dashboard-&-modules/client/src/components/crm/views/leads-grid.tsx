import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { PhaseBadge } from "@/components/crm/shared/phase-badge";
import { Badge } from "@/components/ui/badge";
import { Lead } from "@/types/crm";
import { formatDistanceToNow } from "date-fns";
import { MoreHorizontal, Phone, Mail, Calendar } from "lucide-react";

interface LeadsGridProps {
  leads: Lead[];
  onPhaseChange?: (id: string, phase: Lead["phase"]) => void;
  onAction?: (id: string, action: string) => void;
}

export function LeadsGrid({ leads, onPhaseChange, onAction }: LeadsGridProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3" data-testid="grid-leads">
      {leads.map((lead) => {
        const initials = lead.name
          .split(" ")
          .map((n) => n[0])
          .join("")
          .toUpperCase();

        return (
          <Card key={lead.id} className="hover-elevate" data-testid={`card-lead-${lead.id}`}>
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <Avatar>
                    <AvatarImage src={lead.avatar} />
                    <AvatarFallback>{initials}</AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-semibold truncate">{lead.name}</h3>
                    <p className="text-sm text-muted-foreground truncate">
                      {lead.email}
                    </p>
                  </div>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 flex-shrink-0"
                      data-testid={`button-menu-${lead.id}`}
                    >
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => onAction?.(lead.id, "call")}>
                      <Phone className="h-4 w-4 mr-2" />
                      Call
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onAction?.(lead.id, "email")}>
                      <Mail className="h-4 w-4 mr-2" />
                      Email
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onAction?.(lead.id, "edit")}>
                      Edit
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                <PhaseBadge status={lead.phase} />
                {lead.isClient && (
                  <Badge variant="secondary">Client</Badge>
                )}
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Phone className="h-4 w-4 flex-shrink-0" />
                  <span>{lead.phone}</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Calendar className="h-4 w-4 flex-shrink-0" />
                  <span>
                    Last contact{" "}
                    {formatDistanceToNow(lead.lastContact, { addSuffix: true })}
                  </span>
                </div>
              </div>

              {lead.agentName && (
                <div className="pt-2 border-t text-xs text-muted-foreground">
                  Assigned to {lead.agentName}
                </div>
              )}

              {lead.value && (
                <div className="font-semibold text-primary">
                  {lead.value}
                </div>
              )}

              <div className="flex gap-2 pt-2">
                <Button
                  size="sm"
                  className="flex-1"
                  onClick={() => onAction?.(lead.id, "call")}
                  data-testid={`button-call-${lead.id}`}
                >
                  <Phone className="h-3 w-3 mr-1" />
                  Call
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="flex-1"
                  onClick={() => onAction?.(lead.id, "email")}
                  data-testid={`button-email-${lead.id}`}
                >
                  <Mail className="h-3 w-3 mr-1" />
                  Email
                </Button>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
