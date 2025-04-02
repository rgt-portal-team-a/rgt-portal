import { Employee } from "@/types/employee";
import { PtoLeave } from "@/types/PTOS";
import { EMPLOYEE_TYPES } from "@/constants";
import { IMetricCard, ColorType } from "@/components/Hr/Dashboard/MetricCard";

export interface MetricCalculationOptions {
  employees?: Employee[] | null;
  ptoRequests?: PtoLeave[] | null;
  isLoading?: boolean;
}


export const calculateMetrics = ({
  employees,
  ptoRequests,
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
      createLoadingMetric("NSS Employees", "blue"),
      createLoadingMetric("PTO Requests", "yellow"),
    ];
  }

  const safeEmployees = employees && employees.length > 0 ? employees : [];
  const safePtoRequests = ptoRequests && ptoRequests.length > 0 ? ptoRequests : [];

  if (safeEmployees.length === 0 && safePtoRequests.length === 0) {
    return [
      createEmptyMetric("Total Employees", "purple"),
      createEmptyMetric("Regular Employees", "pink"),
      createEmptyMetric("NSS Employees", "blue"),
      createEmptyMetric("PTO Requests", "yellow"),
    ];
  }

  const totalEmployees = safeEmployees.length;

  const regularEmployees = safeEmployees.reduce(
    (count, emp) =>
      emp?.employeeType === EMPLOYEE_TYPES.FULL_TIME ? count + 1 : count,
    0
  );

  const nssEmployees = safeEmployees.reduce(
    (count, emp) =>
      emp?.employeeType === EMPLOYEE_TYPES.NSP ? count + 1 : count,
    0
  );

  const ptoRequestCount = safePtoRequests.length;

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
      title: "NSS Employees",
      value: nssEmployees.toLocaleString(),
      growth: calculateGrowth(nssEmployees),
      color: "blue",
    },
    {
      title: "PTO Requests",
      value: ptoRequestCount.toLocaleString(),
      growth: calculateGrowth(ptoRequestCount),
      color: "yellow",
    },
  ];
};
