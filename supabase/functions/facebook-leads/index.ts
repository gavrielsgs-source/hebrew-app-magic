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

// Detect platform (Facebook vs Instagram) using ad metadata
async function detectPlatform(
  adId: string | null | undefined,
  pageAccessToken: string
): Promise<{
  platform: string;
  detection_method: string;
  detection_confidence: string;
  detection_error: string | null;
}> {
  // No ad_id → we cannot determine platform reliably
  if (!adId) {
    return {
      platform: "Meta",
      detection_method: "no_ad_id",
      detection_confidence: "none",
      detection_error: null,
    };
  }

  try {
    const adRes = await fetch(
      `https://graph.facebook.com/v17.0/${adId}?fields=effective_instagram_media_url,instagram_actor_id&access_token=${pageAccessToken}`
    );

    if (!adRes.ok) {
      const errText = await adRes.text();
      console.log("⚠️ Ad metadata lookup failed:", adRes.status, errText);
      return {
        platform: "Meta",
        detection_method: "ad_lookup_failed",
        detection_confidence: "none",
        detection_error: `HTTP ${adRes.status}: ${errText.substring(0, 200)}`,
      };
    }

    const adData = await adRes.json();

    if (adData.instagram_actor_id || adData.effective_instagram_media_url) {
      return {
        platform: "Instagram",
        detection_method: "ad_metadata_instagram_actor",
        detection_confidence: "high",
        detection_error: null,
      };
    }

    // Ad exists but has no Instagram markers → it's a Facebook ad
    return {
      platform: "Facebook",
      detection_method: "ad_metadata_no_instagram_markers",
      detection_confidence: "high",
      detection_error: null,
    };
  } catch (err) {
    console.log("⚠️ Platform detection error:", err);
    return {
      platform: "Meta",
      detection_method: "ad_lookup_exception",
      detection_confidence: "none",
      detection_error: err instanceof Error ? err.message : String(err),
    };
  }
}

serve(async (req) => {
  console.log("🔥 WEBHOOK CALLED! Method:", req.method, "URL:", req.url);

  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  // Facebook Webhook Verification (GET)
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
          console.log("📋 Leadgen change value:", JSON.stringify(leadData));
          if (!leadData.form_id || !leadData.leadgen_id || !leadData.page_id) continue;

          try {
            console.log("🟢 Processing lead for page:", leadData.page_id);

            const { data: tokens, error: tokenError } = await supabase
              .from("facebook_tokens")
              .select("access_token, user_id")
              .eq("page_id", leadData.page_id);

            if (tokenError || !tokens || tokens.length === 0) {
              console.log("🔴 No tokens found for page:", leadData.page_id);
              results.push({ success: false, message: `No token for page ${leadData.page_id}` });
              continue;
            }

            for (const tokenData of tokens) {
              const pageAccessToken = tokenData.access_token;

              // Fetch lead details from Meta Graph API
              const leadRes = await fetch(`https://graph.facebook.com/v17.0/${leadData.leadgen_id}?access_token=${pageAccessToken}`);

              if (!leadRes.ok) {
                const errorText = await leadRes.text();
                console.error("❌ Failed to fetch lead:", errorText);
                continue;
              }

              const leadDetails = await leadRes.json();
              console.log("🟠 Lead details:", JSON.stringify(leadDetails));

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

              // Detect platform with confidence tracking
              const adId = leadDetails.ad_id || leadData.ad_id;
              const platformResult = await detectPlatform(adId, pageAccessToken);

              console.log("🔍 Platform detection:", JSON.stringify(platformResult));

              const formattedLead = {
                created_at: new Date(leadDetails.created_time).toISOString(),
                id: leadDetails.id,
                created_time: leadDetails.created_time,
                field_data: leadDetails.field_data || [],
                platform: platformResult.platform,
                platform_detection_method: platformResult.detection_method,
                platform_detection_confidence: platformResult.detection_confidence,
                platform_detection_error: platformResult.detection_error,
                ad_id: adId || null,
                form_id: leadData.form_id || null,
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
                console.log("✅ Lead saved:", leadDetails.id, "platform:", platformResult.platform);
              }

              // Send welcome WhatsApp message
              if (formattedPhone && leadName) {
                try {
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
                    console.log("✅ WhatsApp sent to:", formattedPhone);
                  }
                } catch (whatsappError) {
                  console.error("❌ WhatsApp send failed:", whatsappError);
                }
              }

              results.push({ success: true, lead_id: formattedLead.id, platform: platformResult.platform });
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
      return new Response(JSON.stringify({ error: error.message || String(error) }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
  }

  return new Response("Method not allowed", { status: 405, headers: corsHeaders });
});
