import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";
import type { CreateCustomerData } from "@/types/customer";

interface CreateCustomerParams {
  customerData: CreateCustomerData;
}

export function useCreateCustomer() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ customerData }: CreateCustomerParams) => {
      if (!user) throw new Error('User not authenticated');

      // Insert customer
      const { data, error } = await supabase
        .from('customers')
        .insert({
          ...customerData,
          user_id: user.id,
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating customer:', error);
        throw error;
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      toast.success('לקוח נוצר בהצלחה');
    },
    onError: (error) => {
      console.error('Error creating customer:', error);
      toast.error('שגיאה ביצירת לקוח');
    },
  });
}