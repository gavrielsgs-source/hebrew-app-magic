
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";

export const useCreateLead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (newLead: any) => {
      const { data, error } = await supabase.from("leads").insert([newLead]).select();
      
      if (error) {
        console.error("שגיאה ביצירת ליד:", error);
        throw new Error(error.message);
      }
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["leads"] });
    },
    onError: (error) => {
      console.error("שגיאה בהוספת לקוח:", error);
    }
  });
};
