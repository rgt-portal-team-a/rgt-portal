import { useState, useEffect } from "react";
import { DataTable } from "../../common/DataTable";
import StepProgress from "../../common/StepProgress";
import { Column } from "@/types/tables";
import { usePermission } from "@/hooks/use-permission";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { useAllEmployees } from "@/api/query-hooks/employee.hooks";
import { Employee } from "@/types/employee";
import { useSelector } from "react-redux";
import { RootState } from "@/state/store";
import EmployeeTableSkeleton from "./EmployeeTableSkeleton";
import ErrorMessage from "@/components/common/ErrorMessage";

interface EmployeeTableState {
  currentPage: number;
  filteredEmployees: Employee[];
  loading: boolean;
  error: string | null;
  totalPages: number;
  itemsPerPage: number;
}

interface FilterState {
  department: string;
  type: string;
  status: string;
}

const EmployeeTable: React.FC = () => {
  const [searchName, setSearchName] = useState("");
  const { departments } = useSelector((state: RootState) => state.sharedState);
  const { hasAccess } = usePermission();
  const [filter, setFilter] = useState<FilterState>({
    department: "All Departments",
    type: "All Type",
    status: "All Status",
  });

  const {
    data: employeeData,
    isLoading: isEmployeesLoading,
    isError: isEmployeesError,
    error: employeeError,
    refetch: refetchEmployees,
  } = useAllEmployees({}, {});

  const [state, setState] = useState<EmployeeTableState>({
    currentPage: 1,
    filteredEmployees: [],
    loading: true,
    error: null,
    totalPages: 1,
    itemsPerPage: 10,
  });

  const {
    currentPage,
    filteredEmployees,
    loading,
    error,
    totalPages,
    itemsPerPage,
  } = state;

  useEffect(() => {
    if (employeeData) {
      let filtered = [...employeeData];

      if (searchName.trim() !== "") {
        filtered = filtered.filter(
          (emp) =>
            emp.firstName?.toLowerCase().includes(searchName.toLowerCase()) ||
            emp.lastName?.toLowerCase().includes(searchName.toLowerCase())
        );
      }

      if (filter.department !== "All Departments") {
        filtered = filtered.filter(
          (emp) => emp.department?.name === filter.department
        );
      }

      if (filter.type !== "All Type") {
        filtered = filtered.filter((emp) => emp.workType === filter.type);
      }

      if (filter.status !== "All Status") {
        filtered = filtered.filter((emp) => emp.employeeType === filter.status);
      }

      const newTotalPages = Math.max(
        1,
        Math.ceil(filtered.length / itemsPerPage)
      );
      const adjustedCurrentPage = currentPage > newTotalPages ? 1 : currentPage;

      setState((prev) => ({
        ...prev,
        filteredEmployees: filtered,
        totalPages: newTotalPages,
        currentPage: adjustedCurrentPage,
        loading: false,
      }));
    }
  }, [employeeData, searchName, filter, itemsPerPage, currentPage]);

  if (isEmployeesLoading) {
    return <EmployeeTableSkeleton />;
  }

  if (isEmployeesError) {
    return (
      <ErrorMessage
        title="Error Loading Employee Data"
        error={employeeError}
        refetchFn={refetchEmployees}
      />
    );
  }

  const getPaginatedData = () => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredEmployees.slice(startIndex, endIndex);
  };

  // View action handler
  const handleView = (id?: number): void => {
    console.log(`Viewing employee with ID: ${id}`);
  };

  // Edit action handler
  const handleEdit = (id?: number): void => {
    console.log(`Editing employee with ID: ${id}`);
  };

  const resetFilter = () => {
    setFilter({
      department: "All Departments",
      type: "All Type",
      status: "All Status",
    });
    setState((prev) => ({ ...prev, currentPage: 1 }));
  };

  const columns: Column[] = [
    {
      key: "name",
      header: "Employee Name",
      render: (row) => `${row.firstName} ${row.lastName}`,
    },
    {
      key: "department",
      header: "Department",
      render: (row) => row.department?.name || "N/A",
    },
    {
      key: "role",
      header: "Role",
      render: (row) => row.position || "N/A",
    },
    {
      key: "type",
      header: "Type",
      render: (row) => row.workType || "N/A",
    },
    {
      key: "status",
      header: "Status",
      render: (row) => (
        <div
          className={`px-3 py-2 rounded-[5px] text-center text-xs
          ${
            row.employeeType === "Permanent"
              ? "bg-yellow-100 text-yellow-800"
              : "bg-purple-100 text-purple-800"
          }`}
        >
          {row.employeeType || "N/A"}
        </div>
      ),
      cellClassName: () => "flex items-center justify-center",
    },
  ];

  const actionObj = [
    ...(hasAccess("employeeRecords", "view")
      ? [
          {
            name: "view",
            action: (id?: number, _row?: any) => handleView(id),
          },
        ]
      : []),
    ...(hasAccess("employeeRecords", "edit")
      ? [
          {
            name: "edit",
            action: (id?: number, _row?: any) => handleEdit(id),
          },
        ]
      : []),
  ];

  return (
    <div className="p-6 bg-white rounded-lg">
      <div className="mb-6">
        <div className="flex w-full justify-between items-center">
          <h1 className="text-2xl font-medium text-gray-700 mb-6">Employees</h1>
          <div className="relative justify-between items-center sm:w-[100px] md:w-[301px] md:max-w-[301px] flex-grow">
            <Input
              type="text"
              placeholder="Search by name"
              value={searchName}
              onChange={(e) => setSearchName(e.target.value)}
              className="pl-5 py-5 rounded-xl bg-gray-50 border-none outline-none shadow-none h-full"
            />
            <Search className="absolute right-4 top-4 h-6 w-6 text-gray-400" />
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col gap-8 sm:flex-row sm:items-center mb-6">
          <div className="flex w-full gap-1 md:gap-3 justify-between items-center my-4 md:my-8">
            {/* Department Filter */}
            <Select
              value={filter.department}
              onValueChange={(value) =>
                setFilter((prev) => ({ ...prev, department: value }))
              }
            >
              <SelectTrigger className="w-[320px] py-[25px] rounded-lg text-gray-500 hover:text-black font-normal bg-gray-100 border-none">
                <SelectValue placeholder="All Departments" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All Departments">All Departments</SelectItem>
                {departments?.map((department) => (
                  <SelectItem key={department.id} value={department.name}>
                    {department.name.toUpperCase()}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Type Filter */}
            <Select
              value={filter.type}
              onValueChange={(value) =>
                setFilter((prev) => ({ ...prev, type: value }))
              }
            >
              <SelectTrigger className="w-[320px] py-[25px] rounded-lg text-gray-500 hover:text-black font-normal bg-gray-100 border-none">
                <SelectValue placeholder="All Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All Type">All Type</SelectItem>
                <SelectItem value="Remote">Remote</SelectItem>
                <SelectItem value="Office">Office</SelectItem>
              </SelectContent>
            </Select>

            {/* Status Filter */}
            <Select
              value={filter.status}
              onValueChange={(value) =>
                setFilter((prev) => ({ ...prev, status: value }))
              }
            >
              <SelectTrigger className="w-[320px] py-[25px] rounded-lg text-gray-500 hover:text-black font-normal bg-gray-100 border-none">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All Status">All Status</SelectItem>
                <SelectItem value="Permanent">Permanent</SelectItem>
                <SelectItem value="NSP">NSP</SelectItem>
              </SelectContent>
            </Select>

            {/* Reset Filter Button */}
            <Button
              variant="outline"
              size="icon"
              onClick={resetFilter}
              className="border-none rounded-lg bg-gray-100 text-gray-500 hover:text-black font-normal w-[100px] py-[25px]"
            >
              <X className="h-4 w-4" />
              Reset
            </Button>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="p-4 mb-4 text-red-700 bg-red-100 rounded-lg">
          Error: {error}
        </div>
      )}

      {/* Data Table */}
      <DataTable
        columns={columns}
        data={getPaginatedData()}
        dividers={false}
        actionBool={true}
        actionObj={actionObj}
      />

      {/* No Data Message */}
      {filteredEmployees.length === 0 && (
        <div className="text-center py-5 text-gray-500">
          No employees match your search criteria
        </div>
      )}

      {!loading && filteredEmployees.length > 0 && (
        <StepProgress
          currentPage={currentPage}
          setCurrentPage={(page) =>
            setState((prev) => ({ ...prev, currentPage: page }))
          }
          totalPages={totalPages}
        />
      )}
    </div>
  );
};

export default EmployeeTable;
