import React from "react";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface RecruitmentTableSkeletonProps {
  rowCount?: number;
  columnCount?: number;
  type?: string;
}

const RecruitmentTableSkeleton: React.FC<RecruitmentTableSkeletonProps> = ({
  rowCount = 5,
  columnCount = 8,
}) => {
  const columns = Array.from({ length: columnCount }, (_, i) => i);
  const rows = Array.from({ length: rowCount }, (_, i) => i);

  return (
    <div className="w-5/6">
      <div className="flex flex-col">
        <div className="flex justify-between items-center mb-4">
          <div>
            <Skeleton className="h-8 w-48 mb-2" />
            <Skeleton className="h-4 w-40" />
          </div>
          <div className="flex items-center gap-4">
            <Skeleton className="h-10 w-48" />
            <Skeleton className="h-10 w-48" />
            <Skeleton className="h-10 w-28" />
            <Skeleton className="h-10 w-28" />
          </div>
        </div>

        <div className="rounded-lg overflow-hidden border border-gray-100 bg-white shadow-sm">
          <Table className="border-collapse min-w-full">
            <TableHeader>
              <TableRow className="border-none bg-gray-50">
                {columns.map((column) => (
                  <TableHead
                    key={column}
                    className="border-none text-gray-500 text-xs font-medium p-5"
                  >
                    <Skeleton className="h-4 w-24" />
                  </TableHead>
                ))}
                <TableHead className="border-none text-gray-500 text-xs font-medium p-5">
                  <Skeleton className="h-4 w-16" />
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((row) => (
                <TableRow key={row} className="border-none hover:bg-gray-50">
                  {columns.map((column) => (
                    <TableCell
                      key={`${row}-${column}`}
                      className="border-none text-xs font-semibold text-gray-600 py-4"
                    >
                      {column === 0 ? (
                        <div className="flex items-center gap-3">
                          <Skeleton className="w-8 h-8 rounded-full" />
                          <div className="flex flex-col">
                            <Skeleton className="h-4 w-24 mb-1" />
                            <Skeleton className="h-3 w-32" />
                          </div>
                        </div>
                      ) : (
                        <Skeleton className="h-4 w-20" />
                      )}
                    </TableCell>
                  ))}
                  <TableCell className="border-none">
                    <div className="flex space-x-1">
                      <Skeleton className="h-6 w-6 rounded-md" />
                      <Skeleton className="h-6 w-6 rounded-md" />
                      <Skeleton className="h-6 w-6 rounded-md" />
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          <div className="flex items-center justify-between py-5 px-4">
            <Skeleton className="h-4 w-48" />
            <div className="flex items-center space-x-2">
              <Skeleton className="h-8 w-8 rounded-full" />
              {Array.from({ length: 5 }, (_, i) => (
                <Skeleton key={i} className="h-6 w-6 rounded-md" />
              ))}
              <Skeleton className="h-8 w-8 rounded-full" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecruitmentTableSkeleton;
