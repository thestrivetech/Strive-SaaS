/**
 * Media Grid Component
 *
 * Grid/list view for media assets with responsive layout
 * and empty states.
 *
 * Session 3: Media Library - Upload & Management
 */

'use client';

import { MediaCard } from './media-card';
import { Image as ImageIcon } from 'lucide-react';
import type { media_assets } from '@prisma/client';

interface MediaGridProps {
  assets: (media_assets & {
    uploader?: { id: string; name: string; avatar_url: string | null } | null;
    folder?: { id: string; name: string } | null;
  })[];
  viewMode?: 'grid' | 'list';
  selectedAssets?: Set<string>;
  onSelectAsset?: (asset: any) => void;
  onViewAsset?: (asset: any) => void;
  onMoveAsset?: (asset: any) => void;
}

export function MediaGrid({
  assets,
  viewMode = 'grid',
  selectedAssets,
  onSelectAsset,
  onViewAsset,
  onMoveAsset,
}: MediaGridProps) {
  if (assets.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center">
        <ImageIcon className="h-16 w-16 text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold mb-2">No media assets</h3>
        <p className="text-sm text-muted-foreground max-w-sm">
          Upload your first media asset by dragging and dropping files above or clicking
          the upload zone.
        </p>
      </div>
    );
  }

  if (viewMode === 'list') {
    return (
      <div className="space-y-2">
        {assets.map((asset) => (
          <div key={asset.id} className="flex items-center gap-4 p-3 border rounded-lg hover:bg-muted/50 transition-colors">
            <div className="h-12 w-12 flex-shrink-0">
              <MediaCard
                asset={asset}
                selected={selectedAssets?.has(asset.id)}
                onSelect={onSelectAsset}
                onView={onViewAsset}
                onMove={onMoveAsset}
              />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium truncate">{asset.name}</p>
              <p className="text-sm text-muted-foreground">
                {asset.mime_type} • {new Date(asset.uploaded_at).toLocaleDateString()}
              </p>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
      {assets.map((asset) => (
        <MediaCard
          key={asset.id}
          asset={asset}
          selected={selectedAssets?.has(asset.id)}
          onSelect={onSelectAsset}
          onView={onViewAsset}
          onMove={onMoveAsset}
        />
      ))}
    </div>
  );
}
