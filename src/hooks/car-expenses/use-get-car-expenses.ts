import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { CarExpenseWithTotal } from "@/types/car-expense";
import type { Database } from "@/integrations/supabase/types";

export const useGetCarExpenses = (carId: string) => {
  return useQuery({
    queryKey: ['car-expenses', carId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('car_expenses')
        .select('*')
        .eq('car_id', carId)
        .order('expense_date', { ascending: false });

      if (error) throw error;

      type DbExpense = Database['public']['Tables']['car_expenses']['Row'];

      // חישוב סכום כולל עם מע"מ
      const expensesWithTotal: CarExpenseWithTotal[] = data.map((expense: DbExpense) => ({
        ...expense,
        expense_type: expense.expense_type as 'repair' | 'cleaning' | 'paint' | 'parts' | 'transport' | 'other',
        total_with_vat: expense.include_vat 
          ? expense.amount * (1 + expense.vat_rate / 100)
          : expense.amount,
      }));

      // חישוב סיכום
      const totalExpenses = expensesWithTotal.reduce((sum, exp) => sum + exp.total_with_vat, 0);

      return {
        expenses: expensesWithTotal,
        summary: {
          total: totalExpenses,
          count: expensesWithTotal.length,
        },
      };
    },
    enabled: !!carId,
  });
};
