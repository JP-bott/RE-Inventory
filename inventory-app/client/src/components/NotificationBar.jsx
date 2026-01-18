import React from "react";

export function NotificationBar({ notification }) {
  if (!notification) return null;

  return (
    <div className={`notification notification-${notification.type}`}>
      {notification.message}
    </div>
  );
}
