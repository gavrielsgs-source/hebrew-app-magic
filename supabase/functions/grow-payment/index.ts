
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
      // For both actions, we'll use the same direct debit endpoint with similar parameters
      
      // Create a standardized payload for the direct debit API
      const directDebitPayload: GrowPaymentRequest = {
        userId: payload.userId || '',
        transactionToken: payload.transactionToken || '',
        transactionId: payload.transactionId || '',
        asmachta: payload.asmachta || '',
        clientId: GROW_CLIENT_ID,
        ECPwd: GROW_EC_PWD
      };
      
      // Add optional fields if they exist
      if (payload.customerName) directDebitPayload.fullName = payload.customerName;
      if (payload.customerPhone) directDebitPayload.phone = payload.customerPhone;
      if (payload.customerEmail) directDebitPayload.email = payload.customerEmail;
      if (payload.chargeDay) directDebitPayload.chargeDay = payload.chargeDay;
      if (payload.sum) directDebitPayload.sum = payload.sum?.toString();
      if (payload.maxPayments) directDebitPayload.paymentNum = payload.maxPayments?.toString();
      if (payload.changeStatus) directDebitPayload.changeStatus = payload.changeStatus;
      if (payload.updateCard) directDebitPayload.updateCard = payload.updateCard;

      console.log(`Making request to GROW API for ${action}:`, directDebitPayload);
      responseData = await processDirectDebitPayment(directDebitPayload);
    } 
    else {
      return new Response(
        JSON.stringify({ error: 'Invalid action, must be createPaymentProcess or updateDirectDebit' }), 
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`GROW API response:`, responseData);

    // Check for errors in the API response
    if (responseData.err) {
      let errorMessage = 'GROW API error';
      if (responseData.err.message) {
        errorMessage = responseData.err.message;
      }
      
      return new Response(
        JSON.stringify({ 
          error: errorMessage,
          code: responseData.err.id || 'unknown',
          details: responseData.err
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
      asmachta: responseData.data?.asmachta
    };

    return new Response(
      JSON.stringify(successResponse),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
    
  } catch (error) {
    console.error('Error processing GROW payment request:', error);
    
    let errorMessage = 'Internal server error';
    let errorDetails = {};
    
    if (error instanceof Error) {
      errorMessage = error.message;
    } else if (typeof error === 'object' && error !== null) {
      errorDetails = error;
    }
    
    return new Response(
      JSON.stringify({ 
        error: errorMessage,
        details: errorDetails
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
