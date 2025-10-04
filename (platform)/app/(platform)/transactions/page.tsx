import { Suspense } from 'react';
import { LoopGrid } from '@/components/(platform)/transactions/loop-grid';
import { StatsCards } from '@/components/(platform)/transactions/stats-cards';
import { CreateLoopDialog } from '@/components/(platform)/transactions/create-loop-dialog';
import { LoopFilters } from '@/components/(platform)/transactions/loop-filters';
import { getLoops, getLoopStats } from '@/lib/modules/transactions';
import { Skeleton } from '@/components/ui/skeleton';
import type { LoopStatus, TransactionType } from '@prisma/client';

export default async function TransactionsPage({
  searchParams,
}: {
  searchParams: { status?: string; type?: string; search?: string; page?: string };
}) {
  const page = Number(searchParams.page) || 1;
  const status = searchParams.status as LoopStatus | undefined;
  const transactionType = searchParams.type as TransactionType | undefined;
  const search = searchParams.search;

  const [loopsData, stats] = await Promise.all([
    getLoops({
      page,
      limit: 20,
      status,
      transactionType,
      search,
      sortBy: 'createdAt',
      sortOrder: 'desc',
    }),
    getLoopStats(),
  ]);

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Transaction Management</h1>
          <p className="text-muted-foreground">
            Manage real estate transactions and documents
          </p>
        </div>
        <CreateLoopDialog />
      </div>

      <StatsCards stats={stats} />

      <LoopFilters />

      <Suspense fallback={<LoopGridSkeleton />}>
        <LoopGrid
          loops={loopsData.loops}
          pagination={loopsData.pagination}
        />
      </Suspense>
    </div>
  );
}

function LoopGridSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {Array.from({ length: 6 }).map((_, i) => (
        <Skeleton key={i} className="h-48 w-full" />
      ))}
    </div>
  );
}
