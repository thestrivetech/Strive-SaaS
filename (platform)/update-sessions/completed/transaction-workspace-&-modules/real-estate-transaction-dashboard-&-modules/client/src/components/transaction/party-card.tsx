import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Mail, Phone, MoreVertical, UserMinus } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

export interface PartyCardProps {
  name: string;
  role: string;
  email: string;
  phone?: string;
  avatar?: string;
  permissions: string[];
  onEmail?: () => void;
  onCall?: () => void;
  onRemove?: () => void;
  onEditPermissions?: () => void;
}

const roleColors: Record<string, string> = {
  Buyer: "bg-[hsl(221,83%,53%)] text-white",
  Seller: "bg-[hsl(262,83%,58%)] text-white",
  "Listing Agent": "bg-[hsl(142,71%,45%)] text-white",
  "Buyer's Agent": "bg-[hsl(199,89%,48%)] text-white",
  Lender: "bg-[hsl(38,92%,50%)] text-white",
  "Title Company": "bg-[hsl(220,13%,69%)] text-white",
  Inspector: "bg-[hsl(220,13%,69%)] text-white",
};

export default function PartyCard({
  name,
  role,
  email,
  phone,
  avatar,
  permissions,
  onEmail,
  onCall,
  onRemove,
  onEditPermissions,
}: PartyCardProps) {
  const roleColor = roleColors[role] || "bg-muted text-muted-foreground";

  return (
    <Card className="p-4" data-testid={`card-party-${name}`}>
      <div className="flex items-start gap-3">
        <Avatar className="w-12 h-12">
          <AvatarImage src={avatar} />
          <AvatarFallback>{name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <h4 className="font-semibold text-sm" data-testid="text-party-name">{name}</h4>
              <Badge className={`${roleColor} mt-1`} data-testid="badge-role">{role}</Badge>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button size="icon" variant="ghost" className="h-8 w-8" data-testid="button-party-menu">
                  <MoreVertical className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={onEditPermissions} data-testid="button-edit-permissions">
                  Edit Permissions
                </DropdownMenuItem>
                <DropdownMenuItem onClick={onRemove} className="text-destructive" data-testid="button-remove-party">
                  <UserMinus className="w-4 h-4 mr-2" />
                  Remove from Loop
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <div className="space-y-2 mt-3">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Mail className="w-3.5 h-3.5" />
              <span className="truncate" data-testid="text-email">{email}</span>
            </div>
            {phone && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Phone className="w-3.5 h-3.5" />
                <span data-testid="text-phone">{phone}</span>
              </div>
            )}
          </div>
          <div className="flex gap-2 mt-3">
            <Button size="sm" variant="outline" onClick={onEmail} data-testid="button-email">
              <Mail className="w-3.5 h-3.5 mr-1" />
              Email
            </Button>
            {phone && (
              <Button size="sm" variant="outline" onClick={onCall} data-testid="button-call">
                <Phone className="w-3.5 h-3.5 mr-1" />
                Call
              </Button>
            )}
          </div>
          <div className="mt-3 pt-3 border-t">
            <p className="text-xs text-muted-foreground mb-1.5">Permissions</p>
            <div className="flex flex-wrap gap-1">
              {permissions.map((permission, idx) => (
                <Badge key={idx} variant="outline" className="text-xs">
                  {permission}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
