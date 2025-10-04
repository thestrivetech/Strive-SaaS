import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { CheckCircle, Clock, XCircle, FileText, Send } from "lucide-react";

export interface SignatureParty {
  name: string;
  email: string;
  role: string;
  status: "pending" | "signed" | "declined" | "viewed";
  signedAt?: string;
  avatar?: string;
}

export interface SignatureRequestProps {
  documentName: string;
  totalParties: number;
  signedCount: number;
  parties: SignatureParty[];
  deadline?: string;
  onSendReminder?: (email: string) => void;
  onResend?: (email: string) => void;
}

const statusIcons = {
  pending: Clock,
  signed: CheckCircle,
  declined: XCircle,
  viewed: FileText,
};

const statusColors = {
  pending: "bg-[hsl(38,92%,50%)] text-white",
  signed: "bg-[hsl(142,71%,45%)] text-white",
  declined: "bg-[hsl(0,84%,60%)] text-white",
  viewed: "bg-[hsl(221,83%,53%)] text-white",
};

export default function SignatureRequest({
  documentName,
  totalParties,
  signedCount,
  parties,
  deadline,
  onSendReminder,
  onResend,
}: SignatureRequestProps) {
  const progress = (signedCount / totalParties) * 100;

  return (
    <Card data-testid="card-signature-request">
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <CardTitle className="text-base" data-testid="text-document-name">{documentName}</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              {signedCount} of {totalParties} signatures completed
            </p>
          </div>
          {deadline && (
            <Badge variant="outline" className="gap-1">
              <Clock className="w-3 h-3" />
              Due {deadline}
            </Badge>
          )}
        </div>
        <Progress value={progress} className="mt-3" />
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {parties.map((party, idx) => {
            const StatusIcon = statusIcons[party.status];
            return (
              <div
                key={idx}
                className="flex items-center justify-between gap-3 p-3 rounded-md bg-muted/50"
                data-testid={`party-item-${idx}`}
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <Avatar className="w-9 h-9">
                    <AvatarImage src={party.avatar} />
                    <AvatarFallback className="text-xs">
                      {party.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{party.name}</p>
                    <p className="text-xs text-muted-foreground truncate">{party.role}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className={statusColors[party.status]} data-testid={`badge-status-${party.status}`}>
                    <StatusIcon className="w-3 h-3 mr-1" />
                    {party.status.charAt(0).toUpperCase() + party.status.slice(1)}
                  </Badge>
                  {party.status === "pending" && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => onSendReminder?.(party.email)}
                      data-testid={`button-remind-${idx}`}
                    >
                      <Send className="w-3 h-3 mr-1" />
                      Remind
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
