import { Repository } from "typeorm";
import { NotificationPreference } from "@/entities/notification-preference.entity";
import { NotificationPreferenceDto } from "@/dtos/notification.dto";
import { NotificationChannel, NotificationType } from "@/entities/notification.entity";
import { Logger } from "@/services/logger.service";

export class NotificationPreferenceService {
  private logger: Logger;

  constructor(private notificationPrefRepository: Repository<NotificationPreference>) {
    this.logger = new Logger("NotificationPreferenceService");
  }

  async getUserPreferences(userId: number): Promise<NotificationPreference[]> {
    return this.notificationPrefRepository.find({
      where: { userId },
    });
  }

  async getPreference(userId: number, notificationType?: NotificationType): Promise<NotificationPreference | null> {
    return this.notificationPrefRepository.findOne({
      where: {
        userId,
        notificationType,
      },
    });
  }

  async updatePreference(preferenceDto: NotificationPreferenceDto): Promise<NotificationPreference> {
    let preference = await this.notificationPrefRepository.findOne({
      where: {
        userId: preferenceDto.userId,
        notificationType: preferenceDto.notificationType,
      },
    });

    if (!preference) {
      preference = this.notificationPrefRepository.create({
        userId: preferenceDto.userId,
        notificationType: preferenceDto.notificationType,
        channel: preferenceDto.channel,
        enabled: preferenceDto.enabled,
      });
    } else {
      preference.channel = preferenceDto.channel;
      preference.enabled = preferenceDto.enabled;
    }

    return this.notificationPrefRepository.save(preference);
  }

  /**
   * Initialize notification preferences for a new user
   * Sets up preferences for all notification types with default settings
   * @param userId User ID to create preferences for
   */
  async initializeUserPreferences(userId: number): Promise<void> {
    try {
      this.logger.info(`Initializing notification preferences for user ${userId}`);

      // Get existing preferences
      const existingPreferences = await this.getUserPreferences(userId);
      const existingTypes = new Set(existingPreferences.map((pref) => pref.notificationType));

      // Create default preferences for all notification types
      const defaultPreferences = Object.values(NotificationType).map((type) => ({
        userId,
        notificationType: type,
        channel: NotificationChannel.BOTH,
        enabled: true,
      }));

      // Only create preferences for types that don't exist yet
      for (const pref of defaultPreferences) {
        if (!existingTypes.has(pref.notificationType)) {
          this.logger.info(`Creating notification preference for user ${userId} type ${pref.notificationType}`);
          await this.notificationPrefRepository.save(this.notificationPrefRepository.create(pref));
        }
      }

      this.logger.info(`Successfully initialized notification preferences for user ${userId}`);
    } catch (error) {
      this.logger.error(`Error initializing notification preferences for user ${userId}:`, error);
      throw error;
    }
  }
}
