import { useQuery, useMutation } from "@tanstack/react-query";
import { User, OnboardUserDto } from "@/types/authUser";
import { onboardingService } from "../services/onboarding.service";
import { ApiResponse } from "../types";
import toastService from "../services/toast.service";


export const useAllAwaitingUsers = () => {
  return useQuery<{ success: boolean; users: User[] }>({
    queryKey: ["awaiting-users"],
    queryFn: () => onboardingService.getAllAwaitingUsers(),
  });
};

export const useOnboardUser = () => {

  return useMutation({
    mutationFn: (data : OnboardUserDto ) =>
      onboardingService.onboardUser(data),
    onSuccess: (data, _variables) => {
      toastService.success(data.message || "User Onboarded created successfully");
    },
    onError: (error) => {
      toastService.error(error.message || "Failed to onboard user");
    },
  });
};