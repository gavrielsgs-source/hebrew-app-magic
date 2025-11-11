import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { NewCarExpense } from "@/types/car-expense";

export const useAddCarExpense = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (expense: NewCarExpense) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("לא מחובר למערכת");

      let documentUrl: string | undefined;

      // העלאת מסמך אם קיים
      if (expense.document) {
        const fileExt = expense.document.name.split('.').pop();
        const fileName = `${expense.car_id}/${Date.now()}.${fileExt}`;
        
        const { error: uploadError, data } = await supabase.storage
          .from('documents')
          .upload(fileName, expense.document);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('documents')
          .getPublicUrl(fileName);

        documentUrl = publicUrl;
      }

      const { data, error } = await supabase
        .from('car_expenses')
        .insert({
          car_id: expense.car_id,
          user_id: user.id,
          expense_date: expense.expense_date,
          expense_type: expense.expense_type,
          description: expense.description,
          amount: expense.amount,
          include_vat: expense.include_vat,
          vat_rate: expense.vat_rate || 17,
          document_url: documentUrl,
          invoice_number: expense.invoice_number,
        })
        .select()
        .single();

      if (error) throw error;

      toast.success("ההוצאה נוספה בהצלחה");
      return data;
    },
    onSuccess: (_, expense) => {
      queryClient.invalidateQueries({ queryKey: ['car-expenses', expense.car_id] });
    },
    onError: (error: Error) => {
      console.error('Error adding car expense:', error);
      toast.error("שגיאה בהוספת ההוצאה");
    },
  });
};
