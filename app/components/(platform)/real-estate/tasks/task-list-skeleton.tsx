import { Skeleton } from '@/components/ui/skeleton';
import { Card } from '@/components/ui/card';

export function TaskListSkeleton({ groupByStatus = true }: { groupByStatus?: boolean }) {
  if (!groupByStatus) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <TaskCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Render 3 status groups */}
      {Array.from({ length: 3 }).map((_, groupIndex) => (
        <div key={groupIndex} className="space-y-3">
          {/* Status Header */}
          <div className="flex items-center gap-2">
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-5 w-8 rounded-full" />
          </div>

          {/* Task Cards */}
          <div className="space-y-3">
            {Array.from({ length: groupIndex === 0 ? 4 : groupIndex === 1 ? 3 : 2 }).map((_, i) => (
              <TaskCardSkeleton key={i} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function TaskCardSkeleton() {
  return (
    <Card className="p-4">
      <div className="space-y-3">
        {/* Title and Status */}
        <div className="flex items-start justify-between">
          <Skeleton className="h-5 w-3/4" />
          <Skeleton className="h-6 w-20 rounded-full" />
        </div>

        {/* Description */}
        <div className="space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-2/3" />
        </div>

        {/* Metadata Row */}
        <div className="flex items-center gap-4">
          {/* Priority */}
          <Skeleton className="h-5 w-16 rounded-full" />

          {/* Due Date */}
          <div className="flex items-center gap-1">
            <Skeleton className="h-4 w-4" />
            <Skeleton className="h-4 w-20" />
          </div>

          {/* Estimated Hours */}
          <div className="flex items-center gap-1">
            <Skeleton className="h-4 w-4" />
            <Skeleton className="h-4 w-12" />
          </div>
        </div>

        {/* Assignee */}
        <div className="flex items-center gap-2 pt-2 border-t">
          <Skeleton className="h-6 w-6 rounded-full" />
          <Skeleton className="h-4 w-32" />
        </div>
      </div>
    </Card>
  );
}