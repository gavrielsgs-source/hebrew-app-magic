import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

// Server-side discount code validation
const VALID_DISCOUNT_CODES: Record<string, { percent: number; yearlyOnly: boolean; allowedPlans: string[] }> = {
  'CARS40': { percent: 40, yearlyOnly: true, allowedPlans: ['business', 'enterprise'] },
};

function validateDiscountServer(code: string, billingCycle: string, sum: number, basePrices: Record<string, { monthly: number; yearly: number }>, planId: string): { valid: boolean; error?: string } {
  const normalized = code.trim().toUpperCase();
  const discount = VALID_DISCOUNT_CODES[normalized];
  
  if (!discount) {
    return { valid: false, error: 'Invalid discount code' };
  }
  
  if (discount.yearlyOnly && billingCycle !== 'yearly') {
    return { valid: false, error: 'Discount code only valid for yearly billing' };
  }

  // Validate that the sum matches the expected discounted price
  const planPrices = basePrices[planId];
  if (!planPrices) {
    return { valid: false, error: 'Invalid plan' };
  }

  const baseSum = billingCycle === 'yearly' ? planPrices.yearly : planPrices.monthly;
  const expectedSum = Math.round(baseSum * (1 - discount.percent / 100));

  if (sum !== expectedSum) {
    console.error(`Discount validation failed: expected ${expectedSum}, got ${sum}`);
    return { valid: false, error: 'Sum does not match discount' };
  }

  return { valid: true };
}

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
    const { sum, planId, billingCycle, isYearly, discountCode } = await req.json();

    if (!sum || sum <= 0) {
      return new Response(JSON.stringify({ error: 'Invalid sum' }), { status: 400, headers: corsHeaders });
    }

    // Known base prices for validation (both flows use different price structures)
    // UpgradeSubscription/Payment prices
    const upgradePrices: Record<string, { monthly: number; yearly: number }> = {
      'premium': { monthly: 199, yearly: 179 * 12 },
      'business': { monthly: 399, yearly: 349 * 12 },
      'enterprise': { monthly: 699, yearly: 619 * 12 },
    };

    // SignupTrial prices  
    const signupPrices: Record<string, { monthly: number; yearly: number }> = {
      'premium': { monthly: 99, yearly: 990 },
      'business': { monthly: 299, yearly: 2990 },
      'enterprise': { monthly: 999, yearly: 9990 },
    };

    // Validate discount code if provided
    if (discountCode) {
      // Try both price structures
      const upgradeValidation = validateDiscountServer(discountCode, billingCycle, sum, upgradePrices, planId);
      const signupValidation = validateDiscountServer(discountCode, billingCycle, sum, signupPrices, planId);
      
      if (!upgradeValidation.valid && !signupValidation.valid) {
        console.error(`Discount code validation failed for code: ${discountCode}, plan: ${planId}, cycle: ${billingCycle}, sum: ${sum}`);
        return new Response(JSON.stringify({ error: 'קוד הנחה לא תקין או סכום לא תואם' }), { status: 400, headers: corsHeaders });
      }
    }

    const supplier = Deno.env.get('TRANZILA_SUPPLIER');
    const tranzilaPW = Deno.env.get('TRANZILA_PW');

    if (!supplier || !tranzilaPW) {
      console.error('Missing Tranzila credentials');
      return new Response(JSON.stringify({ error: 'Payment system not configured' }), { status: 500, headers: corsHeaders });
    }

    // Perform handshake with Tranzila (GET request as per docs)
    const handshakeUrl = `https://api.tranzila.com/v1/handshake/create?supplier=${encodeURIComponent(supplier)}&sum=${sum}&TranzilaPW=${encodeURIComponent(tranzilaPW)}`;
    
    console.log(`Performing Tranzila handshake for user ${userId}, sum: ${sum}, plan: ${planId}${discountCode ? `, discount: ${discountCode}` : ''}`);

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
