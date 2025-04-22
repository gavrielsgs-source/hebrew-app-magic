
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Parse request body
    const payload = await req.json();
    console.log('Received webhook from GROW:', payload);

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Missing Supabase configuration');
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Extract transaction details from payload
    const { 
      transactionId, 
      status, 
      userId, 
      amount,
      planId 
    } = payload;

    if (!transactionId || !status || !userId) {
      throw new Error('Missing required webhook payload fields');
    }

    // Update user's subscription status
    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        subscription_tier: planId,
        subscription_transaction_id: transactionId,
        subscription_updated_at: new Date().toISOString(),
        subscription_status: status
      })
      .eq('id', userId);

    if (updateError) {
      console.error('Error updating subscription:', updateError);
      throw updateError;
    }

    // Log the webhook event
    const { error: logError } = await supabase
      .from('audit_logs')
      .insert({
        user_id: userId,
        action: 'payment_webhook',
        table_name: 'profiles',
        record_id: userId,
        new_data: payload
      });

    if (logError) {
      console.error('Error logging webhook event:', logError);
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (error) {
    console.error('Error processing webhook:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error', 
        details: error.message 
      }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});
