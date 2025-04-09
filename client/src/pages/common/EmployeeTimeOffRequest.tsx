import { FilterConfig } from "@/components/common/Filters";
import EmployeeTimeOffManagementTable, {
  FilterState,
  PtoStatusType,
} from "@/components/Hr/Employees/EmployeeTimeOffManagementTable";
import { PtoLeave } from "@/types/PTOS";
import { useState } from "react";

const EmployeeTimeOffRequest = ({
  data,
  isDataLoading,
  departmentName,
}: {
  data: PtoLeave[] | undefined;
  isDataLoading: boolean;
  departmentName?: string;
}) => {
  const [filter, setFilter] = useState<FilterState>({
    type: "All Type",
    status: "All Status",
    selectedDate: null,
    searchQuery: "",
  });

  const resetFilter = () => {
    setFilter({
      type: "All Type",
      status: "All Status",
      selectedDate: null,
      searchQuery: "",
    });
  };

  const filterConfigs: FilterConfig[] = [
    {
      type: "input", // New input type
      placeholder: "Search by name",
      value: filter.searchQuery,
      onChange: (value) =>
        setFilter((prev) => ({ ...prev, searchQuery: value })),
      inputType: "text",
    },
    {
      type: "select",
      options: [
        { label: "All Status", value: "All Status" },
        { label: "Pending", value: PtoStatusType.PENDING },
        {
          label: "Approved by Manager",
          value: PtoStatusType.MANAGER_APPROVED,
        },
        {
          label: "Declined by Manager",
          value: PtoStatusType.MANAGER_DECLINED,
        },
        { label: "Approved by HR", value: PtoStatusType.HR_APPROVED },
        { label: "Declined by HR", value: PtoStatusType.HR_DECLINED },
      ],
      value: filter.status,
      onChange: (value) => setFilter((prev) => ({ ...prev, status: value })),
    },
    {
      type: "date",
      placeholder: "Pick a date range",
      value: filter.selectedDate,
      onChange: (value) =>
        setFilter((prev) => ({ ...prev, selectedDate: value })),
    },
  ];

  const filterData = (data: PtoLeave[] | undefined): PtoLeave[] => {
    if (!data) return [];

    return data.filter((item) => {
      // Filter by type
      if (
        filter.type !== "All Type" &&
        item.type.toLocaleLowerCase() !== filter.type.toLocaleLowerCase()
      ) {
        return false;
      }

      // Filter by status
      if (
        filter.status !== "All Status" &&
        item.status?.toLocaleLowerCase() !== filter.status.toLocaleLowerCase()
      ) {
        return false;
      }
      // Filter by selected date
      if (filter.selectedDate) {
        const startDate = new Date(item.startDate);
        const endDate = new Date(item.endDate);
        const selectedDate = new Date(filter.selectedDate);

        startDate.setHours(0, 0, 0, 0);
        endDate.setHours(0, 0, 0, 0);
        selectedDate.setHours(0, 0, 0, 0);

        if (startDate <= selectedDate && endDate >= selectedDate) {
          return true;
        } else {
          return false;
        }
      }

      if (
        filter.searchQuery &&
        !(
          item.employee?.user?.username
            .toLowerCase()
            .includes(filter.searchQuery.toLowerCase()) ||
          item.employee?.firstName
            ?.toLowerCase()
            .includes(filter.searchQuery.toLowerCase()) ||
          item.employee?.lastName
            ?.toLowerCase()
            .toLowerCase()
            .includes(filter.searchQuery.toLowerCase())
        )
      ) {
        return false;
      }

      return true;
    });
  };

  const filteredData = filterData(data);

  return (
    <div className="flex flex-col gap-[15px] pt-[10px] h-full bg-white rounded-md">
      <section className="space-y-2 flex flex-col sm:flex-row sm:justify-between w-full sm:items-center py-1 pl-4">
        <h1 className="text-lg sm:text-xl font-medium text-gray-600 text-nowrap">
          {departmentName ?? "Employee TimeOff Requests"}
        </h1>
      </section>

      {/* Manage Employees Table Section */}

      <EmployeeTimeOffManagementTable
        initialData={filteredData || []}
        isDataLoading={isDataLoading}
        filters={filterConfigs}
        onReset={resetFilter}
      />
    </div>
  );
};

export default EmployeeTimeOffRequest;
