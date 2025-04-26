
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders, GROW_CLIENT_ID, GROW_EC_PWD, GROW_PAGE_CODE, GROW_USER_ID } from './config.ts';
import { validatePayload, type PaymentPayload } from './validators.ts';
import { createPaymentProcess, type GrowPaymentRequest } from './api-client.ts';

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

    // וידוא תקינות הנתונים
    const validationError = validatePayload(payload);
    if (validationError) {
      return new Response(
        JSON.stringify({ error: validationError }), 
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (action !== 'createPaymentProcess') {
      return new Response(
        JSON.stringify({ error: 'Invalid action' }), 
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // הכנת הבקשה ל-GROW API עם תמיכה במספר תשלומים
    const growPayload: GrowPaymentRequest = {
      pageCode: GROW_PAGE_CODE,
      userId: GROW_USER_ID,
      sum: payload.amount.toString(),
      description: payload.description || 'תשלום חודשי',
      successUrl: payload.successUrl || '',
      cancelUrl: payload.errorUrl || '',
      pageField: {
        fullName: payload.customerName,
        phone: payload.customerPhone,
        email: payload.customerEmail || ''
      },
      chargeType: "1",
      paymentNum: "1",
      clientId: GROW_CLIENT_ID,
      ECPwd: GROW_EC_PWD
    };
    
    // אם יש מספר תשלומים מקסימלי, הוסף אותו
    if (payload.maxPayments && parseInt(payload.maxPayments) > 1) {
      growPayload.maxPayments = payload.maxPayments;
    }

    console.log(`Making request to GROW API:`, growPayload);
    
    // שליחת הבקשה ל-GROW
    const responseData = await createPaymentProcess(growPayload);
    console.log("GROW API response:", responseData);

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

    // החזרת ה-URL לטופס התשלום
    return new Response(
      JSON.stringify({
        success: true,
        url: responseData.data?.url,
        processId: responseData.data?.processId
      }),
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
