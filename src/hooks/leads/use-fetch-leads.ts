
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";

const fetchLeads = async () => {
  console.log('fetchLeads function starting...');
  
  try {
    console.log('Getting user from Supabase auth...');
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError) {
      console.error("Error getting user:", userError);
      throw new Error(`Authentication error: ${userError.message}`);
    }

    if (!user) {
      console.log("No authenticated user found, returning empty array");
      return [];
    }

    console.log("User authenticated successfully, user ID:", user.id);

    console.log('Fetching leads from database...');
    const { data, error } = await supabase
      .from('leads')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false }); 
    
    if (error) {
      console.error("Database error fetching leads:", error);
      throw new Error(`Database error: ${error.message} (Code: ${error.code})`);
    }
    
    console.log('Successfully fetched leads:', {
      count: data?.length || 0,
      hasData: !!data
    });
    
    return data || [];
  } catch (error) {
    console.error("Critical error in fetchLeads function:", error);
    // Re-throw the error to be handled by React Query
    throw error;
  }
};

export const useFetchLeads = () => {
  console.log('useFetchLeads hook initializing...');
  
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["leads"],
    queryFn: fetchLeads,
    retry: (failureCount, error) => {
      console.log(`Leads query failed ${failureCount} times:`, {
        error: error?.message,
        failureCount,
        willRetry: failureCount < 2
      });
      return failureCount < 2; // Retry up to 2 times
    },
    retryDelay: (attemptIndex) => {
      const delay = Math.min(1000 * 2 ** attemptIndex, 30000);
      console.log(`Retrying leads query in ${delay}ms (attempt ${attemptIndex + 1})`);
      return delay;
    },
    refetchOnWindowFocus: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
    onError: (error) => {
      console.error('React Query error in useFetchLeads:', error);
    },
    onSuccess: (data) => {
      console.log('React Query success in useFetchLeads:', { count: data?.length });
    },
  });

  console.log('useFetchLeads hook returning:', { 
    dataCount: data?.length || 0, 
    isLoading, 
    hasError: !!error,
    errorMessage: error?.message 
  });

  return { 
    leads: data || [], 
    isLoading, 
    error,
    refetch
  };
};
