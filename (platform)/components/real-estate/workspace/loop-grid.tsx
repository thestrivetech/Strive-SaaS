import { LoopCard } from './loop-card';
import type { transaction_loops } from '@prisma/client';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface LoopGridProps {
  loops: transaction_loops[];
  pagination: {
    total: number;
    page: number;
    pages: number;
    limit: number;
  };
}

export function LoopGrid({ loops, pagination }: LoopGridProps) {
  if (loops.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No transactions found.</p>
        <p className="text-sm text-muted-foreground mt-2">
          Create your first transaction to get started.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {loops.map((loop) => (
          <LoopCard key={loop.id} loop={loop} />
        ))}
      </div>

      {pagination.pages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Link href={`?page=${Math.max(1, pagination.page - 1)}`}>
            <Button
              variant="outline"
              size="sm"
              disabled={pagination.page === 1}
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>
          </Link>
          <span className="text-sm text-muted-foreground">
            Page {pagination.page} of {pagination.pages}
          </span>
          <Link href={`?page=${Math.min(pagination.pages, pagination.page + 1)}`}>
            <Button
              variant="outline"
              size="sm"
              disabled={pagination.page >= pagination.pages}
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
}
