
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

type NewTask = {
  title: string;
  description?: string | null;
  status: string;
  priority: string;
  type?: string | null; // Added type field as optional
  due_date?: string | null; // Using string for ISO dates
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

      // Add a default type if it's missing
      // Use optional chaining to safely access properties
      return data.map(task => ({
        ...task,
        type: task.type || 'task' // Provide a default value if type is null or missing
      }));
    },
  });

  const addTask = useMutation({
    mutationFn: async (task: NewTask) => {
      const { data: userData, error: userError } = await supabase.auth.getUser();
      
      if (userError || !userData.user) {
        toast.error("לא ניתן להוסיף משימה - משתמש לא מחובר");
        throw userError || new Error("User not authenticated");
      }

      // Note that due_date is already a string from the form
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
    mutationFn: async ({ id, data }: { id: string; data: Partial<NewTask> }) => {
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
