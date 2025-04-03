/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useMemo } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import {
  UserPlus,
  Eye,
  Edit,
  Trash2,
  Filter,
  Columns,
  ChevronLeft,
  ChevronRight,
  Download,
  Search,
} from "lucide-react";
import { RecruitmentType } from "@/lib/enums";
import { debounce } from "lodash";
import { Recruitment } from "@/types/recruitment";

interface Column {
  key: string;
  header: string;
  render?: (row: any) => React.ReactNode;
  cellClassName?: string | ((row: any) => string);
}

interface RecruitmentTableProps {
  candidates: Recruitment[];
  type: RecruitmentType;
  onView: (id: string) => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onAddNew: () => void;
  currentPage: number;
  totalPages: number;
  totalItems: number;
  onPageChange: (page: number) => void;
  onSearch: (term: string) => void;
}

const RecruitmentTable: React.FC<RecruitmentTableProps> = ({
  candidates,
  type,
  onView,
  onEdit,
  onDelete,
  onAddNew,
  currentPage,
  totalPages,
  totalItems,
  onPageChange,
  onSearch,
}) => {
  const [searchTerm, setSearchTerm] = useState("");

  const debouncedSearch = useMemo(
    () =>
      debounce((term: string) => {
        onSearch(term);
      }, 500),
    [onSearch]
  );

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    debouncedSearch(value);
  };

  const columns = useMemo(() => {
    const commonColumns: Column[] = [
      {
        key: "name",
        header: "Employee Name",
        render: (row) => (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gray-200 rounded-full overflow-hidden">
              {row.photoUrl ? (
                <img
                  src={row.photoUrl}
                  alt={row.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gray-300 flex items-center justify-center text-gray-600">
                  {row.name.charAt(0)}
                </div>
              )}
            </div>
            <div className="flex flex-col">
              <span className="font-medium text-gray-800">{row.name}</span>
              <span className="text-xs text-gray-500">{row.email}</span>
            </div>
          </div>
        ),
      },
      {
        key: "phoneNumber",
        header: "Phone Number",
      },
      {
        key: "dateCreated",
        header: "Date Created",
        render: (row) => formatDate(row.createdAt),
      },
      {
        key: "cv",
        header: "CV",
        render: (row) => (
          <div className="flex items-center">
            {row.cvPath ? (
              <>
                <span className="text-gray-600">CV.pdf</span>
                <a
                  href={row.cvPath}
                  target="_blank"
                  rel="noreferrer"
                  className="ml-2"
                >
                  <Download
                    className="cursor-pointer hover:transform hover:scale-110"
                    size={12}
                    color="#6B7280"
                  />
                </a>
              </>
            ) : (
              <span className="text-gray-400">Not available</span>
            )}
          </div>
        ),
      },
      {
        key: "location",
        header: "Location",
      },
    ];

    if (type === RecruitmentType.EMPLOYEE) {
      return [
        ...commonColumns,
        {
          key: "source",
          header: "Source",
        },
        {
          key: "currentStatus",
          header: "Status",
        },
        {
          key: "position",
          header: "Position",
        },
        {
          key: "failStage",
          header: "Fail Stage",
        },
      ];
    } else {
      return [
        ...commonColumns,
        {
          key: "university",
          header: "University",
          render: (row) => row.university || "—",
        },
        {
          key: "firstPriority",
          header: "First Priority",
        },
        {
          key: "secondPriority",
          header: "Second Priority",
        },
        {
          key: "failStage",
          header: "Fail Stage",
        },
      ];
    }
  }, [type]);

  const formatDate = (dateString: string) => {
    if (!dateString) return "—";
    const date = new Date(dateString);
    return `${String(date.getDate()).padStart(2, "0")} ${date.toLocaleString(
      "default",
      { month: "short" }
    )} ${date.getFullYear()}`;
  };

  console.log("====================================");
  console.log(
    "totalItems",
    totalItems,
    "totalPages",
    totalPages,
    "currentPage",
    currentPage
  );
  console.log("====================================");

  return (
    <div className="w-full">
      <div className="flex flex-col w-full">
        <div className="flex flex-col gap-2 lg:gap-0 lg:flex-row justify-between lg:items-center mb-4">
          <div>
            <h1 className="text-xl font-semibold text-gray-700">
              {type === RecruitmentType.EMPLOYEE
                ? "EMPLOYEE CANDIDATES"
                : "NSS CANDIDATES"}
            </h1>
            <p className="text-gray-500 text-sm">
              {totalItems} {totalItems === 1 ? "candidate" : "candidates"} found
            </p>
          </div>
          <div className="flex lg:flex-row flex-wrap lg:flex-nowrap items-center gap-4">
            <div className="relative w-full">
              <Input
                type="text"
                placeholder="Search candidates"
                className="pl-10 pr-4 py-2 w-full rounded-md border border-gray-300"
                value={searchTerm}
                onChange={handleSearchChange}
              />
              <div className="absolute inset-y-0 left-3 flex items-center">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
            </div>
            <Button
              variant="default"
              size="lg"
              className="bg-purple-700 hover:bg-purple-800"
              onClick={onAddNew}
            >
              <UserPlus size={18} className="mr-2" />
              Add New Candidate
            </Button>
            <Button variant="outline" size="default">
              <Columns size={18} className="mr-2" />
              Columns
            </Button>
            <Button variant="outline" size="default">
              <Filter size={18} className="mr-2" />
              Filter
            </Button>
          </div>
        </div>

        <div className="rounded-lg overflow-hidden border border-gray-100 bg-white shadow-sm">
          {candidates.length === 0 ? (
            <div className="py-16 text-center min-w-full">
              <p className="text-gray-500">No candidates found.</p>
            </div>
          ) : (
            <Table className="border-collapse min-w-full">
              <TableHeader>
                <TableRow className="border-none bg-gray-50">
                  {columns.map((column) => (
                    <TableHead
                      key={column.key}
                      className="border-none text-gray-500 text-xs font-medium p-5"
                    >
                      {column.header}
                    </TableHead>
                  ))}
                  <TableHead className="border-none text-gray-500 text-xs font-medium p-5">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {candidates.map((candidate) => (
                  <TableRow
                    key={candidate.id}
                    className="border-none hover:bg-gray-50"
                  >
                    {columns.map((column) => (
                      <TableCell
                        key={`${candidate.id}-${column.key}`}
                        className="border-none text-xs font-semibold text-gray-600 py-4"
                      >
                        <div className={`w-fit`}>
                          {column.render
                            ? column.render(candidate)
                            : candidate[column.key as keyof Recruitment] || "—"}
                        </div>
                      </TableCell>
                    ))}
                    <TableCell className="border-none">
                      <div className="flex space-x-1">
                        <button
                          className="bg-[#FFA6CD] text-white p-[3px] rounded-md hover:bg-pink-400 duration-300 ease-in transition-colors cursor-pointer"
                          onClick={() => onView(candidate.id)}
                        >
                          <Eye size={14} color="white" />
                        </button>
                        <button
                          className="bg-[#C0AFFF] text-white p-[3px] rounded-md hover:bg-purple-300 duration-300 ease-in transition-colors cursor-pointer"
                          onClick={() => onEdit(candidate.id)}
                        >
                          <Edit size={14} color="white" />
                        </button>
                        <button
                          className="bg-[#EB2E31] text-white p-[3px] rounded-md hover:bg-red-500 duration-300 ease-in cursor-pointer transition-colors"
                          onClick={() => onDelete(candidate.id)}
                        >
                          <Trash2 size={14} color="white" />
                        </button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}

          <div className="flex items-center justify-between py-5 px-4">
            <div className="text-sm text-gray-600">
              Showing {candidates.length} of {totalItems} entries
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={() => onPageChange(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="text-gray-500 p-2 rounded-full hover:bg-gray-100 disabled:opacity-30"
              >
                <ChevronLeft size={20} />
              </button>

              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const pageOffset = Math.min(
                  Math.max(0, currentPage - 3),
                  Math.max(0, totalPages - 5)
                );
                const pageNum = i + 1 + pageOffset;

                return (
                  <button
                    key={pageNum}
                    onClick={() => onPageChange(pageNum)}
                    className={`w-6 h-6 flex text-sm items-center justify-center rounded-md transition-all ${
                      currentPage === pageNum
                        ? "bg-rgtpurpleaccent2 text-white font-bold"
                        : "text-gray-700"
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}

              <button
                onClick={() =>
                  onPageChange(Math.min(totalPages, currentPage + 1))
                }
                disabled={currentPage === totalPages}
                className="text-gray-500 p-2 rounded-full hover:bg-gray-100 disabled:opacity-30"
              >
                <ChevronRight size={20} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecruitmentTable;
