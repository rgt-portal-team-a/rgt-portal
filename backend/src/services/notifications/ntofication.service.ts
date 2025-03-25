import { Repository } from "typeorm";
import { NotificationPreferenceService } from "./notification-preference.service";
import { SocketNotificationChannel } from "./channels/socket.channel";
import { EmailNotificationChannel } from "./channels/email.channel";
import { NotificationPayload } from "@/dtos/notification.dto";
import { Notification, NotificationChannel } from "@/entities/notification.entity";
import { AppDataSource } from "@/database/data-source";
import { NotificationPreference } from "@/entities/notification-preference.entity";


export class NotificationService {

    private notificationRepository: Repository<Notification>;
    private emailChannel: EmailNotificationChannel;
    private socketChannel: SocketNotificationChannel;
    private preferenceService: NotificationPreferenceService;
    
    constructor() {
    this.notificationRepository = AppDataSource.getRepository(Notification);
    this.emailChannel = new EmailNotificationChannel();
    this.socketChannel = new SocketNotificationChannel();
    this.preferenceService = new NotificationPreferenceService(AppDataSource.getRepository(NotificationPreference));
  }

  async createNotification(payload: NotificationPayload): Promise<Notification> {
    const notification = this.notificationRepository.create({
      recipientId: payload.recipientId,
      recipient: {
        id: payload.recipientId,
      },
      senderId: payload.senderId,
      type: payload.type,
      title: payload.title,
      content: payload.content,
      data: payload.data,
      read: false,
    });

    await this.notificationRepository.save(notification);

    await this.dispatchNotification(payload);

    return notification;
  }

  async markAsRead(notificationId: string): Promise<Notification> {
    const notification = await this.notificationRepository.findOne({
      where: { id: notificationId },
    });

    if (!notification) {
      throw new Error(`Notification with id ${notificationId} not found`);
    }

    notification.read = true;
    return this.notificationRepository.save(notification);
  }

  async markAllAsRead(userId: number): Promise<Notification[]> {
    const notifications = await this.notificationRepository.find({
      where: { recipientId: userId },
    });

    notifications.forEach(async (notification) => {
      notification.read = true;
      await this.notificationRepository.save(notification);
    });

    return notifications;
  }

  async getUserNotifications(userId: number): Promise<Notification[]> {
    return this.notificationRepository.find({
      where: { recipientId: userId },
      order: { createdAt: "DESC" },
    });
  }

  async getUnreadCount(userId: number): Promise<number> {
    return this.notificationRepository.count({
      where: { recipientId: userId, read: false },
    });
  }

  private async dispatchNotification(payload: NotificationPayload): Promise<void> {
    const preference = await this.preferenceService.getPreference(payload.recipientId, payload.type);

    const channel = preference?.enabled ? preference.channel : NotificationChannel.BOTH;

    if (!preference?.enabled) {
      return;
    }

    if (channel === NotificationChannel.IN_APP || channel === NotificationChannel.BOTH) {
      console.log("Sending notification to socket");
      await this.socketChannel.sendNotification(payload);
    }

    if (channel === NotificationChannel.EMAIL || channel === NotificationChannel.BOTH) {
      await this.emailChannel.sendNotification(payload);
    }
  }
}
