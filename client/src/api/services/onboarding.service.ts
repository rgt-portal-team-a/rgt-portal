import { User, OnboardUserDto, UpdateUserStatus } from "@/types/authUser";
import { createApiClient } from "../axios";
import { ApiResponse } from "../types";

const onboardingApiClient = createApiClient(
  `${
    import.meta.env.VITE_NODE_ENV === "development"
      ? import.meta.env.VITE_DEV_API_URL
      : import.meta.env.VITE_API_URL
  }`
);

export const onboardingService = {
  getAllAwaitingUsers: async (): Promise<{
    success: boolean;
    users: User[];
  }> => {
    const response = await onboardingApiClient.get(`/onboard/awaiting`);
    return response.data;
  },
  onboardUser: async (data: OnboardUserDto): Promise<ApiResponse<User>> => {
    const response = await onboardingApiClient.post(`/onboard`, data);
    return response.data;
  },
  changeStatus: async (
    data: UpdateUserStatus
  ): Promise<ApiResponse<User>> => {
    const response = await onboardingApiClient.post(`/onboard/status`, data);
    return response.data;
  },
};
