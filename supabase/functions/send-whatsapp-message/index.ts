import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const WHATSAPP_TOKEN = Deno.env.get('WHATSAPP_TOKEN');
const WHATSAPP_API_URL = 'https://graph.facebook.com/v21.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface WhatsAppRequest {
  to: string; // Phone number in format 972534318411
  templateName: string;
  languageCode?: string;
  parameters?: string[];
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { to, templateName, languageCode = 'he', parameters = [] }: WhatsAppRequest = await req.json();

    console.log('📱 Sending WhatsApp message:', { to, templateName, parameters });

    if (!WHATSAPP_TOKEN) {
      throw new Error('WHATSAPP_TOKEN is not configured');
    }

    // Build template components based on parameters
    const components = [];
    
    if (parameters.length > 0) {
      components.push({
        type: "body",
        parameters: parameters.map(param => ({
          type: "text",
          text: param
        }))
      });
    }

    // Send WhatsApp template message
    // IMPORTANT: Replace YOUR_PHONE_NUMBER_ID with your actual WhatsApp Business Phone Number ID
    // Get it from: https://business.facebook.com/wa/manage/phone-numbers/
    const response = await fetch(`${WHATSAPP_API_URL}/YOUR_PHONE_NUMBER_ID/messages`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${WHATSAPP_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        to: to,
        type: "template",
        template: {
          name: templateName,
          language: {
            code: languageCode
          },
          components: components
        }
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('❌ WhatsApp API error:', data);
      throw new Error(data.error?.message || 'Failed to send WhatsApp message');
    }

    console.log('✅ WhatsApp message sent successfully:', data);

    return new Response(JSON.stringify({ success: true, data }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (error) {
    console.error('❌ Error in send-whatsapp-message function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
