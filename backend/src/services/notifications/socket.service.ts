import { Socket, Server as SocketIOServer } from "socket.io";
import { AuthMiddleware } from "@/middleware/auth.middleware";
import { logger } from "@/config/logger.config";

export class SocketService {
  private io: SocketIOServer;
  private userSocketMap: Map<number, string[]> = new Map();
  private authMiddleware: AuthMiddleware;
  constructor(io: SocketIOServer) {
    this.authMiddleware = new AuthMiddleware();
    this.io = io;
  }

  initialize(): Promise<void> {
    logger.info("Initializing socket service");
    this.setupSocketAuth();
    this.setupEventHandlers();
    return Promise.resolve();
  }

  private setupSocketAuth(): void {
    logger.info("Setting up socket authentication");
      this.io.use(async (socket: Socket, next: (err?: Error) => void) => {
      try {
        const token =  socket.handshake.query.token as string;
        if (!token) {
          logger.error("Socket authentication error: No token provided");
          return next(new Error("Authentication error: No token provided"));
        }

        const user = await this.authMiddleware.validateToken(token);
        if (!user) {
          return next(new Error("Authentication error: Invalid token"));
        }

        logger.info("Socket authentication successful:", user.id);

        socket.data.user = user;
        next();
      } catch (error) {
        console.error("Socket authentication error:", error);
        next(new Error("Authentication error: Server error"));
      }
    });
  }

  private setupEventHandlers(): void {
    try {
      this.io.on("connection", async (socket) => {
        // console.log("Socket connected:", socket);
        const userId = socket.data?.user?.id;
        // console.log("userId in socket connection", socket.data?.user);
        if (!this.userSocketMap.has(userId)) {
          this.userSocketMap.set(userId, []);
        }
        this.userSocketMap.get(userId)?.push(socket.id);

        socket.on("disconnect", () => {
          logger.info("Socket disconnected:", socket.id);
          const userSockets = this.userSocketMap.get(userId) || [];
          const index = userSockets.indexOf(socket.id);
          if (index !== -1) {
            userSockets.splice(index, 1);
          }
          if (userSockets.length === 0) {
            this.userSocketMap.delete(userId);
          }
        });

        socket.on("error", (error) => {
          logger.error("Socket error:", error);
        });

        socket.on("close", () => {
          logger.info("Socket closed:", socket.id);
          const userSockets = this.userSocketMap.get(userId) || [];
          const index = userSockets.indexOf(socket.id);
          if (index !== -1) {
            userSockets.splice(index, 1);
          }
          if (userSockets.length === 0) {
            this.userSocketMap.delete(userId);
          }
        });
      });
    } catch (error) {
      logger.error("Error setting up event handlers:", error);
      throw error;
    }
  }

    public emitToUser =  (userId: number, event: string, data: any) => {
        // console.log("userId", userId);
        // console.log("all sockets", this.userSocketMap);
    const userSockets = this.userSocketMap.get(userId) || [];
    // console.log("userSockets", userSockets);
    userSockets.forEach((socketId) => {
      // console.log("socketId", socketId);
      this.io.to(socketId).emit(event, data);
    });
  }

  public emitToAll = async (event: string, data: any): Promise<void> => {
    this.io.emit(event, data);
  }
}

