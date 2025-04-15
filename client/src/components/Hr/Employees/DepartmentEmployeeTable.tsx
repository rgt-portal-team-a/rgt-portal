import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { MoreVertical, UserCheck, Trash2 } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import StepProgress from "@/components/common/StepProgress";
import { Column } from "@/types/tables";
import { DataTable } from "../../common/DataTable";
import { usePermission } from "@/hooks/use-permission";
import { Employee, EmployeeType } from "@/types/employee";
import { Department } from "@/types/department";
import ConfirmCancelModal from "@/components/common/ConfirmCancelModal";
import { useRemoveEmployeeFromDepartment } from "@/api/query-hooks/employee.hooks";
import {
  useUpdateDepartment,
  useUpdateManager,
} from "@/api/query-hooks/department.hooks";
import Filters from "@/components/common/Filters";
import Avtr from "@/components/Avtr";

const employeeTypeLabels: Record<EmployeeType, string> = {
  full_time: "FT",
  part_time: "PT",
  contractor: "FT",
  nsp: "PT",
};

interface FilterState {
  role: string;
  workType: string;
  employeeType: string;
  status: string;
}

interface DepartmentEmployeeTableProps {
  filterByName?: string;
  department: Department;
}

const DepartmentEmployeeTable: React.FC<DepartmentEmployeeTableProps> = ({
  filterByName,
  department,
}) => {
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<number | null>(
    null
  );
  const [deleteModalOpen, setDeleteModalOpen] = useState<boolean>(false);
  const [managerModalOpen, setManagerModalOpen] = useState<boolean>(false);
  const [employeeModalOpen, setEmployeeModalOpen] = useState<boolean>(false);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [employeesPerPage] = useState<number>(5);
  const { hasAccess } = usePermission();
  const [filter, setFilter] = useState<FilterState>({
    role: "All Role",
    workType: "All Work Type",
    employeeType: "All Employee Type",
    status: "All Status",
  });
  const removeEmployeeFromDepartment = useRemoveEmployeeFromDepartment();
  const updateDepartment = useUpdateDepartment();

  const updateManager = useUpdateManager();

  const preparedData = useMemo(() => {
    if (!department.employees) return [];

    return department.employees.map((employee) => ({
      ...employee,
      isDepartmentManager: department.managerId === employee.id,
    }));
  }, [department]);

  const filteredData = useMemo(() => {
    if (!department.employees) return [];

    return preparedData.filter((employee) => {
      const nameMatch =
        !filterByName ||
        employee.firstName
          ?.toLowerCase()
          .includes(filterByName.toLowerCase()) ||
        employee.lastName?.toLowerCase().includes(filterByName.toLowerCase());

      const roleMatch =
        filter.role === "All Role" ||
        (filter.role === "manager" && employee.isDepartmentManager) ||
        (filter.role === "member" && !employee.isDepartmentManager);

      const workTypeMatch =
        filter.workType === "All Work Type" ||
        employee.workType === filter.workType;

      const employeeTypeMatch =
        filter.employeeType === "All Employee Type" ||
        employee.employeeType === filter.employeeType;

      const statusMatch =
        filter.status === "All Status" ||
        (filter.status === "Available"
          ? !employee.leaveType
          : !!employee.leaveType);

      return (
        nameMatch &&
        roleMatch &&
        workTypeMatch &&
        employeeTypeMatch &&
        statusMatch
      );
    });
  }, [department, filter, filterByName]);

  const totalPages = useMemo(() => {
    return Math.ceil((filteredData ?? []).length / employeesPerPage);
  }, [filteredData, employeesPerPage]);

  const paginatedData = useMemo(() => {
    return (
      filteredData?.slice(
        (currentPage - 1) * employeesPerPage,
        currentPage * employeesPerPage
      ) || []
    );
  }, [filteredData, currentPage, employeesPerPage]);

  const resetFilter = () => {
    setFilter({
      role: "All Role",
      workType: "All Work Type",
      employeeType: "All Employee Type",
      status: "All Status",
    });
    setCurrentPage(1);
  };

  const fetchData = (page: number) => {
    setCurrentPage(page);
  };

  const handleDeleteEmployee = async () => {
    if (selectedEmployeeId && department.id) {
      try {
        await removeEmployeeFromDepartment.mutateAsync({
          id: selectedEmployeeId,
          departmentId: parseInt(department.id),
        });

        setDeleteModalOpen(false);
        setSelectedEmployeeId(null);
      } catch (error) {
        console.error("Failed to remove employee", error);
      }
    }
  };

  const columns: Column[] = [
    {
      key: "name",
      header: "Employee Name",
      render: (row: any) => (
        <div className="flex items-center">
          <div className="w-8 h-8 rounded-full overflow-hidden mr-3">
            <Avtr
              url={row.user?.profileImage}
              name={row.firstName}
              avtBg="bg-purple-200 text-purple-700"
            />
          </div>
          <div>
            <div className="font-medium">
              {row.firstName} {row.lastName}
            </div>
            <div className="text-gray-500 text-xs">{row.phone}</div>
          </div>
        </div>
      ),
    },
    {
      key: "role",
      header: "Role",
      render: (row: any) => (
        <div>{row.isDepartmentManager ? "Manager" : "Member"}</div>
      ),
    },
    {
      key: "workType",
      header: "Work Type",
      render: (row: any) => <div>{row.workType || "N/A"}</div>,
    },
    {
      key: "employeeType",
      header: "Employee Type",
      render: (row: any) => (
        <div
          className={`px-3 py-2 rounded-[5px] text-center text-xs ${
            row.employeeType === "full_time"
              ? "bg-yellow-100 text-yellow-800"
              : "bg-purple-100 text-purple-800"
          }`}
        >
          {employeeTypeLabels[row.employeeType as EmployeeType] || "N/A"}
        </div>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (row: any) => (
        <div
          className={`px-3 py-2 rounded-[5px] text-center text-xs ${
            !row.leaveType
              ? "bg-green-100 text-green-800"
              : "bg-red-100 text-red-800"
          }`}
        >
          {!row.leaveType ? "Available" : "Busy"}
        </div>
      ),
    },
  ].concat(
    hasAccess("employeeRecords", "edit")
      ? [
          {
            key: "actions",
            header: "Actions",
            render: (row) => (
              <EmployeeActionMenu
                row={row as Employee & { isDepartmentManager?: boolean }}
              />
            ),
          },
        ]
      : []
  );

  const handleUpdateManager = async () => {
    if (selectedEmployeeId && department.id) {
      try {
        await updateManager.mutateAsync({
          id: department.id.toString(),
          data: {
            managerId: selectedEmployeeId,
          },
        });

        setManagerModalOpen(false);
        setSelectedEmployeeId(null);
      } catch (error) {
        console.error("Failed to update manager", error);
      }
    }
  };

  const handleUpdateEmployee = async () => {
    if (selectedEmployeeId && department.id) {
      try {
        await updateDepartment.mutateAsync({
          id: department.id.toString(),
          data: {
            name: department.name,
            description: department.description,
            // managerId: null
          },
        });

        setManagerModalOpen(false);
        setSelectedEmployeeId(null);
      } catch (error) {
        console.error("Failed to update manager", error);
      }
    }
  };

  const EmployeeActionMenu = ({
    row,
  }: {
    row: Employee & { isDepartmentManager?: boolean };
  }) => {
    const [isOpen, setIsOpen] = useState(false);

    return (
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button variant="ghost" size="icon" className="h-8 w-8 p-0">
            <MoreVertical className="h-4 w-4" />
          </Button>
        </PopoverTrigger>
        <PopoverContent align="end" className="w-[200px] p-2 space-y-1">
          {!row.isDepartmentManager && (
            <Button
              variant="ghost"
              className="w-full justify-start"
              onClick={() => {
                setSelectedEmployeeId(row.id);
                setManagerModalOpen(true);
                setIsOpen(false);
              }}
            >
              <UserCheck className="mr-2 h-4 w-4" />
              Make Manager
            </Button>
          ) 
          // : (
            // <Button
            //   variant="ghost"
            //   className="w-full justify-start"
            //   onClick={() => {
            //     setSelectedEmployeeId(row.id);
            //     setEmployeeModalOpen(true);
            //     setIsOpen(false);
            //   }}
            // >
            //   <UserCheck className="mr-2 h-4 w-4" />
            //   Make Employee
            // </Button>
          // )
          }
          <Button
            variant="ghost"
            className="w-full justify-start text-destructive hover:text-destructive"
            onClick={() => {
              setSelectedEmployeeId(row.id);
              setDeleteModalOpen(true);
              setIsOpen(false);
            }}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Delete
          </Button>
        </PopoverContent>
      </Popover>
    );
  };

  return (
    <div className="flex flex-col h-full w-full rounded-lg py-2 px-3">
      {/* Filter Section */}
      <div className="mb-4">
        <Filters
          filters={[
            {
              type: "select",
              options: [
                { label: "All Role", value: "All Role" },
                { label: "Manager", value: "manager" },
                { label: "Member", value: "member" },
              ],
              value: filter.role,
              onChange: (value) => {
                setFilter((prev) => ({ ...prev, role: value }));
                setCurrentPage(1);
              },
            },
            {
              type: "select",
              options: [
                { label: "All Work Type", value: "All Work Type" },
                { label: "Remote", value: "remote" },
                { label: "Hybrid", value: "hybrid" },
              ],
              value: filter.workType,
              onChange: (value) => {
                setFilter((prev) => ({ ...prev, workType: value }));
                setCurrentPage(1);
              },
            },
            {
              type: "select",
              options: [
                { label: "All Employee Type", value: "All Employee Type" },
                { label: "Full Time", value: "full_time" },
                { label: "Part Time", value: "part_time" },
                { label: "Contractor", value: "contractor" },
                { label: "NSP", value: "nsp" },
              ],
              value: filter.employeeType,
              onChange: (value) => {
                setFilter((prev) => ({ ...prev, employeeType: value }));
                setCurrentPage(1);
              },
            },
            {
              type: "select",
              options: [
                { label: "All Status", value: "All Status" },
                { label: "Available", value: "Available" },
                { label: "Busy", value: "Busy" },
              ],
              value: filter.status,
              onChange: (value) => {
                setFilter((prev) => ({ ...prev, status: value }));
                setCurrentPage(1);
              },
            },
          ]}
          onReset={resetFilter}
        />
      </div>

      {paginatedData.length > 0 ? (
        <div className="flex flex-col flex-grow h-full">
          {/* Table Container - Takes most of the space */}
          <div className="flex-grow overflow-auto">
            <DataTable
              columns={columns}
              data={paginatedData}
              actionBool={false}
              dividers={false}
            />
          </div>

          {/* Pagination - Fixed height */}
          <div className="h-12 mt-2 flex items-center justify-center">
            <StepProgress
              currentPage={currentPage}
              setCurrentPage={fetchData}
              totalPages={totalPages}
            />
          </div>
        </div>
      ) : (
        <div className="flex w-full h-full items-center justify-center py-8">
          No Employees In This Department
        </div>
      )}

      <ConfirmCancelModal
        isOpen={deleteModalOpen}
        onOpenChange={(open) => {
          if (!removeEmployeeFromDepartment.isPending) {
            setDeleteModalOpen(open);
            if (!open) {
              setSelectedEmployeeId(null);
            }
          }
        }}
        title="Remove Employee?"
        className="text-center"
        submitText={
          removeEmployeeFromDepartment.isPending ? "Deleting..." : "Delete"
        }
        isSubmitting={removeEmployeeFromDepartment.isPending}
        onSubmit={handleDeleteEmployee}
        onCancel={() => {
          if (!removeEmployeeFromDepartment.isPending) {
            setSelectedEmployeeId(null);
            setDeleteModalOpen(false);
          }
        }}
      >
        <div className="space-y-2 ">
          <p className="text-sm text-gray-500">
            Remove Employee From This Department?
          </p>
          <p className="text-xs text-gray-400">This action cannot be undone</p>
        </div>
      </ConfirmCancelModal>

      {/* Make Manager Confirmation Modal */}
      <ConfirmCancelModal
        isOpen={managerModalOpen}
        onOpenChange={(open) => {
          if (!updateDepartment.isPending) {
            setManagerModalOpen(open);
            if (!open) {
              setSelectedEmployeeId(null);
            }
          }
        }}
        title="Update Department Manager?"
        className="text-center"
        submitText={updateDepartment.isPending ? "Updating..." : "Update"}
        isSubmitting={updateDepartment.isPending}
        onSubmit={handleUpdateManager}
        onCancel={() => {
          if (!updateDepartment.isPending) {
            setSelectedEmployeeId(null);
            setManagerModalOpen(false);
          }
        }}
      >
        <div className="space-y-2 ">
          <p className="text-sm text-gray-500">
            Make this employee the department manager?
          </p>
          <p className="text-xs text-gray-400">
            This will replace the current manager
          </p>
        </div>
      </ConfirmCancelModal>

      {/* Make Employee Confirmation Modal */}
      <ConfirmCancelModal
        isOpen={employeeModalOpen}
        onOpenChange={(open) => {
          if (!updateDepartment.isPending) {
            setEmployeeModalOpen(open);
            if (!open) {
              setSelectedEmployeeId(null);
            }
          }
        }}
        title="Update Department Employee?"
        className="text-center"
        submitText={updateDepartment.isPending ? "Updating..." : "Update"}
        isSubmitting={updateDepartment.isPending}
        onSubmit={handleUpdateEmployee}
        onCancel={() => {
          if (!updateDepartment.isPending) {
            setSelectedEmployeeId(null);
            setEmployeeModalOpen(false);
          }
        }}
      >
        <div className="space-y-2 ">
          <p className="text-sm text-gray-500">
            Remove this employee as the department manager?
          </p>
          <p className="text-xs text-gray-400">
            This will remove the manager role
          </p>
        </div>
      </ConfirmCancelModal>
    </div>
  );
};

export default DepartmentEmployeeTable;
