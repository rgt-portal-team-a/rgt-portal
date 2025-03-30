import { useCallback, useEffect, useState } from "react";
import useWebSocket, { ReadyState } from "react-use-websocket";
import { useQueryClient } from "@tanstack/react-query";
import { Notification } from "@/types/notifications";
import { useAuthContextProvider } from "./useAuthContextProvider";
import { toast } from "./use-toast";

interface UseNotificationSocketOptions {
  onNewNotification?: (notification: Notification) => void;
  enableReconnect?: boolean;
  reconnectInterval?: number;
  reconnectAttempts?: number;
}

export const useNotificationSocket = (
  options: UseNotificationSocketOptions = {}
) => {
  const {
    onNewNotification,
    enableReconnect = true,
    reconnectInterval = 5000,
    reconnectAttempts = 10,
  } = options;

  const { isAuthenticated, currentUser } = useAuthContextProvider();
  const queryClient = useQueryClient();
  const [connectionAttempts, setConnectionAttempts] = useState(0);

  const getSocketUrl = useCallback(() => {
    const baseUrl = process.env.NEXT_PUBLIC_WS_URL || 
      "https://sih2h86cxp.ap-south-1.awsapprunner.com";
    
    const cleanBaseUrl = baseUrl.replace(/\/+$/, '');
    const wsProtocol = cleanBaseUrl.startsWith("https") ? "wss" : "ws";
    const host = cleanBaseUrl.replace(/^https?:\/\//, '');
    
    return `${wsProtocol}://${host}/socket.io/?EIO=4&transport=polling`;
  }, []);

  const { sendMessage, lastMessage, readyState, getWebSocket } = useWebSocket(
    isAuthenticated ? getSocketUrl() : null,
    {
      fromSocketIO: true,
      shouldReconnect: (closeEvent) => {
        if (closeEvent.code === 4001) return false; 
        return enableReconnect && connectionAttempts < reconnectAttempts;
      },
      reconnectInterval,
      reconnectAttempts,
      share: true,
      retryOnError: true,

      onOpen: (event) => {
        console.log("Socket connection established");
        setConnectionAttempts(0);
        toast({
          title: "Connected",
          description: "Real-time notifications connected",
          variant: "success",
        });
        
        if (currentUser?.token) {
          sendMessage(
            JSON.stringify({
              type: "authentication",
              token: currentUser.token,
            })
          );
        }
      },
      onClose: (event) => {
        console.log("Socket connection closed", event);
        if (!event.wasClean) {
          toast({
            title: "Disconnected",
            description: "Notification connection lost",
            variant: "destructive",
          });
        }
      },
      onError: (event) => {
        console.error("Socket error:", event);
        setConnectionAttempts((prev) => prev + 1);
      },
      queryParams: {
        token: currentUser?.token as string,
      },
    }
  );

  useEffect(() => {
    if (!lastMessage?.data) return;

    const handleSocketMessage = (data: string) => {
      try {
        if (typeof data === "string" && data.startsWith("42")) {
          const payload = JSON.parse(data.substring(2));
          const [eventName, eventData] = payload;
          if (eventName === "notification") {
            processNotification(eventData);
          }
        }
        else if (typeof data === "string") {
          const message = JSON.parse(data);
          if (message.type === "notification") {
            processNotification(message.payload);
          }
        }
      } catch (error) {
        console.error("Error parsing message:", error, lastMessage.data);
      }
    };

    const processNotification = (notification: Notification) => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      queryClient.invalidateQueries({ queryKey: ["unreadCount"] });
      onNewNotification?.(notification);
      
      toast({
        title: "New Notification",
        description: notification.content || "New update available",
      });
    };

    handleSocketMessage(lastMessage.data);
  }, [lastMessage, queryClient, onNewNotification]);

  const reconnect = useCallback(() => {
    const socket = getWebSocket();
    if (socket) {
      socket.close();
      setConnectionAttempts(0);
    }
  }, [getWebSocket]);

  const connectionStatus = {
    [ReadyState.CONNECTING]: "Connecting",
    [ReadyState.OPEN]: "Connected",
    [ReadyState.CLOSING]: "Closing",
    [ReadyState.CLOSED]: "Disconnected",
    [ReadyState.UNINSTANTIATED]: "Uninitialized",
  }[readyState];

  return {
    sendMessage,
    lastMessage,
    readyState,
    connectionStatus,
    isConnected: readyState === ReadyState.OPEN,
    reconnect,
    connectionAttempts,
  };
};
