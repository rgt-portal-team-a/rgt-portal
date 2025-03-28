import express from "express";
import cors from "cors";
import helmet from "helmet";
import passport from "passport";
import session from "express-session";
import { createServer } from "http";
import { checkDatabaseConnection, initializeDatabaseConnection } from "@/middleware/database.middleware";
import { errorLogger, httpLogger, logger, notFoundLogger } from "@/config/logger.config";
import { AuthMiddleware } from "@/middleware/auth.middleware";
import { cors as _cors } from "@/middleware/cors.middleware";
import { session as _session } from "@/middleware/session.middleware";
import {
  authRoutes,
  employeeRoutes,
  employeeRecognitionRoutes,
  eventRoutes,
  postRoutes,
  ptoRequestRoutes,
  pollRoutes,
  rootRoutes,
  fileUploaderRoutes,
  recruitmentRoutes,
  recruitmentReportRoutes,
  projectRoutes,
  departmentRoutes,
  userRoutes,
  notificationRoutes,
  aiRoutes,
} from "./routes";
import { SocketService } from "@/services/notifications/socket.service";
import { Server as SocketIOServer } from "socket.io";
import { setSocketService } from "./config/socket";
import { SchedulerService } from "@/services/scheduler.service";

const app = express();
const httpServer = createServer(app);

// app.set("trust proxy", true);

export const io: SocketIOServer = require("socket.io")(httpServer, {
  serveClient: true,
  transports: ["websocket", "polling"],
  cors: _cors,
  pingTimeout: 60000,
  connectTimeout: 60000,
  allowUpgrades: true,
  pingInterval: 25000,
  upgradeTimeout: 30000,
  allowEIO3: true,
});

httpServer.on("upgrade", (request: any, socket, head) => {
  console.log("[HTTP] WebSocket upgrade request received");
});

// MIDDLEWARE
app.use(cors(_cors));
app.use(session(_session));
app.use(passport.initialize());
app.use(passport.session());
app.use(helmet());
app.use(errorLogger);
app.use(httpLogger);
// app.use(notFoundLogger);
app.use(checkDatabaseConnection);

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

// ROUTES
app.use(rootRoutes);
app.use("/auth", authRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/employees", employeeRoutes);
app.use("/api/recognition", employeeRecognitionRoutes);
app.use("/api/leave", ptoRequestRoutes);
app.use("/api/event", eventRoutes);
app.use("/api/polls", pollRoutes);
app.use("/api/file", fileUploaderRoutes);
app.use("/api/recruitment", recruitmentRoutes);
app.use("/api/reports", recruitmentReportRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/departments", departmentRoutes);
app.use("/user/auth", userRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/ai", aiRoutes);

// UNCAUGHT EXCEPTIONS & UNHANDLED REJECTIONS
process.on("uncaughtException", (error) => {
  console.log(error);
  logger.error("Uncaught Exception:", error);
  process.exit(1);
});

process.on("unhandledRejection", (error) => {
  console.log(error);
  logger.error("Unhandled Rejection:", error);
  process.exit(1);
});

export const socketService = new SocketService(io);
const schedulerService = new SchedulerService();

const startServer = async () => {
  try {
    await initializeDatabaseConnection();

    try {
      socketService.initialize();
      setSocketService(socketService);

      await schedulerService.startSchedulers();
      logger.info("Scheduler service initialized successfully");
    } catch (error) {
      logger.error("Failed to initialize services:", error);
      process.exit(1);
    }

    const PORT = process.env.PORT || 3000;

    httpServer.listen(PORT, () => {
      logger.info(`Server running on port ${PORT}`);
    });
  } catch (error) {
    logger.error("Failed to start server:", error);
    process.exit(1);
  }
};

startServer();
