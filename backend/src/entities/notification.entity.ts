import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { User } from "@/entities/user.entity";

export enum NotificationType {
  POST_LIKED = "post_liked",
  POST_COMMENTED = "post_commented",
  COMMENT_REPLIED = "comment_replied",
  COMMENT_LIKED = "comment_liked",
  EVENT_CREATED = "event_created",
  EVENT_INVITATION = "event_invitation",
  EVENT_REMINDER = "event_reminder",
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

@Entity("notifications")
export class Notification {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: "recipient_id" })
  recipient?: User;

  @Column({ nullable: true, type: "bigint" })
  recipientId?: number;

  @Column({ nullable: true, type: "bigint" })
  senderId?: number;

  @Column({
    type: "enum",
    enum: NotificationType,
  })
  type!: NotificationType;

  @Column({ nullable: true, type: "varchar" })
  redirectTo?: string;

  @Column({ type: "varchar" })
  title!: string;

  @Column({ type: "text" })
  content!: string;

  @Column({ type: "jsonb", nullable: true })
  data!: any;

  @Column({ default: false, type: "boolean" })
  read!: boolean;

  @CreateDateColumn({ type: "timestamp" })
  createdAt!: Date;
}
