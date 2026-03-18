
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";
import { addMinutes } from "date-fns";

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

  const mapRow = (row: any): Notification => ({
    id: String(row.id),
    title: String(row.title || ""),
    message: String(row.message || ""),
    type: (row.type || "system") as Notification["type"],
    read: !!row.read_at,
    created_at: String(row.created_at),
    entityId: row.entity_id ? String(row.entity_id) : undefined,
    entityType: row.entity_type ? String(row.entity_type) : undefined,
    scheduledFor: row.scheduled_for ? String(row.scheduled_for) : undefined,
  });

  const fetchNotifications = useCallback(async () => {
    if (!user) return;
    try {
      const { data, error } = await supabase
        .from("notifications")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(50);

      if (error) throw error;
      const mapped = (data || []).map(mapRow);
      setNotifications(mapped);
      setUnreadCount(mapped.filter((n) => !n.read).length);
    } catch (error) {
      console.error("Error fetching notifications:", error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Fetch on mount + realtime subscription
  useEffect(() => {
    if (!user) return;
    fetchNotifications();

    const channel = supabase
      .channel("notifications-realtime")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${user.id}`,
        },
        () => {
          fetchNotifications();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, fetchNotifications]);

  // Check for upcoming tasks and create reminder notifications
  useEffect(() => {
    if (!user) return;

    const checkUpcomingTasks = async () => {
      const now = new Date();
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
          for (const task of upcomingTasks) {
            const dueDateValue = (task as any).due_date;
            if (typeof dueDateValue === "string" || typeof dueDateValue === "number" || dueDateValue instanceof Date) {
              const taskDate = new Date(dueDateValue);
              const timeDiff = Math.ceil((taskDate.getTime() - now.getTime()) / (1000 * 60));

              if (timeDiff <= 30 && timeDiff > 0) {
                const taskId = String((task as any).id || "");
                const taskTitle = String((task as any).title || "");
                const taskType = String((task as any).type || "");

                const { data: existingNotification } = await supabase
                  .from("notifications")
                  .select("id")
                  .eq("user_id", user.id)
                  .eq("entity_type", "task")
                  .eq("entity_id", taskId)
                  .eq("type", "reminder")
                  .maybeSingle();

                if (existingNotification) continue;

                const title = "תזכורת למשימה";
                const message = `יש לך ${taskType === "meeting" ? "פגישה" : "משימה"} בעוד ${timeDiff} דקות: ${taskTitle}`;

                await supabase.from("notifications").insert({
                  user_id: user.id,
                  title,
                  message,
                  type: "reminder",
                  entity_type: "task",
                  entity_id: taskId,
                  scheduled_for: dueDateValue.toString(),
                });

                if (Notification.permission === "granted") {
                  new Notification(title, { body: message, icon: "/favicon.ico" });
                }

                toast(title, {
                  description: message,
                  action: { label: "צפה במשימה", onClick: () => (window.location.href = "/tasks") },
                });
              }
            }
          }
        }
      } catch (error) {
        console.error("Error checking upcoming tasks:", error);
      }
    };

    if (Notification.permission === "default") {
      Notification.requestPermission();
    }

    checkUpcomingTasks();
    const interval = setInterval(checkUpcomingTasks, 60000);
    return () => clearInterval(interval);
  }, [user]);

  const markAsRead = async (notificationId: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === notificationId ? { ...n, read: true } : n))
    );
    setUnreadCount((prev) => Math.max(0, prev - 1));

    await supabase
      .from("notifications")
      .update({ read_at: new Date().toISOString() })
      .eq("id", notificationId);
  };

  const markAllAsRead = async () => {
    const unreadIds = notifications.filter((n) => !n.read).map((n) => n.id);
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    setUnreadCount(0);

    if (unreadIds.length > 0 && user) {
      await supabase
        .from("notifications")
        .update({ read_at: new Date().toISOString() })
        .eq("user_id", user.id)
        .is("read_at", null);
    }
  };

  return { notifications, loading, unreadCount, markAsRead, markAllAsRead };
}
