import React, { useState, useMemo } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { UserPlus, Columns, Download, Search } from "lucide-react";
import { RecruitmentType } from "@/lib/enums";
import { debounce } from "lodash";
import { Recruitment } from "@/types/recruitment";
import { Column } from "@/types/tables";
import { DataTable } from "../common/DataTable";
import StepProgress from "../common/StepProgress";

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

  const formatDate = (dateString: string) => {
    if (!dateString) return "—";
    const date = new Date(dateString);
    return `${String(date.getDate()).padStart(2, "0")} ${date.toLocaleString(
      "default",
      { month: "short" }
    )} ${date.getFullYear()}`;
  };

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
              <span className="font-semibold text-[12.5px] text-[#8A8A8C]">{row.name}</span>
              <span className="text-[12px] font-normal text-[#8A8A8C]">{row.email}</span>
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

  return (
    <div className="flex flex-col w-full h-full">
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
          <Button variant="outline" size="default" className="cursor-pointer">
            <Columns size={18} className="mr-2" />
            Columns
          </Button>
        </div>
      </div>

      <div className="rounded-lg overflow-hidden h-full w-full flex flex-col">
        <DataTable
          columns={columns}
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
