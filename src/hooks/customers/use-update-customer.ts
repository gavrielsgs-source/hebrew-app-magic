import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";
import type { UpdateCustomerData } from "@/types/customer";

export function useUpdateCustomer() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ customerId, customerData }: { customerId: string; customerData: UpdateCustomerData }) => {
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('customers')
        .update(customerData)
        .eq('id', customerId)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) {
        console.error('Error updating customer:', error);
        throw error;
      }

      return data;
    },
    onSuccess: (_, { customerId }) => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      queryClient.invalidateQueries({ queryKey: ['customer', customerId] });
      toast.success('לקוח עודכן בהצלחה');
    },
    onError: (error) => {
      console.error('Error updating customer:', error);
      toast.error('שגיאה בעדכון לקוח');
    },
  });
}