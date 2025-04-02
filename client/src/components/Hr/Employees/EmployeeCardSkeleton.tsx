import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";

const EmployeeCardSkeleton = () => {
  // Create an array of 6 items to represent loading cards
  const skeletonCards = Array(6).fill(null);
  
  return (
    <div className="p-6 bg-slate-50 min-h-screen">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 space-y-6">
        {skeletonCards.map((_, index) => (
          <Card key={index} className="bg-white shadow-sm w-[280px] h-[200px]">
            <CardContent className="p-6 flex flex-col gap-2">
              <div className="flex items-center gap-4">
                {/* Avatar skeleton */}
                <Skeleton className="w-[73px] h-[72px] rounded-xl mr-4" />
                
                {/* Name and position skeleton */}
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-5 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              </div>
              
              {/* Contact info skeleton */}
              <div className="mt-6 grid grid-cols-2 gap-4">
                <div className="flex items-center gap-2">
                  <Skeleton className="h-8 w-8 rounded-lg" />
                  <Skeleton className="h-4 w-16" />
                </div>
                <div className="flex items-center gap-2">
                  <Skeleton className="h-8 w-8 rounded-lg" />
                  <Skeleton className="h-4 w-16" />
                </div>
                <Skeleton className="h-4 w-12" />
                <Skeleton className="h-4 w-12" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default EmployeeCardSkeleton;