
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './use-auth';
import { toast } from 'sonner';

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

// Mock VAPID key for development
const VAPID_KEY = 'BEl62iUYgUivxIkv69yViEuiBIa40HdANcHUTLjhqOAXMNYbmtUIKIuRfkVIZJW1T9yfazrfE4GJm-iPZayP6JEo';

export function useNotificationPermission() {
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [isSupported, setIsSupported] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    if ('Notification' in window) {
      setIsSupported(true);
      setPermission(Notification.permission);
    }
  }, []);

  const requestPermission = async () => {
    if (!isSupported) {
      toast.error('התראות לא נתמכות בדפדפן זה');
      return false;
    }

    try {
      const result = await Notification.requestPermission();
      setPermission(result);
      
      if (result === 'granted') {
        toast.success('הרשאת התראות אושרה בהצלחה');
        
        // Register service worker and push subscription
        if ('serviceWorker' in navigator && 'PushManager' in window) {
          try {
            const registration = await navigator.serviceWorker.register('/sw.js');
            console.log('Service Worker registered successfully');
            
            const subscription = await registration.pushManager.subscribe({
              userVisibleOnly: true,
              applicationServerKey: urlBase64ToUint8Array(VAPID_KEY)
            });

            // Save subscription to database
            if (user && subscription) {
              const subscriptionJson = subscription.toJSON() as any;
              
              const { error } = await supabase
                .from('profiles')
                .update({ 
                  push_subscription: subscriptionJson
                })
                .eq('id', user.id);

              if (error) {
                console.error('Error saving push subscription:', error);
              }
            }
          } catch (swError) {
            console.error('Service Worker registration failed:', swError);
          }
        }
        
        return true;
      } else {
        toast.error('הרשאת התראות נדחתה');
        return false;
      }
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      toast.error('שגיאה בבקשת הרשאת התראות');
      return false;
    }
  };

  const showTestNotification = () => {
    if (permission === 'granted') {
      new Notification('התראת בדיקה', {
        body: 'זוהי התראת בדיקה מהמערכת',
        icon: '/favicon.ico'
      });
    } else {
      toast.error('יש להעניק הרשאה להתראות תחילה');
    }
  };

  return {
    permission,
    isSupported,
    requestPermission,
    showTestNotification,
    isGranted: permission === 'granted',
    isDenied: permission === 'denied'
  };
}
