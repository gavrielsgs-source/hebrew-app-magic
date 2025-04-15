
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { Database } from "@/integrations/supabase/types";

type Car = Database["public"]["Tables"]["cars"]["Row"];
type NewCar = Omit<Car, "id" | "created_at" | "updated_at" | "user_id">;

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
    mutationFn: async (car: NewCar) => {
      const { data: userData, error: userError } = await supabase.auth.getUser();
      
      if (userError || !userData.user) {
        toast.error("לא ניתן להוסיף רכב - משתמש לא מחובר");
        throw userError || new Error("User not authenticated");
      }

      const { data, error } = await supabase
        .from("cars")
        .insert({
          ...car,
          user_id: userData.user.id
        })
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
