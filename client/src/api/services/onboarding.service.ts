import { User, OnboardUserDto } from "@/types/authUser";
import { createApiClient } from "../axios";
import { ApiResponse } from "../types";

const onboardingApiClient = createApiClient(
  `${
    import.meta.env.VITE_NODE_ENV === "development"
      ? import.meta.env.VITE_DEV_API_URL
      : import.meta.env.VITE_API_URL
  }/onboard`
);

export const onboardingService = {

  getAllAwaitingUsers: async (): Promise<{success: boolean, users: User[]}> => {
    const response = await onboardingApiClient.get(`/awaiting`);
    return response.data;
  },
  onboardUser: async (data: OnboardUserDto): Promise<ApiResponse<User>> => {
    const response = await onboardingApiClient.post(`/`,data);
    return response.data;
  },

};
