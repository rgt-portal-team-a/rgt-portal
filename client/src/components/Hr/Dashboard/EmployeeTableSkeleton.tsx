import React from 'react'
import { Skeleton } from "@/components/ui/skeleton"
import { Search } from "lucide-react"

const EmployeeTableSkeleton: React.FC = () => {
    const skeletonRows = Array(5).fill(null)

    return (
    <div className="p-6 bg-white rounded-lg">
        {/* Header Section */}
        <div className="mb-6">
            <div className="flex w-full justify-between items-center">
                <Skeleton className="h-10 w-[200px] mb-6" />
                <div className="relative justify-between items-center sm:w-[100px] md:w-[301px] md:max-w-[301px] flex-grow">
                <Skeleton className="h-14 w-full rounded-xl" />
                <Search className="absolute right-4 top-4 h-6 w-6 text-gray-400" />
                </div>
            </div>
            
            {/* Filters Section */}
            <div className="flex flex-col gap-8 sm:flex-row sm:items-center mb-6">
                <div className="flex w-full gap-1 md:gap-3 justify-between items-center my-4 md:my-8">
                {/* Department Filter Skeleton */}
                <Skeleton className="w-[320px] h-[50px] rounded-lg" />
                
                {/* Type Filter Skeleton */}
                <Skeleton className="w-[320px] h-[50px] rounded-lg" />
                
                {/* Status Filter Skeleton */}
                <Skeleton className="w-[320px] h-[50px] rounded-lg" />
                
                {/* Reset Button Skeleton */}
                <Skeleton className="w-[100px] h-[50px] rounded-lg" />
                </div>
            </div>
        </div>
        
        {/* Table Skeleton */}
        <div className="space-y-4">
        {/* Table Header */}
        <div className="flex mb-4">
            {['Employee Name', 'Department', 'Role', 'Type', 'Status', 'Actions'].map((_header, index) => (
            <Skeleton key={index} className="h-8 flex-1 mr-4" />
            ))}
        </div>
        
        {/* Table Rows */}
        {skeletonRows.map((_, index) => (
            <div key={index} className="flex items-center mb-4 space-x-4">
            <Skeleton className="h-12 w-12 rounded-full" />
            <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
            </div>
            <Skeleton className="h-4 w-1/6 mx-4" />
            <Skeleton className="h-4 w-1/6 mx-4" />
            <Skeleton className="h-4 w-1/6 mx-4" />
            <Skeleton className="h-4 w-1/6 mx-4" />
            <div className="flex space-x-2">
                <Skeleton className="h-8 w-16" />
                <Skeleton className="h-8 w-16" />
            </div>
            </div>
        ))}
        </div>
        
        {/* Pagination Skeleton */}
        <div className="flex justify-center mt-6">
        <Skeleton className="h-10 w-64" />
        </div>
    </div>
    )
}

export default EmployeeTableSkeleton