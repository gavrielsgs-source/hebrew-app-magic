import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface DocumentNumberRequest {
  documentType: string;
  prefix?: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Get user from auth header
    const authHeader = req.headers.get("authorization");
    if (!authHeader) {
      throw new Error("No authorization header");
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    
    if (userError || !user) {
      throw new Error("Invalid user token");
    }

    const { documentType, prefix = '' }: DocumentNumberRequest = await req.json();

    console.log('Getting next document number for:', { userId: user.id, documentType, prefix });

    // Begin transaction to ensure atomic increment
    const { data: sequence, error: selectError } = await supabase
      .from('document_sequences')
      .select('*')
      .eq('user_id', user.id)
      .eq('document_type', documentType)
      .single();

    let nextNumber: number;
    let formattedNumber: string;

    if (selectError?.code === 'PGRST116') {
      // No sequence exists, create one
      console.log('Creating new sequence for:', { documentType });
      nextNumber = 1;
      
      const { error: insertError } = await supabase
        .from('document_sequences')
        .insert({
          user_id: user.id,
          document_type: documentType,
          current_number: nextNumber,
          prefix: prefix
        });

      if (insertError) {
        console.error('Error creating sequence:', insertError);
        throw insertError;
      }
    } else if (selectError) {
      console.error('Error fetching sequence:', selectError);
      throw selectError;
    } else {
      // Sequence exists, increment it
      nextNumber = sequence.current_number + 1;
      
      const { error: updateError } = await supabase
        .from('document_sequences')
        .update({ 
          current_number: nextNumber,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id)
        .eq('document_type', documentType);

      if (updateError) {
        console.error('Error updating sequence:', updateError);
        throw updateError;
      }
    }

    // Format the number based on document type
    switch (documentType) {
      case 'tax_invoice':
        formattedNumber = `${prefix}${String(nextNumber).padStart(6, '0')}`;
        break;
      case 'sales_agreement':
        formattedNumber = `${prefix}SA${String(nextNumber).padStart(4, '0')}`;
        break;
      default:
        formattedNumber = `${prefix}${String(nextNumber).padStart(4, '0')}`;
    }

    console.log('Generated document number:', formattedNumber);

    return new Response(JSON.stringify({ 
      success: true, 
      documentNumber: formattedNumber,
      nextNumber: nextNumber
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in get-next-document-number:', error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : String(error) 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});