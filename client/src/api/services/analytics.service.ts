import { createApiClient } from '../axios';
import {
  TurnoverByTenureInterface,
  TurnoverByPositionInterface,
  LeavingReasonsInterface,
  TurnoverTrendsInterface,
} from "@/types/analytics";
import { ApiResponse } from "../types";


const analyticsApiClient = createApiClient(
  `${
    import.meta.env.VITE_NODE_ENV === "development"
      ? import.meta.env.VITE_DEV_API_URL
      : import.meta.env.VITE_API_URL
  }/employee-analytics`
);


export const analyticsService = {
  getTurnoverByTenure: async (): Promise<TurnoverByTenureInterface[]> => {
    const response = await analyticsApiClient.get<
      ApiResponse<TurnoverByTenureInterface[]>
    >("/turnover-by-tenure");
    return response.data.data;
  },
  getTurnoverByPosition: async (): Promise<TurnoverByPositionInterface[]> => {
    const response = await analyticsApiClient.get<
      ApiResponse<TurnoverByPositionInterface[]>
    >("/turnover-by-position");
    return response.data.data;
  },
  getReasonsForLeaving: async (): Promise<LeavingReasonsInterface[]> => {
    const response = await analyticsApiClient.get<
      ApiResponse<LeavingReasonsInterface[]>
    >("/leaving-reasons");
    return response.data.data;
  },
  getTurnoverTrends: async (): Promise<TurnoverTrendsInterface> => {
    const response = await analyticsApiClient.get<
      ApiResponse<TurnoverTrendsInterface>
    >("/turnover-trends");
    return response.data.data;
  },
};