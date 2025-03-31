import { createApiClient } from '../axios';
import {
  ConversionRateInterface,
  SourceHireSuccessRateInterface,
  DropoutRateInterface,
  HeadcountByWorkTypeInterface,
  HiringLadderInterface,
  EmployeeCountByDepartmentInterface,
  HiringTrendsData,
  HiringQueryParams,
} from "@/types/ai";
import { ApiResponse } from "../types";


const reportApiClient = createApiClient(
  `${
    import.meta.env.VITE_NODE_ENV === "development"
      ? import.meta.env.VITE_DEV_API_URL
      : import.meta.env.VITE_API_URL
  }/reports`
);


export const regularReportsService = {
  getConversionRate: async (): Promise<ConversionRateInterface> => {
    const response = await reportApiClient.get<
      ApiResponse<ConversionRateInterface>
    >("/conversion-rate");
    return response.data.data;
  },
  getSourceToHireSuccessRate:
    async (): Promise<SourceHireSuccessRateInterface> => {
      const response = await reportApiClient.get<
        ApiResponse<SourceHireSuccessRateInterface>
      >("/source-success-rate");
      return response.data.data;
    },
  getDropOutRateByStage: async (): Promise<DropoutRateInterface> => {
    const response = await reportApiClient.get<
      ApiResponse<DropoutRateInterface>
    >("/dropout-rate");
    return response.data.data;
  },
  getHeadcountByWorkType: async (): Promise<HeadcountByWorkTypeInterface> => {
    const response = await reportApiClient.get<
      ApiResponse<HeadcountByWorkTypeInterface>
    >("/employee-headcount-worktype");
    return response.data.data;
  },

  getHiringLadder: async (): Promise<HiringLadderInterface> => {
    const response = await reportApiClient.get<
      ApiResponse<HiringLadderInterface>
    >("/hiring-ladder");
    return response.data.data;
  },

  getHiringTrends: async ({
    startDate = new Date(2022, 0, 1).toISOString().split("T")[0], 
    endDate = new Date().toISOString().split("T")[0],
  }: HiringQueryParams): Promise<HiringTrendsData[]> => {
    const queryParams = new URLSearchParams();

    if (startDate && endDate) {
      queryParams.append("startDate", startDate);
      queryParams.append("endDate", endDate);
    }
    console.log("Hiring Trends Params", queryParams);
    
    const url = `/employee-hiring-trends/${
      queryParams.toString() ? `?${queryParams.toString()}` : ""
    }`;
    console.log("Hiring Trends URL", url);
    const response = await reportApiClient.get<ApiResponse<HiringTrendsData[]>>(
      url
    );
    return response.data.data;
  },

  getEmployeeCountByDepartment:
    async (): Promise<EmployeeCountByDepartmentInterface> => {
      const response = await reportApiClient.get<
        ApiResponse<EmployeeCountByDepartmentInterface>
      >("/employee-count-department");
      return response.data.data;
    },
};