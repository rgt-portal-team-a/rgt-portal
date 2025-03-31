import React, { useEffect, useState } from "react";
import { NotificationItem } from "./NotificationItem";
import { EmptyNotifications } from "./EmptyNotifications";
import { useNotificationSocket } from "@/hooks/useNotificationSocket";
import { SideModal } from "../ui/side-dialog";
import { useNotifications } from "@/api/query-hooks/notification";
import { toast } from "@/hooks/use-toast";

interface NotificationContainerProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export const NotificationContainer: React.FC<NotificationContainerProps> = ({
  isOpen,
  onOpenChange,
}) => {
  const [selectedNotification, setSelectedNotification] =
    useState<Notification | null>(null);

  const {
    notifications,
    isLoadingNotifications,
    markAsRead,
    markAllAsRead,
    refetchNotifications,
  } = useNotifications();

  // Setup WebSocket for real-time notifications
  const { isConnected } = useNotificationSocket({
    onNewNotification: (notification) => {
      toast({
        title: notification.title,
        description: (
          <div className="w-full bg-white shadow-lg rounded-lg pointer-events-auto flex ring-1 ring-black ring-opacity-5">
            <div className="flex-1 p-4">
              <div className="flex items-start">
                <div className="flex-shrink-0 pt-0.5">
                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-lg">
                    {notification.senderAvatar ? (
                      <img
                        src={notification.senderAvatar}
                        alt=""
                        className="h-10 w-10 rounded-full"
                      />
                    ) : (
                      "🔔"
                    )}
                  </div>
                </div>
                <div className="ml-3 flex-1">
                  <p className="text-sm font-medium text-gray-900">
                    {notification.title}
                  </p>
                  <p className="mt-1 text-sm text-gray-500">
                    {notification.content}
                  </p>
                </div>
              </div>
            </div>
            <div className="flex border-l border-gray-200">
              <button
                onClick={() => {
                  markAsRead(notification.id);
                }}
                className="w-full border border-transparent rounded-none rounded-r-lg p-4 flex items-center justify-center text-sm font-medium text-blue-600 hover:text-blue-500 focus:outline-none"
              >
                View
              </button>
            </div>
          </div>
        ),
        duration: 3000,
        variant: "success",
      });
    },
  });

  // Refetch notifications when modal opens
  useEffect(() => {
    if (isOpen) {
      refetchNotifications();
    }
  }, [isOpen, refetchNotifications]);

  const handleNotificationClick = (notification: Notification) => {
    setSelectedNotification(notification);

    // Here you could navigate or show a detail view based on the notification type
    // For now, we'll just log it
    console.log("Notification clicked:", notification);

    // You could also implement navigation based on notification type:
    /*
    switch (notification.type) {
      case NotificationType.POST_LIKED:
      case NotificationType.POST_COMMENTED:
        // Navigate to post
        break;
      case NotificationType.EVENT_INVITATION:
        // Navigate to event
        break;
      // etc.
    }
    */
  };

  return (
    <SideModal
      showCloseButton={false}
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      position="right"
      size="md"
      title="Notifications"
      headerClassName="border-b sticky top-0 bg-white z-10"
      contentClassName="flex flex-col h-full"
      footerContent={
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-500">
            {isConnected ? (
              <span className="flex items-center">
                <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                Connected
              </span>
            ) : (
              <span className="flex items-center">
                <span className="w-2 h-2 bg-red-500 rounded-full mr-2"></span>
                Disconnected
              </span>
            )}
          </span>
          {notifications.length > 0 && (
            <button
              onClick={() => markAllAsRead()}
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              Mark all as read
            </button>
          )}
        </div>
      }
    >
      <div className="overflow-auto flex-1">
        {isLoadingNotifications ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : notifications.length === 0 ? (
          <EmptyNotifications />
        ) : (
          <div className="divide-y divide-gray-200">
            {notifications.map((notification: any) => (
              <NotificationItem
                key={notification.id}
                notification={notification}
                onMarkAsRead={markAsRead}
                onClick={() => handleNotificationClick}
              />
            ))}
          </div>
        )}
      </div>
    </SideModal>
  );
};
