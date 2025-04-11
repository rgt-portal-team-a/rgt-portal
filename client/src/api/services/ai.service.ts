import { createApiClient } from '../axios';
import {
  AttritionRequestInterface,
  AttritionResponseDto,
  JobMatchResultsResponse,
  ReportQueryParams,
  KairoQueryRequest,
  KairoQueryResponse,
  NspHiringSuccessInterface
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
    const response = await aiApiClient.get<JobMatchResultsResponse>(
      "/get-all-job-match-results"
    );
    return response.data;
  },

  getProgramOfStudyHired: async (): Promise<NspHiringSuccessInterface> => {
    const response = await aiApiClient.get<NspHiringSuccessInterface>(
      "/get-program-of-study-hired"
    );
    console.log("ProgramOfStudyHired from AI SERVICE", response.data);
    return response.data;
  },

  generateReport: async (params: ReportQueryParams) => {
    const queryParams = new URLSearchParams({
      type: params.type,
      format: params.format,
    });

    const url = `/generate-report/?${queryParams.toString()}`;
    console.log("Generate Report URL", url);

    const response = await aiApiClient.get(url);
    return response.data;
  },

  kairoChatbot: async (data: KairoQueryRequest) => {
    const response = await aiApiClient.post<KairoQueryResponse>(
      "/kairo-chatbot",
      data
    );
    return response.data;
  },
};