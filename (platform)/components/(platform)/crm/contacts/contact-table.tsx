'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { ContactActionsMenu } from './contact-actions-menu';
import { ContactFormDialog } from './contact-form-dialog';
import type { ContactWithAssignee, ContactType, ContactStatus } from '@/lib/modules/contacts';
import { formatDistanceToNow } from 'date-fns';

interface ContactTableProps {
  contacts: ContactWithAssignee[];
  organizationId: string;
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

export function ContactTable({ contacts, organizationId }: ContactTableProps) {
  const router = useRouter();
  const [editingContact, setEditingContact] = useState<ContactWithAssignee | null>(null);

  const getInitials = (name: string) => {
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  const handleRowClick = (contactId: string) => {
    router.push(`/crm/contacts/${contactId}`);
  };

  if (contacts.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <p>No contacts found. Create your first contact to get started.</p>
      </div>
    );
  }

  return (
    <>
      <div className="rounded-md border overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[250px]">Name</TableHead>
              <TableHead>Company</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Last Contact</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {contacts.map((contact) => {
              const typeConfig = typeVariants[contact.type || 'PROSPECT'];
              const statusConfig = statusVariants[contact.status || 'ACTIVE'];

              return (
                <TableRow
                  key={contact.id}
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => handleRowClick(contact.id)}
                >
                  <TableCell>
                    <div className="flex items-center space-x-3">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback>{getInitials(contact.name)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">{contact.name}</div>
                        {contact.position && (
                          <div className="text-xs text-muted-foreground">{contact.position}</div>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{contact.company || '-'}</TableCell>
                  <TableCell className="max-w-[200px] truncate">{contact.email || '-'}</TableCell>
                  <TableCell>{contact.phone || '-'}</TableCell>
                  <TableCell>
                    <Badge variant={typeConfig.variant}>{typeConfig.label}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={statusConfig.variant}>{statusConfig.label}</Badge>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {contact.last_contact_at
                      ? formatDistanceToNow(new Date(contact.last_contact_at), { addSuffix: true })
                      : 'Never'}
                  </TableCell>
                  <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                    <ContactActionsMenu contact={contact} onEdit={() => setEditingContact(contact)} />
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      {/* Edit Dialog */}
      {editingContact && (
        <ContactFormDialog
          mode="edit"
          contact={editingContact}
          organizationId={organizationId}
          onOpenChange={(open) => !open && setEditingContact(null)}
        />
      )}
    </>
  );
}
