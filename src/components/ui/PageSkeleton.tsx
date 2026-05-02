import { Skeleton } from "@/components/ui/skeleton";

const PageSkeleton = () => (
  <div className="flex-1 overflow-y-auto p-2 pb-20 lg:pb-2">
    <div className="space-y-5 animate-in fade-in duration-300">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-7 w-48 bg-secondary/60" />
          <Skeleton className="h-4 w-64 bg-secondary/40" />
        </div>
        <Skeleton className="h-10 w-32 rounded-xl bg-secondary/60" />
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="glass-card p-4 space-y-3">
            <Skeleton className="h-9 w-9 rounded-xl bg-secondary/60" />
            <Skeleton className="h-6 w-20 bg-secondary/60" />
            <Skeleton className="h-3 w-24 bg-secondary/40" />
          </div>
        ))}
      </div>
      <div className="glass-card p-5 space-y-4">
        <Skeleton className="h-4 w-32 bg-secondary/60" />
        {[1, 2, 3, 4, 5].map(i => (
          <div key={i} className="flex items-center gap-4">
            <Skeleton className="h-10 w-10 rounded-xl bg-secondary/60 flex-shrink-0" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-3/4 bg-secondary/50" />
              <Skeleton className="h-3 w-1/2 bg-secondary/40" />
            </div>
            <Skeleton className="h-8 w-16 rounded-lg bg-secondary/50" />
          </div>
        ))}
      </div>
    </div>
  </div>
);

export default PageSkeleton;
