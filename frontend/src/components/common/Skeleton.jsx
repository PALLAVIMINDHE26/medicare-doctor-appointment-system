import clsx from 'clsx';

export const Skeleton = ({ className }) => (
  <div className={clsx('animate-skeleton rounded-md bg-slate-200', className)} />
);

export const CardSkeleton = () => (
  <div className="rounded-xl border border-slate-200 bg-white p-5">
    <div className="flex items-center gap-3">
      <Skeleton className="h-12 w-12 rounded-full" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-1/2" />
        <Skeleton className="h-3 w-1/3" />
      </div>
    </div>
    <div className="mt-4 space-y-2">
      <Skeleton className="h-3 w-full" />
      <Skeleton className="h-3 w-5/6" />
    </div>
  </div>
);

export const TableSkeleton = ({ rows = 5, cols = 4 }) => (
  <div className="w-full">
    {Array.from({ length: rows }).map((_, r) => (
      <div key={r} className="flex items-center gap-4 border-b border-slate-100 px-4 py-3.5">
        {Array.from({ length: cols }).map((__, c) => (
          <Skeleton key={c} className={clsx('h-4', c === 0 ? 'w-1/4' : 'flex-1')} />
        ))}
      </div>
    ))}
  </div>
);

export const StatCardSkeleton = () => (
  <div className="rounded-xl border border-slate-200 bg-white p-5">
    <Skeleton className="h-3 w-24" />
    <Skeleton className="mt-3 h-7 w-16" />
  </div>
);
