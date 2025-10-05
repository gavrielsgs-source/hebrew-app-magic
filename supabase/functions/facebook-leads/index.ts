import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";
import { crypto } from "https://deno.land/std@0.168.0/crypto/mod.ts";

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
          console.log(leadData)
          if (!leadData.form_id || !leadData.leadgen_id || !leadData.page_id) continue;
        
          try {
            // Get saved page token
            const { data: tokenData, error: tokenError } = await supabase
              .from('facebook_tokens')
              .select('access_token, user_id')
              .eq('page_id', leadData.page_id)
              .single();
    
            if (tokenError || !tokenData) {
              results.push({ success: false, message: `לא נמצא טוקן שמור עבור דף ${leadData.page_id}` });
              continue;
            }

            const pageAccessToken = tokenData.access_token;

            // Fetch lead details
            const leadRes = await fetch(`https://graph.facebook.com/v17.0/${leadData.leadgen_id}?access_token=${pageAccessToken}`);
            if (!leadRes.ok) {
              const errorText = await leadRes.text();
              throw new Error(`Failed to fetch lead: ${errorText}`);
            }

            const leadDetails = await leadRes.json();

            const { error } = await supabase.rpc("save_facebook_lead" as any, {
              p_user_id: tokenData.user_id,
              p_page_id: leadData.page_id,
              p_lead_id: leadDetails.id,
              p_lead_data: leadDetails,
              p_created_at: new Date(leadDetails.created_time),
            });
            

            results.push({ success: true, lead_id: lead.id, message: `ליד נשמר בהצלחה: ${formattedLead.name}` });
          } catch (err) {
            results.push({ success: false, error: err instanceof Error ? err.message : String(err) });
          }
        }
      }

      return new Response(JSON.stringify({ success: true, results }), { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    } catch (error) {
      return new Response(JSON.stringify({ error: "Internal server error", details: error instanceof Error ? error.message : String(error) }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
  }

  return new Response("Method not allowed", { status: 405, headers: corsHeaders });
});
