
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './use-auth';
import { toast } from 'sonner';
import { NotificationPreferences } from '@/types/notification';

// VAPID key for development - should be replaced in production
const VAPID_KEY = 'BEl62iUYgUivxIkv69yViEuiBIa40HI8YlOU2jKqbNI10oIBABwNLR5n_qrCKJI4ZEtZ7FKZ_PD_WiKoaFa5cHE';

// Simple utility function for VAPID key conversion
const urlBase64ToUint8Array = (base64String: string) => {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
};

const getBrowserPermission = (): NotificationPermission => {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return 'default';
  }

  return Notification.permission;
};

export function usePushNotifications() {
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [isSupported, setIsSupported] = useState(false);
  const [preferences, setPreferences] = useState<NotificationPreferences>(() => {
    try {
      const cached = localStorage.getItem("notification_preferences");
      if (cached) return JSON.parse(cached);
    } catch {}
    return { tasks: true, leads: true, reminders: true, meetings: true };
  });
  const { user } = useAuth();

  useEffect(() => {
    if (!('Notification' in window)) {
      setIsSupported(false);
      return;
    }

    setIsSupported(true);

    const syncPermission = () => {
      setPermission(getBrowserPermission());
    };

    syncPermission();
    window.addEventListener('focus', syncPermission);

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        syncPermission();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('focus', syncPermission);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

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
        const prefs = data.notification_preferences as unknown as NotificationPreferences;
        setPreferences(prefs);
        localStorage.setItem("notification_preferences", JSON.stringify(prefs));
      }
    } catch (error) {
      console.error("Error loading preferences:", error);
    }
  };

  const updatePreferences = async (newPreferences: NotificationPreferences) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from("profiles")
        .upsert({
          id: user.id,
          notification_preferences: newPreferences as any,
        }, { onConflict: "id" })
        .select("id");

      if (error || !data || data.length === 0) {
        toast.error("Failed to save notification preferences");
        return;
      }

      setPreferences(newPreferences);
      localStorage.setItem("notification_preferences", JSON.stringify(newPreferences));
      toast.success("Notification preferences saved");
    } catch (error) {
      console.error("Error updating preferences:", error);
      toast.error("שגיאה בעדכון העדפות");
    }
  };

  const requestPermission = async () => {
    if (!isSupported) {
      toast.error('התראות לא נתמכות בדפדפן זה');
      return false;
    }

    try {
      const currentPermission = getBrowserPermission();
      setPermission(currentPermission);

      if (currentPermission === 'granted') {
        toast.success('הרשאת התראות כבר מאושרת');
        return true;
      }

      if (currentPermission === 'denied') {
        toast.error('ההתראות חסומות בדפדפן. צריך לאפשר אותן בהגדרות האתר ואז לנסות שוב');
        return false;
      }

      const result = await Notification.requestPermission();
      setPermission(result);

      if (result === 'granted') {
        toast.success('הרשאת התראות אושרה בהצלחה');

        if ('serviceWorker' in navigator && 'PushManager' in window) {
          try {
            const registration = await navigator.serviceWorker.register('/sw.js');
            console.log('Service Worker registered successfully');

            const subscription = await (registration as any).pushManager.subscribe({
              userVisibleOnly: true,
              applicationServerKey: urlBase64ToUint8Array(VAPID_KEY)
            });

            if (user && subscription) {
              const subscriptionJson = subscription.toJSON();

              const { error } = await supabase
                .from('profiles')
                .update({
                  push_subscription: subscriptionJson as any,
                  notification_preferences: preferences as any
                })
                .eq('id', user.id);

              if (error) {
                console.error('Error saving push subscription:', error);
              } else {
                console.log('Push subscription saved successfully');
              }
            }
          } catch (swError) {
            console.log('Service Worker registration failed, but basic notifications will still work:', swError);
          }
        }

        return true;
      }

      toast.error('הרשאת התראות נדחתה');
      return false;
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      toast.error('שגיאה בבקשת הרשאת התראות');
      return false;
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
    if (!user) {
      console.log('No user found for notification scheduling');
      return false;
    }

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

      if (error) {
        console.error('Error creating notification record:', error);
        throw error;
      }

      console.log('Notification record created:', data);

      const now = new Date();
      const timeDiff = scheduledFor.getTime() - now.getTime();
      const currentPermission = getBrowserPermission();
      setPermission(currentPermission);

      if (timeDiff <= 300000 && timeDiff > 0 && currentPermission === 'granted') {
        setTimeout(() => {
          new Notification(title, {
            body: message,
            icon: "/favicon.ico",
            tag: entityId || 'notification'
          });

          toast(title, {
            description: message
          });
        }, timeDiff);
      } else if (timeDiff <= 0 && currentPermission === 'granted') {
        new Notification(title, {
          body: message,
          icon: "/favicon.ico",
          tag: entityId || 'notification'
        });

        toast(title, {
          description: message
        });
      }

      return true;
    } catch (error) {
      console.error("Error scheduling notification:", error);
      toast.error("שגיאה ביצירת התזכורת");
      return false;
    }
  };

  const showTestNotification = () => {
    if (!isSupported) {
      toast.error('התראות לא נתמכות בדפדפן זה');
      return false;
    }

    const currentPermission = getBrowserPermission();
    setPermission(currentPermission);

    if (currentPermission === 'granted') {
      try {
        new Notification('התראת בדיקה', {
          body: 'זוהי התראת בדיקה מהמערכת',
          icon: '/favicon.ico'
        });

        toast.success('התראת בדיקה נשלחה');
        return true;
      } catch (error) {
        console.error('Error showing test notification:', error);
        toast.error('שגיאה בהצגת התראת בדיקה');
        return false;
      }
    }

    if (currentPermission === 'denied') {
      toast.error('ההתראות חסומות בדפדפן. צריך לאפשר אותן בהגדרות האתר ואז לנסות שוב');
      return false;
    }

    toast.error('יש להעניק הרשאה להתראות תחילה');
    return false;
  };

  const sendTestNotification = showTestNotification;

  return {
    permission,
    isSupported,
    preferences,
    requestPermission,
    updatePreferences,
    scheduleNotification,
    showTestNotification,
    sendTestNotification,
    isGranted: permission === 'granted',
    isDenied: permission === 'denied'
  };
}
