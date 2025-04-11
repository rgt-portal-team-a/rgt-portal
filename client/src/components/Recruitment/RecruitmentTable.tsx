import React, { useState, useMemo, useCallback } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { UserPlus, Download, Search, Check, Eye } from "lucide-react";
import { RecruitmentType } from "@/lib/enums";
import { debounce } from "lodash";
import { Recruitment } from "@/types/recruitment";
import { Column } from "@/types/tables";
import { DataTable } from "../common/DataTable";
import StepProgress from "../common/StepProgress";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";

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

  const [visibleColumns, setVisibleColumns] = useState<string[]>([
    "name",
    "phoneNumber",
    "dateCreated",
    "cv",
    "location",
    "failStage",
  ]);
  const [columnSearchTerm, setColumnSearchTerm] = useState("");

  // const [filters, setFilters] = useState({
  //   status: "",
  //   source: "",
  //   position: "",
  //   university: "",
  //   failStage: "",
  // });

  // const handleFilterChange = (filterName: string, value: string) => {
  //   setFilters((prev) => ({
  //     ...prev,
  //     [filterName]: value,
  //   }));
  // };

  // const handleResetFilters = () => {
  //   setFilters({
  //     status: "",
  //     source: "",
  //     position: "",
  //     university: "",
  //     failStage: "",
  //   });
  // };

  // const filterConfigs: FilterConfig[] = useMemo(() => {
  //   const commonFilters = [
  //     {
  //       type: "select" as const,
  //       options: [
  //         { label: "All Statuses", value: "" },
  //         ...Array.from(new Set(candidates.map((c) => c.currentStatus)))
  //           .filter(Boolean)
  //           .map((status) => ({ label: status || "", value: status || "" })),
  //       ],
  //       value: filters.status,
  //       onChange: (value: string) => handleFilterChange("status", value),
  //       placeholder: "Status",
  //     },
  //     {
  //       type: "select" as const,
  //       options: [
  //         { label: "All Sources", value: "" },
  //         ...Array.from(new Set(candidates.map((c) => c.source)))
  //           .filter(Boolean)
  //           .map((source) => ({ label: source || "", value: source || "" })),
  //       ],
  //       value: filters.source,
  //       onChange: (value: string) => handleFilterChange("source", value),
  //       placeholder: "Source",
  //     },
  //   ];

  //   if (type === RecruitmentType.EMPLOYEE) {
  //     commonFilters.push({
  //       type: "select" as const,
  //       options: [
  //         { label: "All Positions", value: "" },
  //         ...Array.from(new Set(candidates.map((c) => c.position)))
  //           .filter(Boolean)
  //           .map((pos) => ({ label: pos || "", value: pos || "" })),
  //       ],
  //       value: filters.position,
  //       onChange: (value: string) => handleFilterChange("position", value),
  //       placeholder: "Position",
  //     });
  //   } else {
  //     commonFilters.push({
  //       type: "select" as const,
  //       options: [
  //         { label: "All Universities", value: "" },
  //         ...Array.from(new Set(candidates.map((c) => c.university)))
  //           .filter(Boolean)
  //           .map((uni) => ({ label: uni || "", value: uni || "" })),
  //       ],
  //       value: filters.university,
  //       onChange: (value: string) => handleFilterChange("university", value),
  //       placeholder: "University",
  //     });
  //   }

  //   commonFilters.push({
  //     type: "select" as const,
  //     options: [
  //       { label: "All Fail Stages", value: "" },
  //       ...Array.from(new Set(candidates.map((c) => c.failStage)))
  //         .filter(Boolean)
  //         .map((stage) => ({ label: stage || "", value: stage || "" })),
  //     ],
  //     value: filters.failStage,
  //     onChange: (value: string) => handleFilterChange("failStage", value),
  //     placeholder: "Fail Stage",
  //   });

  //   return commonFilters;
  // }, [candidates, type, filters]);

  const toggleArrayState = useCallback(
    <T,>(setState: React.Dispatch<React.SetStateAction<T[]>>, item: T) => {
      setState((prev) =>
        prev.includes(item) ? prev.filter((i) => i !== item) : [...prev, item]
      );
    },
    []
  );

  const toggleColumnVisibility = useCallback(
    (columnKey: string) => {
      toggleArrayState(setVisibleColumns, columnKey);
    },
    [toggleArrayState]
  );

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

  const formatDate = (dateString: string) => {
    if (!dateString) return "—";
    const date = new Date(dateString);
    return `${String(date.getDate()).padStart(2, "0")} ${date.toLocaleString(
      "default",
      { month: "short" }
    )} ${date.getFullYear()}`;
  };

  // const filteredCandidates = useMemo(() => {
  //   return candidates.filter((candidate) => {
  //     return (
  //       (!filters.status || candidate.currentStatus === filters.status) &&
  //       (!filters.source || candidate.source === filters.source) &&
  //       (!filters.position || candidate.position === filters.position) &&
  //       (!filters.university || candidate.university === filters.university) &&
  //       (!filters.failStage || candidate.failStage === filters.failStage)
  //     );
  //   });
  // }, [candidates, filters]);

  const formatedCandidates = candidates.map((candidate) => ({
    ...candidate,
    failStage: candidate.failStage || "—",
    failReason: candidate.failReason || "—",
  }));

  const columns = useMemo<Column[]>(() => {
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
                <div className="w-full h-full bg-purple-200 flex items-center justify-center text-purple-500">
                  {row.name.charAt(0)}
                </div>
              )}
            </div>
            <div className="flex flex-col">
              <span className="font-semibold text-[12.5px] text-[#8A8A8C]">
                {row.name}
              </span>
              <span className="text-[12px] font-normal text-[#8A8A8C]">
                {row.email}
              </span>
            </div>
          </div>
        ),
      },
      { key: "phoneNumber", header: "Phone Number" },
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
      { key: "location", header: "Location" },
    ];

    return type === RecruitmentType.EMPLOYEE
      ? [
          ...commonColumns,
          { key: "source", header: "Source" },
          { key: "currentStatus", header: "Status" },
          { key: "position", header: "Position" },
          { key: "failStage", header: "Fail Stage" },
        ]
      : [
          ...commonColumns,
          {
            key: "university",
            header: "University",
            render: (row) => row.university || "—",
          },
          { key: "firstPriority", header: "First Priority" },
          { key: "secondPriority", header: "Second Priority" },
          { key: "failStage", header: "Fail Stage" },
        ];
  }, [type]);

  const showAllColumns = useCallback(() => {
    setVisibleColumns(columns.map((col) => col.key));
  }, [columns]);

  const hideAllColumns = useCallback(() => {
    setVisibleColumns(["name"]);
  }, []);

  const resetColumns = useCallback(() => {
    setVisibleColumns([
      "name",
      "phoneNumber",
      "dateCreated",
      "cv",
      "location",
      "failStage",
    ]);
  }, []);

  const filteredColumnOptions = useMemo(() => {
    return columns.filter((col) =>
      col.header.toLowerCase().includes(columnSearchTerm.toLowerCase())
    );
  }, [columns, columnSearchTerm]);

  // Filter columns based on visibility
  const visibleColumnsData = useMemo(() => {
    return columns.filter((col) => visibleColumns.includes(col.key));
  }, [columns, visibleColumns]);

  return (
    <div className="flex flex-col w-full h-full ">
      <div className="flex flex-col gap-2 lg:gap-0 lg:flex-row justify-between lg:items-center mb-4">
        <div>
          <h1 className="text-xl font-semibold text-gray-700">
            {type === RecruitmentType.EMPLOYEE
              ? "CANDIDATES"
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
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                size="default"
                className="cursor-pointer text-slate-500"
              >
                <Eye size={25} />
                Columns
              </Button>
            </PopoverTrigger>
            <PopoverContent
              className="w-64 p-0 rounded-xl bg-gradient-to-tr from-[#FFFBEB] via-[#F2FBFF] to-[#F7FEFF]"
              align="end"
            >
              <div className="p-4">
                <div className="flex justify-between items-center mb-4">
                  <button
                    className="text-sm font-medium text-gray-700"
                    onClick={() =>
                      visibleColumns.length === columns.length
                        ? hideAllColumns()
                        : showAllColumns()
                    }
                  >
                    {visibleColumns.length === columns.length
                      ? "Hide All"
                      : "Show All"}
                  </button>
                  <button
                    className="text-sm text-gray-500 cursor-pointer"
                    onClick={resetColumns}
                  >
                    Reset
                  </button>
                </div>
                <div className="relative">
                  <Search
                    className="absolute left-4 top-3 text-gray-400"
                    size={17}
                  />
                  <Input
                    placeholder="Search"
                    className="pl-10 bg-white shadow-none border rounded-md w-full py-5"
                    value={columnSearchTerm}
                    onChange={(e) => setColumnSearchTerm(e.target.value)}
                  />
                </div>
              </div>
              <div className="max-h-[300px] overflow-y-auto py-1">
                {filteredColumnOptions.map((column) => (
                  <div
                    key={column.key}
                    className="flex items-center px-4 py-4 hover:bg-gray-100"
                  >
                    <button
                      className={`flex items-center justify-center w-5 h-5 mr-3 rounded ${
                        visibleColumns.includes(column.key)
                          ? "bg-green-500 text-white"
                          : "bg-gray-200"
                      }`}
                      onClick={() => toggleColumnVisibility(column.key)}
                    >
                      {visibleColumns.includes(column.key) && (
                        <Check className="h-3 w-3" />
                      )}
                    </button>
                    <span className="text-sm">{column.header}</span>
                  </div>
                ))}
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>

      <div className="rounded-lg overflow-hidden h-full w-full flex flex-col">
        {/* <Filters filters={filterConfigs} onReset={handleResetFilters} /> */}
        <DataTable
          columns={visibleColumnsData}
          data={formatedCandidates}
          dividers={false}
          actionBool={true}
          actionObj={[
            {
              name: "view",
              action: (id?: number) => {
                if (id !== undefined) {
                  onView(String(id));
                }
              },
            },
            {
              name: "edit",
              action: (id?: number) => {
                if (id !== undefined) {
                  onEdit(String(id));
                }
              },
            },
            {
              name: "delete",
              action: (id?: number) => {
                if (id !== undefined) {
                  onDelete(String(id));
                }
              },
            },
          ]}
          loading={false}
        />
      </div>
      <div className="flex items-center justify-center px-4 w-full">
        <StepProgress
          currentPage={currentPage}
          setCurrentPage={onPageChange}
          totalPages={totalPages}
        />
      </div>
    </div>
  );
};

export default RecruitmentTable;
