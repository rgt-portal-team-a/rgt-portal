// src/hooks/useNotificationPreferences.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuthContextProvider } from "./useAuthContextProvider";
import {
  NotificationPreference,
  NotificationPreferenceUpdateDto,
  NotificationType,
} from "@/types/notifications";
import { notificationApi } from "@/api/services/notification.service";
import { toast } from "@/hooks/use-toast";

export const useNotificationPreferences = () => {
  const queryClient = useQueryClient();
  const { currentUser: user } = useAuthContextProvider();

  const {
    data: preferences = [],
    isLoading,
    error,
  } = useQuery<NotificationPreference[]>({
    queryKey: ["notificationPreferences", user?.id],
    queryFn: () => {
      if (!user?.id) return Promise.resolve([]);
      return notificationApi.getPreferences();
    },
    initialData: () =>
      notificationApi.getDefaultPreferences().map((dto) => ({
        ...dto,
        id: "",
        userId: typeof user?.id === "number" ? user.id : 0,
      })),
  });

  const updateMutation = useMutation<
    NotificationPreference,
    Error,
    NotificationPreferenceUpdateDto & { type: NotificationType }
  >({
    mutationFn: (dto) => notificationApi.updatePreference(dto),
    onMutate: async (newPreference) => {
      await queryClient.cancelQueries({
        queryKey: ["notificationPreferences", user?.id],
      });

      const previousPreferences = queryClient.getQueryData<
        NotificationPreference[]
      >(["notificationPreferences", user?.id]);

      queryClient.setQueryData<NotificationPreference[]>(
        ["notificationPreferences", user?.id],
        (old = []) =>
          old.map((pref) =>
            pref.notificationType === newPreference.notificationType
              ? { ...pref, ...newPreference }
              : pref
          )
      );

      return {
        previousPreferences,
        updatingType: newPreference.notificationType,
      };
    },
    onError: (error, _, context) => {
      const typedContext = context as
        | { previousPreferences?: NotificationPreference[] }
        | undefined;
      toast({
        variant: "destructive",
        title: "Update failed",
        description: error.message,
      });
      queryClient.setQueryData(
        ["notificationPreferences", user?.id],
        typedContext?.previousPreferences || []
      );
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: ["notificationPreferences", user?.id],
      });
    },
  });

  return {
    preferences,
    isLoading,
    error,
    updatePreference: updateMutation.mutate,
    isUpdating: (type: NotificationType) =>
      updateMutation.isPending &&
      updateMutation.variables?.notificationType === type,
  };
};
