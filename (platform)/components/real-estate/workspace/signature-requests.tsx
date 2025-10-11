import { getSignatureRequestsByLoop } from '@/lib/modules/workspace/signatures';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { FileSignature, Plus } from 'lucide-react';
import { CreateSignatureDialog } from './create-signature-dialog';

interface SignatureRequestsProps {
  loopId: string;
}

const statusColors: Record<string, string> = {
  PENDING: 'bg-gray-500',
  SENT: 'bg-blue-500',
  VIEWED: 'bg-yellow-500',
  SIGNED: 'bg-green-500',
  DECLINED: 'bg-red-500',
  EXPIRED: 'bg-gray-400',
};

export async function SignatureRequests({ loopId }: SignatureRequestsProps) {
  const result = await getSignatureRequestsByLoop(loopId, { page: 1, limit: 50 });
  const requests = result.data;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Signature Requests</h3>
        <CreateSignatureDialog loopId={loopId} />
      </div>

      {requests.length === 0 ? (
        <div className="text-center py-8 border rounded-lg">
          <FileSignature className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
          <p className="text-muted-foreground">No signature requests yet.</p>
          <p className="text-sm text-muted-foreground mt-1">
            Create a signature request to get documents signed.
          </p>
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Signing Order</TableHead>
              <TableHead>Signatures</TableHead>
              <TableHead>Created</TableHead>
              <TableHead>Expires</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {requests.map((request) => (
              <TableRow key={request.id}>
                <TableCell className="font-medium">{request.title}</TableCell>
                <TableCell>
                  <Badge className={statusColors[request.status] || 'bg-gray-500'}>
                    {request.status}
                  </Badge>
                </TableCell>
                <TableCell className="capitalize">
                  {request.signing_order.toLowerCase()}
                </TableCell>
                <TableCell>
                  {request.signatureStats?.SIGNED || 0} / {request._count?.signatures || 0}
                </TableCell>
                <TableCell>
                  {new Date(request.created_at).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  {request.expires_at
                    ? new Date(request.expires_at).toLocaleDateString()
                    : 'No expiry'}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
