import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

// Helper function to extract field value from Facebook lead data
const getFieldValue = (fieldData: any[], fieldName: string): string | null => {
  if (!Array.isArray(fieldData)) return null;
  
  const field = fieldData.find((f: any) => f.name === fieldName);
  return field?.values?.[0] || null;
};

const fetchLeads = async () => {
  try {
    console.log("🔍 [use-fetch-leads] Starting to fetch leads");

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError) {
      console.error("🔍 [use-fetch-leads] Authentication error:", userError);
      throw new Error(`Authentication error: ${userError.message}`);
    }

    if (!user) {
      console.log("🔍 [use-fetch-leads] No user found, returning empty array");
      return [];
    }

    console.log("🔍 [use-fetch-leads] Fetching leads for user:", user.id);

    // Fetch from both tables
    const [regularLeadsResult, facebookLeadsResult] = await Promise.all([
      supabase
        .from("leads")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false }),
      supabase
        .from("facebook_leads")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
    ]);

    if (regularLeadsResult.error) {
      console.error("🔍 [use-fetch-leads] Regular leads error:", regularLeadsResult.error);
      throw new Error(`Database error: ${regularLeadsResult.error.message}`);
    }

    if (facebookLeadsResult.error) {
      console.error("🔍 [use-fetch-leads] Facebook leads error:", facebookLeadsResult.error);
      throw new Error(`Database error: ${facebookLeadsResult.error.message}`);
    }

    const regularLeads = regularLeadsResult.data || [];
    
    // Transform facebook_leads to match the leads schema
    const facebookLeads = (facebookLeadsResult.data || []).map((fbLead: any) => {
      const leadData = fbLead.lead_data || {};
      const fieldData = leadData.field_data || [];
      
      // Extract name from first_name or full_name fields
      const firstName = getFieldValue(fieldData, 'first_name');
      const fullName = getFieldValue(fieldData, 'full_name');
      const name = firstName || fullName || 'ללא שם';
      
      // Extract phone
      const phone = getFieldValue(fieldData, 'phone');
      
      // Extract email
      const email = getFieldValue(fieldData, 'email');
      
      return {
        id: fbLead.id,
        user_id: fbLead.user_id,
        name,
        phone,
        email,
        status: 'new',
        source: 'Facebook',
        notes: null,
        created_at: fbLead.created_at,
        updated_at: fbLead.created_at,
        car_id: null,
        agency_id: null,
        assigned_to: null,
        follow_up_notes: null
      };
    });

    // Combine both sources
    const allLeads = [...regularLeads, ...facebookLeads].sort((a, b) => {
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });

    console.log("🔍 [use-fetch-leads] Successfully fetched leads:", {
      regularCount: regularLeads.length,
      facebookCount: facebookLeads.length,
      totalCount: allLeads.length,
    });

    return allLeads;
  } catch (error) {
    console.error("🔍 [use-fetch-leads] Error in fetchLeads:", error);
    throw error;
  }
};

export const useFetchLeads = () => {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["leads"],
    queryFn: fetchLeads,
    retry: 2,
    refetchOnWindowFocus: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  console.log("🔍 [use-fetch-leads] Hook result:", {
    leadsCount: data?.length || 0,
    isLoading,
    hasError: !!error,
  });

  return {
    leads: data || [],
    isLoading,
    error,
    refetch,
  };
};
