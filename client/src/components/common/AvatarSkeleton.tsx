import { Skeleton } from "@/components/ui/skeleton";

export function AvatarSkeleton() {
  return (
    <div className="flex flex-col justify-center items-center space-y-1">
      <Skeleton className="h-16 w-16 rounded-full" />

      <Skeleton className="h-2 w-[100px]" />
    </div>
  );
}
