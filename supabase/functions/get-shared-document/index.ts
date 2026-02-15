import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const shareId = url.searchParams.get("shareId");
    const action = url.searchParams.get("action") || "view";

    if (!shareId) {
      return new Response(
        JSON.stringify({ error: "Missing shareId" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Use service role to bypass RLS for public access
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Find the share record
    const { data: share, error: shareError } = await supabase
      .from("document_shares")
      .select("*")
      .eq("share_id", shareId)
      .single();

    if (shareError || !share) {
      return new Response(
        JSON.stringify({ error: "Share not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check if expired or revoked
    if (share.revoked_at || new Date(share.expires_at) < new Date()) {
      return new Response(
        JSON.stringify({ error: "expired" }),
        { status: 410, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get document metadata
    const { data: doc } = await supabase
      .from("customer_documents")
      .select("title, document_number, type, date, created_at")
      .eq("id", share.document_id)
      .single();

    // Create signed URL (10 minutes)
    const { data: signedData, error: signedError } = await supabase.storage
      .from("customer-documents")
      .createSignedUrl(share.file_path, 600);

    if (signedError || !signedData?.signedUrl) {
      console.error("Signed URL error:", signedError);
      return new Response(
        JSON.stringify({ error: "Failed to generate document URL" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Update metrics
    if (action === "download") {
      await supabase
        .from("document_shares")
        .update({
          download_count: (share.download_count || 0) + 1,
          last_viewed_at: new Date().toISOString(),
        })
        .eq("id", share.id);
    } else {
      await supabase
        .from("document_shares")
        .update({
          view_count: (share.view_count || 0) + 1,
          last_viewed_at: new Date().toISOString(),
        })
        .eq("id", share.id);
    }

    return new Response(
      JSON.stringify({
        signedUrl: signedData.signedUrl,
        document: doc
          ? {
              title: doc.title,
              documentNumber: doc.document_number,
              type: doc.type,
              date: doc.date || doc.created_at,
            }
          : null,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("Error:", err);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
