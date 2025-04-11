import { useQuery, useMutation } from "@tanstack/react-query";
import { User, OnboardUserDto, UpdateUserStatus } from "@/types/authUser";
import { onboardingService } from "../services/onboarding.service";
import toastService from "../services/toast.service";
import { queryClient } from "@/features/data-access/rbacQuery";


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
      queryClient.invalidateQueries({ queryKey: ["awaiting-users"] });
      queryClient.invalidateQueries({ queryKey: ["employees"] });
      queryClient.invalidateQueries({ queryKey: ["departments"] });
      toastService.success(data.message || "User Onboarded created successfully");
    },
    onError: (error) => {
      toastService.error(error.message || "Failed to onboard user");
    },
  });
};


export const changeStatus = () => {
  return useMutation({
    mutationFn: (data: UpdateUserStatus) =>
      onboardingService.changeStatus(data),
    onSuccess: (data, _variables) => {
      queryClient.invalidateQueries({ queryKey: ["awaiting-users"] });
      queryClient.invalidateQueries({ queryKey: ["employees"] });
      queryClient.invalidateQueries({ queryKey: ["departments"] });
      toastService.success(data.message || "User Status Changed successfully");
    },
    onError: (error) => {
      toastService.error(error.message || "Failed to changed user status");
    },
  });
};