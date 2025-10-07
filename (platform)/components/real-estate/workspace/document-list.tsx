import { getDocumentsByLoop } from '@/lib/modules/transactions/documents';
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
import { Download, FileText, History } from 'lucide-react';
import { DocumentUpload } from './document-upload';
import { DownloadButton } from './download-button';

interface DocumentListProps {
  loopId: string;
}

const statusColors: Record<string, string> = {
  DRAFT: 'bg-gray-500',
  PENDING: 'bg-yellow-500',
  REVIEWED: 'bg-blue-500',
  SIGNED: 'bg-green-500',
  ARCHIVED: 'bg-gray-400',
};

export async function DocumentList({ loopId }: DocumentListProps) {
  const result = await getDocumentsByLoop({ loopId }, { page: 1, limit: 100 });
  const documents = result.data;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Documents</h3>
        <DocumentUpload loopId={loopId} />
      </div>

      {documents.length === 0 ? (
        <div className="text-center py-8 border rounded-lg">
          <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
          <p className="text-muted-foreground">No documents uploaded yet.</p>
          <p className="text-sm text-muted-foreground mt-1">
            Upload your first document to get started.
          </p>
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Uploaded</TableHead>
              <TableHead>Size</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {documents.map((doc) => (
              <TableRow key={doc.id}>
                <TableCell className="font-medium">{doc.original_name}</TableCell>
                <TableCell className="capitalize">{doc.category?.toLowerCase() || 'Other'}</TableCell>
                <TableCell>
                  <Badge className={statusColors[doc.status] || 'bg-gray-500'}>
                    {doc.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  {new Date(doc.created_at).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  {doc.file_size ? `${(doc.file_size / 1024).toFixed(1)} KB` : 'N/A'}
                </TableCell>
                <TableCell className="text-right space-x-2">
                  <DownloadButton documentId={doc.id} />
                  <Button variant="ghost" size="sm">
                    <History className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
