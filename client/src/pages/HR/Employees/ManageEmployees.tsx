import React, { useState, useCallback, useMemo } from "react";
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
import UserAddIcon from "@/assets/icons/UserAddIcon";
import HamburgerMenu from "@/assets/icons/HamburgerMenu";
import GridIcon from "@/assets/icons/GridIcon";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useAllEmployees } from "@/api/query-hooks/employee.hooks";
import EmployeesTableSkeleton from "@/components/Hr/Employees/EmployeesTableSkeleton";

type ViewMode = "table" | "grid";

export const ManageEmployees: React.FC = () => {
const [viewMode, setViewMode] = useState<ViewMode>("table");
const [isEditModalOpen, setIsEditModalOpen] = useState(false);
const [selectedEmployeeId, setSelectedEmployeeId] = useState<number | null>(null);
const [visibleColumns, setVisibleColumns] = useState([
  "name",
  "email",
  "phoneNumber",
  "birthday",
  "startDate",
  "department",
  "onLeave",
  // "actions",
]);

const [columnSearchTerm, setColumnSearchTerm] = useState("");
const [searchByField, setSearchByField] = useState<string[]>([]);
const [searchTerm, setSearchTerm] = useState("");
const [gridSearchTerm, setGridSearchTerm] = useState("");
const [searchFieldSearchTerm, setSearchFieldSearchTerm] = useState("");

// Employee Data Fetching
const {
  data: employees,
  isLoading: isEmployeesLoading,
  isError: isEmployeesError,
  error,
  refetch,
} = useAllEmployees({}, {});


// Column Configuration
const allColumns = [
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
  // { key: "actions", header: "Action" },
];

// Memoized filtered employees for grid view
const filteredEmployees = useMemo(() => {
  if (!employees || employees.length === 0) return [];

  return employees.filter((employee) => {
    const fullName =
      `${employee.firstName || ""} ${employee.lastName || ""}`.toLowerCase();
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
    "actions",
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

// Render Methods
const renderEmployeeContent = () => {
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
    <EmployeeManagementTable
      columnsToShow={visibleColumns}
      searchByField={searchByField}
      searchTerm={searchTerm}
    />
  ) : (
    <div className="flex flex-col gap-4">
      {/* Employee Cards Grid */}
      <div className="flex flex-wrap gap-4">
        {filteredEmployees.map((employee) => (
          <EmployeeCard key={employee.id} employee={employee} />
        ))}
      </div>
    </div>
  );
};

  return (
    <>
    <div className="flex flex-col gap-[15px] pt-[10px] h-full">
      <section className="h-[62px] flex justify-between w-full items-center py-1">
        <div className="flex flex-col h-full">
          <h1 className="text-xl font-medium text-gray-600">RGT Team</h1>
          <p className="text-sm text-gray-500">
            This is the data of all employees
          </p>
        </div>

        <div className="md:flex md:flex-row gap-4 items-center h-full flex-col">


          {/* Search Input */}
          {viewMode === "table" ? (
            <>
              <div className="relative justify-between items-center sm:w-[100px] md:w-[301px] md:max-w-[301px] flex-grow">
                <Input
                  type="text"
                  placeholder="Search Employee"
                  className="pl-5 py-5 rounded-xl bg-gray-50 border-none outline-none shadow-none h-full"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <Search className="absolute right-4 top-4 h-6 w-6 text-gray-400" />
              </div>

              {/* Popover Buttons */}
              <div className="flex justify-end gap-4">
                {/* Search Fields Popover */}
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="bg-white text-sm text-gray-400 hover:bg-gray-100 rounded-xl py-4 h-full"
                    >
                      <Search className="w-12 h-12" size={14} />
                      Search Fields
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
                          onChange={(e) =>
                            setSearchFieldSearchTerm(e.target.value)
                          }
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
                      className="bg-white text-sm text-gray-400 hover:bg-gray-100 rounded-xl py-4 h-full"
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
            </>
          ) : (
            <>
              {/* Grid View Search */}
              <div className="relative w-full max-w-md mx-auto">
                <Input
                  type="text"
                  placeholder="Search Employee"
                  className="pl-5 py-5 rounded-xl bg-gray-50 border-none outline-none shadow-none h-full"
                  value={gridSearchTerm}
                  onChange={(e) => setGridSearchTerm(e.target.value)}
                />
                <Search className="absolute right-4 top-4 h-6 w-6 text-gray-400" />
              </div>
            </>
          )}

          {/* View Mode Toggle */}
          <div className="flex h-10 items-center rounded-lg bg-gray-300">
            <div
              className={`p-2 rounded-lg cursor-pointer ${
                viewMode === "table" ? "bg-purple-400" : ""
              }`}
              onClick={() => setViewMode("table")}
            >
              <HamburgerMenu />
            </div>
            <div
              className={`p-2 rounded-lg cursor-pointer ${
                viewMode === "grid" ? "bg-purple-400" : ""
              }`}
              onClick={() => setViewMode("grid")}
            >
              <GridIcon />
            </div>
          </div>
        </div>
      </section>

      <div className="flex flex-col h-full">{renderEmployeeContent()}</div>
    </div>

    </>
  );
};

export default ManageEmployees;
