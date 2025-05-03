
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders, GROW_CLIENT_ID, GROW_EC_PWD, GROW_PAGE_CODE, GROW_USER_ID } from './config.ts';
import { validatePayload, type PaymentPayload } from './validators.ts';
import { createPaymentProcess, updateDirectDebitPayment, type GrowPaymentRequest } from './api-client.ts';

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
    
    if (action === 'createPaymentProcess') {
      // Implementation for creating payment process
      const growPayload: GrowPaymentRequest = {
        pageCode: GROW_PAGE_CODE,
        userId: GROW_USER_ID,
        sum: payload.amount?.toString() || "0",
        description: payload.description || 'תשלום חודשי',
        successUrl: payload.successUrl || '',
        cancelUrl: payload.errorUrl || '',
        pageField: {
          fullName: payload.customerName || '',
          phone: payload.customerPhone || '',
          email: payload.customerEmail || ''
        },
        chargeType: "1",  // Fixed GROW code for regular payment
        paymentNum: payload.maxPayments?.toString() || "1",
        maxPaymentNum: payload.maxPayments?.toString() || "1",
        clientId: GROW_CLIENT_ID,
        ECPwd: GROW_EC_PWD
      } as any;

      console.log(`Making request to GROW API for payment process:`, growPayload);
      responseData = await createPaymentProcess(growPayload);
    } 
    else if (action === 'updateDirectDebit') {
      // Implementation for updating direct debit with all required fields per Postman
      // Ensure we have ALL the required fields
      if (!payload.userId || !payload.transactionToken || !payload.transactionId || !payload.asmachta) {
        return new Response(
          JSON.stringify({ 
            error: 'Missing required fields for updateDirectDebit',
            details: 'userId, transactionToken, transactionId, and asmachta are required'
          }), 
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Create payload with all required fields as strings (as shown in Postman)
      const directDebitPayload: GrowPaymentRequest = {
        userId: payload.userId,
        transactionToken: payload.transactionToken,
        transactionId: payload.transactionId,
        asmachta: payload.asmachta,
        clientId: GROW_CLIENT_ID,
        ECPwd: GROW_EC_PWD
      };

      // Add optional fields if they exist
      if (payload.customerName) directDebitPayload.fullName = payload.customerName;
      if (payload.customerPhone) directDebitPayload.phone = payload.customerPhone;
      if (payload.customerEmail) directDebitPayload.email = payload.customerEmail;
      if (payload.chargeDay) directDebitPayload.chargeDay = payload.chargeDay;
      if (payload.amount) directDebitPayload.sum = payload.amount.toString();
      if (payload.maxPayments) directDebitPayload.paymentNum = payload.maxPayments.toString();
      if (payload.changeStatus) directDebitPayload.changeStatus = payload.changeStatus;
      if (payload.updateCard) directDebitPayload.updateCard = payload.updateCard;

      console.log(`Making request to GROW API for updating direct debit:`, directDebitPayload);
      responseData = await updateDirectDebitPayment(directDebitPayload);
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
