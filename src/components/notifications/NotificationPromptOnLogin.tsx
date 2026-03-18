
import { useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";

export function NotificationPromptOnLogin() {
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;
    if (!("Notification" in window)) return;
    if (Notification.permission !== "default") return;
    if (localStorage.getItem("notification_prompt_shown")) return;

    const timer = setTimeout(() => {
      Notification.requestPermission().finally(() => {
        localStorage.setItem("notification_prompt_shown", "true");
      });
    }, 3000);

    return () => clearTimeout(timer);
  }, [user]);

  return null;
}
