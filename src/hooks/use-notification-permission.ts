
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/hooks/use-auth";
import { urlBase64ToUint8Array, VAPID_KEY } from "@/utils/notification-utils";

export function useNotificationPermission() {
  const { user } = useAuth();
  const [isSupported, setIsSupported] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission>("default");
  const [subscription, setSubscription] = useState<PushSubscription | null>(null);

  useEffect(() => {
    console.log('Checking notification support...');
    const supported = 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window;
    console.log('Notification support:', supported);
    setIsSupported(supported);
    
    const currentPermission = Notification.permission;
    console.log('Current permission:', currentPermission);
    setPermission(currentPermission);
  }, []);

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
      
      const sub = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_KEY)
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

  return {
    isSupported,
    permission,
    subscription,
    requestPermission,
    subscribeToNotifications
  };
}
