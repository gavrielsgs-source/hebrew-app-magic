
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

    // Get user's push subscription
    const { data: notification, error: notificationError } = await supabase
      .from('notifications')
      .select('user_id')
      .eq('id', notificationId)
      .single();

    if (notificationError || !notification) {
      throw new Error('Notification not found');
    }

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('push_subscription, notification_preferences')
      .eq('id', notification.user_id)
      .single();

    if (profileError || !profile?.push_subscription) {
      console.log('No push subscription found for user');
      return new Response('No subscription', { status: 200, headers: corsHeaders });
    }

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
      return new Response('Notifications disabled for this type', { status: 200, headers: corsHeaders });
    }

    // Calculate delay until scheduled time
    const now = new Date();
    const scheduledTime = new Date(scheduledFor);
    const delay = scheduledTime.getTime() - now.getTime();

    if (delay > 0) {
      // Schedule for later (in a real implementation, you'd use a job queue)
      setTimeout(async () => {
        await sendPushNotification(profile.push_subscription, title, message, entityType, entityId);
        
        // Mark as sent
        await supabase
          .from('notifications')
          .update({ sent_at: new Date().toISOString() })
          .eq('id', notificationId);
      }, delay);
    } else {
      // Send immediately
      await sendPushNotification(profile.push_subscription, title, message, entityType, entityId);
      
      // Mark as sent
      await supabase
        .from('notifications')
        .update({ sent_at: new Date().toISOString() })
        .eq('id', notificationId);
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in send-push-notification:', error);
    return new Response(JSON.stringify({ error: error.message }), {
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
      url: getUrlForEntity(entityType, entityId)
    });

    // In a real implementation, you'd use a proper web push library
    // For now, we'll just log the notification
    console.log('Would send push notification:', { title, message, entityType, entityId });
    
  } catch (error) {
    console.error('Error sending push notification:', error);
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
