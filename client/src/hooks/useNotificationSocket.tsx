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
  const [shouldForcePolling, setShouldForcePolling] = useState(false);

  const getWebSocketUrl = () => {
    const baseUrl = process.env.NEXT_PUBLIC_WS_URL 
      || "https://sih2h86cxp.ap-south-1.awsapprunner.com";
    
    const wsProtocol = baseUrl.startsWith("https") ? "wss" : "ws";
    const host = baseUrl.replace(/^https?:\/\//, "");
    
    return shouldForcePolling 
      ? `${wsProtocol}://${host}/socket.io/?EIO=4&transport=polling`
      : `${wsProtocol}://${host}/socket.io/?EIO=4&transport=websocket`;
  };

  const socketOptions = {
    fromSocketIO: true,
    shouldReconnect: (closeEvent: CloseEvent) => {
      if (closeEvent.code === 4001) return false;
      return enableReconnect && connectionAttempts < reconnectAttempts;
    },
    reconnectInterval,
    reconnectAttempts,
    share: true,
    retryOnError: true,
    transports: shouldForcePolling ? ['polling'] : ['websocket', 'polling'],
    onOpen: (event: Event) => {
      console.log("Socket connection established", event);
      setConnectionAttempts(0);
      toast({
        title: "Connected",
        description: "Real-time notifications connected",
        variant: "success",
      });
      
      if (!shouldForcePolling && currentUser?.token) {
        sendMessage(
          JSON.stringify({
            type: "authentication",
            token: currentUser.token,
          })
        );
      }
    },
    onClose: (event: CloseEvent) => {
      console.log("Socket connection closed", event);
      if (event.code === 1006 && !shouldForcePolling) {
        console.warn("WebSocket failed, falling back to polling");
        setShouldForcePolling(true);
      }
    },
    onError: (event: Event) => {
      console.error("Socket error:", event);
      toast({
        title: "Connection Error",
        description: "Failed to connect to real-time service",
        variant: "destructive",
      });
      setConnectionAttempts((prev) => prev + 1);
    },
    onReconnectStop: (numAttempts: number) => {
      console.log("Reconnection attempts exhausted", numAttempts);
      toast({
        title: "Connection Lost",
        description: "Could not reconnect to notification service",
        variant: "destructive",
      });
    },
    queryParams: {
      token: currentUser?.token as string,
    },
  };

  const { sendMessage, lastMessage, readyState, getWebSocket } = useWebSocket(
    isAuthenticated ? getWebSocketUrl() : null,
    socketOptions
  );

  useEffect(() => {
    if (!lastMessage?.data) return;

    const handleSocketMessage = (data: string) => {
      try {
        if (data.startsWith("42")) {
          const payload = JSON.parse(data.substring(2));
          const [eventName, eventData] = payload;

          if (eventName === "notification") {
            processNotification(eventData);
          }
        } else {
          const message = JSON.parse(data);
          if (message.type === "notification") {
            processNotification(message.payload);
          }
        }
      } catch (error) {
        console.error("Error parsing message:", error, data);
      }
    };

    const processNotification = (notification: Notification) => {
      console.log("New notification:", notification);
      // Fixed query invalidation syntax
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      queryClient.invalidateQueries({ queryKey: ["unreadCount"] });
      onNewNotification?.(notification);
      
      toast({
        title: "New Notification",
        description: notification.content || "You have a new notification", // Changed from notification.message
      });
    };

    handleSocketMessage(lastMessage.data);
  }, [lastMessage, queryClient, onNewNotification]);

  const reconnect = useCallback(() => {
    const socket = getWebSocket();
    if (socket) {
      socket.close();
      setConnectionAttempts(0);
      setShouldForcePolling(false);
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
    isConnecting: readyState === ReadyState.CONNECTING,
    reconnect,
    connectionAttempts,
    transportMode: shouldForcePolling ? "polling" : "websocket",
  };
};
