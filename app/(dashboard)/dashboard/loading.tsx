import { Skeleton } from "@heroui/skeleton";

export default function Loading() {
  return (
    <div className="flex-1 overflow-y-auto p-6">
      <div className="flex gap-8">
        <div className="flex-1 flex flex-col gap-8">
          <Skeleton className="h-40 w-full rounded-lg" />
          <Skeleton className="h-8 w-64" />
          <div className="grid grid-cols-2 gap-5">
            <Skeleton className="h-36 w-full rounded-lg" />
            <Skeleton className="h-36 w-full rounded-lg" />
          </div>
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-40 w-80 rounded-lg" />
        </div>
        <div className="w-[300px] flex flex-col gap-6">
          <Skeleton className="h-32 w-full rounded-lg" />
          <Skeleton className="h-40 w-full rounded-lg" />
          <Skeleton className="h-40 w-full rounded-lg" />
        </div>
      </div>
    </div>
  );
}