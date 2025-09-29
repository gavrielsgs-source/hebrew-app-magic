import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";
import type { CustomerNote } from "@/types/customer";

export function useCustomerNotes(customerId: string) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['customer-notes', customerId, user?.id],
    queryFn: async (): Promise<CustomerNote[]> => {
      if (!user) return [];

      const { data, error } = await supabase
        .from('customer_notes')
        .select('*')
        .eq('customer_id', customerId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching customer notes:', error);
        throw error;
      }

      return data || [];
    },
    enabled: !!user && !!customerId,
  });
}

export function useCreateCustomerNote() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ customerId, note }: { customerId: string; note: string }) => {
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('customer_notes')
        .insert({
          customer_id: customerId,
          user_id: user.id,
          note,
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating customer note:', error);
        throw error;
      }

      return data;
    },
    onSuccess: (_, { customerId }) => {
      queryClient.invalidateQueries({ queryKey: ['customer-notes', customerId] });
      toast.success('הערה נוספה בהצלחה');
    },
    onError: (error) => {
      console.error('Error creating customer note:', error);
      toast.error('שגיאה בהוספת הערה');
    },
  });
}