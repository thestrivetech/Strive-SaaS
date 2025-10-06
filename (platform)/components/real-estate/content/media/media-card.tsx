/**
 * Media Card Component
 *
 * Individual media asset card with thumbnail preview,
 * metadata display, and action buttons.
 *
 * Session 3: Media Library - Upload & Management
 */

'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  FileText,
  FileVideo,
  MoreVertical,
  Download,
  Trash2,
  Eye,
  Copy,
  FolderInput,
} from 'lucide-react';
import { deleteMediaAsset } from '@/lib/modules/content/media';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import type { media_assets } from '@prisma/client';

interface MediaCardProps {
  asset: media_assets & {
    uploader?: { id: string; name: string; avatar_url: string | null } | null;
    folder?: { id: string; name: string } | null;
  };
  selected?: boolean;
  onSelect?: (asset: any) => void;
  onView?: (asset: any) => void;
  onMove?: (asset: any) => void;
}

export function MediaCard({
  asset,
  selected,
  onSelect,
  onView,
  onMove,
}: MediaCardProps) {
  const [deleting, setDeleting] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  const isImage = asset.mime_type.startsWith('image/');
  const isVideo = asset.mime_type.startsWith('video/');
  const isDocument = asset.mime_type.startsWith('application/');

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${(bytes / Math.pow(k, i)).toFixed(1)} ${sizes[i]}`;
  };

  const handleDelete = async () => {
    if (!confirm(`Delete "${asset.name}"? This cannot be undone.`)) {
      return;
    }

    setDeleting(true);
    try {
      await deleteMediaAsset(asset.id);
      toast({
        title: 'Asset deleted',
        description: `${asset.name} has been deleted`,
      });
      router.refresh();
    } catch (error) {
      toast({
        title: 'Delete failed',
        description: error instanceof Error ? error.message : 'An error occurred',
        variant: 'destructive',
      });
    } finally {
      setDeleting(false);
    }
  };

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(asset.file_url);
    toast({
      title: 'URL copied',
      description: 'File URL copied to clipboard',
    });
  };

  const handleDownload = () => {
    window.open(asset.file_url, '_blank');
  };

  return (
    <Card
      className={`
        group relative overflow-hidden transition-all
        ${selected ? 'ring-2 ring-primary' : 'hover:shadow-md'}
        ${deleting ? 'opacity-50 pointer-events-none' : ''}
      `}
    >
      {/* Thumbnail/Preview */}
      <div
        className="aspect-square bg-muted relative cursor-pointer"
        onClick={() => onSelect?.(asset)}
      >
        {isImage ? (
          <Image
            src={asset.file_url}
            alt={asset.alt || asset.name}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 16vw"
          />
        ) : isVideo ? (
          <div className="flex items-center justify-center h-full">
            <FileVideo className="h-16 w-16 text-muted-foreground" />
          </div>
        ) : isDocument ? (
          <div className="flex items-center justify-center h-full">
            <FileText className="h-16 w-16 text-muted-foreground" />
          </div>
        ) : (
          <div className="flex items-center justify-center h-full">
            <FileText className="h-16 w-16 text-muted-foreground" />
          </div>
        )}

        {/* Selected indicator */}
        {selected && (
          <div className="absolute top-2 left-2 h-6 w-6 bg-primary rounded-full flex items-center justify-center">
            <div className="h-3 w-3 bg-white rounded-full" />
          </div>
        )}

        {/* Actions overlay */}
        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
          <Button
            size="sm"
            variant="secondary"
            onClick={(e) => {
              e.stopPropagation();
              onView?.(asset);
            }}
          >
            <Eye className="h-4 w-4" />
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
              <Button size="sm" variant="secondary">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={handleCopyUrl}>
                <Copy className="h-4 w-4 mr-2" />
                Copy URL
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleDownload}>
                <Download className="h-4 w-4 mr-2" />
                Download
              </DropdownMenuItem>
              {onMove && (
                <DropdownMenuItem onClick={() => onMove(asset)}>
                  <FolderInput className="h-4 w-4 mr-2" />
                  Move to folder
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleDelete} className="text-destructive">
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Metadata */}
      <div className="p-3">
        <p className="text-sm font-medium truncate" title={asset.name}>
          {asset.name}
        </p>
        <div className="flex items-center justify-between mt-1">
          <p className="text-xs text-muted-foreground">{formatFileSize(asset.file_size)}</p>
          {isImage && asset.width && asset.height && (
            <p className="text-xs text-muted-foreground">
              {asset.width}x{asset.height}
            </p>
          )}
        </div>
        {asset.folder && (
          <p className="text-xs text-muted-foreground mt-1 truncate">
            {asset.folder.name}
          </p>
        )}
      </div>
    </Card>
  );
}
