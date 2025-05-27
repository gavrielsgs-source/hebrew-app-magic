
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";
import { addMinutes, isBefore, isAfter } from "date-fns";

type Notification = {
  id: string;
  title: string;
  message: string;
  type: "reminder" | "lead" | "task" | "car" | "system";
  read: boolean;
  created_at: string;
  entityId?: string;
  entityType?: string;
  scheduledFor?: string;
};

export function useNotifications() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  // Check for upcoming tasks and create notifications
  useEffect(() => {
    if (!user) return;

    const checkUpcomingTasks = async () => {
      const now = new Date();
      const in30Minutes = addMinutes(now, 30);
      const in1Hour = addMinutes(now, 60);

      try {
        const { data: upcomingTasks } = await supabase
          .from("tasks")
          .select("id, title, due_date, type")
          .eq("user_id", user.id)
          .neq("status", "completed")
          .gte("due_date", now.toISOString())
          .lte("due_date", in1Hour.toISOString());

        if (upcomingTasks) {
          upcomingTasks.forEach(task => {
            const dueDateValue = (task as any).due_date;
            if (typeof dueDateValue === 'string' || typeof dueDateValue === 'number' || dueDateValue instanceof Date) {
              const taskDate = new Date(dueDateValue);
              const timeDiff = Math.ceil((taskDate.getTime() - now.getTime()) / (1000 * 60));

              if (timeDiff <= 30 && timeDiff > 0) {
                const taskId = String((task as any).id || '');
                const taskTitle = String((task as any).title || '');
                const taskType = String((task as any).type || '');
                
                const notification: Notification = {
                  id: `task-reminder-${taskId}`,
                  title: "תזכורת למשימה",
                  message: `יש לך ${taskType === "meeting" ? "פגישה" : "משימה"} בעוד ${timeDiff} דקות: ${taskTitle}`,
                  type: "reminder",
                  read: false,
                  created_at: new Date().toISOString(),
                  entityId: taskId,
                  entityType: "task",
                  scheduledFor: dueDateValue.toString()
                };

                // Show browser notification if supported
                if (Notification.permission === "granted") {
                  new Notification(notification.title, {
                    body: notification.message,
                    icon: "/favicon.ico"
                  });
                }

                // Show toast notification
                toast(notification.title, {
                  description: notification.message,
                  action: {
                    label: "צפה במשימה",
                    onClick: () => window.location.href = "/tasks"
                  }
                });

                setNotifications(prev => {
                  const exists = prev.some(n => n.id === notification.id);
                  if (!exists) {
                    return [notification, ...prev];
                  }
                  return prev;
                });
              }
            }
          });
        }
      } catch (error) {
        console.error("Error checking upcoming tasks:", error);
      }
    };

    // Request notification permission
    if (Notification.permission === "default") {
      Notification.requestPermission();
    }

    // Check immediately and then every minute
    checkUpcomingTasks();
    const interval = setInterval(checkUpcomingTasks, 60000);

    return () => clearInterval(interval);
  }, [user]);

  // Load initial notifications
  useEffect(() => {
    if (!user) return;

    const fetchNotifications = async () => {
      setLoading(true);
      
      try {
        // Create some sample notifications for demonstration
        const sampleNotifications: Notification[] = [
          {
            id: "1",
            title: "לידים שלא טופלו",
            message: "יש לך 3 לידים שלא טופלו מעל 24 שעות",
            type: "lead",
            read: false,
            created_at: new Date().toISOString(),
            entityType: "lead"
          },
          {
            id: "2",
            title: "רכבים לפרסום",
            message: "2 רכבים מחכים לפרסום",
            type: "car",
            read: false,
            created_at: new Date().toISOString(),
            entityType: "car"
          }
        ];
        
        setNotifications(sampleNotifications);
        setUnreadCount(sampleNotifications.filter(n => !n.read).length);
      } catch (error) {
        console.error("Error fetching notifications:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchNotifications();
  }, [user]);

  const markAsRead = async (notificationId: string) => {
    setNotifications(notifications.map(notification => 
      notification.id === notificationId ? { ...notification, read: true } : notification
    ));
    
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  const markAllAsRead = () => {
    setNotifications(notifications.map(notification => ({ ...notification, read: true })));
    setUnreadCount(0);
  };

  return {
    notifications,
    loading,
    unreadCount,
    markAsRead,
    markAllAsRead
  };
}
