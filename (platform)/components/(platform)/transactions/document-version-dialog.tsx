'use client';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { History } from 'lucide-react';

export function DocumentVersionDialog({ documentId }: { documentId: string }) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm">
          <History className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Version History</DialogTitle>
          <DialogDescription>
            View and manage document versions
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <p className="text-sm text-muted-foreground">Version history will be displayed here.</p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
