import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const EmployeeManagementTableSkeleton = () => {
  const skeletonRows = Array(5).fill(null);

  return (
    <div className="rounded-md ">
      <Table>
        <TableHeader>
          <TableRow className={`border-none`}>
            {[1, 2, 3, 4, 5]?.map((_, index) => (
              <TableHead key={index} className={`border-none`}>
                <Skeleton className="h-4 w-24" />
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {skeletonRows.map((_, rowIndex) => (
            <TableRow key={rowIndex} className=" p-2 px-4 space-x-4 gap-2">
              <TableCell>
                <div className="flex items-center">
                  <Skeleton className="w-8 h-8 rounded-full mr-2" />
                  <div>
                    <Skeleton className="h-4 w-24 mb-1" />
                    <Skeleton className="h-3 w-32" />
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <Skeleton className="h-4 w-28" />
              </TableCell>

              <TableCell>
                <Skeleton className="h-4 w-32" />
              </TableCell>

              <TableCell className="hidden md:table-cell">
                <Skeleton className="h-4 w-24" />
              </TableCell>
              <TableCell>
                <div className="flex space-x-2">
                  <Skeleton className="h-8 w-8 rounded-md" />
                  <Skeleton className="h-8 w-8 rounded-md" />
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default EmployeeManagementTableSkeleton;
// {
//   /* City */
// }
// <TableCell className="hidden md:table-cell">
//   <Skeleton className="h-4 w-20" />
// </TableCell>;

// {
//   /* Home Address */
// }
// <TableCell className="hidden md:table-cell">
//   <Skeleton className="h-4 w-40" />
// </TableCell>;

// {
//   /* Region */
// }
// <TableCell className="hidden md:table-cell">
//   <Skeleton className="h-4 w-20" />
// </TableCell>;

// {
//   /* Country */
// }
// <TableCell className="hidden md:table-cell">
//   <Skeleton className="h-4 w-20" />
// </TableCell>;

// {
//   /* Start Date */
// }
// <TableCell className="hidden md:table-cell">
//   <Skeleton className="h-6 w-24 rounded-md" />
// </TableCell>;

// {
//   /* Seniority */
// }
// <TableCell className="hidden md:table-cell">
//   <Skeleton className="h-4 w-16" />
// </TableCell>;

// {
//   /* Skills */
// }
// <TableCell className="hidden md:table-cell">
//   <Skeleton className="h-4 w-32" />
// </TableCell>;

// {
//   /* FT/PT */
// }
// <TableCell className="hidden md:table-cell">
//   <div className="flex items-center">
//     <Skeleton className="h-4 w-10 mr-2" />
//     <Skeleton className="h-3 w-3 rounded-full" />
//   </div>
// </TableCell>;

// {
//   /* Department */
// }
// <TableCell className="hidden md:table-cell">
//   <Skeleton className="h-4 w-24" />
// </TableCell>;

// {
//   /* Team Leader */
// }
// <TableCell className="hidden md:table-cell">
//   <Skeleton className="h-4 w-24" />
// </TableCell>;

// {
//   /* Jr. Team Leader */
// }
// <TableCell className="hidden md:table-cell">
//   <Skeleton className="h-4 w-24" />
// </TableCell>;

// {
//   /* Notes */
// }
// <TableCell className="hidden md:table-cell">
//   <Skeleton className="h-4 w-32" />
// </TableCell>;

// {
//   /* Agency */
// }
// <TableCell className="hidden md:table-cell">
//   <Skeleton className="h-4 w-24" />
// </TableCell>;

// {
//   /* Got Invoice */
// }
// <TableCell className="hidden md:table-cell">
//   <div className="flex justify-center">
//     <Skeleton className="h-6 w-6 rounded-md" />
//   </div>
// </TableCell>;

// {
//   /* Paid */
// }
// <TableCell className="hidden md:table-cell">
//   <div className="flex justify-center">
//     <Skeleton className="h-6 w-6 rounded-md" />
//   </div>
// </TableCell>;

// {
//   /* On Leave */
// }
// <TableCell className="hidden md:table-cell">
//   <div className="flex justify-center">
//     <Skeleton className="h-6 w-6 rounded-md" />
//   </div>
// </TableCell>;

// {
//   /* End Date */
// }
// <TableCell className="hidden md:table-cell">
//   <Skeleton className="h-4 w-24" />
// </TableCell>;

// {
//   /* Duration */
// }
// <TableCell className="hidden md:table-cell">
//   <Skeleton className="h-4 w-16" />
// </TableCell>;

// {
//   /* Reason for Leave */
// }
// <TableCell className="hidden md:table-cell">
//   <div className="flex items-center">
//     <Skeleton className="h-4 w-24 mr-2" />
//     <Skeleton className="h-3 w-3 rounded-full" />
//   </div>
// </TableCell>;

// {
//   /* Leave Explanation */
// }
// <TableCell className="hidden md:table-cell">
//   <Skeleton className="h-4 w-32" />
// </TableCell>;
