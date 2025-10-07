'use client';

import { useRouter } from 'next/navigation';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Mail, Phone, Building2, Briefcase, Clock } from 'lucide-react';
import { ContactActionsMenu } from './contact-actions-menu';
import type { ContactWithAssignee } from './actions';
import { ContactType, ContactStatus } from './actions';
import { formatDistanceToNow } from 'date-fns';

interface ContactCardProps {
  contact: ContactWithAssignee;
}

// Type badge variants
const typeVariants: Record<ContactType, { label: string; variant: 'default' | 'secondary' | 'outline' }> = {
  PROSPECT: { label: 'Prospect', variant: 'outline' },
  CLIENT: { label: 'Client', variant: 'default' },
  PAST_CLIENT: { label: 'Past Client', variant: 'secondary' },
  PARTNER: { label: 'Partner', variant: 'secondary' },
  VENDOR: { label: 'Vendor', variant: 'secondary' },
};

// Status badge variants
const statusVariants: Record<ContactStatus, { label: string; variant: 'default' | 'destructive' | 'outline' }> = {
  ACTIVE: { label: 'Active', variant: 'default' },
  INACTIVE: { label: 'Inactive', variant: 'outline' },
  DO_NOT_CONTACT: { label: 'Do Not Contact', variant: 'destructive' },
};

export function ContactCard({ contact }: ContactCardProps) {
  const router = useRouter();

  const getInitials = (name: string) => {
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  const handleCardClick = () => {
    router.push(`/crm/contacts/${contact.id}`);
  };

  const typeConfig = typeVariants[contact.type || 'PROSPECT'];
  const statusConfig = statusVariants[contact.status || 'ACTIVE'];

  return (
    <Card
      className="hover:shadow-md transition-shadow cursor-pointer group"
      onClick={handleCardClick}
    >
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="flex items-center space-x-3">
          <Avatar className="h-10 w-10">
            <AvatarFallback>{getInitials(contact.name)}</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-sm truncate group-hover:text-primary transition-colors">
              {contact.name}
            </h3>
            {contact.position && (
              <p className="text-xs text-muted-foreground truncate">{contact.position}</p>
            )}
          </div>
        </div>
        <ContactActionsMenu contact={contact} />
      </CardHeader>

      <CardContent className="space-y-3">
        {/* Type and Status */}
        <div className="flex gap-2">
          <Badge variant={typeConfig.variant}>{typeConfig.label}</Badge>
          <Badge variant={statusConfig.variant}>{statusConfig.label}</Badge>
        </div>

        {/* Company */}
        {contact.company && (
          <div className="flex items-center text-sm text-muted-foreground">
            <Building2 className="h-4 w-4 mr-2 flex-shrink-0" />
            <span className="truncate">{contact.company}</span>
          </div>
        )}

        {/* Email */}
        {contact.email && (
          <div className="flex items-center text-sm text-muted-foreground">
            <Mail className="h-4 w-4 mr-2 flex-shrink-0" />
            <span className="truncate">{contact.email}</span>
          </div>
        )}

        {/* Phone */}
        {contact.phone && (
          <div className="flex items-center text-sm text-muted-foreground">
            <Phone className="h-4 w-4 mr-2 flex-shrink-0" />
            <span className="truncate">{contact.phone}</span>
          </div>
        )}

        {/* Assigned To */}
        {contact.assigned_to && (
          <div className="flex items-center text-sm text-muted-foreground">
            <Briefcase className="h-4 w-4 mr-2 flex-shrink-0" />
            <span className="truncate">Assigned to: {contact.assigned_to.name}</span>
          </div>
        )}

        {/* Last Contact */}
        {contact.last_contact_at && (
          <div className="flex items-center text-xs text-muted-foreground">
            <Clock className="h-3 w-3 mr-2 flex-shrink-0" />
            <span>
              Last contact: {formatDistanceToNow(new Date(contact.last_contact_at), { addSuffix: true })}
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
