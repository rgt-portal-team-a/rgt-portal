import React, { useState } from "react";
import { Column } from "@/types/tables";
import { DataTable } from "../../common/DataTable";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../ui/select";
import { Calendar as CalendarIcon, X } from "lucide-react";
import { Calendar } from "../../ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "../../ui/popover";
import { DateRange } from "react-day-picker";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { SideModal } from "@/components/ui/side-dialog";
import ConfirmCancelModal from "@/components/common/ConfirmCancelModal";
import { PtoLeave } from "@/types/PTOS";
import ViewIcon from "@/assets/icons/ViewIcon";
import Avtr from "@/components/Avtr";

export interface timeOffManagementTableProps {
  initialData: PtoLeave[] | undefined;
  isDataLoading: boolean;
  pageSize?: number;
}

export interface FilterState {
  type: string;
  status: string;
  dateRange?: DateRange;
}

const EmployeeTimeOffManagementTable: React.FC<timeOffManagementTableProps> = ({
  initialData,
}) => {
  const [selectedEmployee, setSelectedEmployee] = useState<PtoLeave | null>(
    null
  );

  const [rejectModalOpen, setRejectModalOpen] = React.useState<boolean>(false);
  const [approveModalOpen, setApproveModalOpen] =
    React.useState<boolean>(false);
  const [reason, setReason] = React.useState<string>("");

  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  const handleReject = (id: number | undefined): void => {
    if (id) {
      console.log("Rejected with reason:", reason);
      setRejectModalOpen(true);
      setReason("");
    }
  };

  const handleApprove = (id: number | undefined): void => {
    if (id) {
      console.log("Approved");
      setApproveModalOpen(true);
    }
  };

  const [filter, setFilter] = useState<FilterState>({
    type: "All Type",
    status: "All Status",
    dateRange: undefined,
  });

  const resetFilter = () => {
    setFilter({
      type: "All Type",
      status: "All Status",
      dateRange: undefined,
    });
  };

  const formattedData = initialData?.map((item) => ({
    ...item,
    from: format(new Date(item.startDate), "dd MMM yyyy"),
    to: format(new Date(item.endDate), "dd MMM yyyy"),
    status:
      (item.status ?? "") === "approved"
        ? "Approved by Manager"
        : (item.status ?? "") === "rejected"
        ? "Rejected by Manager"
        : "Pending",
    total: `${Math.ceil(
      (new Date(item.endDate as Date).getTime() -
        new Date(item.startDate as Date).getTime()) /
        (1000 * 60 * 60 * 24)
    )} days`,
  }));

  const columns: Column[] = [
    {
      key: "employeeName",
      header: "Employee Name",
      render: (row) => (
        <div className="flex items-center gap-1">
          {row && (
            <>
              <Avtr
                name={row.employee?.user?.username}
                url={row.employee?.user?.profileImage}
              />
              <div>
                <p className="text-[#8A8A8C] font-semibold ">
                  {row.employee?.user?.username}
                </p>
                <p className="font-[400]">{row.employee?.user?.email}</p>
              </div>
            </>
          )}
        </div>
      ),
    },
    {
      key: "from",
      header: "From",
    },
    {
      key: "to",
      header: "To",
    },
    {
      key: "total",
      header: "Total",
    },
    {
      key: "reason",
      header: "Reason",
    },
    {
      key: "status",
      header: "Status",
      cellClassName: (row) => {
        const lowerCase = row.status.toLowerCase();
        console.log("lower:", lowerCase);
        return `py-2 px-4 text-center rounded-md ${
          lowerCase === "approved"
            ? "bg-[#DFFFC7] text-[#20E42A]"
            : lowerCase === "rejected"
            ? "bg-[#FEE4E2] text-[#D92D20]"
            : "bg-yellow-100 text-yellow-800"
        }`;
      },
    },
    {
      key: "view",
      header: "Action",
      render: (row) => (
        <div className="w-full flex pl-3">
          <div
            className="bg-rgtpink rounded-[7.37px] cursor-pointer hover:bg-pink-500 transition-all duration-300 ease-in"
            onClick={() => {
              setIsModalOpen(true);
              setSelectedEmployee(row as PtoLeave);
              console.log("row:", row.id);
            }}
          >
            <ViewIcon />
          </div>
        </div>
      ),
    },
  ];

  return (
    <>
      <div className="space-y-4 bg-white py-4 flex  flex-col items-center w-full">
        {/* Filter Section */}
        <div className="flex flex-wrap px-[22px]  gap-3 justify-between items-center">
          {/* Date Range Picker */}
          {/* <div className="flex-grow min-w-auto "> */}
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant={"outline"}
                className={cn(
                  "w-[320px] py-[25px] rounded-lg justify-start text-left font-normal bg-gray-100 border-none",
                  !filter.dateRange && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {filter.dateRange?.from ? (
                  filter.dateRange.to ? (
                    <>
                      {format(filter.dateRange.from, "LLL dd, y")} -{" "}
                      {format(filter.dateRange.to, "LLL dd, y")}
                    </>
                  ) : (
                    format(filter.dateRange.from, "LLL dd, y")
                  )
                ) : (
                  <span>Pick a date range</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                initialFocus
                mode="range"
                defaultMonth={filter.dateRange?.from}
                selected={filter.dateRange}
                onSelect={(range) =>
                  setFilter((prev) => ({ ...prev, dateRange: range }))
                }
                numberOfMonths={2}
              />
            </PopoverContent>
          </Popover>
          {/* </div> */}

          {/* Type Filter */}
          <Select
            value={filter.type}
            onValueChange={(value) =>
              setFilter((prev) => ({ ...prev, type: value }))
            }
          >
            <SelectTrigger className="w-[320px] py-[25px] rounded-lg text-gray-500  hover:text-black font-normal bg-gray-100 border-none">
              <SelectValue placeholder="All Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All Type">All Type</SelectItem>
              <SelectItem value="Engagement">Engagement</SelectItem>
              <SelectItem value="Unwell">Unwell</SelectItem>
              <SelectItem value="Emergency">Emergency</SelectItem>
            </SelectContent>
          </Select>

          {/* Status Filter */}
          <Select
            value={filter.status}
            onValueChange={(value) =>
              setFilter((prev) => ({ ...prev, status: value }))
            }
          >
            <SelectTrigger className="w-[320px] py-[25px] rounded-lg text-gray-500  hover:text-black font-normal bg-gray-100 border-none">
              <SelectValue placeholder="All Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All Status">All Status</SelectItem>
              <SelectItem value="Pending">Pending</SelectItem>
              <SelectItem value="Approved">Approved</SelectItem>
              <SelectItem value="Rejected">Rejected</SelectItem>
            </SelectContent>
          </Select>

          {/* Reset Filter Button */}
          <Button
            variant="outline"
            size="icon"
            onClick={resetFilter}
            className="border-none rounded-lg bg-gray-100 text-gray-500  hover:text-black font-normal w-[100px] py-[25px]"
          >
            <X className="h-4 w-4" />
            Reset
          </Button>
        </div>

        <div className="flex w-full px-4">
          <DataTable
            columns={columns}
            data={formattedData}
            actionBool={false}
          />
        </div>

        {/* <div className="mt-4 flex justify-center ">
          <StepProgress
            currentPage={currentPage}
            setCurrentPage={setCurrentPage}
            totalPages={Math.ceil(filteredEmployees?.length ?? 0 / pageSize)}
          />
        </div> */}
      </div>

      <ConfirmCancelModal
        isOpen={rejectModalOpen}
        onOpenChange={setRejectModalOpen}
        title="Are you sure you want to reject?"
        onSubmit={() => console.log("submitting...")}
        onCancel={() => {
          setRejectModalOpen(false);
        }}
      >
        <div className="space-y-2">
          <p className="text-sm text-gray-500">Provide a Reason</p>
          <Textarea
            className="w-full"
            rows={2}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Enter reason here..."
          />
          <p className="text-xs text-gray-400">
            We can't let you go at the moment
          </p>
        </div>
      </ConfirmCancelModal>

      <ConfirmCancelModal
        isOpen={approveModalOpen}
        onOpenChange={setApproveModalOpen}
        title="Are you sure you want to approve?"
        onSubmit={() => console.log("submitting...")}
        onCancel={() => {
          setApproveModalOpen(false);
        }}
      />

      <SideModal
        isOpen={isModalOpen}
        onOpenChange={() => setIsModalOpen(false)}
        title="Approve Or Reject Request"
        showCloseButton={false}
        headerClassName="w-full flex justify-center text-[#706D8A]"
        className="flex flex-col items-center sm:w-1/2"
        footerClassName="w-full p-0 h-full flex"
        footerContent={
          <div className="w-full flex justify-center items-end gap-4">
            <Button
              variant={"ghost"}
              className="w-1/2 py-7 border-1 border-[#FF0000] text-[#FF0000] hover:text-[#FF0000] cursor-pointer transition-all duration-300 ease-in"
              onClick={() => handleReject(selectedEmployee?.id)}
            >
              Reject
            </Button>
            <Button
              variant={"secondary"}
              className="w-1/2 py-7 bg-[#DFFFC7] text-[#15FF00] cursor-pointer transition-all duration-300 ease-in hover:text-[#15FF00] hover:bg-[#DFFFC7]"
              onClick={() => handleApprove(selectedEmployee?.id)}
            >
              Approve
            </Button>
          </div>
        }
      >
        <div className=" p-6 flex flex-col ">
          {/* Employee Name */}
          <div className="mb-4">
            <label className="text-sm text-gray-300">Employee Name</label>
            <Input
              value={selectedEmployee?.employee?.user?.username}
              readOnly
              className="h-12 rounded-lg text-gray-400 mt-1 bg-gray-100 border-none shadow-none"
            />
          </div>

          {/* Date Fields */}
          <div className="flex gap-4 mb-4">
            <div className="w-1/2">
              <label className="text-sm text-gray-300">From</label>
              <div className="relative">
                <Input
                  value={format(
                    new Date(selectedEmployee?.startDate ?? new Date()),
                    "dd MMM yyyy"
                  )}
                  readOnly
                  className="h-12 rounded-lg text-gray-400 mt-1 bg-gray-100 pr-10 border-none shadow-none"
                />
              </div>
            </div>

            <div className="w-1/2">
              <label className="text-sm text-gray-300">To</label>
              <div className="relative">
                <Input
                  value={format(
                    new Date(selectedEmployee?.endDate ?? new Date()),
                    "dd MMM yyyy"
                  )}
                  readOnly
                  className="h-12 rounded-lg text-gray-400 mt-1 bg-gray-100  pr-10 border-none shadow-none"
                />
              </div>
            </div>
          </div>

          {/* Reason */}
          <div>
            <label className="text-sm text-gray-300">Reason</label>
            <Textarea
              value={selectedEmployee?.reason}
              readOnly
              className="h-28 rounded-lg text-gray-400 mt-1 bg-gray-100 border-none shadow-none"
            />
          </div>
          <div className="pt-4">
            <label className="text-sm text-gray-300">Manager Name</label>
            <Input
              value={selectedEmployee?.approver?.user?.username}
              readOnly
              className="h-12 rounded-lg text-gray-400 mt-1 bg-gray-100 border-none shadow-none"
            />
          </div>
        </div>
      </SideModal>
    </>
  );
};

export default EmployeeTimeOffManagementTable;
