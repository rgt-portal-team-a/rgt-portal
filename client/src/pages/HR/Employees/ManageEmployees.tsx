import React, { useState, useCallback, useMemo, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Search, Eye, Check, AlertTriangle, RefreshCw } from "lucide-react";
import EmployeeManagementTable from "@/components/Hr/Employees/EmployeeManagementTable";
import EmployeeCard from "@/components/Hr/Employees/EmployeeCard";
import EmployeeCardSkeleton from "@/components/Hr/Employees/EmployeeCardSkeleton";
import NoEmployeesPage from "@/pages/common/NoEmployeesPage";
import HamburgerMenu from "@/assets/icons/HamburgerMenu";
import GridIcon from "@/assets/icons/GridIcon";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useAllEmployees } from "@/api/query-hooks/employee.hooks";
import EmployeesTableSkeleton from "@/components/Hr/Employees/EmployeesTableSkeleton";
import StepProgress from "@/components/common/StepProgress";

type ViewMode = "table" | "grid";

export const ManageEmployees: React.FC = () => {
  const [viewMode, setViewMode] = useState<ViewMode>("table");

  const [visibleColumns, setVisibleColumns] = useState([
    "name",
    "email",
    "phoneNumber",
    "birthday",
    "startDate",
    "department",
    "onLeave",
  ]);
  const [searchByField, setSearchByField] = useState<string[]>([]);

  const stableSearchByField = useMemo(() => searchByField, [searchByField]);
  const stableVisibleColumns = useMemo(() => visibleColumns, [visibleColumns]);

  const [columnSearchTerm, setColumnSearchTerm] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [gridSearchTerm, setGridSearchTerm] = useState("");
  const [searchFieldSearchTerm, setSearchFieldSearchTerm] = useState("");

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(
    window.innerWidth >= 768 ? 6 : 2
  );

  const handleViewModeChange = useCallback((mode: ViewMode) => {
    setViewMode(mode);
  }, []);

  useEffect(() => {
    const handleResize = () => {
      setItemsPerPage(window.innerWidth >= 768 ? 6 : 2);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Add useEffect to reset page when search term changes
  useEffect(() => {
    setCurrentPage(1);
  }, [gridSearchTerm, viewMode]);

  // Employee Data Fetching - with staleTime to prevent unnecessary refetches
  const {
    data: employees,
    isLoading: isEmployeesLoading,
    isError: isEmployeesError,
    error,
    refetch,
  } = useAllEmployees(
    {},
    {
      gcTime: 10 * 60 * 1000,
    }
  );

  // Column Configuration
  const allColumns = useMemo(
    () => [
      { key: "name", header: "Employee Name" },
      { key: "email", header: "Email" },
      { key: "phoneNumber", header: "Phone Number" },
      { key: "birthday", header: "Birth Date" },
      { key: "age", header: "Age" },
      { key: "city", header: "City" },
      { key: "homeAddress", header: "Home Address" },
      { key: "region", header: "Region" },
      { key: "country", header: "Country" },
      { key: "startDate", header: "Start Date" },
      { key: "endDate", header: "End Date" },
      { key: "seniority", header: "Seniority" },
      { key: "skills", header: "Skills" },
      { key: "ftpt", header: "FT/PT" },
      { key: "department", header: "Department" },
      { key: "seniorTeamLead", header: "Team Leader" },
      { key: "juniorTeamLead", header: "Jr. Team Leader" },
      { key: "agency", header: "Agency" },
      { key: "invoiceReceived", header: "Got Invoice" },
      { key: "paid", header: "Paid" },
      { key: "onLeave", header: "On Leave" },
    ],
    []
  );

  const filteredEmployees = useMemo(() => {
    if (!employees || employees.length === 0) return [];
    return employees.filter((employee) => {
      const fullName = `${employee.firstName || ""} ${
        employee.lastName || ""
      }`.toLowerCase();
      return fullName.includes(gridSearchTerm.toLowerCase());
    });
  }, [employees, gridSearchTerm]);

  const toggleArrayState = useCallback(
    <T,>(setState: React.Dispatch<React.SetStateAction<T[]>>, item: T) => {
      setState((prev) =>
        prev.includes(item) ? prev.filter((i) => i !== item) : [...prev, item]
      );
    },
    []
  );

  // Column Visibility Methods
  const hideAllColumns = useCallback(() => {
    setVisibleColumns(["name"]);
  }, []);

  const showAllColumns = useCallback(() => {
    setVisibleColumns(allColumns.map((col) => col.key));
  }, [allColumns]);

  const toggleColumnVisibility = useCallback(
    (columnKey: string) => {
      toggleArrayState(setVisibleColumns, columnKey);
    },
    [toggleArrayState]
  );

  const toggleSearchByField = useCallback(
    (fieldKey: string) => {
      toggleArrayState(setSearchByField, fieldKey);
    },
    [toggleArrayState]
  );

  const resetSearchByField = useCallback(() => {
    setSearchByField(allColumns.map((col) => col.key));
  }, [allColumns]);

  const resetColumns = useCallback(() => {
    const defaultColumns = [
      "name",
      "email",
      "phoneNumber",
      "birthday",
      "startDate",
      "department",
      "onLeave",
    ];
    setVisibleColumns(defaultColumns);
  }, []);

  // Filtered Options with Memoization
  const filteredColumnOptions = useMemo(
    () =>
      allColumns.filter((col) =>
        col.header.toLowerCase().includes(columnSearchTerm.toLowerCase())
      ),
    [allColumns, columnSearchTerm]
  );

  const filteredSearchByFieldOptions = useMemo(
    () =>
      allColumns.filter((col) =>
        col.header.toLowerCase().includes(searchFieldSearchTerm.toLowerCase())
      ),
    [allColumns, searchFieldSearchTerm]
  );

  const ViewModeToggle = React.memo(
    ({
      viewMode,
      onViewModeChange,
    }: {
      viewMode: ViewMode;
      onViewModeChange: (mode: ViewMode) => void;
    }) => {
      return (
        <div className="flex h-8 items-center rounded-lg bg-gray-300">
          <div
            className={`p-2 rounded-lg cursor-pointer ${
              viewMode === "table" ? "bg-purple-400" : ""
            }`}
            onClick={() => onViewModeChange("table")}
          >
            <HamburgerMenu size={18} />
          </div>
          <div
            className={`p-2 rounded-lg cursor-pointer ${
              viewMode === "grid" ? "bg-purple-400" : ""
            }`}
            onClick={() => onViewModeChange("grid")}
          >
            <GridIcon size={18} />
          </div>
        </div>
      );
    }
  );

  const paginatedGridData = useMemo(() => {
    if (!filteredEmployees || filteredEmployees.length === 0) return [];
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredEmployees.slice(startIndex, endIndex);
  }, [filteredEmployees, currentPage, itemsPerPage]);

  // Add total pages calculation
  const totalGridPages = useMemo(() => {
    return Math.ceil((filteredEmployees?.length || 0) / itemsPerPage);
  }, [filteredEmployees, itemsPerPage]);

  // Render Methods
  const renderEmployeeContent = useCallback(() => {
    if (isEmployeesLoading) {
      return viewMode === "table" ? (
        <EmployeesTableSkeleton />
      ) : (
        <EmployeeCardSkeleton />
      );
    }

    if (isEmployeesError) {
      return (
        <div className="p-6">
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Error loading Employees data</AlertTitle>
            <AlertDescription>
              {error instanceof Error
                ? error.message
                : "Failed to load data. Please try again."}
            </AlertDescription>
          </Alert>
          <Button onClick={() => refetch()} variant="outline" className="mt-4">
            <RefreshCw className="mr-2 h-4 w-4" />
            Try Again
          </Button>
        </div>
      );
    }

    if (!employees || employees.length === 0) {
      return <NoEmployeesPage />;
    }

    return viewMode === "table" ? (
      <div className="h-full overflow-auto">
        <EmployeeManagementTable
          key="employee-table"
          employeeData={employees}
          columnsToShow={stableVisibleColumns}
          searchByField={stableSearchByField}
          searchTerm={searchTerm}
        />
      </div>
    ) : (
      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap gap-4">
          {paginatedGridData.map((employee) => (
            <EmployeeCard key={employee.id} employee={employee} />
          ))}
        </div>
        {totalGridPages > 1 && (
          <StepProgress
            currentPage={currentPage}
            setCurrentPage={setCurrentPage}
            totalPages={totalGridPages}
          />
        )}
      </div>
    );
  }, [
    isEmployeesLoading,
    isEmployeesError,
    employees,
    viewMode,
    stableVisibleColumns,
    stableSearchByField,
    searchTerm,
    paginatedGridData,
    totalGridPages,
    currentPage,
    error,
    refetch,
  ]);

  const memoizedRenderEmployeeContent = useMemo(() => {
    return renderEmployeeContent();
  }, [renderEmployeeContent]);

  return (
    <div className="flex flex-col pt-[10px] h-full bg-white rounded-md w-full">
      <div className="w-full flex flex-col-reverse md:flex-row sm:items-center md:items-start lg:items-center gap-2 px-2">
        {viewMode === "table" ? (
          <div className="flex items-center flex-wrap w-full gap-2 lg:flex-nowrap ">
            <div className="relative min-w-[300px]">
              <Input
                type="text"
                placeholder="Search Employee"
                className="pl-5 py-4 rounded-xl bg-gray-50 border outline-none shadow-none h-full w-full"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <Search
                className="absolute right-4 top-4 text-gray-400"
                size={18}
              />
            </div>

            {/* Search Fields Popover */}
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="bg-white text-sm text-gray-400 hover:bg-gray-100 rounded-xl py-6 w-fit"
                >
                  <Search className="w-4 h-4 sm:mr-2" size={14} />
                  <span className="">Search Fields</span>
                </Button>
              </PopoverTrigger>

              <PopoverContent
                className="w-64 p-0 rounded-xl bg-gradient-to-tr from-[#FFFBEB] via-[#F2FBFF] to-[#F7FEFF]"
                align="end"
              >
                {/* Search Fields Popover Content */}
                <div className="p-4">
                  <div className="flex justify-between items-center mb-4">
                    <button
                      className="text-sm font-medium text-gray-700 flex items-center"
                      onClick={() => {
                        resetSearchByField();
                        setSearchFieldSearchTerm("");
                      }}
                    >
                      Reset
                    </button>
                  </div>
                  <div className="relative">
                    <Search className="absolute left-4 top-[15px] h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search"
                      className="pl-10 bg-white shadow-none rounded-[16px] py-[15px] w-full h-[48px]"
                      value={searchFieldSearchTerm}
                      onChange={(e) => setSearchFieldSearchTerm(e.target.value)}
                    />
                  </div>
                </div>
                <div className="max-h-[300px] overflow-y-auto py-1">
                  {filteredSearchByFieldOptions.map((column) => (
                    <div
                      key={column.key}
                      className="flex items-center px-4 py-4 hover:bg-gray-100"
                    >
                      <button
                        className={`flex items-center justify-center w-5 h-5 mr-3 rounded ${
                          searchByField.includes(column.key)
                            ? "bg-green-500 text-white"
                            : "bg-gray-200"
                        }`}
                        onClick={() => toggleSearchByField(column.key)}
                      >
                        {searchByField.includes(column.key) && (
                          <Check className="h-3 w-3" />
                        )}
                      </button>
                      <span className="text-sm">{column.header}</span>
                    </div>
                  ))}
                </div>
              </PopoverContent>
            </Popover>

            {/* Columns Popover */}
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="bg-white text-sm text-gray-400 hover:bg-gray-100 rounded-xl py-6 w-fit"
                >
                  <Eye className="w-12 h-12" size={14} />
                  Columns
                </Button>
              </PopoverTrigger>
              <PopoverContent
                className="w-64 p-0 rounded-xl bg-gradient-to-tr from-[#FFFBEB] via-[#F2FBFF] to-[#F7FEFF]"
                align="end"
              >
                {/* Columns Popover Content */}
                <div className="p-4">
                  <div className="flex justify-between items-center mb-4">
                    <button
                      className="text-sm font-medium text-gray-700 flex items-center"
                      onClick={() =>
                        visibleColumns.length === allColumns.length
                          ? hideAllColumns()
                          : showAllColumns()
                      }
                    >
                      {visibleColumns.length === allColumns.length
                        ? "Hide All"
                        : "Show All"}
                    </button>
                    <button
                      className="text-sm text-gray-500"
                      onClick={resetColumns}
                    >
                      Reset
                    </button>
                  </div>
                  <div className="relative">
                    <Search className="absolute left-4 top-[15px] h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search"
                      className="pl-10 bg-white shadow-none rounded-[16px] py-[15px] w-full h-[48px]"
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
        ) : (
          <div className="w-full">
            <div className="relative w-[400px] ">
              <Input
                type="text"
                placeholder="Search Employee"
                className="pl-5 py-4 rounded-xl bg-gray-50 border outline-none shadow-none h-full w-full"
                value={gridSearchTerm}
                onChange={(e) => setGridSearchTerm(e.target.value)}
              />
              <Search
                className="absolute right-4 top-4 text-gray-400"
                size={18}
              />
            </div>
          </div>
        )}

        {/* View Mode Toggle - adjust size for mobile */}
        <div className="w-full md:w-[100px] flex justify-end">
          <ViewModeToggle
            viewMode={viewMode}
            onViewModeChange={handleViewModeChange}
          />
        </div>
      </div>

      <div className="flex flex-col h-full overflow-auto">
        {memoizedRenderEmployeeContent}
      </div>
    </div>
  );
};

export default ManageEmployees;
