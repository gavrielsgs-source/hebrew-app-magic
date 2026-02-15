import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    // Parse the webhook data (Tranzila sends form-encoded or JSON)
    let webhookData: Record<string, string>;
    const contentType = req.headers.get('content-type') || '';
    
    if (contentType.includes('application/x-www-form-urlencoded')) {
      const formData = await req.formData();
      webhookData = {};
      formData.forEach((value, key) => {
        webhookData[key] = String(value);
      });
    } else {
      const text = await req.text();
      try {
        webhookData = JSON.parse(text);
      } catch {
        // Try URL-encoded parsing
        webhookData = {};
        const params = new URLSearchParams(text);
        params.forEach((value, key) => {
          webhookData[key] = value;
        });
      }
    }

    console.log('Tranzila webhook received:', JSON.stringify(webhookData));

    const response = webhookData.Response || webhookData.response;
    const confirmationCode = webhookData.ConfirmationCode || webhookData.confirmation_code;
    const index = webhookData.index || webhookData.Index;
    const planId = webhookData.planId;
    const billingCycle = webhookData.billingCycle;
    const userId = webhookData.userId;
    const sum = parseFloat(webhookData.sum || webhookData.Sum || '0');

    // Response "000" means successful transaction
    const isSuccess = response === '000';

    if (!userId) {
      console.error('No userId in webhook data');
      return new Response(JSON.stringify({ error: 'Missing userId' }), { status: 400, headers: corsHeaders });
    }

    // Record payment in payment_history
    const { error: paymentError } = await supabase
      .from('payment_history')
      .insert({
        user_id: userId,
        amount: sum,
        payment_type: 'subscription',
        status: isSuccess ? 'completed' : 'failed',
        transaction_id: index || null,
        asmachta: confirmationCode || null,
        failure_reason: isSuccess ? null : `Tranzila response code: ${response}`,
        metadata: {
          plan_id: planId,
          billing_cycle: billingCycle,
          tranzila_response: response,
          raw_data: webhookData,
        },
      });

    if (paymentError) {
      console.error('Error recording payment:', paymentError);
    }

    // If payment was successful, update subscription
    if (isSuccess && planId) {
      const isYearly = billingCycle === 'yearly';
      const now = new Date();
      const expiresAt = new Date(now);
      
      if (isYearly) {
        expiresAt.setFullYear(expiresAt.getFullYear() + 1);
      } else {
        expiresAt.setMonth(expiresAt.getMonth() + 1);
      }

      const nextBillingDate = new Date(expiresAt);

      // Update existing subscription
      const { error: subError } = await supabase
        .from('subscriptions')
        .update({
          subscription_tier: planId,
          subscription_status: 'active',
          active: true,
          billing_cycle: billingCycle || 'monthly',
          billing_amount: sum,
          expires_at: expiresAt.toISOString(),
          next_billing_date: nextBillingDate.toISOString(),
          payment_token: index || null,
          cancel_at_period_end: false,
          cancelled_at: null,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', userId);

      if (subError) {
        console.error('Error updating subscription:', subError);
      } else {
        console.log(`Subscription updated for user ${userId}: plan=${planId}, cycle=${billingCycle}`);
      }
    }

    return new Response(JSON.stringify({ 
      success: true, 
      payment_status: isSuccess ? 'completed' : 'failed' 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    console.error('Error in tranzila-webhook:', error);
    return new Response(JSON.stringify({
      error: 'Internal server error',
      details: error instanceof Error ? error.message : String(error),
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});
