
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const GROW_API_BASE = 'https://sandbox.meshulam.co.il/api/light/server/1.0';
const GROW_PAGE_CODE = Deno.env.get('GROW_PAGE_CODE') || 'f8dc02a4a03d';

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
    const userEmail = payload["email"] || payload["data[email]"];
    const fullName = payload["fullName"] || payload["data[fullName]"];
    const phone = payload["phone"] || payload["data[phone]"];
    const amount = payload["sum"] || payload["data[sum]"];
    const planId = payload["planId"] || payload["data[planId]"];

    if (!transactionId || !status) {
      throw new Error('Missing required webhook payload fields');
    }

    // Forward to GROW API for approval
    const downstreamForm = new FormData();
    downstreamForm.append('pageCode', GROW_PAGE_CODE);
    
    function normalizeKey(key: string): string {
      const match = key.match(/^data\[(.+)\]$/);
      return match ? match[1] : key;
    }

    for (const key in payload) {
      downstreamForm.append(normalizeKey(key), payload[key]);
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

    // If payment was successful, create user and set subscription
    if (status === '1' || status === 1) {
      console.log('Payment successful, creating user account...');

      // Generate a temporary password
      const tempPassword = `CarsLead${Math.random().toString(36).slice(-8)}!`;

      try {
        // Create user account
        const { data: authData, error: authError } = await supabase.auth.admin.createUser({
          email: userEmail,
          password: tempPassword,
          email_confirm: true,
          user_metadata: {
            full_name: fullName,
            phone: phone,
            created_via: 'payment'
          }
        });

        if (authError) {
          console.error('Error creating user:', authError);
          throw authError;
        }

        console.log('User created successfully:', authData.user?.id);

        // Update user profile
        const { error: profileError } = await supabase
          .from('profiles')
          .update({
            full_name: fullName,
            phone: phone
          })
          .eq('id', authData.user.id);

        if (profileError) {
          console.error('Error updating profile:', profileError);
        }

        // Update subscription
        const { error: subscriptionError } = await supabase
          .from('subscriptions')
          .update({
            subscription_tier: planId,
            active: true,
            expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // 30 days from now
          })
          .eq('user_id', authData.user.id);

        if (subscriptionError) {
          console.error('Error updating subscription:', subscriptionError);
        }

        // Log the payment event
        const { error: logError } = await supabase
          .from('audit_logs')
          .insert({
            user_id: authData.user.id,
            action: 'payment_completed',
            table_name: 'subscriptions',
            record_id: authData.user.id,
            new_data: {
              transaction_id: transactionId,
              plan_id: planId,
              amount: amount,
              status: status
            }
          });

        if (logError) {
          console.error('Error logging payment event:', logError);
        }

        console.log(`User ${authData.user.id} successfully created and upgraded to ${planId}`);

        // TODO: Send welcome email with login credentials
        // This would typically be done through an email service

      } catch (userError) {
        console.error('Error in user creation flow:', userError);
        // Don't throw here - payment was successful, user creation is secondary
      }
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
        details: error instanceof Error ? error.message : String(error) 
      }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});
