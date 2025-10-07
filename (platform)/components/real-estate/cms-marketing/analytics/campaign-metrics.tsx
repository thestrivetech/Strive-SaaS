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
import { Badge } from '@/components/ui/badge';

interface Campaign {
  id: string;
  name: string;
  type: string;
  status: string;
  impressions: number;
  clicks: number;
  conversions: number;
  spend: number | string | { toNumber: () => number };
  revenue: number | string | { toNumber: () => number };
}

interface CampaignMetricsProps {
  data: Campaign[];
}

export function CampaignMetrics({ data }: CampaignMetricsProps) {
  if (data.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-center text-muted-foreground">No campaign data available</p>
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
                <TableHead>Campaign</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Impressions</TableHead>
                <TableHead className="text-right">Clicks</TableHead>
                <TableHead className="text-right">CTR</TableHead>
                <TableHead className="text-right">Conversions</TableHead>
                <TableHead className="text-right">Spend</TableHead>
                <TableHead className="text-right">Revenue</TableHead>
                <TableHead className="text-right">ROI</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((campaign) => {
                const ctr =
                  campaign.impressions > 0
                    ? ((campaign.clicks / campaign.impressions) * 100).toFixed(2)
                    : '0.00';
                const spend = Number(campaign.spend);
                const revenue = Number(campaign.revenue);
                const roi = spend > 0 ? (((revenue - spend) / spend) * 100).toFixed(2) : '0.00';
                const isPositiveROI = Number(roi) > 0;

                return (
                  <TableRow key={campaign.id}>
                    <TableCell className="font-medium max-w-xs truncate">
                      {campaign.name}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{campaign.type}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          campaign.status === 'ACTIVE'
                            ? 'default'
                            : campaign.status === 'COMPLETED'
                              ? 'secondary'
                              : 'outline'
                        }
                      >
                        {campaign.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      {campaign.impressions.toLocaleString()}
                    </TableCell>
                    <TableCell className="text-right">{campaign.clicks.toLocaleString()}</TableCell>
                    <TableCell className="text-right">{ctr}%</TableCell>
                    <TableCell className="text-right">
                      {campaign.conversions.toLocaleString()}
                    </TableCell>
                    <TableCell className="text-right">${spend.toFixed(2)}</TableCell>
                    <TableCell className="text-right">${revenue.toFixed(2)}</TableCell>
                    <TableCell className="text-right">
                      <span className={isPositiveROI ? 'text-green-600' : 'text-red-600'}>
                        {isPositiveROI ? '+' : ''}
                        {roi}%
                      </span>
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
