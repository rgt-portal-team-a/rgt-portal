import { SocketService } from "@/services/notifications/socket.service";

let socketServiceInstance: SocketService | null = null;

export const setSocketService = (service: SocketService) => {
  socketServiceInstance = service;
};

export const getSocketService = (): SocketService => {
  if (!socketServiceInstance) {
    throw new Error("Socket service not initialized");
  }
  return socketServiceInstance;
};
