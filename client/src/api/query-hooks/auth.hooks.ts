import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { authService } from "../services/auth.service";
import { User } from "@/types/authUser";

export const useGoogleAuth = () => {
  return useMutation({
    mutationFn: authService.initiateGoogleAuth,
    onMutate: () => {
      sessionStorage.setItem("oauth_pending", "true");
    },
    onSettled: () => {
      sessionStorage.removeItem("oauth_pending");
    },
  });
};

export const useCurrentUser = () => {
  return useQuery({
    queryFn: authService.getCurrentUser,
    queryKey: ["user"],
  });
};

export const useLogin = (options = {}) => {
  return useMutation({
    mutationFn: authService.login,
    ...options,
  });
};

export const useSetPassword = (options = {}) => {
  return useMutation({
    mutationFn: authService.setPassword,
    ...options,
  });
};

export const useVerifyOtp = (options = {}) => {
  return useMutation({
    mutationFn: authService.verifyOtp,
    ...options,
  });
};

export const useUpdateUser = (options = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Partial<User>) => authService.updateUser(data),
    ...options,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user"] });
    },
  });
};
