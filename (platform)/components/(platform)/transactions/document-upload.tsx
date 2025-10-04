'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { uploadDocument } from '@/lib/modules/documents';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { Upload } from 'lucide-react';

interface DocumentUploadProps {
  loopId: string;
}

export function DocumentUpload({ loopId }: DocumentUploadProps) {
  const [open, setOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [category, setCategory] = useState('contract');
  const [description, setDescription] = useState('');
  const { toast } = useToast();
  const router = useRouter();

  async function handleUpload(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setUploading(true);

    const formData = new FormData(e.currentTarget);
    formData.append('loopId', loopId);
    formData.append('category', category);
    if (description) {
      formData.append('description', description);
    }

    try {
      await uploadDocument(formData);
      toast({
        title: 'Document uploaded',
        description: 'The document has been uploaded successfully.',
      });
      setOpen(false);
      setCategory('contract');
      setDescription('');
      router.refresh();
    } catch (error) {
      toast({
        title: 'Upload failed',
        description: error instanceof Error ? error.message : 'Failed to upload document',
        variant: 'destructive',
      });
    } finally {
      setUploading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Upload className="h-4 w-4 mr-2" />
          Upload Document
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Upload Document</DialogTitle>
          <DialogDescription>
            Upload a document for this transaction
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleUpload} className="space-y-4">
          <div>
            <Label htmlFor="file">Select File *</Label>
            <Input
              id="file"
              name="file"
              type="file"
              accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
              required
              className="mt-1"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Supported: PDF, DOC, DOCX, JPG, PNG (Max 10MB)
            </p>
          </div>

          <div>
            <Label htmlFor="category">Category *</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger id="category" className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="contract">Contract</SelectItem>
                <SelectItem value="disclosure">Disclosure</SelectItem>
                <SelectItem value="inspection">Inspection</SelectItem>
                <SelectItem value="appraisal">Appraisal</SelectItem>
                <SelectItem value="title">Title</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Optional description..."
              rows={3}
              className="mt-1"
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={uploading}>
              Cancel
            </Button>
            <Button type="submit" disabled={uploading}>
              {uploading ? 'Uploading...' : 'Upload'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
