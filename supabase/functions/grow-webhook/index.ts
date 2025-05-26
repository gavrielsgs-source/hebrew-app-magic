import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.0";
import { GROW_PAGE_CODE } from '../grow-payment/config.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const GROW_API_BASE = 'https://sandbox.meshulam.co.il/api/light/server/1.0'; // Replace with your actual base URL

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const contentType = req.headers.get("content-type") || "";
    let payload: Record<string, any> = {};

    if (contentType.includes("application/json")) {
      payload = await req.json();
    } else if (contentType.includes("application/x-www-form-urlencoded")) {
      const formText = await req.text();
      payload = Object.fromEntries(new URLSearchParams(formText));
    } else if (contentType.includes("multipart/form-data")) {
      const formData = await req.formData();
      payload = {};
      for (const [key, value] of formData.entries()) {
        payload[key] = value;
      }
    } else {
      throw new Error("Unsupported content-type");
    }

    console.log("Received webhook from GROW:", payload);

    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Missing Supabase configuration');
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const transactionId = payload["transactionId"] || payload["data[transactionId]"];
    const status = payload["status"] || payload["data[statusCode]"];
    const userId = payload["recurringDebitId"] || payload["data[recurringDebitId]"];
    const amount = payload["sum"] || payload["data[sum]"];
    const planId = payload["description"] || payload["data[description]"];

    if (!transactionId || !status || !userId) {
      throw new Error('Missing required webhook payload fields');
    }

    const downstreamForm = new FormData();
    downstreamForm.append('pageCode', GROW_PAGE_CODE)
    for (const key in payload) {
      downstreamForm.append(key, payload[key]);
    }

    const response = await fetch(`${GROW_API_BASE}/approveTransaction`, {
      method: 'POST',
      body: downstreamForm,
      headers: {
        'accept': 'application/json',
      },
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error('Error approving transaction:', errText);
      throw new Error(`Downstream approveTransaction failed: ${errText}`);
    }
    console.log(await response.json())
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
