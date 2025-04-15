import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

// Define Task interface that matches what comes back from the database
interface TaskFromDB {
  id: string;
  title: string;
  description?: string | null;
  status: string;
  priority: string;
  due_date?: string | null;
  car_id?: string | null;
  lead_id?: string | null;
  created_at: string;
  updated_at: string;
  user_id: string;
  cars: any; // Using any for simplicity, but ideally should be typed properly
  leads: any; // Using any for simplicity, but ideally should be typed properly
  type?: string | null; // Add optional type field
}

// Define Task interface with the additional type field
interface Task extends TaskFromDB {
  type: string; // Make type non-optional with a default
}

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

      // Ensure every task has a type, defaulting to 'task'
      return data.map((task: TaskFromDB): Task => ({
        ...task,
        type: task.type || 'task'
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

      // Ensure type is set to 'task' if not provided
      const taskWithDefaultType = {
        ...task,
        type: task.type || 'task'
      };

      const { data, error } = await supabase
        .from("tasks")
        .insert({
          ...taskWithDefaultType,
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
