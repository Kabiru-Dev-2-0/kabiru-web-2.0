import { Skeleton } from "@heroui/skeleton";

export default function Loading() {
  return (
    <div className="flex-1 overflow-y-auto p-6">
      <Skeleton className="h-10 w-64" />
      <div className="mt-4 grid grid-cols-2 gap-6">
        <Skeleton className="h-40 w-full rounded-lg" />
        <Skeleton className="h-40 w-full rounded-lg" />
        <Skeleton className="h-40 w-full rounded-lg" />
        <Skeleton className="h-40 w-full rounded-lg" />
      </div>
    </div>
  );
}