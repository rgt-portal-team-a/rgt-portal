/* eslint-disable @typescript-eslint/no-explicit-any */
import { DataTable } from "@/components/common/DataTable";
import DatePicker from "@/components/common/DatePicker";
import Filters, { FilterConfig } from "@/components/common/Filters";
import SuccessCard from "@/components/common/SuccessCard";
import { SideFormModal } from "@/components/common/Modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SideModal } from "@/components/ui/side-dialog";
import { timeOffTableColumns } from "@/constants";
import { useRequestPto } from "@/hooks/usePtoRequests";
import { PtoLeave } from "@/types/PTOS";
import { Field, FieldInputProps, FormikHelpers } from "formik";
import { useState } from "react";
import * as Yup from "yup";
import {
  PtoStatusType,
  statusTextMap,
} from "@/components/Hr/Employees/EmployeeTimeOffManagementTable";
import StepProgress from "@/components/common/StepProgress";

export default function TimeOff() {
  const [appRej, setAppRej] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeletePTO, setIsDeletePTO] = useState(false);
  const [selectedPtoId, setSelectedPtoId] = useState<number | undefined>(
    undefined
  );
  const [selectedType, setSelectedType] = useState<string>("All Types");
  const [selectedStatus, setSelectedStatus] = useState<string>("All Statuses");
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(5);

  const {
    createPto,
    ptoData,
    isPtoLoading,
    isPtoDeleting,
    deletePto,
    isLoading,
  } = useRequestPto();

  const formattedPtoData = ptoData?.map((item) => ({
    ...item,
    status:
      statusTextMap[(item.status as PtoStatusType) ?? PtoStatusType.PENDING],
    type:
      item.type.slice(0, 1).toUpperCase() + item.type.slice(1).toLowerCase(),
    total: `${Math.ceil(
      (new Date(item.endDate as Date).getTime() -
        new Date(item.startDate as Date).getTime()) /
        (1000 * 60 * 60 * 24)
    )} days`,
  }));

  const initialFormValues = {
    type: "vacation",
    reason: "",
    startDate: new Date(),
    endDate: new Date(),
  };

  const ptoFormSchema = Yup.object({
    type: Yup.string()
      .oneOf(["vacation", "sick"], "Invalid leave type")
      .required("Leave type is required"),
    reason: Yup.string()
      .max(50, "reason must be at most 50 characters")
      .required("reason is required"),
    startDate: Yup.date()
      .required("From date is required")
      .typeError("Invalid date"),
    endDate: Yup.date()
      .required("To date is required")
      .min(Yup.ref("startDate"), "To date must be after From date")
      .typeError("Invalid date"),
  });

  const handleFormSubmit = async (
    values: typeof initialFormValues,
    { setSubmitting }: FormikHelpers<typeof initialFormValues>
  ) => {
    try {
      await createPto(values as PtoLeave);
      setIsModalOpen(false);
    } catch (error) {
      console.error("Error creating PTO:", error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleCheckNow = () => {
    setIsSuccess(false);
  };

  const viewPtoData = ptoData?.find((item) => item.id === selectedPtoId);

  const filteredPtoData = formattedPtoData?.filter((item) => {
    // Filter by type
    const typeMatch =
      selectedType === "All Types" ||
      item.type.toLowerCase() === selectedType.toLowerCase();

    // Filter by status
    const statusMatch =
      selectedStatus === "All Statuses" ||
      item.status === statusTextMap[selectedStatus as PtoStatusType];

    // Filter by date
    const dateMatch =
      !selectedDate ||
      (item.startDate &&
        new Date(item.startDate).setHours(0, 0, 0, 0) <=
          new Date(selectedDate).setHours(0, 0, 0, 0) &&
        item.endDate &&
        new Date(item.endDate).setHours(0, 0, 0, 0) >=
          new Date(selectedDate).setHours(0, 0, 0, 0));

    return typeMatch && statusMatch && dateMatch;
  });

  const paginatedData =
    filteredPtoData?.slice(
      (currentPage - 1) * pageSize,
      currentPage * pageSize
    ) || [];

  const handleResetFilters = () => {
    setSelectedType("All Types");
    setSelectedStatus("All Statuses");
    setSelectedDate(null);
  };

  const filters: FilterConfig[] = [
    {
      type: "select",
      options: [
        { label: "All Types", value: "All Types" },
        { label: "Vacation", value: "Vacation" },
        { label: "Sick", value: "Sick" },
      ],
      value: selectedType,
      onChange: setSelectedType,
    },
    {
      type: "select",
      options: [
        { label: "All Statuses", value: "All Statuses" },
        { label: "Pending", value: PtoStatusType.PENDING },
        { label: "Approved by Manager", value: PtoStatusType.MANAGER_APPROVED },
        { label: "Declined by Manager", value: PtoStatusType.MANAGER_DECLINED },
        { label: "Approved by HR", value: PtoStatusType.HR_APPROVED },
        { label: "Declined by HR", value: PtoStatusType.HR_DECLINED },
      ],

      value: selectedStatus,
      onChange: setSelectedStatus,
    },
    {
      type: "date",
      placeholder: "Select a date",
      value: selectedDate,
      onChange: setSelectedDate,
    },
  ];

  return (
    <main className="bg-white px-4 py-2 rounded-md overflow-auto h-full">
      <div className="h-full">
        <header className="flex sm:flex-row flex-col justify-between sm:items-center">
          <h1 className="text-xl font-semibold mb-4 text-[#706D8A] ">
            Request Time List
          </h1>
          <Button
            className="bg-[#6418C3] hover:bg-purple-800 cursor-pointer text-white font-medium text-sm py-6 transition-colors duration-300 ease-in"
            onClick={() => setIsModalOpen(true)}
          >
            <img src="/Add.svg" alt="add" />
            <p className="hidden sm:block">Add New Request</p>
          </Button>
        </header>

        <Filters filters={filters} onReset={handleResetFilters} />

        <div className="h-[300px] sm:h-[360px] md:h-[430px] overflow-auto mb-4 md:mb-0">
          <DataTable
            columns={timeOffTableColumns}
            data={paginatedData || []}
            actionBool={true}
            actionObj={[
              {
                name: "view",
                action: (rowData) => {
                  setAppRej(!appRej);
                  setSelectedPtoId(rowData);
                },
              },
              {
                name: "delete",
                action: () => setIsDeletePTO(true),
              },
            ]}
            showDelete={isDeletePTO}
            setShowDelete={setIsDeletePTO}
            isDeleteLoading={isPtoDeleting}
            onDelete={deletePto}
            loading={isLoading}
          />
        </div>
        {!isLoading && filteredPtoData && filteredPtoData.length > 0 && (
          <div className="">
            <StepProgress
              currentPage={currentPage}
              setCurrentPage={setCurrentPage}
              totalPages={Math.ceil((filteredPtoData?.length || 0) / pageSize)}
            />
          </div>
        )}
      </div>

      {/* modal for a new Time off request */}
      {isModalOpen && (
        <SideFormModal
          onSubmit={handleFormSubmit}
          title="Add New Time Off"
          validationSchema={ptoFormSchema}
          initialFormValues={initialFormValues}
          backFn={() => setIsModalOpen(false)}
          back={true}
          isSubmitting={isPtoLoading}
          submitBtnText="Create"
          buttonClassName="px-6 py-4 w-1/2 cursor-pointer text-white font-medium bg-rgtpink rounded-md hover:bg-pink-500"
        >
          <Field name="type">
            {({
              field,
              form: { setFieldValue },
            }: {
              field: FieldInputProps<string>;
              form: any;
            }) => (
              <div className="pb-1">
                <label className="block text-xs font-medium pb-1 text-[#737276]">
                  Leave Type
                </label>
                <div className="flex gap-4">
                  <button
                    type="button"
                    onClick={() => setFieldValue("type", "vacation")}
                    className={`px-4 py-2 rounded-md text-xs font-medium ${
                      field.value === "vacation"
                        ? "bg-rgtpink text-white"
                        : "bg-slate-200 text-black"
                    }`}
                  >
                    Vacation
                  </button>
                  <button
                    type="button"
                    onClick={() => setFieldValue("type", "sick")}
                    className={`px-4 py-2 rounded-md text-xs font-medium ${
                      field.value === "sick"
                        ? "bg-rgtpink text-white"
                        : "bg-slate-200 text-black"
                    }`}
                  >
                    Sick
                  </button>
                </div>
              </div>
            )}
          </Field>

          <div className="flex w-full gap-4 pt-2">
            <Field name="startDate">
              {({
                field,
                form: { setFieldValue, touched, errors },
              }: {
                field: FieldInputProps<Date>;
                form: any;
              }) => (
                <div className="flex flex-col w-full">
                  <label className="font-medium text-xs text-[#737276]">
                    From
                  </label>
                  <DatePicker
                    placeholder="From"
                    value={field.value}
                    onChange={(val) => setFieldValue("startDate", val)}
                  />
                  {touched.startDate && errors.startDate && (
                    <div className="text-red-500 text-xs mt-1">
                      {errors.startDate}
                    </div>
                  )}
                </div>
              )}
            </Field>

            <Field name="endDate">
              {({
                field,
                form: { setFieldValue, touched, errors },
              }: {
                field: FieldInputProps<Date>;
                form: any;
              }) => (
                <div className="flex flex-col w-full">
                  <label className="font-medium text-xs text-[#737276]">
                    To
                  </label>
                  <DatePicker
                    placeholder="To"
                    value={field.value}
                    onChange={(val) => setFieldValue("endDate", val)}
                  />
                  {touched.endDate && errors.endDate && (
                    <div className="text-red-500 text-xs mt-1">
                      {errors.endDate}
                    </div>
                  )}
                </div>
              )}
            </Field>
          </div>

          <Field name="reason">
            {({
              field,
              form: { touched, errors },
            }: {
              field: FieldInputProps<string>;
              form: any;
            }) => (
              <div className="pt-5">
                <label className="block text-xs font-medium pb-1 text-[#737276]">
                  reason
                </label>
                <textarea
                  {...field}
                  className={`w-full px-3 py-2 border rounded-md resize-none bg-[#F6F6F9] ${
                    touched.reason && errors.reason ? "border-red-500" : ""
                  }`}
                  rows={3}
                  placeholder="Provide your reason"
                  maxLength={50}
                />
                {touched.reason && errors.reason && (
                  <div className="text-red-500 text-xs mt-1">
                    {errors.reason}
                  </div>
                )}
              </div>
            )}
          </Field>
        </SideFormModal>
      )}

      {/* modal for viewing old request */}

      <SideModal
        title="Approve or Reject Request"
        onOpenChange={() => setAppRej(false)}
        isOpen={appRej}
        showCloseButton={false}
        className="w-1/2 md:w-[4
        0%] px-4"
      >
        {viewPtoData && (
          <>
            <section className="flex gap-2">
              <div>
                <label className="text-slate-500 font-semibold text-sm">
                  From
                </label>
                <Input
                  value={
                    viewPtoData.startDate
                      ? new Date(viewPtoData.startDate).toDateString()
                      : ""
                  }
                  className="shadow-none border-0 py-[22px] rounded-md bg-[#F6F6F9] text-slate-500 font-medium text-base"
                  disabled
                />
              </div>

              <div>
                <label className="text-slate-500 font-semibold text-sm">
                  To
                </label>
                <Input
                  value={
                    viewPtoData.endDate
                      ? new Date(viewPtoData.endDate).toDateString()
                      : ""
                  }
                  className="shadow-none border-0 py-[22px] rounded-md bg-[#F6F6F9] text-slate-500 font-medium text-base"
                  disabled
                />
              </div>
            </section>
            <section className="space-y-5 pt-3">
              <div className="flex flex-col gap-1">
                <label className="text-slate-500 font-semibold text-sm">
                  Reason
                </label>
                <textarea
                  className="resize-none bg-[#F6F6F9] p-2 text-slate-500 font-medium text-base rounded-md"
                  value={viewPtoData.reason}
                  disabled
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-slate-500 font-semibold text-sm">
                  HR reason
                </label>
                <textarea
                  className="resize-none bg-[#F6F6F9] p-2 text-slate-500 font-medium text-base rounded-md"
                  value={viewPtoData.statusReason}
                  disabled
                />
              </div>
            </section>
          </>
        )}
      </SideModal>

      {/* Success modal for timeoff creation */}
      {isSuccess && <SuccessCard handleClick={handleCheckNow} />}
    </main>
  );
}
