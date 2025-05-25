import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";
import { crypto } from "https://deno.land/std@0.168.0/crypto/mod.ts";

// CORS headers
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-hub-signature",
};

// Verify Facebook signature
async function verifyFacebookSignature(req: Request, secret: string): Promise<boolean> {
  const signatureHeader = req.headers.get("x-hub-signature");
  if (!signatureHeader || !signatureHeader.startsWith("sha1=")) {
    console.warn("Missing or invalid signature header");
    return false;
  }

  const signature = signatureHeader.slice(5);
  const body = await req.text(); // read body as text
  const encoder = new TextEncoder();
  const key = encoder.encode(secret);
  const hmac = await crypto.subtle.importKey("raw", key, { name: "HMAC", hash: "SHA-1" }, false, ["sign"]);
  const digest = await crypto.subtle.sign("HMAC", hmac, encoder.encode(body));
  const hash = Array.from(new Uint8Array(digest)).map(b => b.toString(16).padStart(2, "0")).join("");

  return signature === hash;
}

serve(async (req) => {
  // Handle preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  // Facebook Webhook Verification (GET)
  if (req.method === "GET") {
    const url = new URL(req.url);
    const mode = url.searchParams.get("hub.mode");
    const token = url.searchParams.get("hub.verify_token");
    const challenge = url.searchParams.get("hub.challenge");

    const verifyToken = Deno.env.get("FB_VERIFY_TOKEN");

    if (mode === "subscribe" && token === verifyToken) {
      console.log("Facebook Webhook verified");
      return new Response(challenge, { status: 200, headers: corsHeaders });
    } else {
      return new Response("Verification failed", { status: 403, headers: corsHeaders });
    }
  }

  try {
    const appSecret = Deno.env.get("FB_APP_SECRET");
    const fbAccessToken = Deno.env.get("FB_ACCESS_TOKEN");
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!appSecret || !fbAccessToken || !supabaseUrl || !supabaseKey) {
      throw new Error("Missing environment variables");
    }

    const signatureValid = await verifyFacebookSignature(req.clone(), appSecret);
    if (!signatureValid) {
      return new Response("Invalid Facebook signature", { status: 401, headers: corsHeaders });
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    const body = await req.json();
    console.log("Received webhook data:", JSON.stringify(body));

    if (!body.entry || !Array.isArray(body.entry) || body.entry.length === 0) {
      return new Response(JSON.stringify({ error: "No entries in payload" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const results = [];

    for (const entry of body.entry) {
      if (!entry.changes || !Array.isArray(entry.changes)) continue;

      for (const change of entry.changes) {
        if (change.field !== "leadgen") continue;
        const leadData = change.value;
        if (!leadData.form_id || !leadData.leadgen_id) continue;

        try {
          const leadRes = await fetch(
            `https://graph.facebook.com/v17.0/${leadData.leadgen_id}?access_token=${fbAccessToken}`
          );

          if (!leadRes.ok) {
            throw new Error(`Failed to fetch lead: ${await leadRes.text()}`);
          }

          const leadDetails = await leadRes.json();
          console.log("Lead details:", leadDetails);

          const formattedLead = {
            name: "",
            email: "",
            phone: "",
            notes: `ליד מפייסבוק - טופס ${leadData.form_id}`,
            source: "פייסבוק",
            status: "new",
          };

          if (Array.isArray(leadDetails.field_data)) {
            for (const field of leadDetails.field_data) {
              const value = field.values?.[0];
              if (!value) continue;

              switch (field.name.toLowerCase()) {
                case "full_name":
                case "name":
                  formattedLead.name = value;
                  break;
                case "email":
                  formattedLead.email = value;
                  break;
                case "phone":
                case "phone_number":
                  formattedLead.phone = value;
                  break;
                default:
                  formattedLead.notes += `\n${field.name}: ${value}`;
              }
            }
          }

          if (!formattedLead.name) {
            formattedLead.name = `ליד פייסבוק ${new Date().toISOString().split("T")[0]}`;
          }

          if (formattedLead.phone || formattedLead.email) {
            const { data: adminUser } = await supabase.from("profiles").select("id").limit(1).single();
            const { data: lead, error } = await supabase
              .from("leads")
              .insert({
                ...formattedLead,
                user_id: adminUser.id,
              })
              .select()
              .single();

            if (error) throw error;

            results.push({
              success: true,
              lead_id: lead.id,
              message: `ליד נשמר בהצלחה: ${formattedLead.name}`,
            });
          } else {
            results.push({
              success: false,
              message: "ליד חסר נתונים חיוניים (טלפון או אימייל)",
            });
          }
        } catch (err) {
          console.error("Error handling lead:", err);
          results.push({
            success: false,
            error: err.message,
          });
        }
      }
    }

    return new Response(JSON.stringify({ success: true, results }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Unhandled error:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error", details: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
