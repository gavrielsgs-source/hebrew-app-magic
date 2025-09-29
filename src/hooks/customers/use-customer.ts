import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import type { Customer } from "@/types/customer";

export function useCustomer(customerId: string) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['customer', customerId, user?.id],
    queryFn: async (): Promise<Customer | null> => {
      if (!user || !customerId) return null;

      const { data, error } = await supabase
        .from('customers')
        .select('*')
        .eq('id', customerId)
        .eq('user_id', user.id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return null; // Customer not found
        }
        console.error('Error fetching customer:', error);
        throw error;
      }

      return data as Customer;
    },
    enabled: !!user && !!customerId,
  });
}