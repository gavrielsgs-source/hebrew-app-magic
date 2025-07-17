
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
  if (!signature || !signature.startsWith("sha1=")) {
    console.warn("Missing or invalid signature header:", signature);
    return false;
  }

  const expectedSignature = signature.slice(5);
  const encoder = new TextEncoder();
  const key = encoder.encode(secret);
  const hmac = await crypto.subtle.importKey("raw", key, { name: "HMAC", hash: "SHA-1" }, false, ["sign"]);
  const digest = await crypto.subtle.sign("HMAC", hmac, encoder.encode(body));
  const hash = Array.from(new Uint8Array(digest)).map(b => b.toString(16).padStart(2, "0")).join("");

  const isValid = expectedSignature === hash;
  console.log("Signature verification:", { expected: expectedSignature, calculated: hash, isValid });
  return isValid;
}

serve(async (req) => {
  console.log("=== Facebook Leads Webhook Called ===");
  console.log("Method:", req.method);
  console.log("URL:", req.url);
  console.log("Headers:", Object.fromEntries(req.headers.entries()));

  // Handle preflight
  if (req.method === "OPTIONS") {
    console.log("Handling CORS preflight request");
    return new Response(null, { headers: corsHeaders });
  }

  // Facebook Webhook Verification (GET)
  if (req.method === "GET") {
    const url = new URL(req.url);
    console.log("GET request - webhook verification");
    console.log("Search params:", Object.fromEntries(url.searchParams.entries()));
    
    const mode = url.searchParams.get("hub.mode");
    const token = url.searchParams.get("hub.verify_token");
    const challenge = url.searchParams.get("hub.challenge");

    const verifyToken = Deno.env.get("FB_VERIFY_TOKEN");
    console.log("Verification attempt:", { mode, token, challenge, expectedToken: verifyToken });
    
    if (mode === "subscribe" && token === verifyToken) {
      console.log("✅ Facebook Webhook verified successfully");
      return new Response(challenge, { status: 200, headers: corsHeaders });
    } else {
      console.log("❌ Facebook Webhook verification failed");
      return new Response("Verification failed", { status: 403, headers: corsHeaders });
    }
  }

  // Handle POST requests (actual webhook data)
  if (req.method === "POST") {
    console.log("POST request - processing webhook data");
    
    try {
      const appSecret = Deno.env.get("FB_APP_SECRET");
      const supabaseUrl = Deno.env.get("SUPABASE_URL");
      const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

      console.log("Environment check:", {
        hasAppSecret: !!appSecret,
        hasSupabaseUrl: !!supabaseUrl,
        hasSupabaseKey: !!supabaseKey
      });

      if (!appSecret || !supabaseUrl || !supabaseKey) {
        throw new Error("Missing required environment variables");
      }

      // Read body and verify signature
      const body = await req.text();
      const signatureHeader = req.headers.get("x-hub-signature");
      
      console.log("Request body:", body);
      console.log("Signature header:", signatureHeader);

      const signatureValid = await verifyFacebookSignature(body, signatureHeader || "", appSecret);
      if (!signatureValid) {
        console.log("❌ Invalid Facebook signature");
        return new Response("Invalid Facebook signature", { status: 401, headers: corsHeaders });
      }

      console.log("✅ Signature verified, processing webhook data");

      const supabase = createClient(supabaseUrl, supabaseKey);
      const webhookData = JSON.parse(body);
      
      console.log("Parsed webhook data:", JSON.stringify(webhookData, null, 2));

      if (!webhookData.entry || !Array.isArray(webhookData.entry) || webhookData.entry.length === 0) {
        console.log("❌ No entries in webhook payload");
        return new Response(JSON.stringify({ error: "No entries in payload" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const results = [];

      for (const entry of webhookData.entry) {
        console.log("Processing entry:", entry);
        
        if (!entry.changes || !Array.isArray(entry.changes)) {
          console.log("No changes in entry, skipping");
          continue;
        }

        for (const change of entry.changes) {
          console.log("Processing change:", change);
          
          if (change.field !== "leadgen") {
            console.log("Change field is not leadgen, skipping:", change.field);
            continue;
          }
          
          const leadData = change.value;
          console.log("Lead data from change:", leadData);
          
          if (!leadData.form_id || !leadData.leadgen_id || !leadData.page_id) {
            console.log("Missing form_id, leadgen_id, or page_id, skipping");
            continue;
          }

          try {
            console.log(`Fetching saved access token for page: ${leadData.page_id}`);
            
            // קבלת הטוקן השמור עבור הדף הזה
            const { data: tokenData, error: tokenError } = await supabase
              .from('facebook_tokens')
              .select('access_token')
              .eq('page_id', leadData.page_id)
              .single();

            if (tokenError || !tokenData) {
              console.log("❌ No saved access token found for page:", leadData.page_id);
              results.push({
                success: false,
                message: `לא נמצא טוקן שמור עבור דף ${leadData.page_id}`,
              });
              continue;
            }

            const pageAccessToken = tokenData.access_token;
            console.log(`✅ Found access token for page ${leadData.page_id}`);

            console.log(`Fetching lead details for leadgen_id: ${leadData.leadgen_id}`);
            
            const leadRes = await fetch(
              `https://graph.facebook.com/v17.0/${leadData.leadgen_id}?access_token=${pageAccessToken}`
            );

            if (!leadRes.ok) {
              const errorText = await leadRes.text();
              console.log("❌ Failed to fetch lead from Facebook:", errorText);
              throw new Error(`Failed to fetch lead: ${errorText}`);
            }

            const leadDetails = await leadRes.json();
            console.log("✅ Lead details from Facebook:", JSON.stringify(leadDetails, null, 2));

            const formattedLead = {
              name: "",
              email: "",
              phone: "",
              notes: `ליד מפייסבוק - טופס ${leadData.form_id}`,
              source: "פייסבוק",
              status: "new",
            };

            if (Array.isArray(leadDetails.field_data)) {
              console.log("Processing field data:", leadDetails.field_data);
              
              for (const field of leadDetails.field_data) {
                const value = field.values?.[0];
                if (!value) continue;

                console.log(`Processing field: ${field.name} = ${value}`);

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

            console.log("Formatted lead:", formattedLead);

            if (formattedLead.phone || formattedLead.email) {
              // Get the first admin user to assign the lead to
              const { data: adminUser, error: adminError } = await supabase
                .from("profiles")
                .select("id")
                .limit(1)
                .single();

              if (adminError) {
                console.log("Error fetching admin user:", adminError);
                throw new Error(`Failed to get admin user: ${adminError.message}`);
              }

              console.log("Admin user found:", adminUser);

              const { data: lead, error } = await supabase
                .from("leads")
                .insert({
                  ...formattedLead,
                  user_id: adminUser.id,
                })
                .select()
                .single();

              if (error) {
                console.log("❌ Error inserting lead to database:", error);
                throw error;
              }

              console.log("✅ Lead saved successfully:", lead);

              results.push({
                success: true,
                lead_id: lead.id,
                message: `ליד נשמר בהצלחה: ${formattedLead.name}`,
              });
            } else {
              console.log("❌ Lead missing essential data (phone or email)");
              results.push({
                success: false,
                message: "ליד חסר נתונים חיוניים (טלפון או אימייל)",
              });
            }
          } catch (err) {
            console.error("❌ Error handling individual lead:", err);
            results.push({
              success: false,
              error: err.message,
            });
          }
        }
      }

      console.log("Final results:", results);

      return new Response(JSON.stringify({ success: true, results }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    } catch (error) {
      console.error("❌ Unhandled error in webhook:", error);
      return new Response(
        JSON.stringify({ error: "Internal server error", details: error.message }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
  }

  console.log("❌ Unsupported method:", req.method);
  return new Response("Method not allowed", { status: 405, headers: corsHeaders });
});
