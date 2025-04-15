
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

type NewTask = {
  title: string;
  description?: string | null;
  status: string;
  priority: string;
  type: string;
  due_date?: string | null; // Changed from Date to string
  car_id?: string | null;
  lead_id?: string | null;
};

export function useTasks() {
  const queryClient = useQueryClient();

  const { data: tasks = [], isLoading } = useQuery({
    queryKey: ["tasks"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("tasks")
        .select("*, cars(*), leads(*)")
        .order("due_date", { ascending: true });

      if (error) {
        toast.error("שגיאה בטעינת משימות");
        throw error;
      }

      return data;
    },
  });

  const addTask = useMutation({
    mutationFn: async (task: NewTask) => {
      const { data: userData, error: userError } = await supabase.auth.getUser();
      
      if (userError || !userData.user) {
        toast.error("לא ניתן להוסיף משימה - משתמש לא מחובר");
        throw userError || new Error("User not authenticated");
      }

      // No need to format due_date as it's already a string now
      const { data, error } = await supabase
        .from("tasks")
        .insert({
          ...task,
          user_id: userData.user.id
        })
        .select()
        .single();

      if (error) {
        toast.error("שגיאה בהוספת משימה");
        throw error;
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      toast.success("משימה נוספה בהצלחה");
    },
  });

  const updateTask = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Omit<NewTask, 'due_date'>> & { due_date?: string | null } }) => {
      const { error } = await supabase
        .from("tasks")
        .update(data)
        .eq("id", id);

      if (error) {
        toast.error("שגיאה בעדכון משימה");
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      toast.success("משימה עודכנה בהצלחה");
    },
  });

  const deleteTask = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("tasks")
        .delete()
        .eq("id", id);

      if (error) {
        toast.error("שגיאה במחיקת משימה");
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      toast.success("משימה נמחקה בהצלחה");
    },
  });

  return {
    tasks,
    isLoading,
    addTask,
    updateTask,
    deleteTask,
  };
}
