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

    // בדיקת הרשאות API של GROW
    if (!GROW_CLIENT_ID || !GROW_EC_PWD) {
      console.error("Missing required GROW credentials");
      return new Response(
        JSON.stringify({ error: 'Missing GROW API credentials' }), 
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // וידוא תקינות הנתונים בהתאם לסוג הפעולה
    const validationError = validatePayload(payload, action);
    if (validationError) {
      return new Response(
        JSON.stringify({ error: validationError }), 
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    let responseData;
    
    if (action === 'createPaymentProcess') {
      // Existing implementation for creating payment process
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
        chargeType: "1",  // קוד קבוע של GROW לתשלום רגיל
        paymentNum: payload.maxPayments || "1",  // מספר תשלומים מבוקש
        maxPaymentNum: payload.maxPayments || "1", // הגבלת מספר תשלומים מקסימלי
        clientId: GROW_CLIENT_ID,
        ECPwd: GROW_EC_PWD
      } as any;

      console.log(`Making request to GROW API for payment process:`, growPayload);
      responseData = await createPaymentProcess(growPayload);
    } 
    else if (action === 'updateDirectDebit') {
      // New implementation for updating direct debit
      const directDebitPayload: GrowPaymentRequest = {
        userId: payload.userId || GROW_USER_ID,
        transactionToken: payload.transactionToken || '',
        transactionId: payload.transactionId || '',
        asmachta: payload.asmachta || '',
        clientId: GROW_CLIENT_ID,
        ECPwd: GROW_EC_PWD,
        // Include additional fields if provided
        sum: payload.amount?.toString(),
        description: payload.description,
        paymentNum: payload.maxPayments,
        maxPaymentNum: payload.maxPayments,
        pageField: payload.customerEmail ? {
          fullName: payload.customerName,
          phone: payload.customerPhone,
          email: payload.customerEmail
        } : undefined
      };

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

    // בדיקה אם התקבלה שגיאה מה-API
    if (responseData.err) {
      // Extract error message properly
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

    // Response structure may differ between create and update operations
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
    // Improved error handling
    console.error('Error processing GROW payment request:', error);
    
    let errorMessage = 'Internal server error';
    let errorDetails = {};
    
    // Extract message from error object properly
    if (error instanceof Error) {
      errorMessage = error.message;
    } else if (typeof error === 'object' && error !== null) {
      // Try to extract information from unknown error object
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
