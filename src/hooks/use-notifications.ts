
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";

type Notification = {
  id: string;
  title: string;
  message: string;
  type: "reminder" | "lead" | "task" | "car" | "system";
  read: boolean;
  created_at: string;
  entityId?: string;
  entityType?: string;
};

export function useNotifications() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  // מטען את ההתראות
  useEffect(() => {
    if (!user) return;

    const fetchNotifications = async () => {
      setLoading(true);
      
      try {
        // כאן נשלוף את ההתראות מהדאטאבייס
        // במצב נוכחי נדמה נתונים
        const demoNotifications: Notification[] = [
          {
            id: "1",
            title: "תזכורת חדשה",
            message: "יש לך פגישה עם לקוח בעוד שעה",
            type: "reminder",
            read: false,
            created_at: new Date().toISOString(),
            entityType: "lead",
            entityId: "1"
          },
          {
            id: "2",
            title: "ליד חדש התווסף",
            message: "ישראל ישראלי נוסף למערכת כליד חדש",
            type: "lead",
            read: true,
            created_at: new Date(Date.now() - 8600000).toISOString(),
            entityType: "lead",
            entityId: "2"
          },
          {
            id: "3",
            title: "מועד תזכורת הגיע",
            message: "יש להתקשר ללקוח להזכיר על פגישה מחר",
            type: "task",
            read: false,
            created_at: new Date(Date.now() - 36000000).toISOString(),
            entityType: "task",
            entityId: "5"
          }
        ];
        
        setNotifications(demoNotifications);
        setUnreadCount(demoNotifications.filter(n => !n.read).length);
      } catch (error) {
        console.error("Error fetching notifications:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchNotifications();
    
    // כאן ניתן להוסיף האזנה לשינויים בזמן אמת
    // הדוגמה הבאה היתה עובדת עם סופאבייס
    /*
    const channel = supabase
      .channel('notifications-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.id}`
        },
        payload => {
          if (payload.eventType === 'INSERT') {
            setNotifications(prev => [payload.new as Notification, ...prev]);
            setUnreadCount(prev => prev + 1);
            toast({
              title: payload.new.title,
              description: payload.new.message
            });
          }
        }
      )
      .subscribe();
      
    return () => {
      supabase.removeChannel(channel);
    };
    */
  }, [user]);

  const markAsRead = async (notificationId: string) => {
    // כאן היינו מעדכנים גם בדאטאבייס
    /*
    try {
      await supabase
        .from('notifications')
        .update({ read: true })
        .eq('id', notificationId);
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
    */
    
    // עדכון המצב המקומי
    setNotifications(notifications.map(notification => 
      notification.id === notificationId ? { ...notification, read: true } : notification
    ));
    
    // עדכון ספירת הלא נקראות
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  return {
    notifications,
    loading,
    unreadCount,
    markAsRead
  };
}
