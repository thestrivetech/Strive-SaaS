import { Button } from "@/components/ui/button";
import DocumentCard from "@/components/transaction/document-card";
import { Upload, FolderOpen } from "lucide-react";
import { useDocuments } from "@/lib/hooks/useDocuments";
import { Skeleton } from "@/components/ui/skeleton";

export default function Documents() {
  const { data: documents, isLoading } = useDocuments();

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold" data-testid="text-page-title">Document Library</h1>
          <p className="text-muted-foreground">Manage all transaction documents</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" data-testid="button-folders">
            <FolderOpen className="w-4 h-4 mr-2" />
            Folders
          </Button>
          <Button data-testid="button-upload">
            <Upload className="w-4 h-4 mr-2" />
            Upload
          </Button>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-40" data-testid={`skeleton-document-${i}`} />
          ))
        ) : documents && documents.length > 0 ? (
          documents.map((doc) => {
            const now = Date.now();
            const updated = new Date(doc.updatedAt).getTime();
            const diffMinutes = Math.floor((now - updated) / 60000);
            const diffHours = Math.floor(diffMinutes / 60);
            const diffDays = Math.floor(diffHours / 24);
            
            let lastModified = "";
            if (diffMinutes < 1) lastModified = "just now";
            else if (diffMinutes < 60) lastModified = `${diffMinutes} minute${diffMinutes > 1 ? 's' : ''} ago`;
            else if (diffHours < 24) lastModified = `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
            else lastModified = `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;

            return (
              <DocumentCard
                key={doc.id}
                id={doc.id}
                name={doc.name}
                type={doc.type as any}
                size={doc.size}
                version={doc.version}
                lastModified={lastModified}
                uploadedBy={doc.uploadedBy}
                status={doc.status as any}
                onView={() => console.log('View document:', doc.id)}
                onDownload={() => console.log('Download document:', doc.id)}
                onDelete={() => console.log('Delete document:', doc.id)}
              />
            );
          })
        ) : (
          <div className="col-span-2 text-center py-12 text-muted-foreground">
            No documents found
          </div>
        )}
      </div>
    </div>
  );
}
