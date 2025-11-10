import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const GROW_API_BASE = 'https://sandbox.meshulam.co.il/api/light/server/1.0';
const GROW_CLIENT_ID = Deno.env.get('GROW_CLIENT_ID') || '';
const GROW_EC_PWD = Deno.env.get('GROW_EC_PWD') || '';

interface TrialExpiration {
  subscription_id: string;
  user_id: string;
  email: string;
  full_name: string;
  subscription_tier: string;
  trial_ends_at: string;
  days_left: number;
  payment_token?: string;
  billing_amount: number;
  billing_cycle: string;
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

    // Get subscriptions where trial ends today
    const { data: expiringTrials, error: fetchError } = await supabase
      .rpc('get_expiring_trials', { days_ahead: 0 });

    if (fetchError) {
      console.error('Error fetching expiring trials:', fetchError);
      throw fetchError;
    }

    if (!expiringTrials || expiringTrials.length === 0) {
      console.log('No trials expiring today');
      return new Response(
        JSON.stringify({ message: 'No trials to process', processed: 0 }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      );
    }

    console.log(`Found ${expiringTrials.length} expiring trials to process`);

    const results = {
      processed: 0,
      successful: 0,
      failed: 0,
      errors: [] as string[],
    };

    // Process each expiring trial
    for (const trial of expiringTrials as TrialExpiration[]) {
      results.processed++;

      try {
        // Get subscription details with payment token
        const { data: subscription, error: subError } = await supabase
          .from('subscriptions')
          .select('payment_token, billing_amount, billing_cycle, recurring_payment_id')
          .eq('id', trial.subscription_id)
          .single();

        if (subError || !subscription) {
          throw new Error(`Failed to fetch subscription: ${subError?.message}`);
        }

        if (!subscription.payment_token) {
          throw new Error('No payment token found for subscription');
        }

        // Process recurring payment via Grow API
        console.log(`Processing payment for user ${trial.email}, amount: ${subscription.billing_amount}`);

        const formData = new FormData();
        formData.append('customerId', GROW_CLIENT_ID);
        formData.append('apiPassword', GROW_EC_PWD);
        formData.append('paymentToken', subscription.payment_token);
        formData.append('sum', String(subscription.billing_amount));
        formData.append('description', `${trial.subscription_tier} subscription - ${subscription.billing_cycle}`);

        const paymentResponse = await fetch(`${GROW_API_BASE}/processRecurringPayment`, {
          method: 'POST',
          body: formData,
        });

        const paymentResult = await paymentResponse.json();

        if (paymentResult.status === 1) {
          // Payment successful - update subscription to active
          const nextBillingDate = new Date();
          nextBillingDate.setMonth(nextBillingDate.getMonth() + (subscription.billing_cycle === 'yearly' ? 12 : 1));

          const { error: updateError } = await supabase
            .from('subscriptions')
            .update({
              subscription_status: 'active',
              active: true,
              next_billing_date: nextBillingDate.toISOString(),
              trial_ends_at: null,
              updated_at: new Date().toISOString(),
            })
            .eq('id', trial.subscription_id);

          if (updateError) {
            throw new Error(`Failed to update subscription: ${updateError.message}`);
          }

          // Record payment in history
          await supabase
            .from('payment_history')
            .insert({
              user_id: trial.user_id,
              subscription_id: trial.subscription_id,
              transaction_id: paymentResult.data?.transactionId,
              asmachta: paymentResult.data?.asmachta,
              amount: subscription.billing_amount,
              status: 'success',
              payment_type: subscription.billing_cycle === 'yearly' ? 'yearly' : 'monthly',
              metadata: { trial_conversion: true },
            });

          console.log(`✅ Successfully charged ${trial.email} - ${subscription.billing_amount} ILS`);
          results.successful++;

          // TODO: Send success email
        } else {
          // Payment failed
          throw new Error(paymentResult.err?.message || 'Payment processing failed');
        }

      } catch (error) {
        console.error(`❌ Failed to process trial for ${trial.email}:`, error);
        results.failed++;
        results.errors.push(`${trial.email}: ${error instanceof Error ? error.message : String(error)}`);

        // Update subscription status to past_due
        await supabase
          .from('subscriptions')
          .update({
            subscription_status: 'past_due',
            active: false,
            updated_at: new Date().toISOString(),
          })
          .eq('id', trial.subscription_id);

        // Record failed payment
        await supabase
          .from('payment_history')
          .insert({
            user_id: trial.user_id,
            subscription_id: trial.subscription_id,
            amount: trial.billing_amount || 0,
            status: 'failed',
            payment_type: trial.billing_cycle === 'yearly' ? 'yearly' : 'monthly',
            failure_reason: error instanceof Error ? error.message : String(error),
            metadata: { trial_conversion_failed: true },
          });

        // TODO: Send payment failed email
      }
    }

    console.log('Trial expiration check completed:', results);

    return new Response(
      JSON.stringify(results),
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
