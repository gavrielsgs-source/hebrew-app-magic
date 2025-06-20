
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './use-auth';
import { toast } from 'sonner';

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

export function usePushNotifications() {
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [isSupported, setIsSupported] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    // Check if notifications are supported
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
        
        // Try to register service worker if available
        if ('serviceWorker' in navigator && 'PushManager' in window) {
          try {
            // Register service worker
            const registration = await navigator.serviceWorker.register('/sw.js');
            console.log('Service Worker registered successfully');
            
            // Subscribe to push notifications
            const subscription = await registration.pushManager.subscribe({
              userVisibleOnly: true,
              applicationServerKey: urlBase64ToUint8Array(VAPID_KEY)
            });

            // Save subscription to database
            if (user && subscription) {
              const subscriptionJson = subscription.toJSON();
              
              const { error } = await supabase
                .from('profiles')
                .upsert({ 
                  id: user.id,
                  push_subscription: subscriptionJson,
                  notification_preferences: {
                    tasks: true,
                    leads: true,
                    reminders: true,
                    meetings: true
                  }
                });

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
      // Create notification record in database
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

      // If the notification is scheduled for soon (within 5 minutes), show it immediately for testing
      const now = new Date();
      const timeDiff = scheduledFor.getTime() - now.getTime();
      
      if (timeDiff <= 300000 && timeDiff > 0 && permission === 'granted') { // 5 minutes
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
      } else if (timeDiff <= 0 && permission === 'granted') {
        // Show immediately if time has passed
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
    if (permission === 'granted') {
      new Notification('התראת בדיקה', {
        body: 'זוהי התראת בדיקה מהמערכת',
        icon: '/favicon.ico'
      });
      
      toast.success('התראת בדיקה נשלחה');
    } else {
      toast.error('יש להעניק הרשאה להתראות תחילה');
    }
  };

  return {
    permission,
    isSupported,
    requestPermission,
    scheduleNotification,
    showTestNotification,
    isGranted: permission === 'granted',
    isDenied: permission === 'denied'
  };
}
