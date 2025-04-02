import { createApiClient } from '../axios';
import { TurnoverByTenureInterface } from "@/types/analytics";
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
};