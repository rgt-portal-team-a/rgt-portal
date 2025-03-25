import { NotificationChannel, NotificationType } from "@/entities/notification.entity";

export interface NotificationPayload {
  type: NotificationType;
  recipientId: number;
  senderId?: number;
  title: string;
  content: string;
  data?: any;
  redirectTo?: string;
}

export interface NotificationPreferenceDto {
  userId: number;
  notificationType: NotificationType;
  channel: NotificationChannel;
  enabled: boolean;
}
