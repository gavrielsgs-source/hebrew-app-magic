import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// בדיקת תקפות טוקן פייסבוק
async function checkTokenValidity(accessToken: string): Promise<boolean> {
  try {
    const response = await fetch(
      `https://graph.facebook.com/v18.0/me?access_token=${accessToken}`
    );
    
    if (response.ok) {
      return true;
    } else {
      const error = await response.json();
      console.log("Token validation failed:", error);
      return false;
    }
  } catch (error) {
    console.error("Error checking token validity:", error);
    return false;
  }
}

// חידוש טוקן לטוקן ארוך טווח
async function exchangeForLongLivedToken(shortLivedToken: string): Promise<string | null> {
  try {
    const appId = "2106125989900776";
    const appSecret = Deno.env.get("FB_APP_SECRET");
    
    if (!appSecret) {
      console.error("FB_APP_SECRET not found");
      return null;
    }
    
    const response = await fetch(
      `https://graph.facebook.com/v18.0/oauth/access_token?grant_type=fb_exchange_token&client_id=${appId}&client_secret=${appSecret}&fb_exchange_token=${shortLivedToken}`
    );
    
    const data = await response.json();
    console.log("Token exchange response:", data);
    
    if (data.access_token) {
      return data.access_token;
    } else {
      console.error("Failed to exchange token:", data);
      return null;
    }
  } catch (error) {
    console.error("Error exchanging token:", error);
    return null;
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("=== Checking Facebook Tokens ===");
    
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    
    if (!supabaseUrl || !supabaseKey) {
      throw new Error("Missing Supabase environment variables");
    }
    
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // קבלת כל הטוקנים
    const { data: tokens, error: fetchError } = await supabase
      .from('facebook_tokens')
      .select('*');
    
    if (fetchError) {
      throw fetchError;
    }
    
    console.log(`Found ${tokens?.length || 0} tokens to check`);
    
    const results = [];
    
    for (const token of tokens || []) {
      console.log(`Checking token for page: ${token.page_name} (${token.page_id})`);
      
      const isValid = await checkTokenValidity(token.access_token);
      
      if (!isValid) {
        console.log(`❌ Token invalid for page: ${token.page_name}`);
        
        // נסה לחדש את הטוקן
        console.log(`Attempting to refresh token for page: ${token.page_name}`);
        const newToken = await exchangeForLongLivedToken(token.access_token);
        
        if (newToken) {
          // עדכן את הטוקן במסד הנתונים
          const { error: updateError } = await supabase
            .from('facebook_tokens')
            .update({ 
              access_token: newToken,
              updated_at: new Date().toISOString()
            })
            .eq('id', token.id);
          
          if (updateError) {
            console.error(`Failed to update token for ${token.page_name}:`, updateError);
            results.push({
              page_name: token.page_name,
              status: 'error',
              message: 'Failed to update refreshed token'
            });
          } else {
            console.log(`✅ Token refreshed successfully for page: ${token.page_name}`);
            results.push({
              page_name: token.page_name,
              status: 'refreshed',
              message: 'Token refreshed successfully'
            });
          }
        } else {
          console.log(`❌ Failed to refresh token for page: ${token.page_name}`);
          
          // צור התראה שהטוקן פג
          const { error: notificationError } = await supabase
            .from('notifications')
            .insert({
              user_id: token.user_id,
              title: 'טוקן פייסבוק פג תוקף',
              message: `הטוקן עבור דף "${token.page_name}" פג תוקף. יש להתחבר מחדש לפייסבוק כדי להמשיך לקבל לידים.`,
              type: 'error'
            });
          
          if (notificationError) {
            console.error('Failed to create notification:', notificationError);
          }
          
          results.push({
            page_name: token.page_name,
            status: 'expired',
            message: 'Token expired and could not be refreshed'
          });
        }
      } else {
        console.log(`✅ Token valid for page: ${token.page_name}`);
        results.push({
          page_name: token.page_name,
          status: 'valid',
          message: 'Token is valid'
        });
      }
    }
    
    console.log("Token check completed. Results:", results);
    
    return new Response(JSON.stringify({ 
      success: true, 
      checked: tokens?.length || 0,
      results 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
    
  } catch (error) {
    console.error("Error in token check:", error);
    return new Response(
      JSON.stringify({ error: "Token check failed", details: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  }
});