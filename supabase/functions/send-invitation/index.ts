import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";
import { Resend } from "https://esm.sh/resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface InvitationRequest {
  email: string;
  role: string;
  companyId: string;
  agencyId?: string;
  companyName: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Extract JWT token from Authorization header
    const authHeader = req.headers.get("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      console.error("Missing or invalid Authorization header");
      return new Response(
        JSON.stringify({ error: "Missing authentication token" }), 
        {
          status: 401,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    const token = authHeader.replace("Bearer ", "");
    console.log("Request started with token present");

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      {
        global: {
          headers: { Authorization: authHeader },
        },
      }
    );

    // Get the authenticated user with explicit token
    const {
      data: { user },
      error: authError,
    } = await supabaseClient.auth.getUser(token);

    if (authError || !user) {
      console.error("Authentication error:", authError);
      return new Response(
        JSON.stringify({ error: "Invalid or expired authentication token" }), 
        {
          status: 401,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    console.log(`Authenticated user: ${user.id} (${user.email})`);

    const { email, role, companyId, agencyId, companyName }: InvitationRequest = await req.json();

    console.log(`Sending invitation to ${email} for role ${role} in company ${companyName}`);

    // Check if user is Super Admin
    const { data: isAdminResult, error: adminError } = await supabaseClient
      .rpc("is_admin");

    if (adminError) {
      console.error("Error checking admin status:", adminError);
      return new Response(
        JSON.stringify({ error: "Failed to verify permissions" }),
        { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Verify user has permission to invite (is Super Admin OR owner of company)
    if (!isAdminResult) {
      const { data: company, error: companyError } = await supabaseClient
        .from("companies")
        .select("*")
        .eq("id", companyId)
        .eq("owner_id", user.id)
        .single();

      if (companyError || !company) {
        console.error("Company verification error:", companyError);
        return new Response(
          JSON.stringify({ error: "Unauthorized to invite for this company" }),
          { status: 403, headers: { "Content-Type": "application/json", ...corsHeaders } }
        );
      }
    }

    console.log(`User permission verified: ${isAdminResult ? 'Super Admin' : 'Company Owner'}`);

    // Verify the target company exists
    const { data: targetCompany, error: targetError } = await supabaseClient
      .from("companies")
      .select("id, name")
      .eq("id", companyId)
      .single();

    if (targetError || !targetCompany) {
      console.error("Target company not found:", targetError);
      return new Response(
        JSON.stringify({ error: "Company not found" }),
        { status: 404, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Create invitation record
    const { data: invitation, error: inviteError } = await supabaseClient
      .from("user_invitations")
      .insert({
        email,
        role,
        company_id: companyId,
        agency_id: agencyId,
        invited_by: user.id,
      })
      .select()
      .single();

    if (inviteError) {
      console.error("Error creating invitation:", inviteError);
      return new Response(
        JSON.stringify({ error: "Failed to create invitation" }),
        { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Send invitation email
    const origin = req.headers.get("origin") || req.headers.get("referer")?.split("/").slice(0, 3).join("/") || "https://carsleadapp.com";
    const inviteUrl = `${origin}/accept-invitation?token=${invitation.token}`;
    
    console.log(`Generated invite URL: ${inviteUrl}`);
    
    const roleNames = {
      'viewer': 'צפייה בלבד',
      'sales_agent': 'איש מכירות',
      'agency_manager': 'מנהל סוכנות'
    };

    const emailResponse = await resend.emails.send({
      from: "מערכת CRM <onboarding@resend.dev>",
      to: [email],
      subject: `הזמנה להצטרף ל-${companyName}`,
      html: `
        <div dir="rtl" style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px; color: white; text-align: center; margin-bottom: 30px;">
            <h1 style="margin: 0; font-size: 28px; font-weight: bold;">🎉 הוזמנת להצטרף!</h1>
          </div>
          
          <div style="background: white; padding: 30px; border-radius: 10px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
            <h2 style="color: #2d3748; margin-bottom: 20px;">שלום!</h2>
            
            <p style="color: #4a5568; font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
              הוזמנת להצטרף לחברת <strong>${companyName}</strong> במערכת ניהול הלקוחות שלנו.
            </p>
            
            <div style="background: #f7fafc; padding: 20px; border-radius: 8px; margin-bottom: 25px;">
              <p style="margin: 0; color: #2d3748;"><strong>התפקיד שלך:</strong> ${roleNames[role as keyof typeof roleNames] || role}</p>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${inviteUrl}" 
                 style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                        color: white; 
                        padding: 15px 40px; 
                        text-decoration: none; 
                        border-radius: 25px; 
                        font-weight: bold; 
                        font-size: 16px;
                        display: inline-block;
                        box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);">
                🚀 קבל הזמנה
              </a>
            </div>
            
            <p style="color: #718096; font-size: 14px; text-align: center; margin-top: 25px;">
              הקישור תקף ל-7 ימים מיום שליחת המייל.
            </p>
            
            <hr style="border: none; height: 1px; background: #e2e8f0; margin: 25px 0;">
            
            <p style="color: #a0aec0; font-size: 12px; text-align: center; margin: 0;">
              אם לא ביקשת הזמנה זו, ניתן להתעלם מהמייל הזה.
            </p>
          </div>
        </div>
      `,
    });

    if (emailResponse.error) {
      console.error("Error sending email:", emailResponse.error);
      // Clean up the created invitation to avoid dead tokens
      await supabaseClient
        .from("user_invitations")
        .delete()
        .eq("id", invitation.id);

      // Return detailed error to the client
      return new Response(
        JSON.stringify({ 
          error: "Failed to send invitation email",
          details: emailResponse.error
        }),
        { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    console.log("Invitation email sent successfully:", emailResponse);

    return new Response(
      JSON.stringify({ 
        success: true, 
        invitationId: invitation.id,
        message: "ההזמנה נשלחה בהצלחה!"
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      }
    );
  } catch (error: any) {
    console.error("Error in send-invitation function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);