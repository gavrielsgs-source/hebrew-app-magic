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
    const contentType = req.headers.get("content-type") || "";
    let payload: Record<string, any> = {};

    if (contentType.includes("application/json")) {
      payload = await req.json();
    } else if (contentType.includes("application/x-www-form-urlencoded")) {
      const formText = await req.text();
      payload = Object.fromEntries(new URLSearchParams(formText));
    } else if (contentType.includes("multipart/form-data")) {
      const formData = await req.formData();
      for (const [key, value] of formData.entries()) {
        payload[key] = value;
      }
    } else {
      // Try to parse as form-urlencoded (Tranzila default)
      const text = await req.text();
      payload = Object.fromEntries(new URLSearchParams(text));
    }

    console.log("Received webhook from Tranzila:", JSON.stringify(payload));

    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Missing Supabase configuration');
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Extract Tranzila transaction fields
    const responseCode = payload["Response"] || payload["response"];
    const confirmationCode = payload["ConfirmationCode"] || payload["confirmationcode"];
    const transactionIndex = payload["index"] || payload["Index"];
    const userEmail = payload["email"];
    const fullName = payload["contact"];
    const phone = payload["phone"];
    const amount = payload["sum"];
    const companyName = payload["company"];
    const address = payload["address"];
    const city = payload["city"];
    
    // Custom fields passed through
    const planId = payload["planId"];
    const billingCycle = payload["billingCycle"] || 'monthly';
    const userId = payload["userId"];
    const isNewUser = payload["isNewUser"] === 'true';

    console.log(`Transaction response code: ${responseCode}, confirmation: ${confirmationCode}, index: ${transactionIndex}`);

    // Response "000" means success in Tranzila
    if (responseCode === '000' || responseCode === '0') {
      console.log('Payment successful, processing...');

      let targetUserId = userId;

      // If this is a new user signup
      if (isNewUser && userEmail) {
        try {
          const tempPassword = `CarsLead${Math.random().toString(36).slice(-8)}!`;

          const { data: authData, error: authError } = await supabase.auth.admin.createUser({
            email: userEmail,
            password: tempPassword,
            email_confirm: true,
            user_metadata: {
              full_name: fullName,
              phone: phone,
              created_via: 'tranzila_payment'
            }
          });

          if (authError) {
            console.error('Error creating user:', authError);
            throw authError;
          }

          targetUserId = authData.user.id;
          console.log('User created successfully:', targetUserId);

          // Update profile
          await supabase.from('profiles').update({
            full_name: fullName,
            phone: phone,
            company_name: companyName,
          }).eq('id', targetUserId);

        } catch (userError) {
          console.error('Error in user creation:', userError);
        }
      }

      if (targetUserId) {
        // Update subscription
        const nextBilling = new Date();
        nextBilling.setMonth(nextBilling.getMonth() + (billingCycle === 'yearly' ? 12 : 1));

        const subscriptionData: Record<string, any> = {
          subscription_tier: planId || 'premium',
          subscription_status: 'active',
          active: true,
          billing_cycle: billingCycle,
          billing_amount: parseFloat(amount),
          next_billing_date: nextBilling.toISOString(),
          recurring_payment_id: transactionIndex,
          updated_at: new Date().toISOString(),
        };

        const { error: subError } = await supabase
          .from('subscriptions')
          .update(subscriptionData)
          .eq('user_id', targetUserId);

        if (subError) {
          console.error('Error updating subscription:', subError);
        } else {
          console.log('Subscription updated successfully');
        }

        // Record payment history
        const { error: paymentError } = await supabase
          .from('payment_history')
          .insert({
            user_id: targetUserId,
            transaction_id: transactionIndex,
            asmachta: confirmationCode,
            amount: parseFloat(amount),
            status: 'success',
            payment_type: billingCycle,
            metadata: {
              plan: planId,
              billing_cycle: billingCycle,
              provider: 'tranzila',
              response_code: responseCode,
            },
          });

        if (paymentError) {
          console.error('Error recording payment:', paymentError);
        }

        // Log audit event
        await supabase.from('audit_logs').insert({
          user_id: targetUserId,
          action: 'payment_completed',
          table_name: 'subscriptions',
          record_id: targetUserId,
          new_data: {
            transaction_id: transactionIndex,
            confirmation_code: confirmationCode,
            plan_id: planId,
            amount: amount,
            provider: 'tranzila',
          },
        });

        // Send welcome email for new users
        if (isNewUser && userEmail) {
          try {
            const { data: linkData, error: linkError } = await supabase.auth.admin.generateLink({
              type: 'magiclink',
              email: userEmail,
            });

            if (!linkError && linkData.properties?.action_link) {
              await supabase.functions.invoke('send-email', {
                body: {
                  to: userEmail,
                  template: 'welcome',
                  data: {
                    userName: fullName,
                    magicLink: linkData.properties.action_link,
                    amount: parseFloat(amount),
                  },
                },
              });
              console.log('Welcome email sent');
            }
          } catch (emailError) {
            console.error('Error sending welcome email:', emailError);
          }
        }

        console.log(`Payment processed for user ${targetUserId}, plan: ${planId}`);
      }
    } else {
      console.log(`Payment failed with response code: ${responseCode}`);

      if (userId) {
        await supabase.from('payment_history').insert({
          user_id: userId,
          transaction_id: transactionIndex || 'unknown',
          amount: parseFloat(amount) || 0,
          status: 'failed',
          payment_type: billingCycle || 'monthly',
          failure_reason: `Tranzila response code: ${responseCode}`,
          metadata: { provider: 'tranzila', response_code: responseCode },
        });
      }
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (error) {
    console.error('Error processing Tranzila webhook:', error);
    return new Response(JSON.stringify({
      error: 'Internal server error',
      details: error instanceof Error ? error.message : String(error),
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});
