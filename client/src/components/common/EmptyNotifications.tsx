import React from "react";

export const EmptyNotifications: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center">
      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center text-2xl mb-4">
        🔔
      </div>
      <h3 className="text-lg font-medium text-gray-900 mb-2">
        No notifications yet
      </h3>
      <p className="text-sm text-gray-500">
        When you get notifications, they'll appear here.
      </p>
      <p className="text-sm text-gray-500 mt-2">
        You'll receive notifications about likes, comments, events, and other
        activities.
      </p>
    </div>
  );
};
