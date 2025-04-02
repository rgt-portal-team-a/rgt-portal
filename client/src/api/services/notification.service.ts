import { Notification, NotificationPreference } from "@/types/notifications";
import defaultApiClient from "../axios";


export const notificationApi = {
  getNotifications: async (): Promise<Notification[]> => {
    const response = await defaultApiClient.get(`/api/notifications`);
    return response.data.notifications;
  },

  getUnreadCount: async (): Promise<number> => {
    const response = await defaultApiClient.get(`/api/notifications/unread-count`);
    return response.data.count;
  },

  markAsRead: async (notificationId: string): Promise<Notification> => {
    const response = await defaultApiClient.put(
        `/api/notifications/${notificationId}/read`
    )
    return response.data.notification;
  },

  markAllAsRead: async (): Promise<void> => {
      const response = await defaultApiClient.put(`/api/notifications/all/read`);
      return response.data;
  },

  getPreferences: async (): Promise<NotificationPreference[]> => {
    const response = await defaultApiClient.get(`/api/notifications/preferences`);
    return response.data.preferences;
  },

  updatePreference: async (
    preference: Partial<NotificationPreference>
  ): Promise<NotificationPreference> => {
    const response = await defaultApiClient.put(
        `/api/notifications/preferences/${preference.id}`,
        preference
    );
    return response.data.preference;
  },
};
