import Skeleton from "@/components/Skeleton";

export default function DashboardLoading() {
  return (
    <div>
      <Skeleton className="h-32 rounded-2xl" />
      <div className="mt-4 flex gap-2">
        <Skeleton className="h-10 flex-1 sm:w-32 sm:flex-none" />
        <Skeleton className="h-10 flex-1 sm:w-40 sm:flex-none" />
      </div>
      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
        <Skeleton className="h-20" />
        <Skeleton className="h-20" />
        <Skeleton className="h-20 hidden sm:block" />
      </div>
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-24" />
        ))}
      </div>
    </div>
  );
}
