import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";
import { crypto } from "https://deno.land/std@0.168.0/crypto/mod.ts";
import {
  resolveAttribution,
  isEnhancedEnabled,
  type AttributionResult,
} from "../_shared/attribution.ts";

/**
 * ============================================================================
 *  facebook-leads webhook
 * ----------------------------------------------------------------------------
 *  PUBLIC / REVIEWER-SAFE FLOW (always on):
 *   - validates Meta HMAC-SHA256 signature
 *   - fetches lead via Graph API (uses approved leads_retrieval scope)
 *   - persists lead to facebook_leads
 *   - calls attribution service in SAFE MODE → label = "Facebook" (or "Meta")
 *   - sends welcome WhatsApp
 *
 *  ENHANCED FLOW (flag-gated, OFF by default):
 *   - additionally performs Graph ad-metadata lookup
 *   - resolves Instagram vs Facebook with high confidence
 *   - mirrors evidence to public.lead_attributions
 *
 *  See supabase/functions/_shared/ATTRIBUTION_README.md for full docs.
 * ============================================================================
 */

function formatPhoneForWhatsApp(phone: string | null | undefined): string | null {
  if (!phone) return null;
  let cleaned = phone.replace(/\D/g, "");
  if (cleaned.startsWith("0")) cleaned = cleaned.substring(1);
  if (!cleaned.startsWith("972")) cleaned = "972" + cleaned;
  return cleaned;
}

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-hub-signature-256",
};

async function verifyMetaSignature(
  body: string,
  signature: string,
  secret: string,
): Promise<boolean> {
  if (!signature || !signature.startsWith("sha256=")) return false;
  const expected = signature.slice(7);
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    enc.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const digest = await crypto.subtle.sign("HMAC", key, enc.encode(body));
  const hash = Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
  return expected === hash;
}

