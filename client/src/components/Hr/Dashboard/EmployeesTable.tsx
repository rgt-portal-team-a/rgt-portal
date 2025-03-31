import { useState, useEffect, useCallback } from "react";
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
import { Employee, EmployeeType } from "@/types/employee";
import { useSelector } from "react-redux";
import { RootState } from "@/state/store";
import EmployeeTableSkeleton from "./EmployeeTableSkeleton";
import ErrorMessage from "@/components/common/ErrorMessage";
import { WORK_TYPES } from "@/constants";

const employeeTypeLabels: Record<EmployeeType, string> = {
   full_time: "FT",
   part_time: "PT",
   contractor: "FT",
   nsp: "PT",
 };

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
  employmentType: string;
}
interface EmployeeTableProps {
  employeeData: Employee[] | undefined;
  isEmployeesLoading: boolean;
  isEmployeesError: boolean;
  employeeError: Error | null;
  refetchEmployees: () => void;
}

const EmployeeTable: React.FC<EmployeeTableProps> = ({employeeData, employeeError, isEmployeesError, isEmployeesLoading, refetchEmployees}) => {
  const [searchName, setSearchName] = useState("");
  const { departments } = useSelector((state: RootState) => state.sharedState);
  const { hasAccess } = usePermission();
  const [filter, setFilter] = useState<FilterState>({
    department: "All Departments",
    type: "All Type",
    employmentType: "All Type",
  });



  const [state, setState] = useState<EmployeeTableState>({
    currentPage: 1,
    filteredEmployees: [],
    loading: true,
    error: null,
    totalPages: 1,
    itemsPerPage: 5,
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

      // Employment type filter
      if (filter.employmentType !== "All Types") {
        filtered = filtered.filter(
          (emp) => emp.employeeType === filter.employmentType
        );
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

  const resetFilter = () => {
    setFilter({
      department: "All Departments",
      type: "All Type",
      employmentType: "All Types",
    });
    setState((prev) => ({ ...prev, currentPage: 1 }));
  };

  const calculateSeniority = useCallback((date: Date | null): string => {
    if (!date) return "N/A";
    const now = new Date();
    const diffInYears = Math.floor((now.getTime() - new Date(date).getTime()) / (1000 * 60 * 60 * 24 * 365));
    return `${diffInYears} years`;
  }, []);

  const columns: Column[] = [
    {
      key: "name",
      header: "Employee Name",
      render: (row) => <div className="py-4">{row.firstName} {row.lastName}</div>,
    },
    {
      key: "phone",
      header: "Phone Number",
      render: (row) => <div>{row.phone || "N/A"}</div>,
    },
    {
      key: "age",
      header: "Age",
      render: (row) => <div>{calculateSeniority(row.birthDate)}</div>,
    },
    {
      key: "city",
      header: "City",
      render: (row) => <div>{row.contactDetails?.city || "N/A"}</div>,
    },
    {
      key: "region",
      header: "Region",
      render: (row) => <div>{row.contactDetails?.region || "N/A"}</div>,
    },
    {
      key: "department",
      header: "Department",
      render: (row) => row.department?.name || "N/A",
    },
    {
      key: "startDate",
      header: "Start Date",
      render: (row) => <div>{row.hireDate || "N/A"}</div>,
    },
    {
      key: "seniority",
      header: "Seniority",
      render: (row) => <div>{calculateSeniority(row.hireDate)}</div>,
    },
    {
      key: "type",
      header: "Type",
      render: (row) => row.workType || "N/A",
    },
    {
      key: "employmentType",
      header: "Employee Type",
      render: (row) => (
        <div>
          {employeeTypeLabels[row.employeeType as EmployeeType] || "N/A"}
        </div>
      ),
      cellClassName: () => "flex items-center justify-center",
    },
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
                <SelectItem value="All Types">All Type</SelectItem>
                <SelectItem value={WORK_TYPES.REMOTE}>Remote</SelectItem>
                <SelectItem value={WORK_TYPES.HYBRID}>Office</SelectItem>
              </SelectContent>
            </Select>

            {/* employmentType Filter */}
            <Select
              value={filter.employmentType}
              onValueChange={(value) =>
                setFilter((prev) => ({ ...prev, employmentType: value }))
              }
            >
              <SelectTrigger className="w-[320px] py-[25px] rounded-lg text-gray-500 hover:text-black font-normal bg-gray-100 border-none">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All Types">All Status</SelectItem>
                <SelectItem value="full_time">Full-time</SelectItem>
                <SelectItem value="part_time">Part-time</SelectItem>
                <SelectItem value="contractor">Contractor</SelectItem>
                <SelectItem value="nsp">NSP</SelectItem>
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
        actionBool={false}
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
