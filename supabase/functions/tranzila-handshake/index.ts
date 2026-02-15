import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Authenticate user
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: corsHeaders });
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const token = authHeader.replace('Bearer ', '');
    const { data: claimsData, error: claimsError } = await supabase.auth.getClaims(token);
    if (claimsError || !claimsData?.claims) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: corsHeaders });
    }

    const userId = claimsData.claims.sub;

    // Parse request body
    const { sum, planId, billingCycle, isYearly } = await req.json();

    if (!sum || sum <= 0) {
      return new Response(JSON.stringify({ error: 'Invalid sum' }), { status: 400, headers: corsHeaders });
    }

    const supplier = Deno.env.get('TRANZILA_SUPPLIER');
    const tranzilaPW = Deno.env.get('TRANZILA_PW');

    if (!supplier || !tranzilaPW) {
      console.error('Missing Tranzila credentials');
      return new Response(JSON.stringify({ error: 'Payment system not configured' }), { status: 500, headers: corsHeaders });
    }

    // Perform handshake with Tranzila (GET request as per docs)
    const handshakeUrl = `https://api.tranzila.com/v1/handshake/create?supplier=${encodeURIComponent(supplier)}&sum=${sum}&TranzilaPW=${encodeURIComponent(tranzilaPW)}`;
    
    console.log(`Performing Tranzila handshake for user ${userId}, sum: ${sum}, plan: ${planId}`);

    const handshakeResponse = await fetch(handshakeUrl, { method: 'GET' });
    const handshakeText = await handshakeResponse.text();

    console.log('Tranzila handshake response:', handshakeText);

    // Parse response - Tranzila returns URL-encoded format like "thtk=xxx"
    let thtk: string | null = null;
    try {
      const jsonData = JSON.parse(handshakeText);
      thtk = jsonData.thtk || null;
    } catch {
      // Not JSON - try URL-encoded format
      const params = new URLSearchParams(handshakeText.trim());
      thtk = params.get('thtk');
    }

    if (!thtk) {
      console.error('No thtk in handshake response:', handshakeText);
      return new Response(JSON.stringify({ error: 'Failed to initialize payment' }), { status: 502, headers: corsHeaders });
    }

    return new Response(JSON.stringify({
      success: true,
      thtk: thtk,
      supplier: supplier,
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    console.error('Error in tranzila-handshake:', error);
    return new Response(JSON.stringify({
      error: 'Internal server error',
      details: error instanceof Error ? error.message : String(error),
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});
