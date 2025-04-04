import { createApiClient } from '../axios';
import {
  AttritionRequestInterface,
  AttritionResponseDto,
  JobMatchResultsResponse,
} from "@/types/ai";


const aiApiClient = createApiClient(
  `${
    import.meta.env.VITE_NODE_ENV === "development"
      ? import.meta.env.VITE_DEV_API_URL
      : import.meta.env.VITE_API_URL
  }/ai`
);


export const aiService = {
  predictAttrition: async (
    data: AttritionRequestInterface
  ): Promise<AttritionResponseDto> => {
    const response = await aiApiClient.post<AttritionResponseDto>(
      "/predict-attrition",
      data
    );
    return response.data;
  },

  getAllJobMatchResults: async (): Promise<JobMatchResultsResponse> => {
    const response = await aiApiClient.post<JobMatchResultsResponse>(
      "/get-all-job-match-results"
    );
    return response.data;
  },
};