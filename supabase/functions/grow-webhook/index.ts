
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
    const isTrial = payload["isTrial"] === 'true' || payload["data[isTrial]"] === 'true';
    const billingCycle = payload["billingCycle"] || payload["data[billingCycle]"] || 'monthly';
    const paymentToken = payload["token"] || payload["data[token]"];

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

        // Determine subscription settings based on trial status
        const subscriptionData: any = {
          subscription_tier: planId || 'premium',
          billing_cycle: billingCycle,
        };

        if (isTrial) {
          // Trial subscription
          const trialEndDate = new Date();
          trialEndDate.setDate(trialEndDate.getDate() + 14); // 14 days trial

          subscriptionData.subscription_status = 'trial';
          subscriptionData.active = true;
          subscriptionData.trial_ends_at = trialEndDate.toISOString();
          subscriptionData.payment_token = paymentToken;
          
          // Set billing amount based on tier
          const billingAmounts: Record<string, number> = {
            premium: billingCycle === 'yearly' ? 990 : 99,
            business: billingCycle === 'yearly' ? 2990 : 299,
            enterprise: billingCycle === 'yearly' ? 9990 : 999,
          };
          subscriptionData.billing_amount = billingAmounts[planId || 'premium'];

          console.log(`Setting up trial subscription - ends: ${trialEndDate.toISOString()}`);
        } else {
          // Regular paid subscription
          const nextBilling = new Date();
          nextBilling.setMonth(nextBilling.getMonth() + (billingCycle === 'yearly' ? 12 : 1));

          subscriptionData.subscription_status = 'active';
          subscriptionData.active = true;
          subscriptionData.next_billing_date = nextBilling.toISOString();
          subscriptionData.payment_token = paymentToken;
          subscriptionData.billing_amount = parseFloat(amount);
        }

        // Update subscription
        const { error: subscriptionError } = await supabase
          .from('subscriptions')
          .update(subscriptionData)
          .eq('user_id', authData.user.id);

        if (subscriptionError) {
          console.error('Error updating subscription:', subscriptionError);
        }

        // Record payment in history
        const { error: paymentHistoryError } = await supabase
          .from('payment_history')
          .insert({
            user_id: authData.user.id,
            transaction_id: transactionId,
            amount: parseFloat(amount),
            status: 'success',
            payment_type: isTrial ? 'trial_verification' : billingCycle,
            metadata: {
              plan: planId,
              is_trial: isTrial,
              billing_cycle: billingCycle,
            },
          });

        if (paymentHistoryError) {
          console.error('Error recording payment history:', paymentHistoryError);
        }

        // If trial, immediately refund the 1 ILS verification charge
        if (isTrial && amount === '1' || amount === '1.00') {
          console.log('Trial verification - will refund 1 ILS');
          // TODO: Implement refund via Grow API if needed
          // Most payment processors handle this automatically
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

        // Generate magic link for first login
        try {
          const { data: linkData, error: linkError } = await supabase.auth.admin.generateLink({
            type: 'magiclink',
            email: userEmail,
          });

          if (!linkError && linkData.properties?.action_link) {
            console.log('Magic link generated, sending welcome email...');
            
            // Send welcome email with magic link
            const { error: emailError } = await supabase.functions.invoke('send-email', {
              body: {
                to: userEmail,
                template: 'welcome',
                data: {
                  userName: fullName,
                  magicLink: linkData.properties.action_link,
                  trialEndsAt: trial_ends_at,
                  amount: billing_amount,
                }
              }
            });

            if (emailError) {
              console.error('Error sending welcome email:', emailError);
            } else {
              console.log('✅ Welcome email sent successfully');
            }
          } else {
            console.error('Error generating magic link:', linkError);
          }
        } catch (emailError) {
          console.error('Error in email sending flow:', emailError);
          // Don't throw - payment was successful, email is secondary
        }

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
