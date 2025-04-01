import { Skeleton } from "@/components/ui/skeleton";

const EventsPageSkeleton = () => {
  return (
    <div className="w-full max-w-6xl mx-auto p-4 bg-gray-50">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <Skeleton className="h-8 w-32 mb-1" />
          <Skeleton className="h-4 w-48" />
        </div>
        <Skeleton className="h-10 w-32 rounded-full" />
      </div>

      {/* Main content grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left sidebar */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          {/* Upcoming Events Header */}
          <div className="flex justify-between items-center mb-6">
            <Skeleton className="h-6 w-40" />
            <div className="hidden md:flex gap-1">
              <Skeleton className="h-6 w-6 rounded" />
              <Skeleton className="h-6 w-6 rounded" />
            </div>
          </div>

          {/* Month and year */}
          <div className="flex justify-center mb-4">
            <Skeleton className="h-5 w-24" />
          </div>

          {/* Calendar header */}
          <div className="grid grid-cols-7 mb-2">
            {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((_, i) => (
              <div key={`day-header-${i}`} className="text-center">
                <Skeleton className="h-4 w-6 mx-auto" />
              </div>
            ))}
          </div>

          {/* Calendar days */}
          <div className="grid grid-cols-7 gap-y-2 mb-8">
            {[...Array(42)].map((_, i) => (
              <div key={`day-${i}`} className="text-center">
                <Skeleton className="h-8 w-8 rounded-full mx-auto" />
              </div>
            ))}
          </div>

          {/* Special Events */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-4">
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-5 w-5 rounded" />
            </div>
            <div className="flex justify-center py-4">
              <Skeleton className="h-5 w-32" />
            </div>
          </div>

          {/* Announcements */}
          <div>
            <div className="mb-4">
              <Skeleton className="h-6 w-36" />
            </div>
            <div className="flex justify-center py-4">
              <Skeleton className="h-5 w-32" />
            </div>
          </div>
        </div>

        {/* Main calendar view - takes up 2/3 of the space */}
        <div className="md:col-span-2 bg-white rounded-lg shadow-sm p-6">
          {/* Month view header */}
          <div className="flex justify-between items-center mb-4">
            <Skeleton className="h-6 w-32" />
            <div className="flex items-center gap-2">
              <Skeleton className="h-6 w-6 rounded" />
              <Skeleton className="h-6 w-6 rounded" />
            </div>
          </div>


          {/* Calendar header - days of week */}
          <div className="grid grid-cols-7 mb-4">
            {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((_, i) => (
              <div key={`header-${i}`} className="text-center">
                <Skeleton className="h-5 w-12 mx-auto" />
              </div>
            ))}
          </div>

          {/* First week date numbers */}
          <div className="grid grid-cols-7 mb-1">
            {[...Array(7)].map((_, i) => (
              <div key={`week1-${i}`} className="text-center py-2">
                <Skeleton className="h-6 w-6 mx-auto rounded-full" />
              </div>
            ))}
          </div>

          {/* Calendar grid - 6 weeks, 7 days each */}
          {[...Array(6)].map((_, weekIndex) => (
            <div
              key={`week-${weekIndex}`}
              className="grid grid-cols-7 border-t"
            >
              {[...Array(7)].map((_, dayIndex) => (
                <div
                  key={`cell-${weekIndex}-${dayIndex}`}
                  className="min-h-24 border-r border-b p-2"
                >
                  {/* Random event skeletons */}
                  {Math.random() > 0.8 && (
                    <Skeleton className="h-10 w-full rounded-md mt-4" />
                  )}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default EventsPageSkeleton;
