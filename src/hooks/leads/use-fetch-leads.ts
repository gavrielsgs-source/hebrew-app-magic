
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";

const fetchLeads = async () => {
  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError) {
      throw new Error(`Authentication error: ${userError.message}`);
    }

    if (!user) {
      return [];
    }

    const { data, error } = await supabase
      .from('leads')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false }); 
    
    if (error) {
      throw new Error(`Database error: ${error.message}`);
    }
    
    return data || [];
  } catch (error) {
    console.error("Error in fetchLeads:", error);
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

  return { 
    leads: data || [], 
    isLoading, 
    error,
    refetch
  };
};
