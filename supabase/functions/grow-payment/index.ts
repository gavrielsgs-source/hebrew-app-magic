import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders, GROW_CLIENT_ID, GROW_EC_PWD } from './config.ts';
import { validatePayload, type PaymentPayload } from './validators.ts';
import { processDirectDebitPayment, type GrowPaymentRequest } from './api-client.ts';

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
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
        JSON.stringify({ error: 'Invalid JSON', details: e.message }),
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
        fullName: payload.customerName || '',      // fallback empty string if missing
        phone: payload.customerPhone || '',        // fallback empty string if missing
        sum: payload.sum ? String(payload.sum) : undefined,
        // Add any other optional fields your API client accepts here
        // e.g. email, chargeDay, maxPayments, etc. if supported
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
