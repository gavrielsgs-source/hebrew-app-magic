import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface TrialExpiration {
  subscription_id: string;
  user_id: string;
  email: string;
  full_name: string;
  subscription_tier: string;
  trial_ends_at: string;
  days_left: number;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Starting trial expiration check...');
    
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Missing Supabase configuration');
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // First, update all expired trials that are still marked as 'trial'
    console.log('Updating expired trial subscriptions...');
    const { data: expiredUpdate, error: expiredError } = await supabase
      .from('subscriptions')
      .update({
        subscription_status: 'expired',
        active: false,
        updated_at: new Date().toISOString(),
      })
      .eq('subscription_status', 'trial')
      .lt('trial_ends_at', new Date().toISOString())
      .select('id');

    if (expiredError) {
      console.error('Error updating expired trials:', expiredError);
    } else {
      console.log(`✅ Updated ${expiredUpdate?.length || 0} expired trial subscriptions to 'expired' status`);
    }

    // Also handle cancel_at_period_end subscriptions that have passed their billing date
    console.log('Checking subscriptions scheduled for cancellation...');
    const { data: cancelledSubs, error: cancelError } = await supabase
      .from('subscriptions')
      .update({
        subscription_status: 'cancelled',
        active: false,
        cancelled_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('cancel_at_period_end', true)
      .eq('subscription_status', 'active')
      .lt('next_billing_date', new Date().toISOString())
      .select('id');

    if (cancelError) {
      console.error('Error cancelling end-of-period subscriptions:', cancelError);
    } else {
      console.log(`✅ Cancelled ${cancelledSubs?.length || 0} subscriptions at period end`);
    }

    // Get trials expiring today - send reminder emails
    const { data: expiringTrials, error: fetchError } = await supabase
      .rpc('get_expiring_trials', { days_ahead: 0 });

    if (fetchError) {
      console.error('Error fetching expiring trials:', fetchError);
      throw fetchError;
    }

    if (!expiringTrials || expiringTrials.length === 0) {
      console.log('No trials expiring today');
      return new Response(
        JSON.stringify({ 
          message: 'No trials to process', 
          processed: 0,
          expired: expiredUpdate?.length || 0,
          cancelled_at_period_end: cancelledSubs?.length || 0,
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      );
    }

    console.log(`Found ${expiringTrials.length} expiring trials to notify`);

    const results = {
      processed: 0,
      notified: 0,
      errors: [] as string[],
    };

    // Send expiration notification emails for trials expiring today
    // Note: Recurring payments are managed automatically by Tranzila.
    // When Tranzila charges successfully, the tranzila-webhook updates the subscription.
    // If no payment was set up, the trial will be marked as expired by the update above.
    for (const trial of expiringTrials as TrialExpiration[]) {
      results.processed++;

      try {
        // Check if user has a payment token (meaning they set up payment via Tranzila)
        const { data: subscription } = await supabase
          .from('subscriptions')
          .select('payment_token')
          .eq('id', trial.subscription_id)
          .single();

        if (!subscription?.payment_token) {
          // No payment method - trial will expire, send notification
          console.log(`📧 Sending trial expiration email to ${trial.email} (no payment method)`);
          
          try {
            await supabase.functions.invoke('send-email', {
              body: {
                to: trial.email,
                template: 'trial-expiring',
                data: {
                  userName: trial.full_name || trial.email,
                  planName: trial.subscription_tier,
                }
              }
            });
            console.log(`✅ Expiration email sent to ${trial.email}`);
          } catch (emailError) {
            console.error(`Failed to send email to ${trial.email}:`, emailError);
          }

          results.notified++;
        } else {
          // User has payment token - Tranzila will handle the recurring charge automatically
          console.log(`ℹ️ User ${trial.email} has payment method, Tranzila will charge automatically`);
        }

      } catch (error) {
        console.error(`❌ Error processing trial for ${trial.email}:`, error);
        results.errors.push(`${trial.email}: ${error instanceof Error ? error.message : String(error)}`);
      }
    }

    console.log('Trial expiration check completed:', results);

    return new Response(
      JSON.stringify({
        ...results,
        expired: expiredUpdate?.length || 0,
        cancelled_at_period_end: cancelledSubs?.length || 0,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    );

  } catch (error) {
    console.error('Error in trial expiration check:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error', 
        details: error instanceof Error ? error.message : String(error) 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
