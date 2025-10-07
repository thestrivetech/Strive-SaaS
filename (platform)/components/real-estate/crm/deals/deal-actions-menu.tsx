'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { MoreVertical, Edit, TrendingUp, TrendingDown, Trash2 } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
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
import { closeDeal, deleteDeal } from './actions';

interface DealActionsMenuProps {
  dealId: string;
  dealTitle: string;
  onEdit?: () => void;
}

export function DealActionsMenu({ dealId, dealTitle, onEdit }: DealActionsMenuProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isCloseWonOpen, setIsCloseWonOpen] = useState(false);
  const [isCloseLostOpen, setIsCloseLostOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  async function handleCloseWon() {
    setIsLoading(true);
    try {
      await closeDeal({
        id: dealId,
        status: 'WON',
        actual_close_date: new Date(),
      });

      toast({
        title: 'Deal marked as won',
        description: `${dealTitle} has been closed as won.`,
      });

      router.refresh();
      setIsCloseWonOpen(false);
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to close deal',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }

  async function handleCloseLost() {
    setIsLoading(true);
    try {
      await closeDeal({
        id: dealId,
        status: 'LOST',
        actual_close_date: new Date(),
        lost_reason: 'Marked as lost from actions menu',
      });

      toast({
        title: 'Deal marked as lost',
        description: `${dealTitle} has been closed as lost.`,
      });

      router.refresh();
      setIsCloseLostOpen(false);
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to close deal',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }

  async function handleDelete() {
    setIsLoading(true);
    try {
      await deleteDeal({ id: dealId });

      toast({
        title: 'Deal deleted',
        description: `${dealTitle} has been deleted successfully.`,
      });

      router.push('/crm/deals');
      router.refresh();
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to delete deal',
        variant: 'destructive',
      });
      setIsLoading(false);
    }
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon">
            <MoreVertical className="h-4 w-4" />
            <span className="sr-only">Open deal actions</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {onEdit && (
            <>
              <DropdownMenuItem onClick={onEdit}>
                <Edit className="h-4 w-4 mr-2" />
                Edit deal
              </DropdownMenuItem>
              <DropdownMenuSeparator />
            </>
          )}
          <DropdownMenuItem onClick={() => setIsCloseWonOpen(true)}>
            <TrendingUp className="h-4 w-4 mr-2 text-green-600" />
            Mark as won
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setIsCloseLostOpen(true)}>
            <TrendingDown className="h-4 w-4 mr-2 text-red-600" />
            Mark as lost
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => setIsDeleteOpen(true)}
            className="text-destructive focus:text-destructive"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete deal
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Close as Won Dialog */}
      <AlertDialog open={isCloseWonOpen} onOpenChange={setIsCloseWonOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Mark deal as won?</AlertDialogTitle>
            <AlertDialogDescription>
              This will close the deal and mark it as successfully won. This action can be undone by editing the deal later.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isLoading}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleCloseWon} disabled={isLoading}>
              {isLoading ? 'Closing...' : 'Mark as won'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Close as Lost Dialog */}
      <AlertDialog open={isCloseLostOpen} onOpenChange={setIsCloseLostOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Mark deal as lost?</AlertDialogTitle>
            <AlertDialogDescription>
              This will close the deal and mark it as lost. You can optionally provide a reason when editing the deal.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isLoading}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleCloseLost} disabled={isLoading}>
              {isLoading ? 'Closing...' : 'Mark as lost'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Dialog */}
      <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete deal?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete &quot;{dealTitle}&quot; and all associated data. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isLoading}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isLoading}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isLoading ? 'Deleting...' : 'Delete deal'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
