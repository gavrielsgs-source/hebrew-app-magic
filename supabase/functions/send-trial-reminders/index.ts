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
    console.log('Starting trial reminders check...');
    
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Missing Supabase configuration');
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const results = {
      threeDays: 0,
      oneDay: 0,
      total: 0,
    };

    // Check for trials expiring in 3 and 1 days (not 7 days - not too annoying)
    const reminderDays = [3, 1];

    for (const days of reminderDays) {
      const { data: trials, error } = await supabase
        .rpc('get_expiring_trials', { days_ahead: days });

      if (error) {
        console.error(`Error fetching trials expiring in ${days} days:`, error);
        continue;
      }

      if (!trials || trials.length === 0) {
        console.log(`No trials expiring in ${days} days`);
        continue;
      }

      // Filter to only those expiring exactly in X days
      const exactDayTrials = trials.filter((trial: any) => trial.days_left === days);

      console.log(`Found ${exactDayTrials.length} trials expiring in exactly ${days} days`);

      for (const trial of exactDayTrials) {
        try {
          console.log(`📧 Sending ${days}-day reminder to ${trial.email}`);
          
          // Send trial reminder email
          const { error: emailError } = await supabase.functions.invoke('send-email', {
            body: {
              to: trial.email,
              template: 'trial-reminder',
              data: {
                userName: trial.full_name || trial.email,
                daysLeft: days,
                trialEndsAt: trial.trial_ends_at,
                amount: 99, // Default amount - should be from subscription data
              }
            }
          });

          if (emailError) {
            console.error(`Failed to send email to ${trial.email}:`, emailError);
          } else {
            console.log(`✅ Reminder email sent successfully to ${trial.email}`);
          }

          // Track reminder sent
          const keyName = days === 3 ? 'threeDays' : 'oneDay';
          results[keyName]++;
          results.total++;

        } catch (emailError) {
          console.error(`Failed to send reminder to ${trial.email}:`, emailError);
        }
      }
    }

    console.log('Trial reminders completed:', results);

    return new Response(
      JSON.stringify(results),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    );

  } catch (error) {
    console.error('Error in trial reminders:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error', 
        details: error instanceof Error ? error.message : String(error) 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
