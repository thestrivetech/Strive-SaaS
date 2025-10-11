'use client';

import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import { getDocumentDownloadUrl } from '@/lib/modules/workspace/documents';
import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';

export function DownloadButton({ documentId }: { documentId: string }) {
  const { toast } = useToast();
  const [isDownloading, setIsDownloading] = useState(false);

  async function handleDownload() {
    setIsDownloading(true);
    try {
      const result = await getDocumentDownloadUrl(documentId);
      if (result.url) {
        window.open(result.url, '_blank');
      }
    } catch (error) {
      toast({
        title: 'Download failed',
        description: error instanceof Error ? error.message : 'Failed to download document',
        variant: 'destructive',
      });
    } finally {
      setIsDownloading(false);
    }
  }

  return (
    <Button variant="ghost" size="sm" onClick={handleDownload} disabled={isDownloading}>
      <Download className="h-4 w-4" />
    </Button>
  );
}
