import { Skeleton } from '@heroui/skeleton';

export default function Loading() {
  return (
    <div className="flex-1 overflow-y-auto p-6">
      <div className="flex flex-col gap-8">
        <div className="flex gap-6">
          <div className="flex-1">
            <Skeleton className="h-8 w-64" />
            <div className="mt-4 grid grid-cols-2 gap-5">
              <Skeleton className="h-36 w-full rounded-lg" />
              <Skeleton className="h-36 w-full rounded-lg" />
            </div>
          </div>
          <Skeleton className="h-[250px] w-[270px] rounded-lg" />
        </div>
        <Skeleton className="h-8 w-64" />
        <div className="grid grid-cols-3 gap-5">
          <Skeleton className="h-40 w-full rounded-lg" />
          <Skeleton className="h-40 w-full rounded-lg" />
          <Skeleton className="h-40 w-full rounded-lg" />
        </div>
        <div className="grid grid-cols-3 gap-5">
          <Skeleton className="h-40 w-full rounded-lg" />
          <Skeleton className="h-40 w-full rounded-lg" />
          <Skeleton className="h-40 w-full rounded-lg" />
        </div>
      </div>
    </div>
  );
}
