
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/hooks/use-auth";
import { PushNotification } from "@/types/notification";

export function useNotificationData() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<PushNotification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadNotifications();
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
    if (!user || Notification.permission !== "granted") {
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
    notifications,
    loading,
    unreadCount,
    scheduleNotification,
    sendTestNotification,
    markAsRead,
    loadNotifications
  };
}
