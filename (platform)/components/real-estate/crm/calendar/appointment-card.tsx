'use client';

import { format } from 'date-fns';
import { Calendar, Clock, MapPin, Phone, Video, User } from 'lucide-react';
import type { appointments } from '@prisma/client';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import {
  getAppointmentTypeColor,
  getAppointmentStatusColor,
  formatTimeRange,
} from '@/lib/modules/appointments';
import { cn } from '@/lib/utils';

interface AppointmentCardProps {
  appointment: appointments & {
    users?: { id: string; name: string | null; avatar_url: string | null } | null;
    lead?: { id: string; name: string } | null;
    contact?: { id: string; name: string } | null;
    deal?: { id: string; title: string } | null;
    listing?: { id: string; title: string; address: string } | null;
  };
  variant?: 'default' | 'compact';
  onEdit?: () => void;
  onStatusChange?: (status: string) => void;
}

export function AppointmentCard({
  appointment,
  variant = 'default',
  onEdit,
  onStatusChange,
}: AppointmentCardProps) {
  const typeColor = getAppointmentTypeColor(appointment.type);
  const statusColor = getAppointmentStatusColor(appointment.status);

  const startTime = new Date(appointment.start_time);
  const endTime = new Date(appointment.end_time);

  if (variant === 'compact') {
    return (
      <div
        className={cn(
          'p-2 rounded-md border-l-4 cursor-pointer hover:bg-accent/50 transition-colors',
          `border-l-${typeColor}-500`
        )}
        onClick={onEdit}
      >
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{appointment.title}</p>
            <p className="text-xs text-muted-foreground">
              {formatTimeRange(startTime, endTime)}
            </p>
          </div>
          <Badge variant="outline" className="text-xs">
            {appointment.type.replace('_', ' ')}
          </Badge>
        </div>
      </div>
    );
  }

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <h3 className="font-semibold text-base">{appointment.title}</h3>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="h-3 w-3" />
              <span>{formatTimeRange(startTime, endTime)}</span>
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <Badge variant="outline" className={cn(`bg-${typeColor}-50 border-${typeColor}-200`)}>
              {appointment.type.replace('_', ' ')}
            </Badge>
            <Badge variant="outline" className={cn(`bg-${statusColor}-50 border-${statusColor}-200`)}>
              {appointment.status}
            </Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {appointment.description && (
          <p className="text-sm text-muted-foreground line-clamp-2">{appointment.description}</p>
        )}

        <div className="space-y-2">
          {appointment.location && (
            <div className="flex items-center gap-2 text-sm">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <span className="truncate">{appointment.location}</span>
            </div>
          )}

          {appointment.meeting_url && (
            <div className="flex items-center gap-2 text-sm">
              <Video className="h-4 w-4 text-muted-foreground" />
              <a
                href={appointment.meeting_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline truncate"
              >
                Join meeting
              </a>
            </div>
          )}

          {appointment.users && (
            <div className="flex items-center gap-2 text-sm">
              <User className="h-4 w-4 text-muted-foreground" />
              <span>{appointment.users.name || 'Unassigned'}</span>
            </div>
          )}

          {/* CRM Relations */}
          {(appointment.lead || appointment.contact || appointment.deal || appointment.listing) && (
            <div className="pt-2 mt-2 border-t space-y-1">
              {appointment.lead && (
                <div className="text-xs text-muted-foreground">
                  Lead: <span className="text-foreground">{appointment.lead.name}</span>
                </div>
              )}
              {appointment.contact && (
                <div className="text-xs text-muted-foreground">
                  Contact: <span className="text-foreground">{appointment.contact.name}</span>
                </div>
              )}
              {appointment.deal && (
                <div className="text-xs text-muted-foreground">
                  Deal: <span className="text-foreground">{appointment.deal.title}</span>
                </div>
              )}
              {appointment.listing && (
                <div className="text-xs text-muted-foreground">
                  Listing: <span className="text-foreground">{appointment.listing.title}</span>
                </div>
              )}
            </div>
          )}
        </div>

        {(onEdit || onStatusChange) && (
          <div className="flex items-center gap-2 pt-2">
            {onEdit && (
              <Button size="sm" variant="outline" onClick={onEdit}>
                Edit
              </Button>
            )}
            {onStatusChange && appointment.status === 'SCHEDULED' && (
              <Button size="sm" variant="default" onClick={() => onStatusChange('COMPLETED')}>
                Mark Complete
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
