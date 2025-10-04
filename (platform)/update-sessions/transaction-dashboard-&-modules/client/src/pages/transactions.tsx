import { Button } from "@/components/ui/button";
import LoopCard from "@/components/transaction/loop-card";
import { Plus, Filter } from "lucide-react";
import { useLoops } from "@/lib/hooks/useLoops";
import { Skeleton } from "@/components/ui/skeleton";

export default function Transactions() {
  const { data: loops, isLoading } = useLoops();

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold" data-testid="text-page-title">All Transactions</h1>
          <p className="text-muted-foreground">Manage all transaction loops</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" data-testid="button-filter">
            <Filter className="w-4 h-4 mr-2" />
            Filter
          </Button>
          <Button data-testid="button-create">
            <Plus className="w-4 h-4 mr-2" />
            Create Loop
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {isLoading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-64" data-testid={`skeleton-loop-${i}`} />
          ))
        ) : (
          loops?.map((loop) => (
            <LoopCard
              key={loop.id}
              id={loop.id}
              propertyAddress={loop.propertyAddress}
              status={loop.status as any}
              transactionType={loop.transactionType}
              listingPrice={loop.listingPrice ? parseFloat(loop.listingPrice) : 0}
              closingDate={loop.closingDate ? new Date(loop.closingDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : "TBD"}
              progress={loop.progress}
              parties={loop.parties || []}
              documentCount={loop.documentCount || 0}
              onView={() => console.log('View loop:', loop.id)}
              onEdit={() => console.log('Edit loop:', loop.id)}
              onDelete={() => console.log('Delete loop:', loop.id)}
            />
          ))
        )}
      </div>
    </div>
  );
}
