import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import type { CustomerPayment, CustomerBalance } from '@/types/customer';

interface CreatePaymentData {
  customerId: string;
  purchaseId?: string;
  amount: number;
  paymentDate?: string;
  paymentMethod: 'cash' | 'credit' | 'transfer' | 'check';
  reference?: string;
  notes?: string;
  documentId?: string;
}

export function useCustomerPayments(customerId: string) {
  return useQuery({
    queryKey: ['customer-payments', customerId],
    queryFn: async (): Promise<CustomerPayment[]> => {
      const { data, error } = await supabase
        .from('customer_payments')
        .select(`
          *,
          purchase:customer_vehicle_purchases(
            id,
            purchase_price,
            purchase_date,
            car:cars(make, model, year, license_number)
          )
        `)
        .eq('customer_id', customerId)
        .order('payment_date', { ascending: false });

      if (error) throw error;
      
      return (data || []).map(payment => ({
        id: payment.id,
        customer_id: payment.customer_id,
        purchase_id: payment.purchase_id,
        amount: payment.amount,
        payment_date: payment.payment_date,
        payment_method: payment.payment_method as CustomerPayment['payment_method'],
        reference: payment.reference,
        notes: payment.notes,
        document_id: payment.document_id,
        user_id: payment.user_id,
        created_at: payment.created_at,
        purchase: payment.purchase ? {
          id: payment.purchase.id,
          customer_id: customerId,
          car_id: '',
          purchase_price: payment.purchase.purchase_price,
          purchase_date: payment.purchase.purchase_date,
          created_at: '',
          car: payment.purchase.car
        } : undefined
      }));
    },
    enabled: !!customerId,
  });
}

export function useAddCustomerPayment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreatePaymentData) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data: payment, error } = await supabase
        .from('customer_payments')
        .insert({
          customer_id: data.customerId,
          purchase_id: data.purchaseId || null,
          amount: data.amount,
          payment_date: data.paymentDate || new Date().toISOString().split('T')[0],
          payment_method: data.paymentMethod,
          reference: data.reference || null,
          notes: data.notes || null,
          document_id: data.documentId || null,
          user_id: user.id
        })
        .select()
        .single();

      if (error) throw error;

      // If linked to a purchase, update the amount_paid
      if (data.purchaseId) {
        const { data: currentPurchase } = await supabase
          .from('customer_vehicle_purchases')
          .select('amount_paid')
          .eq('id', data.purchaseId)
          .single();

        const currentAmountPaid = currentPurchase?.amount_paid || 0;
        
        await supabase
          .from('customer_vehicle_purchases')
          .update({ amount_paid: currentAmountPaid + data.amount })
          .eq('id', data.purchaseId);
      }

      return payment;
    },
    onSuccess: (_, variables) => {
      toast.success('התשלום נוסף בהצלחה');
      queryClient.invalidateQueries({ queryKey: ['customer-payments', variables.customerId] });
      queryClient.invalidateQueries({ queryKey: ['customer-purchases', variables.customerId] });
      queryClient.invalidateQueries({ queryKey: ['customer-balance', variables.customerId] });
    },
    onError: (error) => {
      console.error('Error adding payment:', error);
      toast.error('שגיאה בהוספת התשלום');
    }
  });
}

export function useDeleteCustomerPayment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ paymentId, customerId }: { paymentId: string; customerId: string }) => {
      // Get payment details first to update purchase amount_paid
      const { data: payment } = await supabase
        .from('customer_payments')
        .select('amount, purchase_id')
        .eq('id', paymentId)
        .single();

      const { error } = await supabase
        .from('customer_payments')
        .delete()
        .eq('id', paymentId);

      if (error) throw error;

      // If linked to a purchase, update the amount_paid
      if (payment?.purchase_id) {
        const { data: currentPurchase } = await supabase
          .from('customer_vehicle_purchases')
          .select('amount_paid')
          .eq('id', payment.purchase_id)
          .single();

        const currentAmountPaid = currentPurchase?.amount_paid || 0;
        const newAmount = Math.max(0, currentAmountPaid - payment.amount);
        
        await supabase
          .from('customer_vehicle_purchases')
          .update({ amount_paid: newAmount })
          .eq('id', payment.purchase_id);
      }

      return { customerId };
    },
    onSuccess: (result) => {
      toast.success('התשלום נמחק בהצלחה');
      queryClient.invalidateQueries({ queryKey: ['customer-payments', result.customerId] });
      queryClient.invalidateQueries({ queryKey: ['customer-purchases', result.customerId] });
      queryClient.invalidateQueries({ queryKey: ['customer-balance', result.customerId] });
    },
    onError: (error) => {
      console.error('Error deleting payment:', error);
      toast.error('שגיאה במחיקת התשלום');
    }
  });
}

export function useCustomerBalance(customerId: string) {
  return useQuery({
    queryKey: ['customer-balance', customerId],
    queryFn: async (): Promise<CustomerBalance> => {
      // Get total purchases (sales to customer)
      const { data: purchases } = await supabase
        .from('customer_vehicle_purchases')
        .select('purchase_price')
        .eq('customer_id', customerId);

      const totalPurchases = (purchases || []).reduce(
        (sum, p) => sum + (p.purchase_price || 0), 
        0
      );

      // Get total payments
      const { data: payments } = await supabase
        .from('customer_payments')
        .select('amount')
        .eq('customer_id', customerId);

      const totalPayments = (payments || []).reduce(
        (sum, p) => sum + (p.amount || 0), 
        0
      );

      const outstandingBalance = totalPurchases - totalPayments;
      const paymentPercentage = totalPurchases > 0 
        ? Math.min(100, (totalPayments / totalPurchases) * 100) 
        : 0;

      return {
        totalPurchases,
        totalPayments,
        outstandingBalance,
        paymentPercentage
      };
    },
    enabled: !!customerId,
  });
}
