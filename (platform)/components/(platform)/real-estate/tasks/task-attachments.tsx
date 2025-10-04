'use client';

import { useState } from 'react';
import { Loader2, Download, Trash2, FileIcon, ImageIcon, FileText, FileSpreadsheet } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { FileUpload } from '@/components/ui/file-upload';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { uploadAttachment, deleteAttachment, getAttachmentUrl } from '@/lib/modules/attachments';
import { toast } from 'sonner';

interface TaskAttachmentsProps {
  taskId: string;
  projectId: string;
  initialAttachments: Array<{
    id: string;
    file_name: string;
    file_size: number;
    mime_type: string;
    created_at: Date;
    users: {
      id: string;
      name: string | null;
      email: string;
    } | null;
  }>;
}

export function TaskAttachments({
  taskId,
  projectId,
  initialAttachments,
}: TaskAttachmentsProps) {
  const [attachments, setAttachments] = useState(initialAttachments);
  const [isUploading, setIsUploading] = useState(false);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  async function handleUpload(files: File[]) {
    setIsUploading(true);

    for (const file of files) {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('entityType', 'task');
      formData.append('entityId', taskId);

      const result = await uploadAttachment(formData);

      if (result.success && result.data) {
        setAttachments((prev) => [result.data, ...prev]);
        toast.success(`${file.name} uploaded successfully`);
      } else {
        toast.error(result.error || 'Upload failed');
      }
    }

    setIsUploading(false);
  }

  async function handleDownload(attachmentId: string, fileName: string) {
    const result = await getAttachmentUrl(attachmentId);

    if (result.success && result.data) {
      // Create temporary link and trigger download
      const link = document.createElement('a');
      link.href = result.data.url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success('Download started');
    } else {
      toast.error(result.error || 'Download failed');
    }
  }

  async function handleDelete(attachmentId: string, fileName: string) {
    setIsDeleting(attachmentId);

    const result = await deleteAttachment({ attachmentId });

    if (result.success) {
      setAttachments((prev) => prev.filter((a) => a.id !== attachmentId));
      toast.success(`${fileName} deleted`);
    } else {
      toast.error(result.error || 'Delete failed');
    }

    setIsDeleting(null);
  }

  function getFileIcon(mimeType: string) {
    if (mimeType.startsWith('image/')) return <ImageIcon className="h-8 w-8 text-blue-500" />;
    if (mimeType === 'application/pdf') return <FileText className="h-8 w-8 text-red-500" />;
    if (mimeType.includes('word')) return <FileText className="h-8 w-8 text-blue-600" />;
    if (mimeType.includes('sheet') || mimeType.includes('excel'))
      return <FileSpreadsheet className="h-8 w-8 text-green-600" />;
    return <FileIcon className="h-8 w-8 text-gray-500" />;
  }

  function formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${Math.round((bytes / Math.pow(k, i)) * 100) / 100} ${sizes[i]}`;
  }

  function formatDate(date: Date): string {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }).format(new Date(date));
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h3 className="text-lg font-semibold">Attachments</h3>
        <p className="text-sm text-muted-foreground">
          {attachments.length} file{attachments.length !== 1 ? 's' : ''} attached
        </p>
      </div>

      {/* Attachment List */}
      {attachments.length > 0 && (
        <div className="space-y-2">
          {attachments.map((attachment) => (
            <div key={attachment.id} className="flex items-center gap-3 p-3 border rounded-lg">
              {/* File Icon */}
              <div className="flex-shrink-0">
                {getFileIcon(attachment.mime_type)}
              </div>

              {/* File Info */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{attachment.file_name}</p>
                <p className="text-xs text-muted-foreground">
                  {formatFileSize(attachment.file_size)} •
                  Uploaded by {attachment.users?.name || attachment.users?.email || 'Unknown'} •
                  {formatDate(attachment.created_at)}
                </p>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDownload(attachment.id, attachment.file_name)}
                >
                  <Download className="h-4 w-4" />
                </Button>

                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete attachment?</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to delete &quot;{attachment.file_name}&quot;?
                        This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => handleDelete(attachment.id, attachment.file_name)}
                        disabled={isDeleting === attachment.id}
                      >
                        {isDeleting === attachment.id ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Deleting...
                          </>
                        ) : (
                          'Delete'
                        )}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Upload Section */}
      <div>
        <FileUpload
          onFilesSelected={handleUpload}
          maxFiles={5}
          maxSizeMB={10}
          disabled={isUploading}
        />
        {isUploading && (
          <div className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            Uploading files...
          </div>
        )}
      </div>
    </div>
  );
}
