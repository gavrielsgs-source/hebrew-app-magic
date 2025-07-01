
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
      console.log('Notification permission state:', Notification.permission);
    } else {
      console.log('Notifications not supported in this browser');
    }
  }, []);

  const requestPermission = async () => {
    if (!isSupported) {
      toast.error('התראות לא נתמכות בדפדפן זה');
      return false;
    }

    try {
      console.log('Requesting notification permission...');
      
      // Check current permission state
      if (Notification.permission === 'granted') {
        console.log('Permission already granted');
        setPermission('granted');
        toast.success('הרשאת התראות כבר מאושרת');
        return true;
      }

      if (Notification.permission === 'denied') {
        console.log('Permission was previously denied');
        toast.error('הרשאת התראות נדחתה בעבר. יש לאפשר התראות בהגדרות הדפדפן');
        return false;
      }

      // Request permission
      const result = await Notification.requestPermission();
      console.log('Permission request result:', result);
      setPermission(result);
      
      if (result === 'granted') {
        toast.success('הרשאת התראות אושרה בהצלחה');
        
        // Register service worker and push subscription only if available
        if ('serviceWorker' in navigator && 'PushManager' in window) {
          try {
            // Check if service worker file exists before registering
            const swResponse = await fetch('/sw.js', { method: 'HEAD' });
            if (swResponse.ok) {
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
                } else {
                  console.log('Push subscription saved successfully');
                }
              }
            } else {
              console.log('Service worker file not found, skipping registration');
            }
          } catch (swError) {
            console.error('Service Worker registration failed:', swError);
            // Don't show error to user as basic notifications still work
          }
        }
        
        return true;
      } else if (result === 'denied') {
        toast.error('הרשאת התראות נדחתה. ניתן לשנות זאת בהגדרות הדפדפן');
        return false;
      } else {
        toast.warning('הרשאת התראות לא אושרה');
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
      try {
        new Notification('התראת בדיקה', {
          body: 'זוהי התראת בדיקה מהמערכת',
          icon: '/favicon.ico'
        });
        toast.success('התראת בדיקה נשלחה');
      } catch (error) {
        console.error('Error showing test notification:', error);
        toast.error('שגיאה בהצגת התראת בדיקה');
      }
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
