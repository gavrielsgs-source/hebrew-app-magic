
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

// GROW API credentials
const GROW_USER_ID = Deno.env.get('GROW_USER_ID') || '3bdaec1d6c7e9ef7'; // Testing user ID
const GROW_PAGE_CODE = Deno.env.get('GROW_PAGE_CODE') || 'f8dc02a4a03d'; // Default page code for recurring payment

// CORS headers for browser requests
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Base URL for GROW API
const GROW_API_BASE = 'https://secure.e-c.co.il/api/light/server/1.0';

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

    // Different endpoints based on the action
    let endpoint = '';
    let growPayload = {};

    switch(action) {
      case 'createPaymentProcess':
        endpoint = `${GROW_API_BASE}/createpaymentprocess`;
        
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

        // Prepare payment creation payload
        growPayload = {
          UserId: GROW_USER_ID,
          PageCode: payload.pageCode || GROW_PAGE_CODE,
          Sum: payload.amount.toString(),
          CustomerName: payload.customerName,
          CustomerPhone: payload.customerPhone,
          Description: payload.description || 'מנוי שירות',
          CustomerEmail: payload.customerEmail || '',
          SuccessUrl: payload.successUrl || '',
          ErrorUrl: payload.errorUrl || '',
          MaxPayments: payload.maxPayments || '1',
          Language: payload.language || 'HE',
          TemplateName: payload.templateName || '',
          ProductDescription: payload.productDescription || '',
          ...payload.extraParams // Allow any extra parameters to be passed through
        };
        break;
        
      case 'updateDirectDebit':
        endpoint = `${GROW_API_BASE}/updatedirectdebit`;
        
        // Validate required fields for direct debit update
        if (!payload.transactionId) {
          return new Response(
            JSON.stringify({ 
              error: 'Missing required fields', 
              details: 'Transaction ID is required' 
            }), 
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
        
        // Prepare direct debit update payload
        growPayload = {
          UserId: GROW_USER_ID,
          TransactionId: payload.transactionId,
          ...payload.updateParams // Parameters like Sum, IsActive, CardOwnerName, etc.
        };
        break;
        
      default:
        return new Response(
          JSON.stringify({ error: 'Invalid action' }), 
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    }

    console.log(`Making request to GROW API: ${endpoint}`, growPayload);

    // Make the request to GROW API
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(growPayload),
    });

    // Check for non-2xx status code
    if (!response.ok) {
      const errorText = await response.text();
      console.error('GROW API non-2xx response:', response.status, errorText);
      return new Response(
        JSON.stringify({ 
          error: 'GROW API error',
          status: response.status,
          details: errorText
        }),
        { status: 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Parse and return the response from GROW
    let responseData;
    try {
      responseData = await response.json();
    } catch (e) {
      // Handle case where response is not valid JSON
      const responseText = await response.text();
      console.error('Failed to parse GROW API response as JSON:', e, 'Response text:', responseText);
      
      // If we can't parse as JSON but have HTML, it might be the payment form directly
      if (responseText.includes('<!DOCTYPE') || responseText.includes('<html')) {
        return new Response(
          JSON.stringify({
            htmlResponse: true,
            html: responseText
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      return new Response(
        JSON.stringify({ 
          error: 'Invalid response from GROW API', 
          details: e.message,
          responseText: responseText.substring(0, 500) // Include first 500 chars of response for debugging
        }),
        { status: 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    console.log('GROW API response:', responseData);
    
    return new Response(
      JSON.stringify(responseData),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
    
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
