import { NotificationPayload } from "@/dtos/notification.dto";

export interface NotificationChannel {
  sendNotification(notification: NotificationPayload): Promise<void>;
}
