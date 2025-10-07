import { Skeleton } from '@/components/ui/skeleton';

export default function SignatureLoading() {
  return (
    <div className="container mx-auto max-w-4xl py-8 space-y-6">
      {/* Document viewer skeleton */}
      <Skeleton className="h-[600px] w-full rounded-lg" />

      {/* Signature pad skeleton */}
      <div className="space-y-4">
        <Skeleton className="h-6 w-48" />
        <Skeleton className="h-40 w-full" />
        <div className="flex gap-2">
          <Skeleton className="h-10 w-24" />
          <Skeleton className="h-10 w-24" />
        </div>
      </div>
    </div>
  );
}
