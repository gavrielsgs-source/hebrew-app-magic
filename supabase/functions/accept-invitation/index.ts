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
  email: string;
  password: string;
}

type InvitationRequest = InvitationInfoRequest | InvitationAcceptRequest;

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const { action, token } = body;

    console.log(`Processing invitation ${action} for token: ${token?.substring(0, 8)}...`);

    if (!token) {
      return new Response(
        JSON.stringify({ error: "Token is required" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    if (action === "info") {
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
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );

    } else if (action === "accept") {
      const { email, password } = body;

      // First check if user is already authenticated via header
      let userId: string | null = null;
      let userEmail: string | null = null;

      const authHeader = req.headers.get("Authorization");
      if (authHeader) {
        const supabaseClient = createClient(
          Deno.env.get("SUPABASE_URL") ?? "",
          Deno.env.get("SUPABASE_ANON_KEY") ?? "",
          { global: { headers: { Authorization: authHeader } } }
        );
        const { data: { user } } = await supabaseClient.auth.getUser();
        if (user) {
          userId = user.id;
          userEmail = user.email ?? null;
          console.log(`Authenticated user found: ${userEmail}`);
        }
      }

      // If no authenticated user, try to sign up or find user via admin
      if (!userId && email && password) {
        console.log(`No session, attempting signup/signin for ${email}`);

        // Try to create user with admin API (auto-confirms email)
        const { data: signUpData, error: signUpError } = await supabaseAdmin.auth.admin.createUser({
          email,
          password,
          email_confirm: true, // Auto-confirm so they can log in immediately
        });

        if (signUpError) {
          // User might already exist - try to find them
          if (signUpError.message?.includes("already been registered") || signUpError.message?.includes("already exists")) {
            console.log("User already exists, looking up by email");
            const { data: { users } } = await supabaseAdmin.auth.admin.listUsers();
            const existingUser = users?.find(u => u.email === email);
            if (existingUser) {
              userId = existingUser.id;
              userEmail = existingUser.email ?? null;
              
              // Update password for existing user
              await supabaseAdmin.auth.admin.updateUser(existingUser.id, { password });
            }
          } else {
            console.error("Error creating user:", signUpError);
            return new Response(
              JSON.stringify({ error: "שגיאה ביצירת חשבון: " + signUpError.message }),
              { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
            );
          }
        } else if (signUpData?.user) {
          userId = signUpData.user.id;
          userEmail = signUpData.user.email ?? null;
          console.log(`Created new user: ${userEmail}`);
        }
      }

      if (!userId) {
        return new Response(
          JSON.stringify({ error: "נדרשת התחברות או הרשמה לקבלת ההזמנה" }),
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

      // Verify email matches invitation
      if (userEmail !== invitation.email) {
        console.error(`Email mismatch: user ${userEmail} vs invitation ${invitation.email}`);
        return new Response(
          JSON.stringify({ error: "האימייל לא תואם להזמנה" }),
          { status: 403, headers: { "Content-Type": "application/json", ...corsHeaders } }
        );
      }

      // Check validity
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

      // Check if role already exists
      const { data: existingRole } = await supabaseAdmin
        .from("user_roles")
        .select("id")
        .eq("user_id", userId)
        .eq("company_id", invitation.company_id)
        .eq("role", invitation.role)
        .maybeSingle();

      if (!existingRole) {
        const { error: roleError } = await supabaseAdmin
          .from("user_roles")
          .insert({
            user_id: userId,
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
      }

      // Mark invitation as accepted
      await supabaseAdmin
        .from("user_invitations")
        .update({ accepted_at: now.toISOString() })
        .eq("id", invitation.id);

      console.log(`Successfully accepted invitation for ${userEmail} with role ${invitation.role}`);

      return new Response(
        JSON.stringify({ 
          success: true, 
          message: "התצטרפת בהצלחה לחברה!",
          needsLogin: !authHeader, // Tell frontend if user needs to log in
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
