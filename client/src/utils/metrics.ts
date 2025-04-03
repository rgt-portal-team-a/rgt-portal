import { Employee } from "@/types/employee";
import { PtoLeave, StatusType } from "@/types/PTOS";
import { EMPLOYEE_TYPES, PTOSTATUS_TYPES } from "@/constants";
import { IMetricCard, ColorType } from "@/components/Hr/Dashboard/MetricCard";
import { RecruitmentResponse, Recruitment } from "@/hooks/useRecruitment";

export interface MetricCalculationOptions {
  employees?: Employee[] | null;
  ptoRequests?: PtoLeave[] | null;
  recruitments?: Recruitment[] | null;
  isLoading?: boolean;
}


export const calculateMetrics = ({
  employees,
  ptoRequests,
  recruitments,
  isLoading,
}: MetricCalculationOptions): IMetricCard[] => {
  const createEmptyMetric = (
    title: string,
    color: ColorType
  ): IMetricCard => ({
    title,
    value: "0",
    growth: "0",
    color,
  });

  const createLoadingMetric = (
    title: string,
    color: ColorType
  ): IMetricCard => ({
    title,
    value: "Loading...",
    growth: "0",
    color,
  });

  if (isLoading) {
    return [
      createLoadingMetric("Total Employees", "purple"),
      createLoadingMetric("Regular Employees", "pink"),
      createLoadingMetric("Recruitment", "yellow"),
      createLoadingMetric("Employees On Leave", "blue"),
    ];
  }

  const safeEmployees = employees || [];
  const safePtoRequests = ptoRequests || [];
  const safeRecruitments = recruitments || [];

  if (safeEmployees.length === 0 && safePtoRequests.length === 0) {
    return [
      createEmptyMetric("Total Employees", "purple"),
      createEmptyMetric("Regular Employees", "pink"),
      createEmptyMetric("Recruitments", "yellow"),
      createEmptyMetric("Employees On Leave", "blue"),
    ];
  }

  const totalEmployees = safeEmployees.length;
  const totalRecruitments = safeRecruitments.length;

  const regularEmployees = safeEmployees.reduce(
    (count, emp) =>
      emp?.employeeType === EMPLOYEE_TYPES.FULL_TIME ? count + 1 : count,
    0
  );


  const onLeaveCount = safePtoRequests.reduce((count, request) => {
    return (
        request.status !== PTOSTATUS_TYPES.PENDING && 
        request.status !== PTOSTATUS_TYPES.MANAGER_DECLINED && 
        request.status !== PTOSTATUS_TYPES.HR_DECLINED
    ) ? count + 1 : count;
  }, 0);



  const calculateGrowth = (value: number): string => {
    if (value === 0) return "0";

    const growthFactor = Math.min(
      Math.max(Math.round(Math.log(value + 1) * 3), 1),
      15
    );

    return growthFactor.toString();
  };

  return [
    {
      title: "Total Employees",
      value: totalEmployees.toLocaleString(),
      growth: calculateGrowth(totalEmployees),
      color: "purple",
    },
    {
      title: "Regular Employees",
      value: regularEmployees.toLocaleString(),
      growth: calculateGrowth(regularEmployees),
      color: "pink",
    },
    {
      title: "Recruitments",
      value: totalRecruitments.toLocaleString(),
      growth: calculateGrowth(totalRecruitments),
      color: "yellow",
    },
    {
      title: "Employees On Leave",
      value: onLeaveCount.toLocaleString(),
      growth: calculateGrowth(onLeaveCount),
      color: "blue",
    },
  ];
};
