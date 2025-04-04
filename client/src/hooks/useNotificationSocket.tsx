import { useCallback, useEffect, useState } from "react";
import useWebSocket, { ReadyState } from "react-use-websocket";
import { useQueryClient } from "@tanstack/react-query";
import { Notification } from "@/types/notifications";
import { useAuthContextProvider } from "./useAuthContextProvider";
import toastService from "@/api/services/toast.service";

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
    reconnectInterval = 3000,
    reconnectAttempts = 5,
  } = options;

  const { isAuthenticated, currentUser } = useAuthContextProvider();
  const queryClient = useQueryClient();
  const [connectionAttempts, setConnectionAttempts] = useState(0);

  const wsUrl =
    import.meta.env.VITE_NODE_ENV === "development"
      ? import.meta.env.VITE_DEV_WS_BASE_URL
      : import.meta.env.VITE_WS_BASE_URL;

  const { sendMessage, lastMessage, readyState, getWebSocket } = useWebSocket(
    isAuthenticated ? wsUrl : null,
    {
      fromSocketIO: true,
      shouldReconnect: () =>
        enableReconnect && connectionAttempts < reconnectAttempts,
      reconnectInterval,
      reconnectAttempts,
      onOpen: () => {
        console.log("WebSocket connection established");
        toastService.success("WebSocket connection established");
        setConnectionAttempts(0);
      },
      onClose: () => {
        console.log("WebSocket connection closed");
      },
      onError: () => {
        toastService.error("WebSocket connection error");
        setConnectionAttempts((prev) => prev + 1);
      },
      onReconnectStop: () => {
        console.log("WebSocket reconnection attempts exhausted");
      },
      queryParams: { token: currentUser?.token as string },
    }
  );

  useEffect(() => {
    if (lastMessage?.data) {
     
      try {
        const socketData = lastMessage.data;

          if (typeof socketData === "string" && socketData.match(/^\d+\[/)) {
            const jsonStartIndex = socketData.indexOf("[");
            if (jsonStartIndex !== -1) {
              const jsonPart = socketData.substring(jsonStartIndex);
              const parsedArray = JSON.parse(jsonPart);

              if (Array.isArray(parsedArray) && parsedArray.length >= 2) {
                const [eventName, eventData] = parsedArray;

                console.log("Received Socket.IO event:", eventName, eventData);

                if (eventName === "notification") {
                  console.log("Received notification:", eventData);
                  queryClient.invalidateQueries({
                    queryKey: ["notifications"],
                  });
                  queryClient.invalidateQueries({ queryKey: ["unreadCount"] });

                  if (onNewNotification) {
                    onNewNotification(eventData as Notification);
                  }
                } else {
                  console.log("Received event notification:", eventData);
                  queryClient.invalidateQueries({
                    queryKey: ["notifications"],
                  });
                  queryClient.invalidateQueries({ queryKey: ["unreadCount"] });

                  if (onNewNotification) {
                    onNewNotification(eventData as Notification);
                  }
                }
              }
            }
          } else {
            // Handle regular JSON if not in Socket.IO format
            const data = JSON.parse(socketData);
            console.log("Received WebSocket message:", data);

            if (data.type === "notification") {
              console.log("Received notification:", data);
              const notification = data.payload as Notification;

              queryClient.invalidateQueries({ queryKey: ["notifications"] });
              queryClient.invalidateQueries({ queryKey: ["unreadCount"] });

              if (onNewNotification) {
                onNewNotification(notification);
              }
            }
          }
      } catch (error) {
        console.error(
          "Error parsing WebSocket message:",
          error,
          lastMessage.data
        );
      }
    }
  }, [lastMessage, queryClient, onNewNotification]);

  const reconnect = useCallback(() => {
    const socket = getWebSocket();
    if (socket) {
      socket.close();
    }
  }, [getWebSocket]);

  const connectionStatus = {
    [ReadyState.CONNECTING]: "Connecting",
    [ReadyState.OPEN]: "Open",
    [ReadyState.CLOSING]: "Closing",
    [ReadyState.CLOSED]: "Closed",
    [ReadyState.UNINSTANTIATED]: "Uninstantiated",
  }[readyState];

  const isConnected = readyState === ReadyState.OPEN;

  return {
    sendMessage,
    lastMessage,
    readyState,
    connectionStatus,
    isConnected,
    reconnect,
    connectionAttempts,
  };
};
