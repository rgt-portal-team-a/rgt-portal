// src/types/notification.types.ts
export enum NotificationType {
  POST_LIKED = "post_liked",
  POST_COMMENTED = "post_commented",
  COMMENT_REPLIED = "comment_replied",
  COMMENT_LIKED = "comment_liked",
  EVENT_CREATED = "event_created",
  EVENT_INVITATION = "event_invitation",
  PTO_REQUEST_CREATED = "pto_created",
  PTO_REQUEST_STATUS = "pto_request_status",
  PROJECT_ASSIGNMENT = "project_assignment",
  EMPLOYEE_RECOGNITION = "employee_recognition",
  POLL_CREATED = "poll_created",
  DEPARTMENT_ASSIGNMENT = "department_assignment",
  DEPARTMENT_REMOVAL = "department_removal",
  DEPARTMENT_TRANSFER = "department_transfer",
  DEPARTMENT_CREATED = "department_created",
  EMPLOYEE_BIRTHDAY = "employee_birthday",
}

export enum NotificationChannel {
  IN_APP = "in_app",
  EMAIL = "email",
  BOTH = "both",
}

export interface NotificationPreference {
  id: string;
  userId: number;
  notificationType: NotificationType;
  channel: NotificationChannel;
  enabled: boolean;
}

export type NotificationPreferenceUpdateDto = Pick<
  NotificationPreference,
  "notificationType" | "channel" | "enabled"
>;

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
