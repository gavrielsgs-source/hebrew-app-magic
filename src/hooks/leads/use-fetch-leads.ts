
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";

const fetchLeads = async () => {
  console.log('getting leads')
  
  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError) {
      console.error("Error getting user:", userError);
      throw new Error(userError.message);
    }

    if (!user) {
      console.log("No user found");
      return [];
    }

    const { data, error } = await supabase
      .from('leads')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false }); 
    
    if (error) {
      console.error("שגיאה בטעינת לקוחות:", error);
      throw new Error(error.message);
    }
    
    console.log('Loaded leads:', data?.length || 0);
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
    retry: 2,
    retryDelay: 1000,
  });

  return { 
    leads: data || [], 
    isLoading, 
    error 
  };
};
