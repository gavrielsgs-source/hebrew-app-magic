import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface InvitationInfoRequest {
  action: "info";
  token: string;
}

interface InvitationAcceptRequest {
  action: "accept";
  token: string;
}

type InvitationRequest = InvitationInfoRequest | InvitationAcceptRequest;

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { action, token }: InvitationRequest = await req.json();

    console.log(`Processing invitation ${action} for token: ${token?.substring(0, 8)}...`);

    if (!token) {
      return new Response(
        JSON.stringify({ error: "Token is required" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Create Supabase client with service role for bypassing RLS
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    if (action === "info") {
      // Fetch invitation info without auth requirement
      const { data: invitation, error } = await supabaseAdmin
        .from("user_invitations")
        .select(`
          email,
          role,
          company_id,
          agency_id,
          expires_at,
          accepted_at,
          companies!inner(name)
        `)
        .eq("token", token)
        .single();

      if (error || !invitation) {
        console.error("Invitation not found:", error);
        return new Response(
          JSON.stringify({ error: "הזמנה לא נמצאה" }),
          { status: 404, headers: { "Content-Type": "application/json", ...corsHeaders } }
        );
      }

      // Check if invitation is still valid
      const now = new Date();
      const expiresAt = new Date(invitation.expires_at);
      
      if (invitation.accepted_at) {
        return new Response(
          JSON.stringify({ error: "ההזמנה כבר התקבלה" }),
          { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
        );
      }

      if (expiresAt < now) {
        return new Response(
          JSON.stringify({ error: "תוקף ההזמנה פג" }),
          { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
        );
      }

      return new Response(
        JSON.stringify({
          email: invitation.email,
          role: invitation.role,
          companyName: (invitation.companies as any).name,
          expiresAt: invitation.expires_at
        }),
        {
          status: 200,
          headers: { "Content-Type": "application/json", ...corsHeaders }
        }
      );

    } else if (action === "accept") {
      // Accept invitation - requires authentication
      const supabaseClient = createClient(
        Deno.env.get("SUPABASE_URL") ?? "",
        Deno.env.get("SUPABASE_ANON_KEY") ?? "",
        {
          global: {
            headers: { Authorization: req.headers.get("Authorization")! },
          },
        }
      );

      // Get the authenticated user
      const {
        data: { user },
        error: authError,
      } = await supabaseClient.auth.getUser();

      if (authError || !user) {
        console.error("Authentication error:", authError);
        return new Response(
          JSON.stringify({ error: "נדרשת התחברות לקבלת ההזמנה" }),
          { status: 401, headers: { "Content-Type": "application/json", ...corsHeaders } }
        );
      }

      // Fetch invitation with admin client
      const { data: invitation, error: inviteError } = await supabaseAdmin
        .from("user_invitations")
        .select("*")
        .eq("token", token)
        .single();

      if (inviteError || !invitation) {
        console.error("Invitation not found:", inviteError);
        return new Response(
          JSON.stringify({ error: "הזמנה לא נמצאה" }),
          { status: 404, headers: { "Content-Type": "application/json", ...corsHeaders } }
        );
      }

      // Verify user email matches invitation email
      if (user.email !== invitation.email) {
        console.error(`Email mismatch: user ${user.email} vs invitation ${invitation.email}`);
        return new Response(
          JSON.stringify({ error: "האימייל המחובר לא תואם להזמנה" }),
          { status: 403, headers: { "Content-Type": "application/json", ...corsHeaders } }
        );
      }

      // Check if invitation is still valid
      const now = new Date();
      const expiresAt = new Date(invitation.expires_at);
      
      if (invitation.accepted_at) {
        return new Response(
          JSON.stringify({ error: "ההזמנה כבר התקבלה" }),
          { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
        );
      }

      if (expiresAt < now) {
        return new Response(
          JSON.stringify({ error: "תוקף ההזמנה פג" }),
          { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
        );
      }

      // Check if user already has role for this company/agency (idempotent)
      const { data: existingRole } = await supabaseAdmin
        .from("user_roles")
        .select("id")
        .eq("user_id", user.id)
        .eq("company_id", invitation.company_id)
        .eq("role", invitation.role)
        .eq("agency_id", invitation.agency_id)
        .single();

      if (existingRole) {
        console.log("Role already exists, updating invitation as accepted");
        // Mark invitation as accepted (idempotent)
        await supabaseAdmin
          .from("user_invitations")
          .update({ accepted_at: now.toISOString() })
          .eq("id", invitation.id);

        return new Response(
          JSON.stringify({ 
            success: true, 
            message: "התצטרפת בהצלחה!" 
          }),
          { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
        );
      }

      // Create user role using admin client to bypass RLS
      const { error: roleError } = await supabaseAdmin
        .from("user_roles")
        .insert({
          user_id: user.id,
          role: invitation.role,
          company_id: invitation.company_id,
          agency_id: invitation.agency_id
        });

      if (roleError) {
        console.error("Error creating user role:", roleError);
        return new Response(
          JSON.stringify({ error: "שגיאה ביצירת הרשאות משתמש" }),
          { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
        );
      }

      // Mark invitation as accepted
      const { error: acceptError } = await supabaseAdmin
        .from("user_invitations")
        .update({ accepted_at: now.toISOString() })
        .eq("id", invitation.id);

      if (acceptError) {
        console.error("Error accepting invitation:", acceptError);
        // Don't fail completely, role was created successfully
      }

      console.log(`Successfully accepted invitation for user ${user.email} with role ${invitation.role}`);

      return new Response(
        JSON.stringify({ 
          success: true, 
          message: "התצטרפת בהצלחה לחברה!" 
        }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );

    } else {
      return new Response(
        JSON.stringify({ error: "Invalid action" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

  } catch (error: any) {
    console.error("Error in accept-invitation function:", error);
    return new Response(
      JSON.stringify({ error: error.message || "שגיאה פנימית" }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);