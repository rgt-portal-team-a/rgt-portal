import React from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";
import { User } from "lucide-react";

const EmployeePageSkeleton = () => {
  return (
    <div className="bg-slate-100 min-h-screen w-full p-4">
      {/* Profile Header Skeleton */}
      <div className="bg-purple-50 py-6 px-4 mb-4">
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-4">
            {/* Profile Avatar Skeleton */}
            <Skeleton className="w-16 h-16 rounded-full bg-purple-200 flex items-center justify-center">
              <User size={32} className="text-purple-600" />
            </Skeleton>

            {/* Name and Title Skeleton */}
            <div>
              <Skeleton className="h-6 w-48 mb-2 bg-purple-100" />
              <Skeleton className="h-4 w-32 bg-purple-100" />
            </div>
          </div>

          {/* Tabs Skeleton */}
          <div className="flex gap-4">
            <Skeleton className="h-10 w-24 bg-purple-100" />
            <Skeleton className="h-10 w-24 bg-purple-100" />
          </div>

          {/* Edit Button Skeleton */}
          <Skeleton className="w-10 h-10 rounded-full bg-purple-100" />
        </div>
      </div>

      {/* Card Skeleton */}
      <Card className="w-full bg-white shadow-sm rounded-lg overflow-hidden">
        {/* Tabs Indicator Skeleton */}
        <div className="h-12 bg-slate-50 border-b">
          <Skeleton className="h-full w-1/2 bg-purple-100" />
        </div>

        {/* Content Skeleton */}
        <div className="p-6 space-y-4">
          {/* Personal Details Skeleton */}
          <div className="grid grid-cols-2 gap-4">
            {[...Array(6)].map((_, index) => (
              <div key={index} className="space-y-2">
                <Skeleton className="h-4 w-1/2 bg-slate-200" />
                <Skeleton className="h-8 w-full bg-slate-100" />
              </div>
            ))}
          </div>

          {/* Additional Details Skeleton */}
          <div className="mt-6 space-y-4">
            <Skeleton className="h-6 w-1/3 bg-slate-200" />
            <div className="grid grid-cols-3 gap-4">
              {[...Array(3)].map((_, index) => (
                <Skeleton key={index} className="h-24 w-full bg-slate-100" />
              ))}
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default EmployeePageSkeleton;
