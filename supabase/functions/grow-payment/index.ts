
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

// GROW API credentials
const GROW_USER_ID = Deno.env.get('GROW_USER_ID') || '3bdaec1d6c7e9ef7'; // Testing user ID
const GROW_PAGE_CODE = Deno.env.get('GROW_PAGE_CODE') || 'f8dc02a4a03d'; // Default page code for recurring payment

// עדכון כתובת ה-API - שימו לב שבמסמכים הרשמיים של GROW יש לוודא את הכתובת המדויקת
const GROW_API_BASE = 'https://secure.e-c.co.il/easycard/createform.asp';

// CORS headers for browser requests
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Parse request body
    let payload;
    let action;

    try {
      const body = await req.json();
      action = body.action;
      payload = body.payload;
    } catch (e) {
      console.error("Error parsing JSON:", e);
      return new Response(
        JSON.stringify({ 
          error: 'Invalid JSON', 
          details: e.message 
        }), 
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Validate required fields for all requests
    if (!payload) {
      return new Response(
        JSON.stringify({ error: 'Missing payload' }), 
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // GROW שינוי הגישה לשרת של
    let growPayload = {};
    let endpoint = '';

    switch(action) {
      case 'createPaymentProcess':
        endpoint = GROW_API_BASE;
        
        // Validate required fields for payment creation
        if (!payload.customerName || !payload.customerPhone) {
          return new Response(
            JSON.stringify({ 
              error: 'Missing required fields', 
              details: 'Customer name and phone are required' 
            }), 
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
        
        // Validate phone format (Israeli mobile number)
        if (!payload.customerPhone.match(/^05\d{8}$/)) {
          return new Response(
            JSON.stringify({ 
              error: 'Invalid phone format', 
              details: 'Phone must be an Israeli mobile number starting with 05 and containing 10 digits' 
            }), 
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
        
        // Validate customer name format (first and last name)
        if (!payload.customerName.includes(' ')) {
          return new Response(
            JSON.stringify({ 
              error: 'Invalid name format', 
              details: 'Name must include first and last name separated by space' 
            }), 
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        // ההתאמה לפורמט הנדרש ע"י GROW
        growPayload = {
          user: GROW_USER_ID,
          pageCode: payload.pageCode || GROW_PAGE_CODE,
          sum: payload.amount.toString(),
          customerName: payload.customerName,
          customerPhone: payload.customerPhone,
          description: payload.description || 'מנוי שירות',
          customerEmail: payload.customerEmail || '',
          successUrl: payload.successUrl || '',
          errorUrl: payload.errorUrl || '',
          maxPayments: payload.maxPayments || '1',
          language: payload.language || 'HE',
          ...payload.extraParams
        };
        break;
        
      default:
        return new Response(
          JSON.stringify({ error: 'Invalid action' }), 
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    }

    console.log(`Making request to GROW API: ${endpoint}`, growPayload);

    // בניית שאילתה כפרמטרים ב-URL במקום כ-JSON בגוף הבקשה
    const queryParams = new URLSearchParams();
    for (const [key, value] of Object.entries(growPayload)) {
      queryParams.append(key, value as string);
    }

    // Make the request to GROW API
    const response = await fetch(`${endpoint}?${queryParams.toString()}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json, text/html',
      },
    });

    // בדיקת תשובה
    if (!response.ok) {
      const errorText = await response.text();
      console.error('GROW API non-2xx response:', response.status, errorText);
      return new Response(
        JSON.stringify({ 
          error: 'GROW API error',
          status: response.status,
          details: errorText.substring(0, 500) // הגבלה לאורך סביר
        }),
        { status: 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // בדיקה אם התשובה היא HTML (טופס תשלום) או JSON
    const contentType = response.headers.get('content-type') || '';
    
    if (contentType.includes('text/html')) {
      // אם התשובה היא HTML, נחזיר את הטופס להצגה
      const htmlContent = await response.text();
      return new Response(
        JSON.stringify({
          success: true,
          type: 'form',
          html: htmlContent,
          url: response.url  // מחזיר את הכתובת המלאה שיצרה GROW
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } else {
      // אם התשובה היא JSON, ננסה לפרסר אותה
      let responseData;
      try {
        responseData = await response.json();
      } catch (e) {
        // אם לא הצלחנו לפרסר כ-JSON, נחזיר את הטקסט
        const responseText = await response.text();
        
        return new Response(
          JSON.stringify({
            success: true,
            type: 'redirect',
            url: response.url,
            data: responseText
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      return new Response(
        JSON.stringify({
          success: true,
          type: 'json',
          data: responseData
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
  } catch (error) {
    console.error('Error processing GROW payment request:', error);
    
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error', 
        details: error.message 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
