import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { User } from "@/entities/user.entity";
import { NotificationChannel, NotificationType } from "./notification.entity";


@Entity("notification_preferences")
export class NotificationPreference {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: "user_id" })
  user!: User;

  @Column({ nullable: true, type: "bigint" })
  userId!: number;
 
  @Column({
    type: "enum",
    enum: NotificationType,
  })
  notificationType!: NotificationType;

  @Column({
    type: "enum",
    enum: NotificationChannel,
    default: NotificationChannel.BOTH,
  })
  channel!: NotificationChannel;

  @Column({ default: true, type: "boolean" })
  enabled!: boolean;
}
