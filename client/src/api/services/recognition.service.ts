import { createApiClient } from "../axios";
import { ApiResponse } from '../types';
import { CreateRecognitionDto, EmployeeRecognition } from "@/types/recognition";

const recognitionApiClient = createApiClient(
  `${
    import.meta.env.VITE_NODE_ENV === "development"
      ? import.meta.env.VITE_DEV_API_URL
      : import.meta.env.VITE_API_URL
  }/recognition`
);

export const recognitionService = {
  createNewRecognition: async (
    data: CreateRecognitionDto
  ): Promise<EmployeeRecognition> => {
    const response = await recognitionApiClient.post<EmployeeRecognition>(
      '/',
      data
    );
    return response.data;
  },

  createNewRecognitionBulk: async (
    data: CreateRecognitionDto[]
  ): Promise<EmployeeRecognition[]> => {
    const response = await recognitionApiClient.post<EmployeeRecognition[]>(
      '/',
      data
    );
    return response.data;
  },

    getAllRecognitions: async (): Promise<ApiResponse<EmployeeRecognition[]>> => {
        const response = await recognitionApiClient.get<ApiResponse<EmployeeRecognition[]>>("/");
        return response.data;
    },
};
