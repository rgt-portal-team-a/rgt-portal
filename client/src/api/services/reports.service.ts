import { createApiClient } from '../axios';
import {
  ConversionRateInterface,
  SourceHireSuccessRateInterface,
  DropoutRateInterface,
  HeadcountByWorkTypeInterface,
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
    >("/headcount-worktype");
    return response.data.data;
  },
};