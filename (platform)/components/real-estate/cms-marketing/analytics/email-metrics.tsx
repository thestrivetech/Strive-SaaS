'use client';

import { Card, CardContent } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface EmailCampaign {
  id: string;
  subject: string;
  sent: number;
  delivered: number;
  opened: number;
  clicked: number;
  bounced: number;
  unsubscribed: number;
  sent_at: Date | null;
}

interface EmailMetricsProps {
  data: EmailCampaign[];
}

export function EmailMetrics({ data }: EmailMetricsProps) {
  if (data.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-center text-muted-foreground">No email campaign data available</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Subject</TableHead>
                <TableHead className="text-right">Sent</TableHead>
                <TableHead className="text-right">Delivered</TableHead>
                <TableHead className="text-right">Delivery Rate</TableHead>
                <TableHead className="text-right">Opened</TableHead>
                <TableHead className="text-right">Open Rate</TableHead>
                <TableHead className="text-right">Clicked</TableHead>
                <TableHead className="text-right">Click Rate</TableHead>
                <TableHead className="text-right">Bounced</TableHead>
                <TableHead>Sent Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((email) => {
                const deliveryRate =
                  email.sent > 0 ? ((email.delivered / email.sent) * 100).toFixed(2) : '0.00';
                const openRate =
                  email.delivered > 0 ? ((email.opened / email.delivered) * 100).toFixed(2) : '0.00';
                const clickRate =
                  email.delivered > 0
                    ? ((email.clicked / email.delivered) * 100).toFixed(2)
                    : '0.00';

                return (
                  <TableRow key={email.id}>
                    <TableCell className="font-medium max-w-xs truncate">{email.subject}</TableCell>
                    <TableCell className="text-right">{email.sent.toLocaleString()}</TableCell>
                    <TableCell className="text-right">{email.delivered.toLocaleString()}</TableCell>
                    <TableCell className="text-right">{deliveryRate}%</TableCell>
                    <TableCell className="text-right">{email.opened.toLocaleString()}</TableCell>
                    <TableCell className="text-right">
                      <span
                        className={
                          Number(openRate) > 20
                            ? 'text-green-600'
                            : Number(openRate) > 10
                              ? 'text-yellow-600'
                              : 'text-red-600'
                        }
                      >
                        {openRate}%
                      </span>
                    </TableCell>
                    <TableCell className="text-right">{email.clicked.toLocaleString()}</TableCell>
                    <TableCell className="text-right">
                      <span
                        className={
                          Number(clickRate) > 3
                            ? 'text-green-600'
                            : Number(clickRate) > 1
                              ? 'text-yellow-600'
                              : 'text-red-600'
                        }
                      >
                        {clickRate}%
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <span className={email.bounced > 0 ? 'text-red-600' : ''}>
                        {email.bounced.toLocaleString()}
                      </span>
                    </TableCell>
                    <TableCell>
                      {email.sent_at ? new Date(email.sent_at).toLocaleDateString() : 'N/A'}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
