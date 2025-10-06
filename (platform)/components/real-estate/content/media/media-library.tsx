/**
 * Media Library Component
 *
 * Main media library interface with folder navigation,
 * search, upload, and grid/list view modes.
 *
 * Session 3: Media Library - Upload & Management
 */

'use client';

import { useState } from 'react';
import { MediaUploadZone } from './media-upload-zone';
import { MediaGrid } from './media-grid';
import { MediaFolderTree } from './media-folder-tree';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, Grid3x3, List } from 'lucide-react';
import type { media_assets, media_folders } from '@prisma/client';

interface MediaLibraryProps {
  assets: (media_assets & {
    uploader?: { id: string; name: string; avatar_url: string | null } | null;
    folder?: { id: string; name: string } | null;
  })[];
  folders: (media_folders & {
    _count: {
      assets: number;
      children: number;
    };
    children: any[];
  })[];
  onUpload?: () => void;
}

export function MediaLibrary({ assets, folders, onUpload }: MediaLibraryProps) {
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedAssets, setSelectedAssets] = useState<Set<string>>(new Set());

  // Filter assets by folder and search
  const filteredAssets = assets.filter((asset) => {
    // Folder filter
    if (selectedFolder !== null && asset.folder_id !== selectedFolder) {
      return false;
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
    const newSelected = new Set(selectedAssets);
    if (newSelected.has(asset.id)) {
      newSelected.delete(asset.id);
    } else {
      newSelected.add(asset.id);
    }
    setSelectedAssets(newSelected);
  };

  return (
    <div className="flex gap-6 h-[calc(100vh-12rem)]">
      {/* Sidebar - Folder Tree */}
      <aside className="w-64 flex-shrink-0">
        <Card className="p-4 h-full overflow-y-auto">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">Folders</h3>
          </div>
          <MediaFolderTree
            folders={folders}
            selectedFolder={selectedFolder}
            onSelectFolder={setSelectedFolder}
          />
        </Card>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col gap-4 min-w-0">
        {/* Upload Zone */}
        <MediaUploadZone folderId={selectedFolder} onUpload={onUpload} />

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
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <span>
            {filteredAssets.length} {filteredAssets.length === 1 ? 'asset' : 'assets'}
          </span>
          {selectedAssets.size > 0 && (
            <span>{selectedAssets.size} selected</span>
          )}
        </div>

        {/* Assets Grid/List */}
        <Card className="p-4 flex-1 overflow-y-auto">
          <MediaGrid
            assets={filteredAssets}
            viewMode={viewMode}
            selectedAssets={selectedAssets}
            onSelectAsset={handleSelectAsset}
          />
        </Card>
      </div>
    </div>
  );
}
