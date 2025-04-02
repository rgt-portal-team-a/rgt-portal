import { useState, useEffect, useMemo, useCallback } from 'react';
import { Column, ActionObject } from "@/types/tables";
import { DataTable } from '@/components/common/DataTable';
import StepProgress from "@/components/common/StepProgress";
import { Check, X } from "lucide-react";
import EmployeeManagementTableSkeleton from './EmployeeManagementTableSkeleton';
import {EditEmployeeForm} from './EditEmployeeForm';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import {
  useUpdateEmployeeAgency
} from "@/api/query-hooks/employee.hooks";
import { Employee, EmployeeType } from "@/types/employee"; 
import {Link} from "react-router-dom"
import {TeamLeadToggle} from "./TeamLeadToggle";
import {AgencyCheckboxToggle} from "./AgencyCheckboxToggle";

const employeeTypeLabels: Record<EmployeeType, string> = {
   full_time: "FT",
   part_time: "PT",
   contractor: "FT",
   nsp: "PT",
 };




interface EmployeeManagementTableProps {
  employeeData: Employee[];
  columnsToShow?: string[];
  searchByField?: string[];
  searchTerm?: string;
}




const EmployeeManagementTable: React.FC<EmployeeManagementTableProps> = ({ 
  employeeData,
  columnsToShow,
  searchByField = [], 
  searchTerm = "" 
}) => {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [filteredEmployees, setFilteredEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeSection, _setActiveSection] = useState<string>("personal");
  const [filter, setFilter] = useState({
    department: "All Departments",
    employmentType: "All Types",
    onLeave: "All Employees"
  });

  const itemsPerPage = 5;


  const paginationData = useMemo(() => {
    const totalPages = Math.ceil(filteredEmployees.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedData = filteredEmployees.slice(startIndex, endIndex);

    return {
      totalPages,
      paginatedData,
      currentPage,
      itemsPerPage,
      totalItems: filteredEmployees.length,
    };
  }, [filteredEmployees, currentPage, itemsPerPage]);



  const departments = useMemo(() => {
    if (!employees) return [];
    return Array.from(
      new Set(employees.map((emp) => emp.department?.name || "N/A"))
    ).map((dept, index) => ({ id: index + 1, name: dept }));
  }, [employees]);

  // Reset filter function
  const resetFilter = () => {
    setFilter({
      department: "All Departments",
      employmentType: "All Types",
      onLeave: "All Employees"
    });
  };

  // Calculate seniority based on hireDate
  const calculateSeniority = useCallback((date: Date | null): string => {
    if (!date) return "N/A";
    const now = new Date();
    const diffInYears = Math.floor((now.getTime() - new Date(date).getTime()) / (1000 * 60 * 60 * 24 * 365));
    return `${diffInYears} years`;
  }, []);

  // Determine if an employee is on leave
  const isOnLeave = useCallback((leaveType: string | null | undefined): boolean => {
    return !!leaveType;
  }, []);


  const getEmployeeFieldValue = useCallback((employee: Employee | null | undefined, field: string): string => {
      // Early guard clauses
      if (!employee) return "";

      const fieldMappings: Record<string, (emp: Employee) => string> = {
        name: (emp) => `${emp.firstName || ""} ${emp.lastName || ""}`.trim(),
        email: (emp) => emp.user?.email || "",
        phoneNumber: (emp) => emp.phone || "",
        birthday: (emp) => emp.birthDate?.toISOString().split("T")[0] || "",
        age: (emp) =>
          emp.birthDate ? calculateAge(emp.birthDate).toString() : "",
        city: (emp) => emp.contactDetails?.city || "",
        homeAddress: (emp) => emp.contactDetails?.address || "",
        region: (emp) => emp.contactDetails?.region || "",
        country: (emp) => emp.contactDetails?.country || "",
        startDate: (emp) => emp.hireDate?.toISOString().split("T")[0] || "",
        endDate: (emp) => emp.endDate?.toISOString().split("T")[0] || "",
        seniority: (emp) => calculateSeniority(emp.hireDate),
        skills: (emp) => emp.skills?.join(", ") || "",
        ftpt: (emp) => employeeTypeLabels[emp.employeeType as EmployeeType] || "",
        department: (emp) => emp.department?.name || "",
        agency: (emp) => emp.agency?.name || "",
        onLeave: (emp) => (isOnLeave(emp.leaveType) ? "On Leave" : "Active"),
      };

      // Precise age calculation function
      function calculateAge(birthDate: Date): number {
        const today = new Date();
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDifference = today.getMonth() - birthDate.getMonth();

        if (
          monthDifference < 0 ||
          (monthDifference === 0 && today.getDate() < birthDate.getDate())
        ) {
          age--;
        }

        return age;
      }

      // Safe field mapping retrieval
      if (fieldMappings[field]) {
        return fieldMappings[field](employee);
      }

      // Type-safe fallback with optional chaining
      try {
        const value = (employee as any)[field];
        return value != null ? String(value) : "";
      } catch {
        console.warn(`Unhandled field: ${field}`);
        return "";
      }
  }, [calculateSeniority, isOnLeave]);


  useEffect(() => {
    if (!employees) {
      setFilteredEmployees([]);
      return;
    }

    // Apply filters
    let result = employees.filter((employee) => {
      // Department filter
      if (
        filter.department !== "All Departments" &&
        employee.department?.name !== filter.department
      ) {
        return false;
      }

      // Employment type filter
      if (
        filter.employmentType !== "All Types" &&
        employee.employeeType !== filter.employmentType
      ) {
        return false;
      }

      // Leave status filter
      if (filter.onLeave !== "All Employees") {
        const onLeaveStatus = isOnLeave(employee.leaveType);
        if (
          (filter.onLeave === "On Leave" && !onLeaveStatus) ||
          (filter.onLeave === "Not On Leave" && onLeaveStatus)
        ) {
          return false;
        }
      }

      // Search term filter
      if (searchTerm && searchByField.length > 0) {
        const searchLower = searchTerm.toLowerCase();
        return searchByField.some((field) => {
          const value = getEmployeeFieldValue(employee, field);
          return String(value).toLowerCase().includes(searchLower);
        });
      }

      return true;
    });

    setFilteredEmployees(result);
  }, [filter, employees, searchTerm, searchByField, getEmployeeFieldValue]);

  // Load employee data
  useEffect(() => {
    if (employeeData.length > 0) {
      const newEmployees = [...employeeData];
      setEmployees(newEmployees);
      setFilteredEmployees(newEmployees);
      setLoading(false);
    }
  }, [employeeData]);



  // Define the complete list of columns
  const allColumns: Column[] = [
    {
      key: "name",
      header: "Employee Name",
      render: (row) => (
        <Link to={`/hr/manageemployees/employee/${row.id}`}>
          <div className="flex items-center">
            <div className="w-8 h-8 rounded-full overflow-hidden mr-2 bg-gray-200">
              {row.photoUrl ? (
                <img
                  src={row.photoUrl}
                  alt={`${row.firstName} ${row.lastName}`}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-purple-200 text-purple-700">
                  {row.firstName?.charAt(0) || "N/A"}
                </div>
              )}
            </div>
            <div>
              <div className="font-medium">
                {row.firstName} {row.lastName}
              </div>
              <div className="text-xs text-gray-500">
                {row.user?.role?.name || "N/A"}
              </div>
            </div>
          </div>
        </Link>
      ),
    },
    {
      key: "phone",
      header: "Phone Number",
      render: (row) => <div>{row.phone || "N/A"}</div>,
    },
    {
      key: "birthday",
      header: "Birth Date",
      render: (row) => (
        <div>
          {row.birthDate ? new Date(row.birthDate).toLocaleDateString() : "N/A"}
        </div>
      ),
    },
    {
      key: "email",
      header: "Email",
      render: (row) => <div>{row.user?.email || "N/A"}</div>,
    },
    {
      key: "phoneNumber",
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
      key: "homeAddress",
      header: "Home Address",
      render: (row) => <div>{row.contactDetails?.homeAddress || "N/A"}</div>,
    },
    {
      key: "region",
      header: "Region",
      render: (row) => <div>{row.contactDetails?.region || "N/A"}</div>,
    },
    {
      key: "country",
      header: "Country",
      render: (row) => <div>{row.contactDetails?.country || "Ghana"}</div>,
    },
    {
      key: "startDate",
      header: "Start Date",
      render: (row) => <div>{row.hireDate || "N/A"}</div>,
    },
    {
      key: "endDate",
      header: "End Date",
      render: (row) => <div>{row.endDate || "N/A"}</div>,
    },
    {
      key: "seniority",
      header: "Seniority",
      render: (row) => <div>{calculateSeniority(row.hireDate)}</div>,
    },
    {
      key: "skills",
      header: "Skills",
      render: (row) => <div>{row.skills || "N/A"}</div>,
    },
    {
      key: "ftpt",
      header: "FT/PT",
      render: (row) => (
        <div>
          {employeeTypeLabels[row.employeeType as EmployeeType] || "N/A"}
        </div>
      ),
    },
    {
      key: "department",
      header: "Department",
      render: (row) => <div>{row.department?.name || "N/A"}</div>,
    },
    {
      key: "seniorTeamLead",
      header: "Team Leader",
      render: (row) => (
        <TeamLeadToggle employee={row as Employee} isJuniorTeamLead={false} />
      ),
    },
    {
      key: "juniorTeamLead",
      header: "Jr. Team Leader",
      render: (row) => (
        <TeamLeadToggle employee={row as Employee} isJuniorTeamLead={true} />
      ),
    },
    {
      key: "agency",
      header: "Agency",
      render: (row) => <div>{row.agency?.name || "N/A"}</div>,
    },
    {
      key: "invoiceReceived",
      header: "Got Invoice",
      render: (row) => (
        <div className="flex justify-center">
          <AgencyCheckboxToggle
            employee={row as Employee}
            checked={row.agency?.invoiceReceived || false}
            type="invoiceReceived"
          />
        </div>
      ),
    },
    {
      key: "paid",
      header: "Paid",
      render: (row) => (
        <div className="flex justify-center">
          <AgencyCheckboxToggle
            employee={row as Employee}
            checked={row.agency?.paid || false}
            type="paid"
          />
        </div>
      ),
    },
    {
      key: "onLeave",
      header: "On Leave",
      render: (row) => (
        <div className="flex justify-center">
          {isOnLeave(row.leaveType) ? (
            <div className="w-6 h-6 rounded-md bg-green-500 flex items-center justify-center">
              <Check className="text-white" size={16} />
            </div>
          ) : (
            <div className="w-6 h-6 rounded-md bg-gray-300"></div>
          )}
        </div>
      ),
    },
    // {
    //   key: "actions",
    //   header: "Action",
    //   render: (_row) => (
    //     <div className="flex space-x-2">
    //       <button className="cursor-pointer w-8 h-8 bg-purple-400 rounded-md flex items-center justify-center">
    //         <Pencil className="text-white" size={16} />
    //       </button>
    //     </div>
    //   ),
    // },
  ];

  const visibleColumnsData = columnsToShow 
    ? allColumns.filter(col => columnsToShow.includes(col.key))
    : allColumns;

  const actionObj: ActionObject[] = [
    {
      name: "edit",
      action: (id, row) => {
        setSelectedEmployeeId(row.id as number);
        setIsEditModalOpen(true);
      },
    },
  ];

  return (
    <div className="p-6 bg-white rounded-lg shadow-sm">
      <div className="mb-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-medium text-gray-700">
            Employee Management
          </h1>
        </div>

        {/* Filter Section */}
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
                {departments.map((department) => (
                  <SelectItem key={department.id} value={department.name}>
                    {department.name.toUpperCase()}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Employment Type Filter */}
            <Select
              value={filter.employmentType}
              onValueChange={(value) =>
                setFilter((prev) => ({ ...prev, employmentType: value }))
              }
            >
              <SelectTrigger className="w-[320px] py-[25px] rounded-lg text-gray-500 hover:text-black font-normal bg-gray-100 border-none">
                <SelectValue placeholder="All Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All Types">All Types</SelectItem>
                <SelectItem value="full_time">Full-time</SelectItem>
                <SelectItem value="part_time">Part-time</SelectItem>
                <SelectItem value="contractor">Contractor</SelectItem>
                <SelectItem value="nsp">NSP</SelectItem>
              </SelectContent>
            </Select>

            {/* On Leave Filter */}
            <Select
              value={filter.onLeave}
              onValueChange={(value) =>
                setFilter((prev) => ({ ...prev, onLeave: value }))
              }
            >
              <SelectTrigger className="w-[320px] py-[25px] rounded-lg text-gray-500 hover:text-black font-normal bg-gray-100 border-none">
                <SelectValue placeholder="All Employees" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All Employees">All Employees</SelectItem>
                <SelectItem value="On Leave">On Leave</SelectItem>
                <SelectItem value="Not On Leave">Not On Leave</SelectItem>
              </SelectContent>
            </Select>

            {/* Reset Filter Button */}
            <Button
              variant="outline"
              onClick={resetFilter}
              className="border-none rounded-lg bg-gray-100 text-gray-500 hover:text-black font-normal w-[100px] h-[50px] flex items-center justify-center"
            >
              <X className="h-4 w-4 mr-2" />
              Reset
            </Button>
          </div>
        </div>
      </div>

      {loading ? (
        <EmployeeManagementTableSkeleton />
      ) : (
        <div className="overflow-x-auto">
          <DataTable
            columns={visibleColumnsData}
            data={paginationData.paginatedData}
            dividers={false}
            actionBool={true}
            actionObj={actionObj}
          />
        </div>
      )}

      {/* Step Progress (Pagination) */}
      {!loading && (
        <StepProgress
          currentPage={paginationData.currentPage}
          setCurrentPage={setCurrentPage}
          totalPages={paginationData.totalPages}
        />
      )}

      {selectedEmployeeId && (
        <EditEmployeeForm
          employeeId={selectedEmployeeId}
          isOpen={isEditModalOpen}
          onClose={() => {
            setSelectedEmployeeId(null);
            setIsEditModalOpen(false);
          }}
        />
      )}
    </div>
  );
};

export default EmployeeManagementTable;