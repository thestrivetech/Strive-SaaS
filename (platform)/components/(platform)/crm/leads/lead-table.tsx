'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { LeadScoreBadge } from './lead-score-badge';
import { LeadActionsMenu } from './lead-actions-menu';
import { LeadFormDialog } from './lead-form-dialog';
import { formatDistanceToNow } from 'date-fns';
import type { leads, users } from '@prisma/client';

type LeadWithAssignee = leads & {
  assigned_to?: Pick<users, 'id' | 'name' | 'avatar_url'> | null;
};

interface LeadTableProps {
  leads: LeadWithAssignee[];
  organizationId: string;
  onUpdate?: () => void;
}

export function LeadTable({ leads, organizationId, onUpdate }: LeadTableProps) {
  const [editingLead, setEditingLead] = useState<LeadWithAssignee | null>(null);

  if (leads.length === 0) {
    return (
      <div className="border rounded-lg p-12 text-center">
        <p className="text-muted-foreground">No leads found.</p>
        <p className="text-sm text-muted-foreground mt-1">
          Create your first lead to get started.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Company</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Score</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Source</TableHead>
              <TableHead>Last Contact</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {leads.map((lead) => {
              const initials = lead.name
                .split(' ')
                .map((n) => n[0])
                .join('')
                .toUpperCase()
                .substring(0, 2);

              return (
                <TableRow key={lead.id} className="hover:bg-muted/50">
                  <TableCell>
                    <Link
                      href={`/crm/leads/${lead.id}`}
                      className="flex items-center gap-3 hover:text-primary transition-colors"
                    >
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={lead.assigned_to?.avatar_url || undefined} />
                        <AvatarFallback className="text-xs">{initials}</AvatarFallback>
                      </Avatar>
                      <span className="font-medium">{lead.name}</span>
                    </Link>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {lead.company || '—'}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {lead.email || '—'}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {lead.phone || '—'}
                  </TableCell>
                  <TableCell>
                    <LeadScoreBadge score={lead.score} />
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-xs">
                      {lead.status.replace(/_/g, ' ')}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {lead.source.replace(/_/g, ' ')}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {lead.last_contact_at
                      ? formatDistanceToNow(new Date(lead.last_contact_at), { addSuffix: true })
                      : formatDistanceToNow(new Date(lead.created_at), { addSuffix: true })}
                  </TableCell>
                  <TableCell>
                    <LeadActionsMenu
                      lead={lead}
                      onEdit={() => setEditingLead(lead)}
                      onUpdate={onUpdate}
                    />
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      {editingLead && (
        <LeadFormDialog
          mode="edit"
          lead={editingLead}
          organizationId={organizationId}
          trigger={<div />}
          onOpenChange={(open) => !open && setEditingLead(null)}
        />
      )}
    </>
  );
}
