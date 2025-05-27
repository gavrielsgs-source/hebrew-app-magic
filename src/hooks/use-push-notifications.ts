
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";

interface PushNotification {
  id: string;
  title: string;
  message: string;
  type: string;
  entity_type?: string;
  entity_id?: string;
  scheduled_for?: string;
  sent_at?: string;
  read_at?: string;
  created_at: string;
}

interface NotificationPreferences {
  tasks: boolean;
  leads: boolean;
  reminders: boolean;
  meetings: boolean;
}

export function usePushNotifications() {
  const { user } = useAuth();
  const [isSupported, setIsSupported] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission>("default");
  const [subscription, setSubscription] = useState<PushSubscription | null>(null);
  const [notifications, setNotifications] = useState<PushNotification[]>([]);
  const [preferences, setPreferences] = useState<NotificationPreferences>({
    tasks: true,
    leads: true,
    reminders: true,
    meetings: true
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setIsSupported('serviceWorker' in navigator && 'PushManager' in window);
    setPermission(Notification.permission);
    
    if (user) {
      loadNotifications();
      loadPreferences();
    }
  }, [user]);

  const loadNotifications = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from("notifications")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(50);

      if (error) throw error;
      setNotifications(data || []);
    } catch (error) {
      console.error("Error loading notifications:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadPreferences = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("notification_preferences")
        .eq("id", user.id)
        .single();

      if (error) throw error;
      if (data?.notification_preferences) {
        setPreferences(data.notification_preferences);
      }
    } catch (error) {
      console.error("Error loading preferences:", error);
    }
  };

  const requestPermission = async () => {
    if (!isSupported) {
      toast.error("הדפדפן לא תומך בהתראות פוש");
      return false;
    }

    try {
      const permission = await Notification.requestPermission();
      setPermission(permission);
      
      if (permission === "granted") {
        await subscribeToNotifications();
        toast.success("התראות פוש הופעלו בהצלחה!");
        return true;
      } else {
        toast.error("הרשאות התראות נדחו");
        return false;
      }
    } catch (error) {
      console.error("Error requesting permission:", error);
      toast.error("שגיאה בבקשת הרשאות");
      return false;
    }
  };

  const subscribeToNotifications = async () => {
    if (!user || permission !== "granted") return;

    try {
      const registration = await navigator.serviceWorker.register('/sw.js');
      await navigator.serviceWorker.ready;

      const sub = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: 'BMqSvZjw-7dGlXBBkBH7pAHJc9l8v4bUZvDj8Xph2dzRdXg6F8sBzU8k9V6fL2mN7X8cGzPjQ4vB5z2kR1dC-A'
      });

      setSubscription(sub);

      // Save subscription to database
      await supabase
        .from("profiles")
        .update({ 
          push_subscription: sub.toJSON()
        })
        .eq("id", user.id);

    } catch (error) {
      console.error("Error subscribing to notifications:", error);
      toast.error("שגיאה בהרשמה להתראות");
    }
  };

  const scheduleNotification = async (
    title: string,
    message: string,
    scheduledFor: Date,
    type: string = "reminder",
    entityType?: string,
    entityId?: string
  ) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from("notifications")
        .insert({
          user_id: user.id,
          title,
          message,
          type,
          entity_type: entityType,
          entity_id: entityId,
          scheduled_for: scheduledFor.toISOString()
        })
        .select()
        .single();

      if (error) throw error;

      // Send push notification via edge function
      await supabase.functions.invoke('send-push-notification', {
        body: {
          notificationId: data.id,
          title,
          message,
          scheduledFor: scheduledFor.toISOString(),
          entityType,
          entityId
        }
      });

      await loadNotifications();
      toast.success("התזכורת נוצרה בהצלחה!");
    } catch (error) {
      console.error("Error scheduling notification:", error);
      toast.error("שגיאה ביצירת התזכורת");
    }
  };

  const updatePreferences = async (newPreferences: NotificationPreferences) => {
    if (!user) return;

    try {
      await supabase
        .from("profiles")
        .update({ 
          notification_preferences: newPreferences
        })
        .eq("id", user.id);

      setPreferences(newPreferences);
      toast.success("העדפות התראות עודכנו!");
    } catch (error) {
      console.error("Error updating preferences:", error);
      toast.error("שגיאה בעדכון העדפות");
    }
  };

  const markAsRead = async (notificationId: string) => {
    try {
      await supabase
        .from("notifications")
        .update({ read_at: new Date().toISOString() })
        .eq("id", notificationId);

      await loadNotifications();
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  const unreadCount = notifications.filter(n => !n.read_at).length;

  return {
    isSupported,
    permission,
    subscription,
    notifications,
    preferences,
    loading,
    unreadCount,
    requestPermission,
    scheduleNotification,
    updatePreferences,
    markAsRead,
    loadNotifications
  };
}
