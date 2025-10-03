'use client';

import { useCallback, useState } from 'react';
import { Upload, X, FileIcon, Loader2 } from 'lucide-react';
import { Button } from '@/components/(shared)/ui/button';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface FileUploadProps {
  onFilesSelected: (files: File[]) => void;
  maxFiles?: number;
  maxSizeMB?: number;
  acceptedTypes?: string[];
  disabled?: boolean;
  className?: string;
}

const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
const ACCEPTED_DOCUMENT_TYPES = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'text/plain',
  'text/csv',
];

export function FileUpload({
  onFilesSelected,
  maxFiles = 5,
  maxSizeMB = 10,
  acceptedTypes = [...ACCEPTED_IMAGE_TYPES, ...ACCEPTED_DOCUMENT_TYPES],
  disabled = false,
  className,
}: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<{ [key: string]: string }>({});

  const validateFile = useCallback(
    (file: File): string | null => {
      // Check file size
      if (file.size > maxSizeMB * 1024 * 1024) {
        return `File "${file.name}" exceeds ${maxSizeMB}MB`;
      }

      // Check file type
      const isTypeAccepted = acceptedTypes.some((type) => {
        if (type.endsWith('/*')) {
          const baseType = type.split('/')[0];
          return file.type.startsWith(`${baseType}/`);
        }
        return file.type === type;
      });

      if (!isTypeAccepted) {
        return `File "${file.name}" type not accepted`;
      }

      return null;
    },
    [maxSizeMB, acceptedTypes]
  );

  const handleFiles = useCallback(
    (files: FileList | null) => {
      if (!files || files.length === 0) return;

      const fileArray = Array.from(files);

      // Check total file count
      if (selectedFiles.length + fileArray.length > maxFiles) {
        toast.error(`You can only upload up to ${maxFiles} files`);
        return;
      }

      // Validate each file
      const validFiles: File[] = [];
      for (const file of fileArray) {
        const error = validateFile(file);
        if (error) {
          toast.error(error);
          continue;
        }
        validFiles.push(file);
      }

      if (validFiles.length === 0) return;

      // Create previews for image files
      const newPreviews: { [key: string]: string } = { ...previews };
      validFiles.forEach((file) => {
        if (file.type.startsWith('image/')) {
          newPreviews[file.name] = URL.createObjectURL(file);
        }
      });

      const updatedFiles = [...selectedFiles, ...validFiles];
      setSelectedFiles(updatedFiles);
      setPreviews(newPreviews);
      onFilesSelected(updatedFiles);
    },
    [selectedFiles, maxFiles, validateFile, onFilesSelected, previews]
  );

  const removeFile = useCallback(
    (fileName: string) => {
      const updatedFiles = selectedFiles.filter((f) => f.name !== fileName);
      setSelectedFiles(updatedFiles);

      // Revoke preview URL if it exists
      if (previews[fileName]) {
        URL.revokeObjectURL(previews[fileName]);
        const { [fileName]: removed, ...remaining } = previews;
        setPreviews(remaining);
      }

      onFilesSelected(updatedFiles);
    },
    [selectedFiles, previews, onFilesSelected]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      if (disabled) return;
      handleFiles(e.dataTransfer.files);
    },
    [disabled, handleFiles]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      handleFiles(e.target.files);
      e.target.value = ''; // Reset input
    },
    [handleFiles]
  );

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${Math.round(bytes / Math.pow(k, i) * 100) / 100} ${sizes[i]}`;
  };

  return (
    <div className={cn('space-y-4', className)}>
      {/* Drop Zone */}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={cn(
          'relative border-2 border-dashed rounded-lg p-8 transition-colors',
          isDragging ? 'border-primary bg-primary/5' : 'border-muted-foreground/25',
          disabled && 'opacity-50 cursor-not-allowed',
          !disabled && 'cursor-pointer hover:border-primary/50'
        )}
      >
        <input
          type="file"
          multiple
          onChange={handleInputChange}
          disabled={disabled}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
          accept={acceptedTypes.join(',')}
        />
        <div className="flex flex-col items-center justify-center text-center space-y-2">
          <Upload className={cn('h-10 w-10', isDragging ? 'text-primary' : 'text-muted-foreground')} />
          <div>
            <p className="text-sm font-medium">
              {isDragging ? 'Drop files here' : 'Drag & drop files here, or click to browse'}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Max {maxFiles} files, up to {maxSizeMB}MB each
            </p>
          </div>
        </div>
      </div>

      {/* Selected Files List */}
      {selectedFiles.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-medium">Selected files ({selectedFiles.length})</p>
          <div className="space-y-2">
            {selectedFiles.map((file) => (
              <div
                key={file.name}
                className="flex items-center gap-3 p-3 border rounded-lg bg-card hover:bg-accent/50 transition-colors"
              >
                {/* File Preview/Icon */}
                <div className="flex-shrink-0">
                  {previews[file.name] ? (
                    <img
                      src={previews[file.name]}
                      alt={file.name}
                      className="h-10 w-10 object-cover rounded"
                    />
                  ) : (
                    <FileIcon className="h-10 w-10 text-muted-foreground" />
                  )}
                </div>

                {/* File Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{file.name}</p>
                  <p className="text-xs text-muted-foreground">{formatFileSize(file.size)}</p>
                </div>

                {/* Remove Button */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeFile(file.name)}
                  disabled={disabled}
                  className="flex-shrink-0"
                >
                  <X className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
