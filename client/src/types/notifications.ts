export enum NotificationType {
  POST_LIKED = "post_liked",
  POST_COMMENTED = "post_commented",
  EVENT_CREATED = "event_created",
  EVENT_INVITATION = "event_invitation",
  PTO_REQUEST_STATUS = "pto_request_status",
  PROJECT_ASSIGNMENT = "project_assignment",
  EMPLOYEE_RECOGNITION = "employee_recognition",
  POLL_CREATED = "poll_created",
}

export enum NotificationChannel {
  IN_APP = "in_app",
  EMAIL = "email",
  BOTH = "both",
}

export interface Notification {
  id: string;
  recipientId: string;
  senderId?: string;
  senderName?: string;
  senderAvatar?: string;
  type: NotificationType;
  title: string;
  content: string;
  data?: any;
  read: boolean;
  createdAt: string | Date;
}

export interface NotificationPreference {
  id: string;
  userId: string;
  notificationType: NotificationType;
  channel: NotificationChannel;
  enabled: boolean;
}
