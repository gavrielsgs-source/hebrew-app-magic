import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const WHATSAPP_TOKEN = Deno.env.get("WHATSAPP_TOKEN")?.trim().replace(/[\r\n]/g, "");
const WHATSAPP_API_URL = "https://graph.facebook.com/v21.0";
const PHONE_NUMBER_ID = "962328376966757";
const MAX_ATTEMPTS = 3;
const BATCH_SIZE = 20;

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    // Fetch pending items due now (up to BATCH_SIZE)
    const { data: items, error: fetchError } = await supabase
      .from("automation_queue")
      .select("*")
      .eq("status", "pending")
      .lte("scheduled_for", new Date().toISOString())
      .lt("attempts", MAX_ATTEMPTS)
      .order("scheduled_for", { ascending: true })
      .limit(BATCH_SIZE);

    if (fetchError) throw fetchError;
    if (!items || items.length === 0) {
      return json({ processed: 0, message: "queue empty" });
    }

    console.log(`📋 Processing ${items.length} automation items`);
    let sent = 0, failed = 0;

    for (const item of items) {
      try {
        await sendWhatsApp(item.phone, item.template_name, item.template_params ?? []);

        await supabase
          .from("automation_queue")
          .update({ status: "sent", sent_at: new Date().toISOString(), attempts: item.attempts + 1 })
          .eq("id", item.id);

        sent++;
        console.log(`✅ Sent ${item.automation_type} to ${item.phone}`);
      } catch (err: any) {
        const attempts = item.attempts + 1;
        const newStatus = attempts >= MAX_ATTEMPTS ? "failed" : "pending";

        await supabase
          .from("automation_queue")
          .update({ status: newStatus, attempts, last_error: err.message })
          .eq("id", item.id);

        failed++;
        console.error(`❌ Failed ${item.automation_type} to ${item.phone}:`, err.message);
      }
    }

    return json({ processed: items.length, sent, failed });
  } catch (err: any) {
    console.error("process-automation-queue error:", err);
    return json({ error: err.message }, 500);
  }
});

async function sendWhatsApp(to: string, templateName: string, params: string[]) {
  if (!WHATSAPP_TOKEN) throw new Error("WHATSAPP_TOKEN not configured");

  const components: any[] = [];
  const filtered = (params ?? []).filter((p) => p !== undefined && p !== null);
  if (filtered.length > 0) {
    components.push({
      type: "body",
      parameters: filtered.map((p) => ({ type: "text", text: String(p) })),
    });
  }

  const body: any = {
    messaging_product: "whatsapp",
    type: "template",
    to,
    template: {
      name: templateName,
      language: { code: "he" },
      ...(components.length > 0 ? { components } : {}),
    },
  };

  const res = await fetch(`${WHATSAPP_API_URL}/${PHONE_NUMBER_ID}/messages`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${WHATSAPP_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.error?.message ?? "WhatsApp API error");
  return data;
}

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
