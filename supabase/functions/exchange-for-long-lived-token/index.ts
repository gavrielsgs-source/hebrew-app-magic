import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

async function exchangeForLongLivedToken(shortLivedToken: string): Promise<string | null> {
  const appId = '2106125989900776';
  const appSecret = Deno.env.get('FB_APP_SECRET');

  if (!appSecret) {
    console.error('FB_APP_SECRET not configured');
    return null;
  }

  try {
    const url = `https://graph.facebook.com/v21.0/oauth/access_token?grant_type=fb_exchange_token&client_id=${appId}&client_secret=${appSecret}&fb_exchange_token=${shortLivedToken}`;
    
    console.log('Exchanging token for long-lived token');
    const response = await fetch(url);
    
    if (!response.ok) {
      const error = await response.text();
      console.error('Token exchange failed:', error);
      return null;
    }

    const data = await response.json();
    console.log('Token exchanged successfully');
    return data.access_token;
  } catch (error) {
    console.error('Error exchanging token:', error);
    return null;
  }
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { shortLivedToken } = await req.json();

    if (!shortLivedToken) {
      return new Response(
        JSON.stringify({ error: 'Short-lived token is required' }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    console.log('Attempting to exchange token');
    const longLivedToken = await exchangeForLongLivedToken(shortLivedToken);

    if (!longLivedToken) {
      return new Response(
        JSON.stringify({ error: 'Failed to exchange token' }),
        { 
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    return new Response(
      JSON.stringify({ 
        success: true,
        accessToken: longLivedToken 
      }),
      { 
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('Error in exchange-for-long-lived-token function:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
