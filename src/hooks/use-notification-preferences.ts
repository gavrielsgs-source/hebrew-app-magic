
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { NotificationPreferences } from "@/types/notification";

export function useNotificationPreferences() {
  const { user } = useAuth();
  const [preferences, setPreferences] = useState<NotificationPreferences>({
    tasks: true,
    leads: true,
    reminders: true,
    meetings: true
  });

  useEffect(() => {
    if (user) {
      loadPreferences();
    }
  }, [user]);

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
        // Type assertion to ensure proper typing
        const prefs = data.notification_preferences as unknown as NotificationPreferences;
        setPreferences(prefs);
      }
    } catch (error) {
      console.error("Error loading preferences:", error);
    }
  };

  const updatePreferences = async (newPreferences: NotificationPreferences) => {
    if (!user) return;

    try {
      await supabase
        .from("profiles")
        .update({ 
          notification_preferences: newPreferences as any
        })
        .eq("id", user.id);

      setPreferences(newPreferences);
      toast.success("העדפות התראות עודכנו!");
    } catch (error) {
      console.error("Error updating preferences:", error);
      toast.error("שגיאה בעדכון העדפות");
    }
  };

  return {
    preferences,
    updatePreferences,
    loadPreferences
  };
}
