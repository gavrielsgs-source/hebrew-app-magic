import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface Template {
  id: string;
  name: string;
  description: string;
  type: 'car' | 'lead';
  templateContent: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const authHeader = req.headers.get('Authorization')!;
    
    const supabase = createClient(supabaseUrl, supabaseKey, {
      global: { headers: { Authorization: authHeader } },
    });

    // Get user from auth header
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      console.error('Auth error:', userError);
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Migrating templates for user:', user.id);

    // Get templates from request body
    const { templates } = await req.json() as { templates: Template[] };

    if (!templates || !Array.isArray(templates)) {
      return new Response(
        JSON.stringify({ error: 'Invalid templates data' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Received ${templates.length} templates to migrate`);

    // Check if user already has templates (avoid duplicates)
    const { data: existingTemplates, error: checkError } = await supabase
      .from('whatsapp_templates')
      .select('id')
      .eq('user_id', user.id)
      .limit(1);

    if (checkError) {
      console.error('Error checking existing templates:', checkError);
      throw checkError;
    }

    if (existingTemplates && existingTemplates.length > 0) {
      console.log('User already has templates in database, skipping migration');
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'Templates already exist in database',
          migrated: 0
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Insert templates
    const templatesToInsert = templates.map(t => ({
      user_id: user.id,
      name: t.name,
      description: t.description,
      type: t.type,
      template_content: t.templateContent,
      is_default: false,
      is_shared: false,
    }));

    const { data: insertedTemplates, error: insertError } = await supabase
      .from('whatsapp_templates')
      .insert(templatesToInsert)
      .select();

    if (insertError) {
      console.error('Error inserting templates:', insertError);
      throw insertError;
    }

    console.log(`Successfully migrated ${insertedTemplates?.length || 0} templates`);

    return new Response(
      JSON.stringify({ 
        success: true,
        migrated: insertedTemplates?.length || 0,
        message: `Successfully migrated ${insertedTemplates?.length || 0} templates`
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Migration error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
