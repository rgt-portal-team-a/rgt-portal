import React, { useMemo } from "react";
import { format, formatDistanceToNow } from "date-fns";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Notification, NotificationType } from "@/types/notifications";


interface NotificationItemProps {
  notification: Notification;
  onMarkAsRead: (id: string) => void;
  onClick?: (notification: Notification) => void;
}

export const NotificationItem: React.FC<NotificationItemProps> = ({
  notification,
  onMarkAsRead,
  onClick,
}) => {
  const formattedDate = useMemo(() => {
    const date = new Date(notification.createdAt);
    const now = new Date();
    const diffInHours = Math.abs(now.getTime() - date.getTime()) / 36e5;

    return diffInHours < 24
      ? formatDistanceToNow(date, { addSuffix: true })  
      : format(date, "MMM d, yyyy");
  }, [notification.createdAt]);

  const getIcon = () => {
    switch (notification.type) {
      case NotificationType.POST_LIKED:
        return "❤️";
      case NotificationType.POST_COMMENTED:
        return "💬";
      case NotificationType.EVENT_CREATED:
      case NotificationType.EVENT_INVITATION:
        return "📅";
      case NotificationType.PTO_REQUEST_STATUS:
        return "✈️";
      case NotificationType.PROJECT_ASSIGNMENT:
        return "📋";
      case NotificationType.EMPLOYEE_RECOGNITION:
        return "🏆";
      case NotificationType.POLL_CREATED:
        return "📊";
      default:
        return "🔔";
    }
  };

  const handleClick = () => {
    if (!notification.read) {
      onMarkAsRead(notification.id);
    }
    onClick?.(notification);
  };

  return (
    <div
      className={`p-4 border-b last:border-b-0 hover:bg-gray-50 cursor-pointer transition-colors duration-200 ${
        notification.read ? "bg-white" : "bg-blue-50"
      }`}
      onClick={handleClick}
    >
      <div className="flex items-start">
        {notification.senderAvatar ? (
          <Avatar
            className={`border-2 border-white `}
          >
            <AvatarImage src={notification?.senderAvatar} className="h-full w-full" />
            <AvatarFallback className="h-full w-full">{notification?.senderName}</AvatarFallback>
          </Avatar>
        ) : (
          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-lg">
            {getIcon()}
          </div>
        )}

        <div className="ml-3 flex-1">
          <div className="flex justify-between items-start">
            <h4 className="font-medium text-gray-900 mb-1">
              {notification.title}
            </h4>
            {!notification.read && (
              <span className="w-2 h-2 rounded-full bg-blue-600 inline-block ml-2 mt-2"></span>
            )}
          </div>

          <p className="text-sm text-gray-600 mb-1">{notification.content}</p>

          <div className="flex justify-between items-center mt-1">
            <span className="text-xs text-gray-500">{formattedDate}</span>

            {!notification.read && (
              <button
                className="text-xs text-blue-600 hover:text-blue-800"
                onClick={(e) => {
                  e.stopPropagation();
                  onMarkAsRead(notification.id);
                }}
              >
                Mark as read
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
