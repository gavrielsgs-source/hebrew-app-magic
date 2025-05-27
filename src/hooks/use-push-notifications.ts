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
    console.log('Checking notification support...');
    const supported = 'serviceWorker' in navigator && 'PushManager' in window;
    console.log('Notification support:', supported);
    setIsSupported(supported);
    
    const currentPermission = Notification.permission;
    console.log('Current permission:', currentPermission);
    setPermission(currentPermission);
    
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
    console.log('Requesting notification permission...');
    
    if (!isSupported) {
      console.log('Notifications not supported');
      toast.error("הדפדפן לא תומך בהתראות פוש");
      return false;
    }

    try {
      // בדיקה נוספת למצב הנוכחי
      console.log('Current Notification permission before request:', Notification.permission);
      
      const permission = await Notification.requestPermission();
      console.log('Permission result:', permission);
      
      setPermission(permission);
      
      if (permission === "granted") {
        console.log('Permission granted, subscribing to notifications...');
        await subscribeToNotifications();
        toast.success("התראות פוש הופעלו בהצלחה!");
        return true;
      } else if (permission === "denied") {
        console.log('Permission denied');
        toast.error("הרשאות התראות נדחו. תוכל להפעיל אותן בהגדרות הדפדפן");
        return false;
      } else {
        console.log('Permission dismissed');
        toast.error("ההרשאה לא אושרה");
        return false;
      }
    } catch (error) {
      console.error("Error requesting permission:", error);
      toast.error("שגיאה בבקשת הרשאות");
      return false;
    }
  };

  const subscribeToNotifications = async () => {
    if (!user || permission !== "granted") {
      console.log('Cannot subscribe - user or permission missing:', { user: !!user, permission });
      return;
    }

    try {
      console.log('Registering service worker...');
      
      // בדיקה אם Service Worker קיים
      if (!('serviceWorker' in navigator)) {
        console.error('Service Worker not supported');
        toast.error('Service Worker לא נתמך בדפדפן זה');
        return;
      }

      const registration = await navigator.serviceWorker.register('/sw.js');
      console.log('Service worker registered:', registration);
      
      await navigator.serviceWorker.ready;
      console.log('Service worker ready');

      // בדיקה אם יש תמיכה ב-Push Manager
      if (!('PushManager' in window)) {
        console.error('Push messaging not supported');
        toast.error('Push messaging לא נתמך בדפדפן זה');
        return;
      }

      console.log('Subscribing to push notifications...');
      const sub = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: 'BMqSvZjw-7dGlXBBkBH7pAHJc9l8v4bUZvDj8Xph2dzRdXg6F8sBzU8k9V6fL2mN7X8cGzPjQ4vB5z2kR1dC-A'
      });

      console.log('Push subscription created:', sub);
      setSubscription(sub);

      // Save subscription to database
      const { error } = await supabase
        .from("profiles")
        .update({ 
          push_subscription: sub.toJSON()
        })
        .eq("id", user.id);

      if (error) {
        console.error('Error saving subscription to database:', error);
        throw error;
      }

      console.log('Subscription saved to database successfully');

    } catch (error) {
      console.error("Error subscribing to notifications:", error);
      toast.error("שגיאה בהרשמה להתראות: " + (error as Error).message);
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
