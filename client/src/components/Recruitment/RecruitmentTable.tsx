/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useMemo, useEffect } from "react";
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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Check } from "lucide-react";
import StepProgress from "@/components/common/StepProgress";


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
  const [searchByFields, setSearchByFields] = useState<string[]>([]);
  const [columnSearchTerm, setColumnSearchTerm] = useState("");

  const [visibleColumns, setVisibleColumns] = useState<string[]>([]);
  const [columnFilterTerm, setColumnFilterTerm] = useState("");

  const itemsPerPage = 5; 




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


  useEffect(() => {
    setVisibleColumns(columns.map((col) => col.key));
  }, [columns]);

  // Column visibility functions
  const toggleColumnVisibility = (columnKey: string) => {
    setVisibleColumns((prev) =>
      prev.includes(columnKey)
        ? prev.filter((key) => key !== columnKey)
        : [...prev, columnKey]
    );
  };


  const showAllColumns = () => setVisibleColumns(columns.map((col) => col.key));
  const hideAllColumns = () => setVisibleColumns([]);
  const resetColumns = () => setVisibleColumns(columns.map((col) => col.key));

  const filteredColumns = useMemo(() => {
    return columns.filter((col) => visibleColumns.includes(col.key));
  }, [columns, visibleColumns]);


  useEffect(() => {
    if (searchByFields.length === 0 && searchTerm) {
      setSearchByFields(['name']); 
    }
  }, [searchTerm, searchByFields]);


  // const debouncedSearch = useMemo(
  //   () =>
  //     debounce((term: string) => {
  //       onSearch(term);
  //     }, 500),
  //   [onSearch]
  // );

  // const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  //   const value = e.target.value;
  //   setSearchTerm(value);
  //   debouncedSearch(value);
  // };




  const getCandidateFieldValue = (
    candidate: Recruitment,
    field: string
  ): string => {
    const column = columns.find((col) => col.key === field);

    switch (field) {
      case "name":
        return candidate.name;
      case "phoneNumber":
        return candidate.phoneNumber;
      case "dateCreated":
        return formatDate(candidate.createdAt);
      case "location":
        return candidate.location || "";
      case "position":
        return candidate.position || "";
      case "university":
        return candidate.university || "";
      case "firstPriority":
        return candidate.firstPriority || "";
      case "secondPriority":
        return candidate.secondPriority || "";
      default:
        return String(candidate[field as keyof Recruitment] || "");
    }
  };

  const filteredCandidates = useMemo(() => {
    if (!searchTerm || searchByFields.length === 0) return candidates;

    const lowerSearchTerm = searchTerm.toLowerCase().replace(/\s/g, "");

    return candidates.filter((candidate) => {
      return searchByFields.some((field) => {
        const value = getCandidateFieldValue(candidate, field);
        return value.toLowerCase().replace(/\s/g, "").includes(lowerSearchTerm);
      });
    });
  }, [candidates, searchTerm, searchByFields]);

  const paginatedCandidates = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredCandidates.slice(startIndex, endIndex);
  }, [filteredCandidates, currentPage, itemsPerPage]);



  // Available searchable fields based on columns
  const searchableFields = useMemo(() => {
    return columns
      .filter(col => col.key !== 'actions'  && col.key !== 'cv')
      .map(col => ({
        key: col.key,
        label: col.header
      }));
  }, [columns]);

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
              Showing {filteredCandidates.length} of {candidates.length}{" "}
              {candidates.length === 1 ? "candidate" : "candidates"}
              {searchTerm && (
                <span className="ml-2">
                  matching <span className="font-medium">"{searchTerm}"</span>
                  {searchByFields.length > 0 && (
                    <span> in {searchByFields.length} fields</span>
                  )}
                </span>
              )}
            </p>
          </div>
          <div className="flex lg:flex-row flex-wrap lg:flex-nowrap items-center gap-4">
            <Button
              variant="default"
              size="lg"
              className="bg-purple-700 py-6 hover:bg-purple-800"
              onClick={onAddNew}
            >
              <UserPlus size={18} className="mr-2" />
              Add New Candidate
            </Button>

            <div className="relative flex items-center gap-2">
              <div className="relative flex-1">
                <Input
                  type="text"
                  placeholder="Search candidates"
                  className="pl-10 pr-4 py-4 w-54 h-full rounded-md border border-gray-300"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <div className="absolute inset-y-0 left-3 flex items-center">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
              </div>

              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="bg-white text-sm text-gray-400 hover:bg-gray-100 rounded-md py-[15px] h-full w-54 sm:w-auto"
                  >
                    <Search className="w-4 h-4 sm:mr-2" size={14} />
                    <span className="">Search Fields</span>
                  </Button>
                </PopoverTrigger>
                <PopoverContent
                  className="w-64 px-2 py-4 rounded-xl bg-gradient-to-tr from-[#FFFBEB] via-[#F2FBFF] to-[#F7FEFF]"
                  align="end"
                >
                  <div className="space-y-4">
                    <Input
                      placeholder="Search fields..."
                      value={columnSearchTerm}
                      onChange={(e) => setColumnSearchTerm(e.target.value)}
                      className="bg-white shadow-none"
                    />
                    <div className="max-h-60 overflow-y-auto">
                      {searchableFields
                        .filter((field) =>
                          field.label
                            .toLowerCase()
                            .includes(columnSearchTerm.toLowerCase())
                        )
                        .map((field) => (
                          <div
                            key={field.key}
                            className="flex items-center p-2 hover:bg-gray-100 rounded cursor-pointer"
                            onClick={() =>
                              setSearchByFields((prev) =>
                                prev.includes(field.key)
                                  ? prev.filter((f) => f !== field.key)
                                  : [...prev, field.key]
                              )
                            }
                          >
                            <button
                              className={`flex items-center justify-center w-5 h-5 mr-3 rounded ${
                                searchByFields.includes(field.key)
                                  ? "bg-green-500 text-white"
                                  : "bg-gray-200"
                              }`}
                            >
                              {searchByFields.includes(field.key) && (
                                <Check className=" h-4 w-4" />
                              )}
                            </button>
                            <span className="text-sm">{field.label}</span>
                          </div>
                        ))}
                    </div>
                  </div>
                </PopoverContent>
              </Popover>
            </div>

            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="bg-white text-sm text-gray-400 hover:bg-gray-100 rounded-xl py-[15px] h-full w-full"
                >
                  <Eye className="w-12 h-12" size={14} />
                  Columns
                </Button>
              </PopoverTrigger>
              <PopoverContent
                className="w-64 px-2 py-4 rounded-xl bg-gradient-to-tr from-[#FFFBEB] via-[#F2FBFF] to-[#F7FEFF]"
                align="end"
              >
                <div className="space-y-4">
                  <div className="flex justify-between items-center px-2">
                    <button
                      onClick={hideAllColumns}
                      className="text-sm text-gray-600 hover:text-gray-800"
                    >
                      Hide All
                    </button>
                    <button
                      onClick={showAllColumns}
                      className="text-sm text-gray-600 hover:text-gray-800"
                    >
                      Show All
                    </button>
                    <button
                      onClick={resetColumns}
                      className="text-sm text-gray-600 hover:text-gray-800"
                    >
                      Reset
                    </button>
                  </div>
                  <Input
                    placeholder="Search columns..."
                    value={columnFilterTerm}
                    onChange={(e) => setColumnFilterTerm(e.target.value)}
                    className="bg-white shadow-none"
                  />
                  <div className="max-h-60 overflow-y-auto">
                    {columns
                      .filter((col) =>
                        col.header
                          .toLowerCase()
                          .includes(columnFilterTerm.toLowerCase())
                      )
                      .map((col) => (
                        <div
                          key={col.key}
                          className="flex items-center p-2 hover:bg-gray-100 rounded cursor-pointer"
                          onClick={() => toggleColumnVisibility(col.key)}
                        >
                          <button
                            className={`flex items-center justify-center w-5 h-5 mr-3 rounded ${
                              visibleColumns.includes(col.key)
                                ? "bg-green-500 text-white"
                                : "bg-gray-200"
                            }`}
                          >
                            {visibleColumns.includes(col.key) && (
                              <Check className=" h-4 w-4" />
                            )}
                          </button>
                          <span className="text-sm">{col.header}</span>
                        </div>
                      ))}
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          </div>
        </div>

        <div className="rounded-2xl py-3 p-2 overflow-hidden border border-gray-100 bg-white shadow-sm">
          {filteredCandidates.length === 0 ? (
            <div className="py-16 text-center min-w-full">
              <p className="text-gray-500">No candidates found.</p>
            </div>
          ) : (
            <>
              <Table className="border-collapse min-w-full">
                <TableHeader>
                  <TableRow className="border-none ">
                    {filteredColumns.map((column) => (
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
                  {paginatedCandidates.map((candidate) => (
                    <TableRow
                      key={candidate.id}
                      className="border-none hover:bg-gray-50"
                    >
                      {filteredColumns.map((column) => (
                        <TableCell
                          key={`${candidate.id}-${column.key}`}
                          className="border-none text-xs font-semibold text-gray-600 py-4"
                        >
                          <div className={`w-fit`}>
                            {column.render
                              ? column.render(candidate)
                              : candidate[column.key as keyof Recruitment] ||
                                "—"}
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
              {/* Pagination Component */}
              <div className="flex justify-between items-center p-4">
                <div className="text-sm text-gray-500">
                  Showing {paginatedCandidates.length} of{" "}
                  {filteredCandidates.length} candidates
                </div>
                <StepProgress
                  currentPage={currentPage}
                  setCurrentPage={onPageChange}
                  totalPages={Math.ceil(
                    filteredCandidates.length / itemsPerPage
                  )}
                />
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default RecruitmentTable;
