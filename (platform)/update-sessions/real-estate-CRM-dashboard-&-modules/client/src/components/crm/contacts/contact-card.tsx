import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Mail, Phone, MessageSquare, Calendar } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface ContactCardProps {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar?: string;
  tags: string[];
  lastContact: Date;
  dealValue?: string;
}

export function ContactCard({
  name,
  email,
  phone,
  avatar,
  tags,
  lastContact,
  dealValue,
}: ContactCardProps) {
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();

  return (
    <Card className="hover-elevate" data-testid="card-contact">
      <CardContent className="p-4">
        <div className="flex items-start gap-3 mb-3">
          <Avatar className="h-12 w-12">
            <AvatarImage src={avatar} />
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold truncate" data-testid="text-contact-name">{name}</h3>
            <p className="text-sm text-muted-foreground truncate">{email}</p>
            <p className="text-sm text-muted-foreground">{phone}</p>
          </div>
        </div>
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {tags.map((tag) => (
              <Badge key={tag} variant="secondary" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>
        )}
        <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3">
          <Calendar className="h-3 w-3" />
          <span>Last contact {formatDistanceToNow(lastContact, { addSuffix: true })}</span>
        </div>
        {dealValue && (
          <div className="text-sm font-semibold text-primary mb-3">
            Total Deals: {dealValue}
          </div>
        )}
        <div className="flex gap-2">
          <Button size="sm" variant="outline" className="flex-1" data-testid="button-call-contact">
            <Phone className="h-3 w-3" />
          </Button>
          <Button size="sm" variant="outline" className="flex-1" data-testid="button-email-contact">
            <Mail className="h-3 w-3" />
          </Button>
          <Button size="sm" variant="outline" className="flex-1" data-testid="button-message-contact">
            <MessageSquare className="h-3 w-3" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
