
import { useNotificationPermission } from "./use-notification-permission";
import { useNotificationPreferences } from "./use-notification-preferences";
import { useNotificationData } from "./use-notification-data";

export function usePushNotifications() {
  const permissionHook = useNotificationPermission();
  const preferencesHook = useNotificationPreferences();
  const dataHook = useNotificationData();

  return {
    // Permission and subscription
    isSupported: permissionHook.isSupported,
    permission: permissionHook.permission,
    subscription: permissionHook.subscription,
    requestPermission: permissionHook.requestPermission,
    
    // Preferences
    preferences: preferencesHook.preferences,
    updatePreferences: preferencesHook.updatePreferences,
    
    // Data and notifications
    notifications: dataHook.notifications,
    loading: dataHook.loading,
    unreadCount: dataHook.unreadCount,
    scheduleNotification: dataHook.scheduleNotification,
    sendTestNotification: dataHook.sendTestNotification,
    markAsRead: dataHook.markAsRead,
    loadNotifications: dataHook.loadNotifications
  };
}
