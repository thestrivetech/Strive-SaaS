'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { LeadActionsMenu } from './lead-actions-menu';
import { LeadScoreBadge } from './lead-score-badge';
import { LeadFormDialog } from './lead-form-dialog';
import { formatDistanceToNow } from 'date-fns';
import type { leads, users } from '@prisma/client';

type LeadWithAssignee = leads & {
  assigned_to?: Pick<users, 'id' | 'name' | 'avatar_url'> | null;
};

interface LeadCardProps {
  lead: LeadWithAssignee;
  organizationId: string;
  onUpdate?: () => void;
}

export function LeadCard({ lead, organizationId, onUpdate }: LeadCardProps) {
  const [showEditDialog, setShowEditDialog] = useState(false);

  const initials = lead.name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .substring(0, 2);

  return (
    <>
      <Card className="hover:shadow-md transition-shadow">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-3">
            <Link href={`/crm/leads/${lead.id}`} className="flex items-center gap-3 flex-1 min-w-0">
              <Avatar>
                <AvatarImage src={lead.assigned_to?.avatar_url || undefined} />
                <AvatarFallback>{initials}</AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold truncate hover:text-primary transition-colors">
                  {lead.name}
                </h3>
                <p className="text-sm text-muted-foreground truncate">
                  {lead.company || lead.email || 'No company'}
                </p>
              </div>
            </Link>
            <LeadActionsMenu
              lead={lead}
              onEdit={() => setShowEditDialog(true)}
              onUpdate={onUpdate}
            />
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center gap-2 flex-wrap">
            <LeadScoreBadge score={lead.score} />
            <Badge variant="outline" className="text-xs">
              {lead.status.replace(/_/g, ' ')}
            </Badge>
          </div>

          <div className="text-sm space-y-1">
            {lead.email && (
              <p className="text-muted-foreground truncate">{lead.email}</p>
            )}
            {lead.phone && (
              <p className="text-muted-foreground">{lead.phone}</p>
            )}
          </div>

          <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t">
            <span>Source: {lead.source.replace(/_/g, ' ')}</span>
            <span>
              {lead.last_contact_at
                ? formatDistanceToNow(new Date(lead.last_contact_at), { addSuffix: true })
                : formatDistanceToNow(new Date(lead.created_at), { addSuffix: true })}
            </span>
          </div>
        </CardContent>
      </Card>

      <LeadFormDialog
        mode="edit"
        lead={lead}
        organizationId={organizationId}
        trigger={<div />}
        onOpenChange={setShowEditDialog}
      />
    </>
  );
}
