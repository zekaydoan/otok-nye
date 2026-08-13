import Skeleton from "@/components/Skeleton";

export default function PublicVehicleLoading() {
  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8 sm:py-10">
      <div className="mx-auto max-w-2xl">
        <Skeleton className="h-8 w-40" />
        <div className="mt-6 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-100">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="mt-2 h-8 w-48" />
          <Skeleton className="mt-2 h-4 w-32" />
          <Skeleton className="mt-4 h-16" />
        </div>
        <div className="mt-6 space-y-3">
          <Skeleton className="h-20" />
          <Skeleton className="h-20" />
        </div>
      </div>
    </main>
  );
}
