import React from 'react'
import { Skeleton } from "@/components/ui/skeleton"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

const DepartmentPageSkeleton: React.FC = () => {
const skeletonRows = Array(5).fill(null)

return (
  <div className="w-full space-y-4">
    <div className="h-[62px] flex justify-between items-center py-1">
      <Skeleton className="h-10 w-[200px]" />
      <div className="flex space-x-2">
        <Skeleton className="h-10 w-[100px]" />
        <Skeleton className="h-10 w-[100px]" />
      </div>
    </div>

    <div className="border flex flex-col rounded-lg py-6">
        <div className="flex mb-4 px-[22px] gap-3 justify-between items-center">
            <Skeleton className="w-[320px] py-[25px] rounded-lg"/>
            <Skeleton className="w-[320px] py-[25px] rounded-lg"/>
            <Skeleton className="w-[320px] py-[25px] rounded-lg"/>
            <Skeleton className="w-[320px] py-[25px] rounded-lg"/>
            <Skeleton className="w-[100px] py-[25px] rounded-lg"/>
        </div>
      <Table>
        <TableHeader>
          <TableRow>
            {['Employee Name', 'Role', 'Type', 'Position Status', 'Status', 'Actions'].map((header) => (
              <TableHead key={header} className="font-bold">{header}</TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {skeletonRows.map((_, index) => (
            <TableRow key={index}>
              <TableCell>
                <div className="flex items-center space-x-3">
                  <Skeleton className="h-10 w-10 px-4 py-4  rounded-full" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-[150px] px-4 py-4 " />
                    <Skeleton className="h-3 w-[100px] px-4 py-4 " />
                  </div>
                </div>
              </TableCell>
              <TableCell><Skeleton className="h-4 w-[100px] px-4 py-4 " /></TableCell>
              <TableCell><Skeleton className="h-4 w-[80px] px-4 py-4 " /></TableCell>
              <TableCell><Skeleton className="h-4 w-[100px] px-4 py-4 " /></TableCell>
              <TableCell><Skeleton className="h-4 w-[60px] px-4 py-4 " /></TableCell>
              <TableCell>
                <Skeleton className="h-8 w-[80px] rounded-md px-4 py-4 " />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  </div>
)
}

export default DepartmentPageSkeleton