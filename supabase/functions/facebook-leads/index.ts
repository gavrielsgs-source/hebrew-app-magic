
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";

// CORS headers for browser requests
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Verify token middleware
const verifyToken = (token: string | null): boolean => {
  // בשלב הראשון, נבדוק רק אם קיים טוקן
  // בהמשך יש לשנות זאת לבדיקה אמיתית מול מפתח סודי
  const appSecret = Deno.env.get('FB_APP_SECRET');
  if (!appSecret) {
    console.error("Missing FB_APP_SECRET environment variable");
    return false;
  }
  
  // כאן צריך להוסיף לוגיקת אימות מול הסוד של האפליקציה בפייסבוק
  // לדוגמה: חישוב חתימה והשוואתה ל-token שהתקבל
  
  return true; // בשלב ראשוני נחזיר true, אבל זה לא בטוח לסביבת ייצור!
};

serve(async (req) => {
  console.log('serve')
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Create a Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Missing Supabase environment variables');
    }
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // Parse the request body
    const body = await req.json();
    console.log("Received webhook data:", JSON.stringify(body));
    
    // Verify the request
    // בייצור, יש לאמת את הבקשה באמצעות הסוד המשותף עם פייסבוק
    
    // בדיקה אם יש שינויים (entry) בדאטה
    if (!body.entry || !Array.isArray(body.entry) || body.entry.length === 0) {
      return new Response(
        JSON.stringify({ error: 'No entries found in payload' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Facebook שולח לנו מערך של changes בתוך entry
    const results = [];
    
    for (const entry of body.entry) {
      if (entry.changes && Array.isArray(entry.changes)) {
        for (const change of entry.changes) {
          // נטפל רק בשינויים מסוג lead
          if (change.value && change.value.form_id && change.value.leadgen_id) {
            const leadData = change.value;
            
            // כאן נצטרך לפנות ל-Graph API של פייסבוק כדי לקבל את פרטי הליד המלאים
            // בדרך כלל נשתמש בטוקן גישה ארוך-טווח לפייסבוק
            const fbAccessToken = Deno.env.get('FB_ACCESS_TOKEN');
            if (!fbAccessToken) {
              console.error("Missing FB_ACCESS_TOKEN environment variable");
              continue;
            }
            
            try {
              // קבלת פרטי הליד המלאים מה-Graph API
              const leadDetailsResponse = await fetch(
                `https://graph.facebook.com/v17.0/${leadData.leadgen_id}?access_token=${fbAccessToken}`,
                { method: 'GET' }
              );
              
              if (!leadDetailsResponse.ok) {
                throw new Error(`Failed to fetch lead details: ${leadDetailsResponse.statusText}`);
              }
              
              const leadDetails = await leadDetailsResponse.json();
              console.log("Lead details:", JSON.stringify(leadDetails));
              
              // המרת הפרטים למבנה שאנו רוצים לשמור
              const formattedLead = {
                name: '', // יש למצוא מתוך field_data
                email: '', // יש למצוא מתוך field_data
                phone: '', // יש למצוא מתוך field_data
                notes: `ליד מפייסבוק - טופס ${leadData.form_id}`,
                source: 'פייסבוק',
                status: 'new',
              };
              
              // עיבוד השדות שהגיעו מהטופס
              if (leadDetails.field_data && Array.isArray(leadDetails.field_data)) {
                for (const field of leadDetails.field_data) {
                  if (field.name && field.values && field.values.length > 0) {
                    // מיפוי שדות מהפייסבוק לשדות שלנו
                    switch (field.name.toLowerCase()) {
                      case 'full_name':
                      case 'name':
                        formattedLead.name = field.values[0];
                        break;
                      case 'email':
                        formattedLead.email = field.values[0];
                        break;
                      case 'phone':
                      case 'phone_number':
                        formattedLead.phone = field.values[0];
                        break;
                      default:
                        // אם יש שדות נוספים, אפשר להוסיפם להערות
                        formattedLead.notes += `\n${field.name}: ${field.values.join(', ')}`;
                    }
                  }
                }
              }
              
              // שמירת הליד בבסיס הנתונים
              // אם אין שם, נשתמש בערך דיפולטיבי
              if (!formattedLead.name || formattedLead.name.trim() === '') {
                formattedLead.name = `ליד פייסבוק ${new Date().toISOString().split('T')[0]}`;
              }
              
              // נוסיף את הליד רק אם יש לפחות שם או טלפון או אימייל
              if (formattedLead.phone || formattedLead.email) {
                // צריך למצוא משתמש ברירת מחדל או לקבל את המשתמש מהסביבה
                // נשתמש במנהל המערכת כברירת מחדל (בהנחה שזה המשתמש הראשון בטבלת profiles)
                const { data: adminUser } = await supabase
                  .from('profiles')
                  .select('id')
                  .limit(1)
                  .single();
                
                if (!adminUser || !adminUser.id) {
                  throw new Error("No default user found for lead assignment");
                }
                
                const { data: lead, error } = await supabase
                  .from('leads')
                  .insert({
                    ...formattedLead,
                    user_id: adminUser.id,
                  })
                  .select()
                  .single();
                
                if (error) {
                  throw error;
                }
                
                results.push({
                  success: true,
                  lead_id: lead.id,
                  message: `ליד נשמר בהצלחה: ${formattedLead.name}`
                });
              } else {
                results.push({
                  success: false,
                  message: "ליד חסר נתונים חיוניים (טלפון או אימייל)"
                });
              }
            } catch (error) {
              console.error("Error processing lead:", error);
              results.push({
                success: false,
                error: error.message
              });
            }
          }
        }
      }
    }
    
    //acebook Webhook Verification - מטפל בבקשת האימות הראשונית של פייסבוק
    if (req.method === 'GET') {
      const url = new URL(req.url);
      const mode = url.searchParams.get('hub.mode');
      const token = url.searchParams.get('hub.verify_token');
      const challenge = url.searchParams.get('hub.challenge');
      
      // בשלב זה יש להגדיר טוקן אימות קבוע מראש בסביבת העבודה
      const verifyToken = Deno.env.get('FB_VERIFY_TOKEN');
      
      if (mode === 'subscribe' && token === verifyToken) {
        console.log("Webhook verified successfully");
        return new Response(challenge, {
          status: 200,
          headers: { ...corsHeaders }
        });
      } else {
        return new Response('Verification failed', {
          status: 403,
          headers: { ...corsHeaders }
        });
      }
    }
    
    return new Response(
      JSON.stringify({ success: true, results }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in facebook-leads function:', error);
    
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
