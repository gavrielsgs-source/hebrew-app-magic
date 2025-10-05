
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const fetchLeads = async () => {
  try {
    console.log('🔍 [use-fetch-leads] Starting to fetch leads');
    
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError) {
      console.error('🔍 [use-fetch-leads] Authentication error:', userError);
      throw new Error(`Authentication error: ${userError.message}`);
    }

    if (!user) {
      console.log('🔍 [use-fetch-leads] No user found, returning empty array');
      return [];
    }

    console.log('🔍 [use-fetch-leads] Fetching leads for user:', user.id);

    const { data, error } = await supabase
      .from('facebook_leads')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('🔍 [use-fetch-leads] Database error:', error);
      throw new Error(`Database error: ${error.message}`);
    }
    
    console.log('🔍 [use-fetch-leads] Successfully fetched leads:', {
      count: data?.length || 0,
      leads: data
    });
    
    return data || [];
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

  console.log('🔍 [use-fetch-leads] Hook result:', {
    leadsCount: data?.length || 0,
    isLoading,
    hasError: !!error
  });

  return { 
    leads: data || [], 
    isLoading, 
    error,
    refetch
  };
};