serve(async (req) => {
  console.log("🔥 WEBHOOK CALLED! Method:", req.method, "URL:", req.url);

  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  // GET — Meta verification handshake
  if (req.method === "GET") {
    const url = new URL(req.url);
    const mode = url.searchParams.get("hub.mode");
    const token = url.searchParams.get("hub.verify_token");
    const challenge = url.searchParams.get("hub.challenge");
    const verifyToken = Deno.env.get("FB_VERIFY_TOKEN");

    if (mode === "subscribe" && token === verifyToken) {
      return new Response(challenge, { status: 200, headers: corsHeaders });
    }
    return new Response("Verification failed", { status: 403, headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405, headers: corsHeaders });
  }

  try {
    const appSecret = Deno.env.get("FB_APP_SECRET");
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (!appSecret || !supabaseUrl || !supabaseKey) {
      throw new Error("Missing required environment variables");
    }

    const bodyText = await req.text();
    const signatureHeader = req.headers.get("x-hub-signature-256");
    const signatureValid = await verifyMetaSignature(bodyText, signatureHeader || "", appSecret);
    if (!signatureValid) {
      return new Response("Invalid Meta signature", { status: 401, headers: corsHeaders });
    }

    const supabase = createClient(supabaseUrl, supabaseKey);
    const webhookData = JSON.parse(bodyText);

    if (!webhookData.entry || !Array.isArray(webhookData.entry) || webhookData.entry.length === 0) {
      return new Response(JSON.stringify({ error: "No entries in payload" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const results: any[] = [];

    for (const entry of webhookData.entry) {
      if (!entry.changes || !Array.isArray(entry.changes)) continue;

      for (const change of entry.changes) {
        if (change.field !== "leadgen") continue;

        const leadData = change.value;
        console.log("📋 Leadgen change value:", JSON.stringify(leadData));
        if (!leadData.form_id || !leadData.leadgen_id || !leadData.page_id) continue;

        try {
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

            // -------- Fetch lead via approved leads_retrieval scope --------
            const leadRes = await fetch(
              `https://graph.facebook.com/v21.0/${leadData.leadgen_id}?access_token=${pageAccessToken}`,
            );
            if (!leadRes.ok) {
              console.error("❌ Failed to fetch lead:", await leadRes.text());
              continue;
            }
            const leadDetails = await leadRes.json();

            let leadPhone: string | null = null;
            let leadName: string | null = null;
            if (leadDetails.field_data && Array.isArray(leadDetails.field_data)) {
              for (const f of leadDetails.field_data) {
                if (f.name === "phone_number" || f.name === "phone") leadPhone = f.values[0];
                else if (f.name === "full_name" || f.name === "name") leadName = f.values[0];
              }
            }
            const formattedPhone = formatPhoneForWhatsApp(leadPhone);

            // -------- Resolve attribution (FLAG-GATED) --------
            const { data: profile } = await supabase
              .from("profiles")
              .select("attribution_enhanced")
              .eq("id", tokenData.user_id)
              .maybeSingle();

            const enhanced = isEnhancedEnabled(profile?.attribution_enhanced);
            const adId = leadDetails.ad_id || leadData.ad_id || null;

            const attribution: AttributionResult = await resolveAttribution({
              adId,
              formId: leadData.form_id || null,
              pageId: leadData.page_id || null,
              campaignId: leadDetails.campaign_id || null,
              pageAccessToken,
              enhanced,
            });

            console.log(
              "🔍 Attribution:",
              JSON.stringify({
                enhanced,
                display: attribution.lead_source_display,
                method: attribution.detection_method,
                confidence: attribution.detection_confidence,
              }),
            );

            // -------- Persist lead (with attribution evidence in JSONB) --------
            const formattedLead = {
              created_at: new Date(leadDetails.created_time).toISOString(),
              id: leadDetails.id,
              created_time: leadDetails.created_time,
              field_data: leadDetails.field_data || [],
              // Conservative top-level fields kept for backward compatibility:
              platform: attribution.lead_source_display,
              platform_detection_method: attribution.detection_method,
              platform_detection_confidence: attribution.detection_confidence,
              platform_detection_error: attribution.detection_error,
              ad_id: attribution.ad_id,
              form_id: attribution.form_id,
              // Future-ready nested attribution evidence:
              attribution: {
                lead_source_raw: attribution.lead_source_raw,
                lead_source_display: attribution.lead_source_display,
                detection_method: attribution.detection_method,
                detection_confidence: attribution.detection_confidence,
                detection_error: attribution.detection_error,
                ad_id: attribution.ad_id,
                campaign_id: attribution.campaign_id,
                form_id: attribution.form_id,
                page_id: attribution.page_id,
                enhanced_used: attribution.enhanced_used,
                evidence: attribution.evidence,
              },
            };

            const { error } = await supabase.rpc("save_facebook_lead" as any, {
              p_user_id: tokenData.user_id,
              p_page_id: leadData.page_id,
              p_lead_id: leadDetails.id,
              p_lead_data: formattedLead,
              p_created_at: new Date(leadDetails.created_time),
            });
            if (error) console.error("❌ save_facebook_lead RPC failed:", error);

            // -------- Mirror to lead_attributions (only when enhanced is ON) --------
            if (enhanced) {
              const { error: attrErr } = await supabase
                .from("lead_attributions")
                .upsert(
                  {
                    user_id: tokenData.user_id,
                    lead_source_table: "facebook_leads",
                    lead_ref_id: leadDetails.id,
                    lead_source_raw: attribution.lead_source_raw,
                    lead_source_display: attribution.lead_source_display,
                    detection_method: attribution.detection_method,
                    detection_confidence: attribution.detection_confidence,
                    detection_error: attribution.detection_error,
                    ad_id: attribution.ad_id,
                    campaign_id: attribution.campaign_id,
                    form_id: attribution.form_id,
                    page_id: attribution.page_id,
                    evidence: attribution.evidence,
                  },
                  { onConflict: "user_id,lead_source_table,lead_ref_id" },
                );
              if (attrErr) console.error("❌ lead_attributions upsert failed:", attrErr);
            }

            // -------- Welcome WhatsApp (unchanged) --------
            if (formattedPhone && leadName) {
              try {
                const r = await fetch(`${supabaseUrl}/functions/v1/send-whatsapp-message`, {
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
                if (!r.ok) console.error("❌ WhatsApp API error:", await r.json());
              } catch (e) {
                console.error("❌ WhatsApp send failed:", e);
              }
            }

            results.push({
              success: true,
              lead_id: leadDetails.id,
              source: attribution.lead_source_display,
              enhanced_used: attribution.enhanced_used,
            });
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
    return new Response(JSON.stringify({ error: (error as Error).message || String(error) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
