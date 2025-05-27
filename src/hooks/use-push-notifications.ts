
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
    const supported = 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window;
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
      
      if (!('serviceWorker' in navigator)) {
        console.error('Service Worker not supported');
        toast.error('Service Worker לא נתמך בדפדפן זה');
        return;
      }

      const registration = await navigator.serviceWorker.register('/sw.js');
      console.log('Service worker registered:', registration);
      
      await navigator.serviceWorker.ready;
      console.log('Service worker ready');

      if (!('PushManager' in window)) {
        console.error('Push messaging not supported');
        toast.error('Push messaging לא נתמך בדפדפן זה');
        return;
      }

      console.log('Subscribing to push notifications...');
      
      // VAPID key אמיתי - זה key demo שעובד, בסביבת ייצור צריך להחליף
      const vapidKey = 'BEl62iUYgUivxIkv69yViEuiBIa40HI8YlOU2jKqbNI10oIBABwNLR5n_qrCKJI4ZEtZ7FKZ_PD_WiKoaFa5cHE';
      
      const sub = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidKey)
      });

      console.log('Push subscription created:', sub);
      setSubscription(sub);

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

  // פונקציה להמרת VAPID key לפורמט הנכון
  const urlBase64ToUint8Array = (base64String: string) => {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
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

      // אם ההתראה מתוזמנת להתרחש בעתיד הקרוב (עד 5 דקות), נשלח אותה מיד
      const now = new Date();
      const timeDiff = scheduledFor.getTime() - now.getTime();
      
      if (timeDiff <= 300000 && timeDiff > 0) { // 5 דקות
        setTimeout(() => {
          if (Notification.permission === "granted") {
            new Notification(title, {
              body: message,
              icon: "/favicon.ico",
              tag: data.id
            });
          }
        }, timeDiff);
      }

      await loadNotifications();
      toast.success("התזכורת נוצרה בהצלחה!");
    } catch (error) {
      console.error("Error scheduling notification:", error);
      toast.error("שגיאה ביצירת התזכורת");
    }
  };

  const sendTestNotification = async () => {
    if (!user || permission !== "granted") {
      toast.error("יש להפעיל התראות קודם");
      return;
    }

    try {
      // שליחת התראת בדיקה מיידית
      new Notification("התראת בדיקה", {
        body: "זו התראת בדיקה כדי לוודא שההתראות עובדות!",
        icon: "/favicon.ico",
        tag: "test-notification"
      });

      // שמירה במסד הנתונים
      await supabase
        .from("notifications")
        .insert({
          user_id: user.id,
          title: "התראת בדיקה",
          message: "זו התראת בדיקה כדי לוודא שההתראות עובדות!",
          type: "system",
          sent_at: new Date().toISOString()
        });

      toast.success("התראת בדיקה נשלחה!");
      await loadNotifications();
    } catch (error) {
      console.error("Error sending test notification:", error);
      toast.error("שגיאה בשליחת התראת בדיקה");
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
    sendTestNotification,
    updatePreferences,
    markAsRead,
    loadNotifications
  };
}
