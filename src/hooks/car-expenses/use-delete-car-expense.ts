import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const useDeleteCarExpense = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, carId, documentUrl }: { id: string; carId: string; documentUrl?: string }) => {
      // מחיקת מסמך אם קיים
      if (documentUrl) {
        const urlParts = documentUrl.split('/');
        const fileName = urlParts.slice(-2).join('/');
        
        await supabase.storage
          .from('documents')
          .remove([fileName]);
      }

      const { error } = await supabase
        .from('car_expenses')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast.success("ההוצאה נמחקה בהצלחה");
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['car-expenses', variables.carId] });
    },
    onError: (error: Error) => {
      console.error('Error deleting car expense:', error);
      toast.error("שגיאה במחיקת ההוצאה");
    },
  });
};
