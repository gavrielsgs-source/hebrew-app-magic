
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";

const fetchLeads = async () => {
  console.log('getting leads')
 const { data, error } = await supabase.functions.invoke("facebook-leads");
  console.log(data)

  if (error) {
    console.error("שגיאה בטעינת לקוחות:", error);
    throw new Error(error.message);
  }
  return data || [];
};

export const useFetchLeads = () => {
  const { data, isLoading, error } = useQuery({
    queryKey: ["leads"],
    queryFn: fetchLeads,
  });

  return { 
    leads: data || [], 
    isLoading, 
    error 
  };
};
