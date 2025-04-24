
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

// GROW API credentials
const GROW_USER_ID = Deno.env.get('GROW_USER_ID') || '3bdaec1d6c7e9ef7'; 
const GROW_PAGE_CODE = Deno.env.get('GROW_PAGE_CODE') || 'f8dc02a4a03d';
const GROW_CLIENT_ID = Deno.env.get('GROW_CLIENT_ID') || '3bdaec1d6c7e9ef7';
const GROW_EC_PWD = Deno.env.get('GROW_EC_PWD') || 'f8dc02a4a03d';

// עדכון כתובת ה-API בהתאם למסמכי GROW
const GROW_API_BASE = 'https://sandbox.meshulam.co.il/api/light/server/1.0/createPaymentProcess';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    let payload;
    let action;

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
    
    if (!payload) {
      return new Response(
        JSON.stringify({ error: 'Missing payload' }), 
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!GROW_CLIENT_ID || !GROW_EC_PWD) {
      console.error("Missing required GROW credentials");
      return new Response(
        JSON.stringify({ 
          error: 'Missing GROW API credentials'
        }), 
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    let growPayload = {};
    let endpoint = '';

    switch(action) {
      case 'createPaymentProcess':
        endpoint = GROW_API_BASE;
        
        // בדיקת שדות חובה לפי המסמכים הרשמיים
        if (!payload.customerName || !payload.customerPhone) {
          return new Response(
            JSON.stringify({ 
              error: 'Missing required fields',
              details: 'Customer name and phone are required' 
            }), 
            { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
        
        // וידוא פורמט מספר טלפון ישראלי
        if (!payload.customerPhone.match(/^05\d{8}$/)) {
          return new Response(
            JSON.stringify({ 
              error: 'Invalid phone format',
              details: 'Phone must be an Israeli mobile number' 
            }), 
            { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
        
        // וידוא שם מלא
        if (!payload.customerName.includes(' ')) {
          return new Response(
            JSON.stringify({ 
              error: 'Invalid name format',
              details: 'Name must include first and last name' 
            }), 
            { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        // עדכון הפרמטרים בהתאם למסמכי GROW
        growPayload = {
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
          chargeType: "1", // תשלום רגיל
          paymentNum: payload.maxPayments || "1",
          clientId: GROW_CLIENT_ID,
          ECPwd: GROW_EC_PWD
        };
        break;
        
      default:
        return new Response(
          JSON.stringify({ error: 'Invalid action' }), 
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    }

    console.log(`Making request to GROW API: ${endpoint}`, growPayload);
    
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json'
      },
      body: new URLSearchParams(growPayload as Record<string, string>).toString()
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('GROW API error:', response.status, errorText);
      return new Response(
        JSON.stringify({ 
          error: 'GROW API error',
          status: response.status,
          details: errorText
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const responseData = await response.json();
    console.log("GROW API response:", responseData);

    // בדיקה אם התקבלה שגיאה מה-API
    if (responseData.err) {
      return new Response(
        JSON.stringify({ 
          error: 'GROW API error',
          details: responseData.err
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // החזרת ה-URL לטופס התשלום
    return new Response(
      JSON.stringify({
        success: true,
        url: responseData.data.url,
        processId: responseData.data.processId
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
    
  } catch (error) {
    console.error('Error processing GROW payment request:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error', 
        details: error.message 
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
