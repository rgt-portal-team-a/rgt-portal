import { NotificationPreferenceService } from "@/services/notifications/notification-preference.service";
import { NotificationService } from "@/services/notifications/ntofication.service";
import { Request, Response } from "express";
import { NotificationPreference } from "@/entities/notification-preference.entity";
import { AppDataSource } from "@/database/data-source";
import { logger } from "@/config/logger.config";

export class NotificationController {
  private notificationService: NotificationService;
  private preferenceService: NotificationPreferenceService;

  constructor() {
    this.notificationService = new NotificationService();
    this.preferenceService = new NotificationPreferenceService(AppDataSource.getRepository(NotificationPreference));
  }

  public getUserNotifications = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = (req.user as any).id;
      const notifications = await this.notificationService.getUserNotifications(userId);
      if (notifications.length === 0) {
        res.status(200).json({ notifications: [] });
        return;
      }

      res.status(200).json({ notifications });
    } catch (error) {
      console.error("Failed to get notifications", error);
      res.status(500).json({ message: "Failed to get notifications" });
    }
  };

  public getUnreadCount = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = (req.user as any).id;
      const count = await this.notificationService.getUnreadCount(userId);
      if (count === 0) {
        res.status(200).json({ count: 0 });
        return;
      }
      res.status(200).json({ count });
    } catch (error) {
      res.status(500).json({ message: "Failed to get unread count" });
    }
  };

  public markAsRead = async (req: Request, res: Response): Promise<void> => {
    try {
      const { notificationId } = req.params;
      const notification = await this.notificationService.markAsRead(notificationId);
      res.status(200).json({ notification });
    } catch (error) {
      res.status(500).json({ message: "Failed to mark notification as read" });
    }
  };

  public markAllAsRead = async (req: Request, res: Response): Promise<void> => {
    console.log("markAllAsRead");
    try {
      const userId = (req.user as any).id;
      const notifications = await this.notificationService.markAllAsRead(userId);
      res.status(200).json({ notifications });
    } catch (error) {
      res.status(500).json({ message: "Failed to mark all notifications as read" });
    }
  };

  public getUserPreferences = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = (req.user as any).id;
      const preferences = await this.preferenceService.getUserPreferences(userId);
      res.status(200).json({ preferences });
    } catch (error) {
      res.status(500).json({ message: "Failed to get notification preferences" });
    }
  };

  public updatePreference = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = (req.user as any).id;
      const { notificationType, channel, enabled } = req.body;

      const preference = await this.preferenceService.updatePreference({
        userId,
        notificationType,
        channel,
        enabled,
      });

      res.status(200).json({ preference });
    } catch (error) {
      res.status(500).json({ message: "Failed to update notification preference" });
    }
  };

  public initializePreferences = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = (req.user as any).id;

      await this.preferenceService.initializeUserPreferences(userId);

      const preferences = await this.preferenceService.getUserPreferences(userId);

      res.status(200).json({
        message: "Notification preferences initialized successfully",
        preferences,
      });
    } catch (error) {
      logger.error("Failed to initialize notification preferences", error);
      res.status(500).json({ message: "Failed to initialize notification preferences" });
    }
  };
}
