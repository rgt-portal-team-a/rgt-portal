import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Column } from "@/types/tables";

const DataTableSkeleton = ({
  columns,
  actionBool,
}: {
  columns: Column[];
  actionBool: boolean;
}) => {
  const skeletonColumns = actionBool
    ? [...columns, { key: "actions", header: "Actions" }]
    : columns;

  return (
    <Table>
      <TableHeader>
        <TableRow className="border-none">
          {skeletonColumns.map((column) => (
            <TableHead
              key={column.key}
              className="border-none text-[#A3A7AA] text-xs p-6 text-left animate-pulse "
            >
              {column.header}
            </TableHead>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody>
        {Array.from({ length: 5 }).map((_, rowIndex) => (
          <TableRow key={rowIndex} className="border-none ">
            {skeletonColumns.map((column) => (
              <TableCell
                key={column.key}
                className="border-none text-xs font-semibold text-[#898989] text-nowrap "
              >
                <div className="w-18 p-2 px-4 h-6 bg-gray-200 rounded animate-pulse">
                </div>
              </TableCell>
            ))}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

export default DataTableSkeleton;
