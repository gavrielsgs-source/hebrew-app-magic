import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const GROW_API_BASE = 'https://sandbox.meshulam.co.il/api/light/server/1.0';
const GROW_CLIENT_ID = Deno.env.get('GROW_CLIENT_ID') || '';
const GROW_EC_PWD = Deno.env.get('GROW_EC_PWD') || '';

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { reason, feedback, immediateCancel } = await req.json();
    
    console.log('Processing subscription cancellation...');
    
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Missing Supabase configuration');
    }

    // Get user from auth header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('Missing authorization header');
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // Verify user token
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      throw new Error('Invalid authorization token');
    }

    console.log(`Cancelling subscription for user: ${user.id}`);

    // Get user's subscription
    const { data: subscription, error: subError } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (subError || !subscription) {
      throw new Error('No active subscription found');
    }

    // Save cancellation feedback
    if (reason || feedback) {
      await supabase
        .from('cancellation_feedback')
        .insert({
          user_id: user.id,
          subscription_id: subscription.id,
          reason,
          feedback,
        });
    }

    // If trial or immediate cancel requested
    if (subscription.subscription_status === 'trial' || immediateCancel) {
      // Cancel immediately
      const { error: updateError } = await supabase
        .from('subscriptions')
        .update({
          subscription_status: 'cancelled',
          active: false,
          cancel_at_period_end: false,
          cancelled_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', subscription.id);

      if (updateError) {
        throw new Error(`Failed to cancel subscription: ${updateError.message}`);
      }

      // If there's a recurring payment, cancel it with Grow
      if (subscription.recurring_payment_id) {
        try {
          const formData = new FormData();
          formData.append('customerId', GROW_CLIENT_ID);
          formData.append('apiPassword', GROW_EC_PWD);
          formData.append('recurringPaymentId', subscription.recurring_payment_id);

          await fetch(`${GROW_API_BASE}/cancelRecurringPayment`, {
            method: 'POST',
            body: formData,
          });
        } catch (growError) {
          console.error('Failed to cancel recurring payment with Grow:', growError);
          // Continue anyway - subscription is cancelled in our system
        }
      }

      console.log(`✅ Subscription cancelled immediately for user ${user.id}`);

      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'Subscription cancelled immediately',
          cancelled_at: new Date().toISOString(),
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      );
    } else {
      // Cancel at end of billing period
      const { error: updateError } = await supabase
        .from('subscriptions')
        .update({
          cancel_at_period_end: true,
          updated_at: new Date().toISOString(),
        })
        .eq('id', subscription.id);

      if (updateError) {
        throw new Error(`Failed to schedule cancellation: ${updateError.message}`);
      }

      // Cancel recurring payment with Grow so user won't be charged again
      if (subscription.recurring_payment_id) {
        try {
          const formData = new FormData();
          formData.append('customerId', GROW_CLIENT_ID);
          formData.append('apiPassword', GROW_EC_PWD);
          formData.append('recurringPaymentId', subscription.recurring_payment_id);

          await fetch(`${GROW_API_BASE}/cancelRecurringPayment`, {
            method: 'POST',
            body: formData,
          });
          console.log(`✅ Recurring payment cancelled with Grow for user ${user.id}`);
        } catch (growError) {
          console.error('Failed to cancel recurring payment with Grow:', growError);
        }
      }

      console.log(`✅ Subscription scheduled for cancellation at period end for user ${user.id}`);

      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'Subscription will be cancelled at the end of billing period',
          ends_at: subscription.next_billing_date,
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      );
    }

  } catch (error) {
    console.error('Error cancelling subscription:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Failed to cancel subscription',
        details: error instanceof Error ? error.stack : String(error),
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
