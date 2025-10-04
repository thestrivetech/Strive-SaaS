import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import type { transaction_loops } from '@prisma/client';
import { Building2, Calendar, DollarSign, FileText } from 'lucide-react';

interface LoopOverviewProps {
  loop: transaction_loops & { [key: string]: any };
}

export function LoopOverview({ loop }: LoopOverviewProps) {
  const formattedPrice = loop.listing_price
    ? `$${Number(loop.listing_price).toLocaleString()}`
    : 'N/A';

  const formattedType = loop.transaction_type.replace(/_/g, ' ');
  const expectedClosing = loop.expected_closing
    ? new Date(loop.expected_closing).toLocaleDateString()
    : 'Not set';

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Transaction Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-3">
            <Building2 className="h-5 w-5 text-muted-foreground" />
            <div>
              <p className="text-sm text-muted-foreground">Type</p>
              <p className="font-medium">{formattedType}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <DollarSign className="h-5 w-5 text-muted-foreground" />
            <div>
              <p className="text-sm text-muted-foreground">Listing Price</p>
              <p className="font-medium">{formattedPrice}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Calendar className="h-5 w-5 text-muted-foreground" />
            <div>
              <p className="text-sm text-muted-foreground">Expected Closing</p>
              <p className="font-medium">{expectedClosing}</p>
            </div>
          </div>

          {loop.description && (
            <div className="flex items-start gap-3">
              <FileText className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-sm text-muted-foreground">Description</p>
                <p className="text-sm mt-1">{loop.description}</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Progress</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <div className="flex justify-between mb-2">
              <span className="text-sm text-muted-foreground">Completion</span>
              <span className="text-sm font-medium">{loop.progress}%</span>
            </div>
            <Progress value={loop.progress} className="h-3" />
          </div>

          <div className="grid grid-cols-2 gap-4 mt-6">
            <div>
              <p className="text-sm text-muted-foreground">Documents</p>
              <p className="text-2xl font-bold">{loop.documents?.length || 0}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Parties</p>
              <p className="text-2xl font-bold">{loop.parties?.length || 0}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Tasks</p>
              <p className="text-2xl font-bold">{loop.tasks?.length || 0}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Created</p>
              <p className="text-sm font-medium">
                {new Date(loop.created_at).toLocaleDateString()}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
