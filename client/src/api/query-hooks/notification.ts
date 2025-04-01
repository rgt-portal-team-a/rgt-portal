import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { notificationApi } from "../services/notification.service";
import { Notification, NotificationPreference } from "@/types/notifications";

export const useNotifications = () => {
  const queryClient = useQueryClient();

  const {
    data: notifications = [],
    isLoading: isLoadingNotifications,
    isError: isErrorNotifications,
    error: notificationsError,
    refetch: refetchNotifications,
  } = useQuery<Notification[]>({
    queryKey: ["notifications"],
    queryFn: notificationApi.getNotifications,
    staleTime: 60000, // 1 minute
    refetchOnWindowFocus: true,
    refetchOnMount: true,
  });

  const {
    data: unreadCount = 0,
    isLoading: isLoadingUnreadCount,
    refetch: refetchUnreadCount,
  } = useQuery<number>({
    queryKey: ["unreadCount"],
    queryFn: notificationApi.getUnreadCount,
    staleTime: 30000, // 30 seconds
    refetchOnWindowFocus: true,
    refetchOnMount: true,
    
  });

  const {
    data: preferences = [],
    isLoading: isLoadingPreferences,
    refetch: refetchPreferences,
  } = useQuery<NotificationPreference[]>({
    queryKey: ["notificationPreferences"],
    queryFn: notificationApi.getPreferences,
    staleTime: 300000, // 5 minutes
    refetchOnWindowFocus: true,
  });

  const markAsReadMutation = useMutation({
    mutationFn: (notificationId: string) =>
      notificationApi.markAsRead(notificationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      queryClient.invalidateQueries({ queryKey: ["unreadCount"] });
    },
    onError: (error: any) => {
      console.error("Error marking notification as read:", error);
    },
  });

  const markAllAsReadMutation = useMutation({
    mutationFn: () => notificationApi.markAllAsRead(),
    onSuccess: () => {
      queryClient.setQueryData<Notification[]>(
        ["notifications"],
        (oldData) =>
          oldData?.map((notification) => ({ ...notification, read: true })) ||
          []
      );
      queryClient.setQueryData(["unreadCount"], 0);
    },
    onError: (error: any) => {
      console.error("Error marking all notifications as read:", error);
    },
  });

  const updatePreferenceMutation = useMutation({
    mutationFn: (preference: Partial<NotificationPreference>) =>
      notificationApi.updatePreference(preference),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notificationPreferences"] });
    },
    onError: (error: any) => {
      console.error("Error updating notification preferences:", error);
    },
  });

  const markAsRead = (notificationId: string) => {
    markAsReadMutation.mutate(notificationId);
  };

  const markAllAsRead = () => {
    markAllAsReadMutation.mutate();
  };

  const updatePreference = (preference: Partial<NotificationPreference>) => {
    updatePreferenceMutation.mutate(preference);
  };

  return {
    notifications,
    unreadCount,
    preferences,
    isLoadingNotifications,
    isErrorNotifications,
    notificationsError,
    isLoadingUnreadCount,
    isLoadingPreferences,
    markAsRead,
    markAllAsRead,
    updatePreference,
    refetchNotifications,
    refetchUnreadCount,
    refetchPreferences,
  };
};
