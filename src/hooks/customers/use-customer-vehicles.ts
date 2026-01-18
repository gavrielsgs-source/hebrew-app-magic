import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";

export interface CustomerVehiclePurchase {
  id: string;
  customer_id: string;
  car_id: string;
  purchase_price?: number;
  purchase_date?: string;
  amount_paid?: number;
  created_at: string;
  car?: {
    id: string;
    make: string;
    model: string;
    year: number;
    license_number?: string;
    price: number;
  };
}

export interface CustomerVehicleSale {
  id: string;
  customer_id: string;
  car_id: string;
  sale_price?: number;
  sale_date?: string;
  created_at: string;
  car?: {
    id: string;
    make: string;
    model: string;
    year: number;
    license_number?: string;
    price: number;
  };
}

// Get vehicles purchased by customer (cars we sold to them)
export function useCustomerVehiclePurchases(customerId: string) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['customer-vehicle-purchases', customerId, user?.id],
    queryFn: async (): Promise<CustomerVehiclePurchase[]> => {
      if (!user || !customerId) return [];

      const { data, error } = await supabase
        .from('customer_vehicle_purchases')
        .select(`
          *,
          car:cars(id, make, model, year, license_number, price)
        `)
        .eq('customer_id', customerId);

      if (error) {
        console.error('Error fetching customer vehicle purchases:', error);
        throw error;
      }

      return data || [];
    },
    enabled: !!user && !!customerId,
  });
}

// Get vehicles sold by customer (cars we bought from them)
export function useCustomerVehicleSales(customerId: string) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['customer-vehicle-sales', customerId, user?.id],
    queryFn: async (): Promise<CustomerVehicleSale[]> => {
      if (!user || !customerId) return [];

      const { data, error } = await supabase
        .from('customer_vehicle_sales')
        .select(`
          *,
          car:cars(id, make, model, year, license_number, price)
        `)
        .eq('customer_id', customerId);

      if (error) {
        console.error('Error fetching customer vehicle sales:', error);
        throw error;
      }

      return data || [];
    },
    enabled: !!user && !!customerId,
  });
}

// Add vehicle purchase (we sold to customer)
export function useAddCustomerVehiclePurchase() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      customerId: string;
      carId: string;
      purchasePrice?: number;
      purchaseDate?: string;
    }) => {
      // Check for existing record to prevent duplicates
      const { data: existing } = await supabase
        .from('customer_vehicle_purchases')
        .select('id')
        .eq('customer_id', data.customerId)
        .eq('car_id', data.carId)
        .maybeSingle();

      if (existing) {
        // Already exists, return existing record
        console.log('Vehicle purchase record already exists, skipping creation');
        return existing;
      }

      const { data: result, error } = await supabase
        .from('customer_vehicle_purchases')
        .insert({
          customer_id: data.customerId,
          car_id: data.carId,
          purchase_price: data.purchasePrice,
          purchase_date: data.purchaseDate || new Date().toISOString().split('T')[0]
        })
        .select()
        .single();

      if (error) throw error;

      // Update car status to sold
      const { error: carError } = await supabase
        .from('cars')
        .update({ status: 'sold' })
        .eq('id', data.carId);

      if (carError) {
        console.error('Error updating car status:', carError);
      }

      return result;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ 
        queryKey: ['customer-vehicle-purchases', variables.customerId] 
      });
      queryClient.invalidateQueries({ queryKey: ['cars'] });
      toast.success('רכב נמכר ללקוח בהצלחה');
    },
    onError: (error) => {
      console.error('Error adding vehicle purchase:', error);
      toast.error('שגיאה במכירת הרכב ללקוח');
    },
  });
}

// Add vehicle sale (we bought from customer)
export function useAddCustomerVehicleSale() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      customerId: string;
      carId: string;
      salePrice?: number;
      saleDate?: string;
    }) => {
      const { data: result, error } = await supabase
        .from('customer_vehicle_sales')
        .insert({
          customer_id: data.customerId,
          car_id: data.carId,
          sale_price: data.salePrice,
          sale_date: data.saleDate || new Date().toISOString().split('T')[0]
        })
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ 
        queryKey: ['customer-vehicle-sales', variables.customerId] 
      });
      queryClient.invalidateQueries({ queryKey: ['cars'] });
      toast.success('רכישת רכב מהלקוח נרשמה בהצלחה');
    },
    onError: (error) => {
      console.error('Error adding vehicle sale:', error);
      toast.error('שגיאה ברכישת הרכב מהלקוח');
    },
  });
}