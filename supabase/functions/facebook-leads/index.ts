import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";
import { crypto } from "https://deno.land/std@0.168.0/crypto/mod.ts";

// Format phone to WhatsApp format (972XXXXXXXXX)
function formatPhoneForWhatsApp(phone: string | null | undefined): string | null {
  if (!phone) return null;
  let cleaned = phone.replace(/\D/g, '');
  if (cleaned.startsWith('0')) cleaned = cleaned.substring(1);
  if (!cleaned.startsWith('972')) cleaned = '972' + cleaned;
  return cleaned;
}

// CORS headers
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-hub-signature",
};

// Verify Facebook signature
async function verifyFacebookSignature(body: string, signature: string, secret: string): Promise<boolean> {
  if (!signature || !signature.startsWith("sha1=")) return false;
  const expectedSignature = signature.slice(5);
  const encoder = new TextEncoder();
  const key = encoder.encode(secret);
  const hmac = await crypto.subtle.importKey("raw", key, { name: "HMAC", hash: "SHA-1" }, false, ["sign"]);
  const digest = await crypto.subtle.sign("HMAC", hmac, encoder.encode(body));
  const hash = Array.from(new Uint8Array(digest)).map(b => b.toString(16).padStart(2, "0")).join("");
  return expectedSignature === hash;
}

serve(async (req) => {
  console.log("🔥 WEBHOOK CALLED! Method:", req.method, "URL:", req.url);

  // Handle preflight
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  // Facebook Webhook Verification
  if (req.method === "GET") {
    const url = new URL(req.url);
    const mode = url.searchParams.get("hub.mode");
    const token = url.searchParams.get("hub.verify_token");
    const challenge = url.searchParams.get("hub.challenge");
    const verifyToken = Deno.env.get("FB_VERIFY_TOKEN");

    if (mode === "subscribe" && token === verifyToken) return new Response(challenge, { status: 200, headers: corsHeaders });
    return new Response("Verification failed", { status: 403, headers: corsHeaders });
  }

  // Handle POST (actual webhook)
  if (req.method === "POST") {
    try {
  const appSecret = Deno.env.get("FB_APP_SECRET");
  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

  if (!appSecret || !supabaseUrl || !supabaseKey) throw new Error("Missing required environment variables");

  // ✅ Read body once
  const bodyText = await req.text();
  const signatureHeader = req.headers.get("x-hub-signature");

  const signatureValid = await verifyFacebookSignature(bodyText, signatureHeader || "", appSecret);
  if (!signatureValid) return new Response("Invalid Facebook signature", { status: 401, headers: corsHeaders });

  const supabase = createClient(supabaseUrl, supabaseKey);
  const webhookData = JSON.parse(bodyText);

  if (!webhookData.entry || !Array.isArray(webhookData.entry) || webhookData.entry.length === 0) {
    return new Response(JSON.stringify({ error: "No entries in payload" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }

  const results = [];

  for (const entry of webhookData.entry) {
    if (!entry.changes || !Array.isArray(entry.changes)) continue;

    for (const change of entry.changes) {
      if (change.field !== "leadgen") continue;

      const leadData = change.value;
      console.log(leadData);
      if (!leadData.form_id || !leadData.leadgen_id || !leadData.page_id) continue;

      try {
        console.log("🟢 Entered inner try block for page:", leadData.page_id);

        const { data: tokens, error: tokenError } = await supabase
          .from("facebook_tokens")
          .select("access_token, user_id")
          .eq("page_id", leadData.page_id);
        
        console.log("🟡 Tokens fetched:", tokens);
        
        if (tokenError || !tokens || tokens.length === 0) {
          console.log("🔴 No tokens found or error:", tokenError);
          results.push({ success: false, message: `לא נמצא טוקן שמור עבור דף ${leadData.page_id}` });
          continue;
        }
        
        for (const tokenData of tokens) {
          console.log("🔵 Processing token for user:", tokenData.user_id);
        
          const pageAccessToken = tokenData.access_token;
          console.log("🟢 Fetching lead details for:", leadData.leadgen_id);
        
          const leadRes = await fetch(`https://graph.facebook.com/v17.0/${leadData.leadgen_id}?access_token=${pageAccessToken}`);
          console.log("🟣 Lead response status:", leadRes.status);
        
          if (!leadRes.ok) {
            const errorText = await leadRes.text();
            console.error("❌ Failed to fetch lead:", errorText);
            continue;
          }
        
          const leadDetails = await leadRes.json();
          console.log("🟠 Lead details fetched:", leadDetails);
        
          // (rest of your logic)
        }


          let leadPhone = null;
          let leadName = null;

          if (leadDetails.field_data && Array.isArray(leadDetails.field_data)) {
            for (const field of leadDetails.field_data) {
              if (field.name === "phone_number" || field.name === "phone") {
                leadPhone = field.values[0];
              } else if (field.name === "full_name" || field.name === "name") {
                leadName = field.values[0];
              }
            }
          }

          const formattedPhone = formatPhoneForWhatsApp(leadPhone);

          const formattedLead = {
            created_at: new Date(leadDetails.created_time).toISOString(),
            id: leadDetails.id,
            created_time: leadDetails.created_time,
            field_data: leadDetails.field_data || [],
          };

          const { error } = await supabase.rpc("save_facebook_lead" as any, {
            p_user_id: tokenData.user_id,
            p_page_id: leadData.page_id,
            p_lead_id: leadDetails.id,
            p_lead_data: formattedLead,
            p_created_at: new Date(leadDetails.created_time),
          });

          if (error) {
          console.error("❌ save_facebook_lead RPC failed:", error);
          } else {
            console.log("✅ save_facebook_lead RPC succeeded for lead:", leadDetails.id);
          }

          // Send welcome WhatsApp message
          if (formattedPhone && leadName) {
            try {
              console.log("📱 Attempting to send welcome WhatsApp message to:", formattedPhone, "for:", leadName);
              const whatsappResponse = await fetch(`${supabaseUrl}/functions/v1/send-whatsapp-message`, {
                method: "POST",
                headers: {
                  Authorization: `Bearer ${supabaseKey}`,
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  type: "template",
                  to: formattedPhone,
                  templateName: "welcome_message",
                  languageCode: "he",
                  parameters: [leadName],
                }),
              });

              const whatsappResult = await whatsappResponse.json();

              if (!whatsappResponse.ok) {
                console.error("❌ WhatsApp API error:", whatsappResult);
              } else {
                console.log("✅ Welcome WhatsApp message sent successfully to:", formattedPhone);
              }
            } catch (whatsappError) {
              console.error("❌ Failed to send welcome WhatsApp message:", whatsappError);
            }
          } else {
            console.log("⚠️ Skipping WhatsApp message - missing phone or name:", { phone: formattedPhone, name: leadName });
          }

          results.push({ success: true, lead_id: formattedLead.id, message: `ליד נשמר בהצלחה: ${leadName || "ללא שם"}` });
        }
      } catch (err) {
        results.push({ success: false, error: err instanceof Error ? err.message : String(err) });
      }
    }
  }

  return new Response(JSON.stringify(results), {
    status: 200,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
} catch (error) {
  console.error("❌ Fatal error:", error);
  return new Response(JSON.stringify({ error: error.message || String

  }

  return new Response("Method not allowed", { status: 405, headers: corsHeaders });
});
