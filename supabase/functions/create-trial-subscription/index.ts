import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get authenticated user from JWT
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('Missing authorization header');
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (authError || !user) {
      throw new Error('Unauthorized');
    }

    const { userId, email } = await req.json();

    if (!userId) {
      throw new Error('User ID is required');
    }

    // Verify that the authenticated user matches the userId parameter
    if (user.id !== userId) {
      throw new Error('User ID mismatch - you can only create subscriptions for yourself');
    }

    console.log(`Creating trial subscription for user ${userId} (${email})`);

    // Check if subscription already exists
    const { data: existingSubscription } = await supabase
      .from('subscriptions')
      .select('id')
      .eq('user_id', userId)
      .single();

    if (existingSubscription) {
      console.log('Subscription already exists for this user');
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'Subscription already exists',
          subscriptionId: existingSubscription.id 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create trial subscription
    const trialEndsAt = new Date();
    trialEndsAt.setDate(trialEndsAt.getDate() + 14); // 14 days trial

    const { data: subscription, error: subscriptionError } = await supabase
      .from('subscriptions')
      .insert({
        user_id: userId,
        subscription_tier: 'premium',
        subscription_status: 'trial',
        active: true,
        trial_ends_at: trialEndsAt.toISOString(),
        max_users: 2,
        active_users_count: 1,
      })
      .select()
      .single();

    if (subscriptionError) {
      console.error('Error creating subscription:', subscriptionError);
      throw subscriptionError;
    }

    console.log('✅ Trial subscription created successfully:', subscription.id);

    // Log the event
    await supabase.from('audit_logs').insert({
      user_id: userId,
      action: 'trial_subscription_created',
      table_name: 'subscriptions',
      record_id: subscription.id,
      new_data: {
        tier: 'premium',
        status: 'trial',
        trial_ends_at: trialEndsAt.toISOString()
      }
    });

    return new Response(
      JSON.stringify({ 
        success: true, 
        subscription,
        message: 'Trial subscription created successfully'
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error) {
    console.error('Error in create-trial-subscription:', error);
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error' 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});
