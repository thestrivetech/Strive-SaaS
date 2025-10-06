/**
 * Media Details Panel Component
 *
 * Detailed view of selected media asset with metadata editing,
 * preview, and action buttons.
 *
 * Session 3: Media Library - Upload & Management
 */

'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { X, Copy, Download, Trash2, Save } from 'lucide-react';
import { updateMediaAsset, deleteMediaAsset } from '@/lib/modules/content/media';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import type { media_assets } from '@prisma/client';

interface MediaDetailsPanelProps {
  asset: media_assets & {
    uploader?: { id: string; name: string } | null;
    folder?: { id: string; name: string } | null;
  };
  onClose: () => void;
}

export function MediaDetailsPanel({ asset, onClose }: MediaDetailsPanelProps) {
  const [name, setName] = useState(asset.name);
  const [alt, setAlt] = useState(asset.alt || '');
  const [caption, setCaption] = useState(asset.caption || '');
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  const isImage = asset.mime_type.startsWith('image/');
  const isVideo = asset.mime_type.startsWith('video/');

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${(bytes / Math.pow(k, i)).toFixed(1)} ${sizes[i]}`;
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateMediaAsset({
        id: asset.id,
        name,
        alt: alt || null,
        caption: caption || null,
      });

      toast({
        title: 'Asset updated',
        description: 'Changes have been saved',
      });

      router.refresh();
    } catch (error) {
      toast({
        title: 'Update failed',
        description: error instanceof Error ? error.message : 'An error occurred',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
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
      onClose();
      router.refresh();
    } catch (error) {
      toast({
        title: 'Delete failed',
        description: error instanceof Error ? error.message : 'An error occurred',
        variant: 'destructive',
      });
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
    <Card className="w-96 h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <h3 className="font-semibold">Asset Details</h3>
        <Button variant="ghost" size="sm" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Preview */}
        <div className="aspect-square bg-muted rounded-lg overflow-hidden relative">
          {isImage && (
            <Image
              src={asset.file_url}
              alt={asset.alt || asset.name}
              fill
              className="object-contain"
            />
          )}
          {isVideo && (
            <video src={asset.file_url} controls className="w-full h-full" />
          )}
        </div>

        {/* Metadata */}
        <div className="space-y-4">
          <div>
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={saving || deleting}
            />
          </div>

          <div>
            <Label htmlFor="alt">Alt Text</Label>
            <Input
              id="alt"
              value={alt}
              onChange={(e) => setAlt(e.target.value)}
              placeholder="Describe the image..."
              disabled={saving || deleting}
            />
          </div>

          <div>
            <Label htmlFor="caption">Caption</Label>
            <Textarea
              id="caption"
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="Add a caption..."
              disabled={saving || deleting}
              rows={3}
            />
          </div>

          {/* File info */}
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Type:</span>
              <span className="font-medium">{asset.mime_type}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Size:</span>
              <span className="font-medium">{formatFileSize(asset.file_size)}</span>
            </div>
            {isImage && asset.width && asset.height && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Dimensions:</span>
                <span className="font-medium">
                  {asset.width} x {asset.height}
                </span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-muted-foreground">Uploaded:</span>
              <span className="font-medium">
                {new Date(asset.uploaded_at).toLocaleDateString()}
              </span>
            </div>
            {asset.uploader && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">By:</span>
                <span className="font-medium">{asset.uploader.name}</span>
              </div>
            )}
          </div>

          {/* URL */}
          <div>
            <Label>File URL</Label>
            <div className="flex gap-2 mt-1">
              <Input value={asset.file_url} readOnly className="flex-1" />
              <Button variant="outline" size="sm" onClick={handleCopyUrl}>
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Footer - Actions */}
      <div className="p-4 border-t space-y-2">
        <div className="flex gap-2">
          <Button
            variant="outline"
            className="flex-1"
            onClick={handleDownload}
            disabled={saving || deleting}
          >
            <Download className="h-4 w-4 mr-2" />
            Download
          </Button>
          <Button
            onClick={handleSave}
            className="flex-1"
            disabled={saving || deleting}
          >
            <Save className="h-4 w-4 mr-2" />
            {saving ? 'Saving...' : 'Save'}
          </Button>
        </div>
        <Button
          variant="destructive"
          className="w-full"
          onClick={handleDelete}
          disabled={saving || deleting}
        >
          <Trash2 className="h-4 w-4 mr-2" />
          {deleting ? 'Deleting...' : 'Delete Asset'}
        </Button>
      </div>
    </Card>
  );
}
