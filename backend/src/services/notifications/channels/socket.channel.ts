import { NotificationPayload } from "@/dtos/notification.dto";
import { NotificationChannel } from "./interface";
import { getSocketService } from "@/config/socket";

export class SocketNotificationChannel implements NotificationChannel {
  constructor() {}

  public sendNotification = async (notification: NotificationPayload) => {
    try {
      const socketService = getSocketService();

      socketService.emitToUser(notification.recipientId, "notification", {
        type: notification.type,
        title: notification.title,
        content: notification.content,
        data: notification.data,
        createdAt: new Date(),
        read: false,
        senderId: notification.senderId,
      });
    } catch (error) {
      console.error("Failed to send notification to socket", error);
    }
  };

  public sendNotificationToAll = async (notification: NotificationPayload) => {
    const socketService = getSocketService();
    socketService.emitToAll("notification", {
      type: notification.type,
      title: notification.title,
      content: notification.content,
    });
  };
}
