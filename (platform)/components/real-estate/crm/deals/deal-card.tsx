'use client';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { formatCurrency, getInitials } from '@/lib/utils';
import { Users, User } from 'lucide-react';
import Link from 'next/link';
import type { DealWithAssignee } from '@/lib/modules/crm/deals';

interface DealCardProps {
  deal: DealWithAssignee;
  isDragging?: boolean;
}

export function DealCard({ deal, isDragging = false }: DealCardProps) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({
    id: deal.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <Card
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="cursor-grab active:cursor-grabbing hover:shadow-md transition-shadow"
    >
      <CardContent className="p-3 space-y-2">
        <Link href={`/crm/deals/${deal.id}`} className="block">
          <div className="flex items-start justify-between gap-2">
            <h4 className="font-medium text-sm line-clamp-2 flex-1">{deal.title}</h4>
            {deal.assigned_to && (
              <Avatar className="h-6 w-6 flex-shrink-0">
                <AvatarImage src={deal.assigned_to.avatar_url || undefined} />
                <AvatarFallback className="text-xs">
                  {getInitials(deal.assigned_to.name || '')}
                </AvatarFallback>
              </Avatar>
            )}
          </div>

          <div className="flex items-center justify-between mt-2">
            <p className="text-lg font-bold text-green-600">
              {formatCurrency(Number(deal.value))}
            </p>
            <span className="text-xs text-muted-foreground">
              {deal.probability}%
            </span>
          </div>

          {/* Contact/Lead association */}
          <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
            {(deal as any).contact && (
              <div className="flex items-center gap-1">
                <User className="h-3 w-3" />
                <span className="truncate">{(deal as any).contact.name}</span>
              </div>
            )}
            {(deal as any).lead && !( deal as any).contact && (
              <div className="flex items-center gap-1">
                <Users className="h-3 w-3" />
                <span className="truncate">{(deal as any).lead.name}</span>
              </div>
            )}
          </div>
        </Link>
      </CardContent>
    </Card>
  );
}
