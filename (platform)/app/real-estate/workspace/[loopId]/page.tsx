import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { getLoopById } from '@/lib/modules/transactions';
import { LoopOverview } from '@/components/real-estate/workspace/loop-overview';
import { DocumentList } from '@/components/real-estate/workspace/document-list';
import { PartyList } from '@/components/real-estate/workspace/party-list';
import { TaskChecklist } from '@/components/real-estate/workspace/task-checklist';
import { SignatureRequests } from '@/components/real-estate/workspace/signature-requests';
import { notFound } from 'next/navigation';

const statusColors = {
  DRAFT: 'bg-gray-500',
  ACTIVE: 'bg-blue-500',
  UNDER_CONTRACT: 'bg-yellow-500',
  CLOSING: 'bg-orange-500',
  CLOSED: 'bg-green-500',
  CANCELLED: 'bg-red-500',
  ARCHIVED: 'bg-gray-400',
};

export default async function LoopDetailPage({
  params,
}: {
  params: Promise<{ loopId: string }>;
}) {
  const { loopId } = await params;

  let loop;
  try {
    loop = await getLoopById(loopId);
  } catch (error) {
    notFound();
  }

  const documentCount = loop.documents?.length || 0;
  const partyCount = loop.parties?.length || 0;
  const taskCount = 0; // Tasks will be fetched separately

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6 space-y-2">
        <div className="flex items-center gap-3">
          <h1 className="text-3xl font-bold">{loop.property_address}</h1>
          <Badge className={statusColors[loop.status]}>
            {loop.status.replace('_', ' ')}
          </Badge>
        </div>
        <p className="text-muted-foreground">
          {loop.transaction_type.replace('_', ' ')} - ${loop.listing_price?.toLocaleString() || '0'}
        </p>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="documents">
            Documents ({documentCount})
          </TabsTrigger>
          <TabsTrigger value="parties">
            Parties ({partyCount})
          </TabsTrigger>
          <TabsTrigger value="tasks">
            Tasks ({taskCount})
          </TabsTrigger>
          <TabsTrigger value="signatures">Signatures</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <LoopOverview loop={loop} />
        </TabsContent>

        <TabsContent value="documents">
          <DocumentList loopId={loop.id} />
        </TabsContent>

        <TabsContent value="parties">
          <PartyList loopId={loop.id} />
        </TabsContent>

        <TabsContent value="tasks">
          <TaskChecklist loopId={loop.id} />
        </TabsContent>

        <TabsContent value="signatures">
          <SignatureRequests loopId={loop.id} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
