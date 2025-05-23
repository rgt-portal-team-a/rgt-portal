import { useMemo } from "react";
import EmployeeTable from "@/components/Hr/Dashboard/EmployeesTable";
import {
  MetricCard,
  IMetricCard,
} from "../../components/Hr/Dashboard/MetricCard";
import QuickActions from "../../components/Hr/QuickActions";
import { useAllEmployees } from "@/api/query-hooks/employee.hooks";
import { useRequestPto } from "@/hooks/usePtoRequests";
import { calculateMetrics } from "@/utils/metrics";
import {
  useRecruitments,
} from "@/hooks/useRecruitment";

export const HRDashboard = () => {
  const {
    data: employeeData,
    isLoading: isEmployeesLoading,
    isError: isEmployeesError,
    error: employeeError,
    refetch: refetchEmployees,
  } = useAllEmployees({}, {});

  const { allPtoData: ptoRequestData, isAllPtosLoading: isPTOLoading } = useRequestPto();
  const { data: recruitmentsData, isLoading: isLoadingRecruitments } = useRecruitments();


  const metrics: IMetricCard[] = useMemo(() => {
    const hasEmployeeData = employeeData && employeeData.length > 0;
    const hasPTOData = ptoRequestData && ptoRequestData.length > 0;
    const hasRecruitmentData =
      recruitmentsData?.recruitments &&
      recruitmentsData?.recruitments.length > 0;

    const shouldShowLoading =
      (isEmployeesLoading && !hasEmployeeData) ||
      (isPTOLoading && !hasPTOData) ||
      (isLoadingRecruitments && !hasRecruitmentData);

    console.log("Recruitments.recruitments", recruitmentsData?.recruitments);

    return calculateMetrics({
      employees: employeeData,
      isLoading: shouldShowLoading,
      ptoRequests: ptoRequestData,
      recruitments: recruitmentsData?.recruitments,
    });
  }, [
    employeeData,
    isEmployeesLoading,
    ptoRequestData,
    isPTOLoading,
    recruitmentsData?.recruitments,
    isLoadingRecruitments,
  ]);

  return (
    <div className="flex flex-col-reverse gap-6 md:flex-row h-full w-full">
      <div
        className="flex flex-col gap-[17px] space-y-10 md:w-[70%] overflow-y-auto"
        style={{
          scrollbarWidth: "none",
          msOverflowStyle: "none",
        }}
      >
        <div className="grid md:grid-cols-2 sm:grid-cols-1 gap-4">
          {metrics.map((metric, index) => (
            <MetricCard
              key={index}
              title={metric.title}
              value={metric.value}
              growth={metric.growth}
              color={metric.color}
            />
          ))}
        </div>
        <div>
          <EmployeeTable
            isEmployeesLoading={isEmployeesLoading}
            isEmployeesError={isEmployeesError}
            employeeData={employeeData}
            employeeError={employeeError}
            refetchEmployees={refetchEmployees}
          />
        </div>
      </div>

      <section className="md:flex justify-center h-fit md:right-0 md:top-0 hidden md:w-[30%] overflow-y-auto">
        <QuickActions />
      </section>
    </div>
  );
};
