/**
 * Media Upload Zone Component
 *
 * Drag-and-drop file upload zone with visual feedback,
 * file type validation, and upload progress.
 *
 * Session 3: Media Library - Upload & Management
 */

'use client';

import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Card } from '@/components/ui/card';
import { Upload, Loader2, FileWarning } from 'lucide-react';
import { uploadMediaAsset } from '@/lib/modules/content/media';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';

interface MediaUploadZoneProps {
  folderId?: string | null;
  onUpload?: () => void;
  maxFiles?: number;
  compact?: boolean;
}

export function MediaUploadZone({
  folderId,
  onUpload,
  maxFiles,
  compact = false,
}: MediaUploadZoneProps) {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<string>('');
  const { toast } = useToast();
  const router = useRouter();

  const onDrop = useCallback(
    async (acceptedFiles: File[], rejectedFiles: any[]) => {
      // Handle rejected files
      if (rejectedFiles.length > 0) {
        const errors = rejectedFiles.map((file) => {
          const error = file.errors[0];
          if (error.code === 'file-too-large') {
            return `${file.file.name}: File too large (max 50MB)`;
          }
          if (error.code === 'file-invalid-type') {
            return `${file.file.name}: Invalid file type`;
          }
          return `${file.file.name}: ${error.message}`;
        });

        toast({
          title: 'Upload failed',
          description: errors.join('\n'),
          variant: 'destructive',
        });
        return;
      }

      if (acceptedFiles.length === 0) {
        return;
      }

      setUploading(true);
      let successCount = 0;
      let failedCount = 0;

      try {
        for (let i = 0; i < acceptedFiles.length; i++) {
          const file = acceptedFiles[i];
          setUploadProgress(`Uploading ${i + 1} of ${acceptedFiles.length}...`);

          try {
            const formData = new FormData();
            formData.append('file', file);
            if (folderId) formData.append('folderId', folderId);

            await uploadMediaAsset(formData);
            successCount++;
          } catch (error) {
            console.error(`Failed to upload ${file.name}:`, error);
            failedCount++;
          }
        }

        if (successCount > 0) {
          toast({
            title: 'Upload successful',
            description: `${successCount} file(s) uploaded successfully`,
          });
          router.refresh();
          onUpload?.();
        }

        if (failedCount > 0) {
          toast({
            title: 'Some uploads failed',
            description: `${failedCount} file(s) failed to upload`,
            variant: 'destructive',
          });
        }
      } catch (error) {
        toast({
          title: 'Upload failed',
          description: error instanceof Error ? error.message : 'An error occurred',
          variant: 'destructive',
        });
      } finally {
        setUploading(false);
        setUploadProgress('');
      }
    },
    [folderId, onUpload, toast, router]
  );

  const { getRootProps, getInputProps, isDragActive, isDragReject } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.webp', '.svg'],
      'video/*': ['.mp4', '.webm', '.ogg'],
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': [
        '.docx',
      ],
    },
    maxSize: 50 * 1024 * 1024, // 50MB
    maxFiles: maxFiles,
    disabled: uploading,
  });

  return (
    <Card
      {...getRootProps()}
      className={`
        ${compact ? 'p-4' : 'p-8'} border-2 border-dashed transition-colors cursor-pointer
        ${isDragActive && !isDragReject ? 'border-primary bg-primary/5' : ''}
        ${isDragReject ? 'border-destructive bg-destructive/5' : ''}
        ${!isDragActive && !isDragReject ? 'border-muted-foreground/25 hover:border-muted-foreground/50' : ''}
        ${uploading ? 'opacity-50 pointer-events-none' : ''}
      `}
    >
      <input {...getInputProps()} />
      <div className={`flex flex-col items-center gap-2 text-center`}>
        {uploading ? (
          <>
            <Loader2 className={`${compact ? 'h-8 w-8' : 'h-12 w-12'} animate-spin text-muted-foreground`} />
            <p className="text-sm text-muted-foreground">{uploadProgress}</p>
          </>
        ) : isDragReject ? (
          <>
            <FileWarning className={`${compact ? 'h-8 w-8' : 'h-12 w-12'} text-destructive`} />
            <p className="font-medium text-destructive">Invalid file type or size</p>
            <p className="text-xs text-muted-foreground">
              Accepted: Images, Videos, PDFs, Documents (max 50MB)
            </p>
          </>
        ) : (
          <>
            <Upload className={`${compact ? 'h-8 w-8' : 'h-12 w-12'} text-muted-foreground`} />
            <div>
              <p className={`${compact ? 'text-sm' : ''} font-medium`}>
                {isDragActive ? 'Drop files here' : 'Drag & drop files here'}
              </p>
              <p className="text-sm text-muted-foreground">
                or click to browse {compact ? '' : '(max 50MB per file)'}
              </p>
            </div>
          </>
        )}
      </div>
    </Card>
  );
}
