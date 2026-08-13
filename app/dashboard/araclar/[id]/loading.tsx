import Skeleton from "@/components/Skeleton";

export default function VehicleDetailLoading() {
  return (
    <div>
      <Skeleton className="h-40 rounded-2xl" />
      <div className="mt-8">
        <Skeleton className="h-6 w-40" />
        <div className="mt-4 space-y-3">
          <Skeleton className="h-20" />
          <Skeleton className="h-20" />
          <Skeleton className="h-20" />
        </div>
      </div>
    </div>
  );
}
