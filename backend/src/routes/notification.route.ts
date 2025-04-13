import { Router } from "express";
import { NotificationController } from "../controllers/notification.controller";
import { AuthMiddleware } from "@/middleware/auth.middleware";

const notificationRoutes = Router();
const notificationController = new NotificationController();
const authMiddleware = new AuthMiddleware();

notificationRoutes.use(authMiddleware.isAuthenticated);

notificationRoutes.get("/", notificationController.getUserNotifications);
notificationRoutes.get("/unread-count", notificationController.getUnreadCount);
notificationRoutes.put("/all/mark-as-read", notificationController.markAllAsRead);
notificationRoutes.put("/:notificationId/read", notificationController.markAsRead);

notificationRoutes.get("/preferences", notificationController.getUserPreferences);
notificationRoutes.put("/preferences", notificationController.updatePreference);
notificationRoutes.post("/preferences/initialize", notificationController.initializePreferences);


export default notificationRoutes;
