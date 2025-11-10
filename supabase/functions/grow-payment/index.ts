import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders, GROW_CLIENT_ID, GROW_EC_PWD } from './config.ts';
import { validatePayload, type PaymentPayload } from './validators.ts';
import { processDirectDebitPayment, type GrowPaymentRequest } from './api-client.ts';

// Rate limiting for security
const rateLimitMap = new Map();
const RATE_LIMIT_WINDOW = 60000; // 1 minute
const MAX_REQUESTS_PER_WINDOW = 10;

function isRateLimited(clientId: string): boolean {
  const now = Date.now();
  const clientData = rateLimitMap.get(clientId);
  
  if (!clientData || now - clientData.timestamp > RATE_LIMIT_WINDOW) {
    rateLimitMap.set(clientId, { count: 1, timestamp: now });
    return false;
  }
  
  if (clientData.count >= MAX_REQUESTS_PER_WINDOW) {
    return true;
  }
  
  clientData.count++;
  return false;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  // Get client identifier for rate limiting
  const clientId = req.headers.get('x-forwarded-for') || 'unknown';
  
  // Apply rate limiting
  if (isRateLimited(clientId)) {
    console.error('Rate limit exceeded for client:', clientId);
    return new Response(
      JSON.stringify({ error: 'Rate limit exceeded. Please try again later.' }), 
      { 
        status: 429, 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json',
          'Retry-After': '60'
        }
      }
    );
  }

  try {
    let payload: PaymentPayload;
    let action: string;

    try {
      const body = await req.json();
      action = body.action;
      payload = body.payload;
      console.log("Received payment request:", { action, payload });
    } catch (e) {
      console.error("Error parsing JSON:", e);
      return new Response(
        JSON.stringify({ error: 'Invalid JSON', details: e instanceof Error ? e.message : 'Unknown error' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check GROW API credentials
    if (!GROW_CLIENT_ID || !GROW_EC_PWD) {
      console.error("Missing required GROW credentials");
      return new Response(
        JSON.stringify({ error: 'Missing GROW API credentials' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate payload data based on action
    const validationError = validatePayload(payload, action);
    if (validationError) {
      return new Response(
        JSON.stringify({ error: validationError }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    let responseData;

    if (action === 'createPaymentProcess' || action === 'updateDirectDebit') {
    // Compose payload for the API client, matching expected GrowPaymentRequest interface
      const directDebitPayload: GrowPaymentRequest = {
        fullName: payload.fullName || '',
        phone: payload.phone || '',
        email: payload.email || '',
        sum: payload.sum ? String(payload.sum) : undefined,
        planId: payload.planId,
        isTrial: payload.isTrial,
        billingCycle: payload.billingCycle,
        companyName: payload.companyName,
        businessId: payload.businessId,
        address: payload.address,
        city: payload.city,
        postalCode: payload.postalCode,
      };

      console.log(`Making request to GROW API for ${action}:`, directDebitPayload);
      responseData = await processDirectDebitPayment(directDebitPayload);
    } else {
      return new Response(
        JSON.stringify({ error: 'Invalid action, must be createPaymentProcess or updateDirectDebit' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`GROW API response:`, responseData);

    if (responseData.err) {
      return new Response(
        JSON.stringify({
          error: responseData.err.message || 'GROW API error',
          code: responseData.err.id || 'unknown',
          details: responseData.err,
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Success response
    const successResponse = {
      success: true,
      url: responseData.data?.url,
      processId: responseData.data?.processId,
      transactionId: responseData.data?.transactionId,
      asmachta: responseData.data?.asmachta,
    };

    return new Response(
      JSON.stringify(successResponse),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error processing GROW payment request:', error);

    const errorMessage = error instanceof Error ? error.message : 'Internal server error';

    return new Response(
      JSON.stringify({
        error: errorMessage,
        details: error instanceof Error ? undefined : error,
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
