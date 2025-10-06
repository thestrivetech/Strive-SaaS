/**
 * Media Picker Dialog Component
 *
 * Modal dialog for selecting media assets in content editors
 * with support for single and multiple selection.
 *
 * Session 3: Media Library - Upload & Management
 */

'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MediaUploadZone } from './media-upload-zone';
import { MediaGrid } from './media-grid';
import { Search, Grid3x3, List } from 'lucide-react';
import type { media_assets } from '@prisma/client';

interface MediaPickerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  assets: (media_assets & {
    uploader?: { id: string; name: string; avatar_url: string | null } | null;
    folder?: { id: string; name: string } | null;
  })[];
  onSelect: (assets: any[]) => void;
  multiple?: boolean;
  accept?: 'image' | 'video' | 'document' | 'all';
  maxSelection?: number;
}

export function MediaPickerDialog({
  open,
  onOpenChange,
  assets,
  onSelect,
  multiple = false,
  accept = 'all',
  maxSelection = 10,
}: MediaPickerDialogProps) {
  const [search, setSearch] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedAssets, setSelectedAssets] = useState<Set<string>>(new Set());
  const [showUpload, setShowUpload] = useState(false);

  // Filter assets by type and search
  const filteredAssets = assets.filter((asset) => {
    // Type filter
    if (accept !== 'all') {
      if (accept === 'image' && !asset.mime_type.startsWith('image/')) {
        return false;
      }
      if (accept === 'video' && !asset.mime_type.startsWith('video/')) {
        return false;
      }
      if (accept === 'document' && !asset.mime_type.startsWith('application/')) {
        return false;
      }
    }

    // Search filter
    if (search) {
      const searchLower = search.toLowerCase();
      return (
        asset.name.toLowerCase().includes(searchLower) ||
        asset.alt?.toLowerCase().includes(searchLower) ||
        asset.caption?.toLowerCase().includes(searchLower)
      );
    }

    return true;
  });

  const handleSelectAsset = (asset: any) => {
    if (!multiple) {
      // Single selection - replace
      setSelectedAssets(new Set([asset.id]));
    } else {
      // Multiple selection - toggle
      const newSelected = new Set(selectedAssets);
      if (newSelected.has(asset.id)) {
        newSelected.delete(asset.id);
      } else {
        if (newSelected.size < maxSelection) {
          newSelected.add(asset.id);
        }
      }
      setSelectedAssets(newSelected);
    }
  };

  const handleConfirm = () => {
    const selected = assets.filter((asset) => selectedAssets.has(asset.id));
    onSelect(selected);
    setSelectedAssets(new Set());
    setSearch('');
    onOpenChange(false);
  };

  const handleCancel = () => {
    setSelectedAssets(new Set());
    setSearch('');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>
            Select Media {multiple && `(${selectedAssets.size}/${maxSelection})`}
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 flex flex-col gap-4 overflow-hidden">
          {/* Upload zone (collapsible) */}
          {showUpload ? (
            <div>
              <MediaUploadZone
                compact
                onUpload={() => {
                  setShowUpload(false);
                }}
              />
              <Button
                variant="ghost"
                size="sm"
                className="mt-2"
                onClick={() => setShowUpload(false)}
              >
                Hide Upload
              </Button>
            </div>
          ) : (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowUpload(true)}
            >
              Upload New Media
            </Button>
          )}

          {/* Search & Filters */}
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search media..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>

            <Tabs
              value={viewMode}
              onValueChange={(v) => setViewMode(v as 'grid' | 'list')}
            >
              <TabsList>
                <TabsTrigger value="grid">
                  <Grid3x3 className="h-4 w-4" />
                </TabsTrigger>
                <TabsTrigger value="list">
                  <List className="h-4 w-4" />
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          {/* Stats */}
          <div className="text-sm text-muted-foreground">
            {filteredAssets.length} {filteredAssets.length === 1 ? 'asset' : 'assets'}
            {accept !== 'all' && ` (${accept} only)`}
          </div>

          {/* Assets Grid/List */}
          <div className="flex-1 overflow-y-auto border rounded-lg p-4">
            <MediaGrid
              assets={filteredAssets}
              viewMode={viewMode}
              selectedAssets={selectedAssets}
              onSelectAsset={handleSelectAsset}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleCancel}>
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={selectedAssets.size === 0}
          >
            Select {selectedAssets.size > 0 && `(${selectedAssets.size})`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
