import { Skeleton } from "@/components/ui/skeleton";
import PostSkeleton from "./components/common/PostSkeleton";

export const FeedSkeleton = () => {
  return (
    <main className="flex flex-col md:flex-row h-full md:space-x-[17px] pb-5 justify-end">
      {/* Left Column - Main Content */}
      <div
        className="space-y-[18px] flex-1 overflow-y-auto"
        style={{
          scrollbarWidth: "none",
          msOverflowStyle: "none",
        }}
      >
        {/* Recognition Section Skeleton */}
        <div className="bg-muted sticky min-h-32 top-0 rounded-[20px] flex flex-col max-w-full p-3 space-y-4 items-center justify-center">
          <Skeleton className="h-7 w-3/5 mx-auto" />
          <Skeleton className="h-5 w-2/5 mx-auto" />
          <div className="flex gap-4 w-full overflow-x-hidden justify-center items-center">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex flex-col items-center gap-2">
                <Skeleton className="w-14 h-14 rounded-full" />
                <Skeleton className="h-4 w-20" />
              </div>
            ))}
          </div>
        </div>

        {/* Posts Section */}
        <div className="space-y-7">
          {/* Create Post Skeleton */}
          <div className="space-y-3">
            <Skeleton className="h-24 rounded-xl" />
          </div>

          {/* Feed Items */}
          <div className="space-y-5">
            <Skeleton className="h-6 w-1/4 mb-4" />
            {[1, 2, 3].map((i) => (
              <PostSkeleton key={i} />
            ))}
          </div>
        </div>
      </div>

      {/* Right Column - Events Section */}
      <div
        className="hidden custom1:flex space-y-10 w-[380px] overflow-y-auto"
        style={{
          scrollbarWidth: "none",
          msOverflowStyle: "none",
        }}
      >
        <div className="pt-5 space-y-3 h-fit bg-muted rounded-t-2xl w-full flex flex-col items-center">
          {/* Calendar Section */}
          <Skeleton className="h-6 w-32 mb-4" />
          <div className="shadow-lg shadow-muted-foreground/20 p-2 rounded-md w-[348px]">
            <div className="grid grid-cols-7 gap-2 mb-3">
              {[...Array(7)].map((_, i) => (
                <Skeleton key={i} className="h-6 w-full rounded-sm" />
              ))}
            </div>
            <div className="grid grid-cols-7 gap-2">
              {[...Array(42)].map((_, i) => (
                <Skeleton key={i} className="h-8 w-8 rounded-full" />
              ))}
            </div>
          </div>

          {/* Events List */}
          <div className="px-4 py-6 bg-muted rounded-lg space-y-5 w-full">
            <div className="flex items-center justify-between">
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-6 w-6 rounded-full" />
            </div>
            <div className="flex flex-col space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                  <Skeleton className="h-4 w-1/4" />
                </div>
              ))}
            </div>
          </div>

          {/* Announcements */}
          <div className="px-4 bg-muted rounded-lg space-y-2 w-full">
            <div className="flex items-center justify-between pb-4">
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-6 w-6 rounded-full" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};
