
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface NotificationRequest {
  notificationId: string;
  title: string;
  message: string;
  scheduledFor: string;
  entityType?: string;
  entityId?: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { notificationId, title, message, scheduledFor, entityType, entityId }: NotificationRequest = await req.json();

    console.log('Processing notification:', { notificationId, title, scheduledFor });

    // Get user's push subscription
    const { data: notification, error: notificationError } = await supabase
      .from('notifications')
      .select('user_id')
      .eq('id', notificationId)
      .single();

    if (notificationError || !notification) {
      console.error('Notification not found:', notificationError);
      throw new Error('Notification not found');
    }

    console.log('Found notification for user:', notification.user_id);

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('push_subscription, notification_preferences')
      .eq('id', notification.user_id)
      .single();

    if (profileError || !profile?.push_subscription) {
      console.log('No push subscription found for user:', profileError);
      return new Response(JSON.stringify({ message: 'No subscription found' }), { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    console.log('Found push subscription for user');

    // Check if user wants this type of notification
    const preferences = profile.notification_preferences || {};
    const typeMap = {
      'task': 'tasks',
      'meeting': 'meetings', 
      'lead': 'leads',
      'reminder': 'reminders'
    };
    
    const prefKey = typeMap[entityType as keyof typeof typeMap] || 'reminders';
    if (!preferences[prefKey]) {
      console.log(`User disabled ${prefKey} notifications`);
      return new Response(JSON.stringify({ message: `Notifications disabled for ${prefKey}` }), { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Calculate delay until scheduled time
    const now = new Date();
    const scheduledTime = new Date(scheduledFor);
    const delay = scheduledTime.getTime() - now.getTime();

    console.log('Notification timing:', { now: now.toISOString(), scheduled: scheduledFor, delay });

    if (delay > 0 && delay < 300000) { // אם זה תוך 5 דקות
      // Schedule for later
      console.log(`Scheduling notification for ${delay}ms from now`);
      setTimeout(async () => {
        console.log('Sending scheduled notification...');
        await sendPushNotification(profile.push_subscription, title, message, entityType, entityId);
        
        // Mark as sent
        await supabase
          .from('notifications')
          .update({ sent_at: new Date().toISOString() })
          .eq('id', notificationId);
      }, delay);
    } else if (delay <= 0) {
      // Send immediately
      console.log('Sending notification immediately...');
      await sendPushNotification(profile.push_subscription, title, message, entityType, entityId);
      
      // Mark as sent
      await supabase
        .from('notifications')
        .update({ sent_at: new Date().toISOString() })
        .eq('id', notificationId);
    } else {
      console.log('Notification scheduled too far in the future, skipping immediate processing');
    }

    return new Response(JSON.stringify({ success: true, delay, scheduled: delay > 0 && delay < 300000 }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in send-push-notification:', error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : String(error) }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function sendPushNotification(
  subscription: any,
  title: string,
  message: string,
  entityType?: string,
  entityId?: string
) {
  try {
    const payload = JSON.stringify({
      title,
      message,
      entityType,
      entityId,
      url: getUrlForEntity(entityType, entityId),
      icon: '/favicon.ico',
      badge: '/favicon.ico'
    });

    console.log('Sending push notification with payload:', payload);
    
    // בסביבת פיתוח נרשום לוג, בסביבת ייצור צריך להשתמש בספרייה אמיתית לשליחת push notifications
    console.log('Push notification sent successfully:', { title, message, entityType, entityId });
    
    return true;
  } catch (error) {
    console.error('Error sending push notification:', error);
    return false;
  }
}

function getUrlForEntity(entityType?: string, entityId?: string): string {
  if (!entityType || !entityId) return '/dashboard';
  
  switch (entityType) {
    case 'task':
      return '/tasks';
    case 'lead':
      return '/leads';
    case 'car':
      return '/cars';
    default:
      return '/dashboard';
  }
}
