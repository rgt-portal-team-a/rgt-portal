import { Skeleton } from "@/components/ui/skeleton";

const AllDepartmentsSkeleton = () => {
  return (
    <main className="p-4">
      {/* Header and Search Area */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6">
        <Skeleton className="h-8 w-48" /> {/* Department Title */}
        <div className="relative w-full px-2 md:max-w-md">
          <Skeleton className="w-full h-10 rounded-md" /> {/* Search Input */}
        </div>
      </div>

      {/* Department Cards Grid */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1, 2, 3, 4, 5, 6].map((item) => (
          <div key={item} className="border rounded-lg p-4 space-y-4">
            <div className="flex justify-between items-center">
              <Skeleton className="h-6 w-1/2" /> {/* Department Name */}
              <Skeleton className="h-6 w-12" /> {/* Members Count */}
            </div>

            <div className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </div>

            <div className="flex justify-between">
              <Skeleton className="h-8 w-20" /> {/* Action Button */}
              <Skeleton className="h-8 w-20" /> {/* Action Button */}
            </div>
          </div>
        ))}
      </section>

      {/* Pagination */}
      <section className="mt-8 flex justify-center items-center">
        <div className="flex space-x-2">
          {[1, 2, 3].map((page) => (
            <Skeleton key={page} className="h-10 w-10 rounded-full" />
          ))}
        </div>
      </section>
    </main>
  );
};

export default AllDepartmentsSkeleton;
