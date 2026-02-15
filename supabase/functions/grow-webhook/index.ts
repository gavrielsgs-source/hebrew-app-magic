
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
    
    // Extract additional billing details
    const companyName = payload["companyName"] || payload["data[companyName]"];
    const businessId = payload["businessId"] || payload["data[businessId]"];
    const address = payload["address"] || payload["data[address]"];
    const city = payload["city"] || payload["data[city]"];
    const postalCode = payload["postalCode"] || payload["data[postalCode]"];

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

      // Generate a cryptographically secure temporary password
      const randomBytes = new Uint8Array(16);
      crypto.getRandomValues(randomBytes);
      const tempPassword = `CarsLead${Array.from(randomBytes, b => b.toString(16).padStart(2, '0')).join('').slice(0, 12)}!`;

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
            phone: phone,
            company_name: companyName
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

        // Generate invoice after successful payment
        try {
          console.log('Generating invoice for payment...');
          const { data: invoiceData, error: invoiceError } = await supabase.functions.invoke('generate-invoice', {
            body: {
              userId: authData.user.id,
              subscriptionId: authData.user.id, // Using user ID as subscription reference
              amount: parseFloat(amount),
              planName: planId || 'premium',
              billingCycle: billingCycle,
              paymentDetails: {
                transactionId: transactionId,
                paymentDate: new Date().toISOString(),
              },
              billingDetails: {
                fullName: fullName,
                email: userEmail,
                phone: phone,
                companyName: companyName,
                businessId: businessId,
                address: address,
                city: city,
                postalCode: postalCode,
              },
            },
          });

          if (invoiceError) {
            console.error('Error generating invoice:', invoiceError);
          } else {
            console.log('✅ Invoice generated successfully:', invoiceData?.invoice?.invoiceNumber);

            // Send payment receipt email with invoice
            if (invoiceData?.invoice) {
              const { error: receiptError } = await supabase.functions.invoke('send-email', {
                body: {
                  to: userEmail,
                  template: 'payment-receipt',
                  data: {
                    userName: fullName,
                    invoiceNumber: invoiceData.invoice.invoiceNumber,
                    amount: parseFloat(amount),
                    planName: planId || 'premium',
                    billingCycle: billingCycle,
                    paymentDate: new Date().toLocaleDateString('he-IL'),
                    nextBillingDate: subscriptionData.next_billing_date 
                      ? new Date(subscriptionData.next_billing_date).toLocaleDateString('he-IL')
                      : undefined,
                    invoiceUrl: invoiceData.invoice.invoiceUrl,
                  },
                },
              });

              if (receiptError) {
                console.error('Error sending payment receipt:', receiptError);
              } else {
                console.log('✅ Payment receipt email sent successfully');
              }
            }
          }
        } catch (invoiceError) {
          console.error('Error in invoice generation flow:', invoiceError);
          // Don't throw - payment was successful, invoice is secondary
        }

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
                  trialEndsAt: subscriptionData.trial_ends_at,
                  amount: subscriptionData.billing_amount,
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
