
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { Database } from "@/integrations/supabase/types";

type Car = Database["public"]["Tables"]["cars"]["Row"];

export function useCars() {
  const queryClient = useQueryClient();

  const { data: cars = [], isLoading } = useQuery({
    queryKey: ["cars"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("cars")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        toast.error("שגיאה בטעינת רכבים");
        throw error;
      }

      return data;
    },
  });

  const addCar = useMutation({
    mutationFn: async (car: Omit<Car, "id" | "created_at" | "updated_at" | "user_id">) => {
      const { data, error } = await supabase
        .from("cars")
        .insert([car])
        .select()
        .single();

      if (error) {
        toast.error("שגיאה בהוספת רכב");
        throw error;
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cars"] });
      toast.success("רכב נוסף בהצלחה");
    },
  });

  return {
    cars,
    isLoading,
    addCar,
  };
}
