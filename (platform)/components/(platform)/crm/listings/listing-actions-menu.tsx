'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { MoreVertical, Edit, Trash, Eye, CheckCircle, XCircle } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { deleteListing, updateListingStatus } from '@/lib/modules/listings';
import type { ListingWithAssignee } from '@/lib/modules/listings';

interface ListingActionsMenuProps {
  listing: ListingWithAssignee;
}

export function ListingActionsMenu({ listing }: ListingActionsMenuProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await deleteListing(listing.id);
      toast({
        title: 'Success',
        description: 'Listing deleted successfully',
      });
      router.refresh();
      setShowDeleteDialog(false);
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to delete listing',
        variant: 'destructive',
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleStatusChange = async (status: 'ACTIVE' | 'SOLD' | 'WITHDRAWN') => {
    try {
      await updateListingStatus({
        id: listing.id,
        status,
        sold_date: status === 'SOLD' ? new Date() : undefined,
      });
      toast({
        title: 'Success',
        description: `Listing marked as ${status.toLowerCase()}`,
      });
      router.refresh();
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to update status',
        variant: 'destructive',
      });
    }
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 bg-white/90 hover:bg-white"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
          >
            <MoreVertical className="h-4 w-4" />
            <span className="sr-only">Open menu</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
          <DropdownMenuLabel>Actions</DropdownMenuLabel>
          <DropdownMenuItem
            onClick={(e) => {
              e.stopPropagation();
              router.push(`/crm/listings/${listing.id}`);
            }}
          >
            <Eye className="mr-2 h-4 w-4" />
            View Details
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={(e) => {
              e.stopPropagation();
              router.push(`/crm/listings/${listing.id}?edit=true`);
            }}
          >
            <Edit className="mr-2 h-4 w-4" />
            Edit
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          {listing.status !== 'SOLD' && (
            <DropdownMenuItem
              onClick={(e) => {
                e.stopPropagation();
                handleStatusChange('SOLD');
              }}
            >
              <CheckCircle className="mr-2 h-4 w-4" />
              Mark as Sold
            </DropdownMenuItem>
          )}
          {listing.status !== 'ACTIVE' && (
            <DropdownMenuItem
              onClick={(e) => {
                e.stopPropagation();
                handleStatusChange('ACTIVE');
              }}
            >
              <CheckCircle className="mr-2 h-4 w-4" />
              Mark as Active
            </DropdownMenuItem>
          )}
          {listing.status !== 'WITHDRAWN' && (
            <DropdownMenuItem
              onClick={(e) => {
                e.stopPropagation();
                handleStatusChange('WITHDRAWN');
              }}
            >
              <XCircle className="mr-2 h-4 w-4" />
              Withdraw Listing
            </DropdownMenuItem>
          )}
          <DropdownMenuSeparator />
          <DropdownMenuItem
            className="text-destructive"
            onClick={(e) => {
              e.stopPropagation();
              setShowDeleteDialog(true);
            }}
          >
            <Trash className="mr-2 h-4 w-4" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent onClick={(e) => e.stopPropagation()}>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the listing &quot;{listing.title}&quot;.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.stopPropagation();
                handleDelete();
              }}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
