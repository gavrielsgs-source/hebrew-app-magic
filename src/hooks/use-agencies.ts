
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { useAuth } from "@/hooks/use-auth";
import { Agency } from "@/types/user";

export function useAgencies() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: agencies = [], isLoading } = useQuery({
    queryKey: ["agencies"],
    queryFn: async () => {
      if (!user) return [];

      try {
        const { data, error } = await supabase
          .from("agencies")
          .select("*")
          .order("name");

        if (error) {
          console.error("Error fetching agencies:", error);
          toast.error("שגיאה בטעינת סוכנויות");
          throw error;
        }

        return data as Agency[];
      } catch (error) {
        console.error("Error in agencies query:", error);
        throw error;
      }
    },
    enabled: !!user,
    retry: 1,
  });

  const addAgency = useMutation({
    mutationFn: async (name: string) => {
      if (!user) throw new Error("לא מחובר");

      const { data, error } = await supabase
        .from("agencies")
        .insert({
          name,
          owner_id: user.id
        })
        .select()
        .single();

      if (error) {
        console.error("Error adding agency:", error);
        toast.error("שגיאה בהוספת סוכנות");
        throw error;
      }

      return data as Agency;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["agencies"] });
      toast.success("הסוכנות נוספה בהצלחה");
    },
  });

  const updateAgency = useMutation({
    mutationFn: async ({ id, name }: { id: string; name: string }) => {
      const { error } = await supabase
        .from("agencies")
        .update({ name })
        .eq("id", id);

      if (error) {
        console.error("Error updating agency:", error);
        toast.error("שגיאה בעדכון סוכנות");
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["agencies"] });
      toast.success("הסוכנות עודכנה בהצלחה");
    },
  });

  return {
    agencies,
    isLoading,
    addAgency,
    updateAgency,
  };
}
