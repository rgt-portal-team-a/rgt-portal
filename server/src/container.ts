import { container } from "tsyringe";
import { Connection, createConnection, getRepository } from "typeorm";
import { MailService } from "./services/mail.service";
import { UserService } from "./services/user.service";
import { AuthMiddleware } from "./middleware/auth.middleware";
import { EmailNotificationChannel } from "./services/notifications/channels/email.channel";
import { SocketService } from "./services/notifications/socket.service";
import { SocketNotificationChannel } from "./services/notifications/channels/socket.channel";
import { NotificationService } from "./services/notifications/ntofication.service";
import { NotificationPreferenceService } from "./services/notifications/notification-preference.service";
import { NotificationPreference } from "./entities/notification-preference.entity";

container.registerSingleton(SocketService);
container.registerSingleton(MailService);
container.registerSingleton(UserService);
container.registerSingleton(AuthMiddleware);
container.registerSingleton(EmailNotificationChannel);
container.registerSingleton(SocketNotificationChannel);
container.registerSingleton(NotificationService);
container.registerSingleton(NotificationPreferenceService);

container.register("NotificationRepository", {
  useFactory: () => getRepository(Notification),
});

container.register("NotificationPreferenceRepository", {
  useFactory: () => getRepository(NotificationPreference),
});
