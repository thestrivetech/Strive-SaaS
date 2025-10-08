import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar } from 'lucide-react';
import { prisma } from '@/lib/database/prisma';
import { format } from 'date-fns';

/**
 * Content Calendar Component
 *
 * Displays scheduled content items in a calendar-like view
 * Shows upcoming scheduled posts and campaigns
 *
 * @param organizationId - Current organization ID
 */
interface ContentCalendarProps {
  organizationId: string;
}

export async function ContentCalendar({ organizationId }: ContentCalendarProps) {
  // Fetch scheduled content for the next 30 days
  const now = new Date();
  const thirtyDaysFromNow = new Date();
  thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

  const scheduledContent = await prisma.content_items.findMany({
    where: {
      organization_id: organizationId,
      status: 'SCHEDULED',
      scheduled_for: {
        gte: now,
        lte: thirtyDaysFromNow,
      },
    },
    select: {
      id: true,
      title: true,
      type: true,
      scheduled_for: true,
    },
    orderBy: {
      scheduled_for: 'asc',
    },
    take: 10,
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Content Calendar</CardTitle>
        <CardDescription>Upcoming scheduled content</CardDescription>
      </CardHeader>
      <CardContent>
        {scheduledContent.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Calendar className="mx-auto h-12 w-12 mb-2 opacity-50" />
            <p>No scheduled content</p>
            <p className="text-sm mt-1">Schedule content to see it here</p>
          </div>
        ) : (
          <div className="space-y-4">
            {scheduledContent.map((item) => (
              <div
                key={item.id}
                className="flex items-start justify-between p-3 rounded-lg border"
              >
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{item.title}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="outline" className="text-xs">
                      {item.type}
                    </Badge>
                    {item.scheduled_for && (
                      <span className="text-sm text-muted-foreground">
                        {format(new Date(item.scheduled_for), 'MMM d, yyyy h:mm a')}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
