import { Skeleton } from "@heroui/skeleton";

export default function Loading() {
  return (
    <div className="flex-1 overflow-y-auto p-6">
      <div className="flex gap-8">
        <div className="flex-1 flex flex-col gap-6">
          <Skeleton className="h-28 w-full rounded-lg" />
          <Skeleton className="h-28 w-full rounded-lg" />
          <Skeleton className="h-28 w-full rounded-lg" />
        </div>
        <div className="w-[300px] flex flex-col gap-6">
          <Skeleton className="h-32 w-full rounded-lg" />
          <Skeleton className="h-40 w-full rounded-lg" />
        </div>
      </div>
    </div>
  );
}