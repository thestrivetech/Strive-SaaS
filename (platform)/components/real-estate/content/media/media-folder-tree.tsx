/**
 * Media Folder Tree Component
 *
 * Hierarchical folder navigation with expand/collapse
 * and folder creation capabilities.
 *
 * Session 3: Media Library - Upload & Management
 */

'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Folder, FolderOpen, ChevronRight, ChevronDown, FolderPlus } from 'lucide-react';
import { createMediaFolder } from '@/lib/modules/content/media';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';

interface FolderNode {
  id: string;
  name: string;
  path: string;
  parent_id: string | null;
  _count: {
    assets: number;
    children: number;
  };
  children: FolderNode[];
}

interface MediaFolderTreeProps {
  folders: FolderNode[];
  selectedFolder: string | null;
  onSelectFolder: (folderId: string | null) => void;
}

export function MediaFolderTree({
  folders,
  selectedFolder,
  onSelectFolder,
}: MediaFolderTreeProps) {
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set());
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [parentFolderId, setParentFolderId] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  const toggleExpand = (folderId: string) => {
    const newExpanded = new Set(expandedFolders);
    if (newExpanded.has(folderId)) {
      newExpanded.delete(folderId);
    } else {
      newExpanded.add(folderId);
    }
    setExpandedFolders(newExpanded);
  };

  const handleCreateFolder = async () => {
    if (!newFolderName.trim()) {
      toast({
        title: 'Folder name required',
        description: 'Please enter a folder name',
        variant: 'destructive',
      });
      return;
    }

    setCreating(true);
    try {
      await createMediaFolder({
        name: newFolderName.trim(),
        parentId: parentFolderId,
        organizationId: '', // Will be set by server action
      });

      toast({
        title: 'Folder created',
        description: `"${newFolderName}" has been created`,
      });

      setShowCreateDialog(false);
      setNewFolderName('');
      setParentFolderId(null);
      router.refresh();
    } catch (error) {
      toast({
        title: 'Create failed',
        description: error instanceof Error ? error.message : 'An error occurred',
        variant: 'destructive',
      });
    } finally {
      setCreating(false);
    }
  };

  const renderFolder = (folder: FolderNode, level: number = 0) => {
    const isExpanded = expandedFolders.has(folder.id);
    const isSelected = selectedFolder === folder.id;
    const hasChildren = folder.children.length > 0;

    return (
      <div key={folder.id}>
        <div
          className={`
            flex items-center gap-2 px-2 py-1.5 rounded-md cursor-pointer
            hover:bg-muted/50 transition-colors
            ${isSelected ? 'bg-primary/10 text-primary' : ''}
          `}
          style={{ paddingLeft: `${level * 12 + 8}px` }}
        >
          {hasChildren ? (
            <button
              onClick={() => toggleExpand(folder.id)}
              className="p-0 h-4 w-4 flex items-center justify-center"
            >
              {isExpanded ? (
                <ChevronDown className="h-3 w-3" />
              ) : (
                <ChevronRight className="h-3 w-3" />
              )}
            </button>
          ) : (
            <div className="w-4" />
          )}

          <button
            onClick={() => onSelectFolder(folder.id)}
            className="flex items-center gap-2 flex-1 text-left"
          >
            {isExpanded && hasChildren ? (
              <FolderOpen className="h-4 w-4 flex-shrink-0" />
            ) : (
              <Folder className="h-4 w-4 flex-shrink-0" />
            )}
            <span className="text-sm truncate flex-1">{folder.name}</span>
            <span className="text-xs text-muted-foreground">
              {folder._count.assets}
            </span>
          </button>
        </div>

        {isExpanded && hasChildren && (
          <div>
            {folder.children.map((child) => renderFolder(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-2">
      {/* Root "All Media" folder */}
      <div
        className={`
          flex items-center gap-2 px-2 py-1.5 rounded-md cursor-pointer
          hover:bg-muted/50 transition-colors
          ${selectedFolder === null ? 'bg-primary/10 text-primary' : ''}
        `}
        onClick={() => onSelectFolder(null)}
      >
        <Folder className="h-4 w-4" />
        <span className="text-sm font-medium flex-1">All Media</span>
      </div>

      {/* Folder tree */}
      <div className="space-y-0.5">
        {folders.map((folder) => renderFolder(folder))}
      </div>

      {/* Create folder button */}
      <Button
        variant="outline"
        size="sm"
        className="w-full justify-start"
        onClick={() => setShowCreateDialog(true)}
      >
        <FolderPlus className="h-4 w-4 mr-2" />
        New Folder
      </Button>

      {/* Create folder dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Folder</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Folder Name</label>
              <Input
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                placeholder="Enter folder name"
                disabled={creating}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowCreateDialog(false)}
              disabled={creating}
            >
              Cancel
            </Button>
            <Button onClick={handleCreateFolder} disabled={creating}>
              {creating ? 'Creating...' : 'Create Folder'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
