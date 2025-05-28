
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";

const fetchLeads = async () => {
  console.log('Fetching leads...');
  
  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError) {
      console.error("Error getting user:", userError);
      throw new Error(`Authentication error: ${userError.message}`);
    }

    if (!user) {
      console.log("No authenticated user found");
      return [];
    }

    console.log("User authenticated, fetching leads for:", user.id);

    const { data, error } = await supabase
      .from('leads')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false }); 
    
    if (error) {
      console.error("Error fetching leads from database:", error);
      throw new Error(`Database error: ${error.message}`);
    }
    
    console.log('Loaded leads successfully:', data?.length || 0);
    return data || [];
  } catch (error) {
    console.error("Error in fetchLeads:", error);
    throw error;
  }
};

export const useFetchLeads = () => {
  const { data, isLoading, error } = useQuery({
    queryKey: ["leads"],
    queryFn: fetchLeads,
    retry: (failureCount, error) => {
      console.log(`Leads query failed ${failureCount} times:`, error);
      return failureCount < 2; // Retry up to 2 times
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    refetchOnWindowFocus: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  return { 
    leads: data || [], 
    isLoading, 
    error 
  };
};
