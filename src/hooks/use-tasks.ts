
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

  const { data: tasks = [], isLoading, error, refetch } = useQuery({
    queryKey: ["tasks"],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from("tasks")
          .select("*, cars(*), leads(*)")
          .order("due_date", { ascending: true });

        if (error) {
          console.error("Error fetching tasks:", error);
          throw error;
        }

        // Ensure every task has a type, defaulting to 'task'
        return data.map((task: TaskFromDB): Task => ({
          ...task,
          type: task.type || 'task'
        }));
      } catch (error) {
        console.error("Error in tasks query:", error);
        toast.error("שגיאה בטעינת משימות");
        throw error;
      }
    },
    retry: 1,
    refetchOnWindowFocus: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const addTask = useMutation({
    mutationFn: async (task: NewTask) => {
      try {
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
          console.error("Error adding task:", error);
          toast.error("שגיאה בהוספת משימה");
          throw error;
        }

        return data;
      } catch (error) {
        console.error("Error in add task mutation:", error);
        toast.error("שגיאה בהוספת משימה - אנא ודא שהנך מחובר");
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      toast.success("משימה נוספה בהצלחה");
    },
  });

  const updateTask = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<NewTask> }) => {
      try {
        const { error } = await supabase
          .from("tasks")
          .update(data)
          .eq("id", id);

        if (error) {
          console.error("Error updating task:", error);
          toast.error("שגיאה בעדכון משימה");
          throw error;
        }
      } catch (error) {
        console.error("Error in update task mutation:", error);
        toast.error("שגיאה בעדכון משימה - אנא ודא שהנך מחובר");
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
      try {
        const { error } = await supabase
          .from("tasks")
          .delete()
          .eq("id", id);

        if (error) {
          console.error("Error deleting task:", error);
          toast.error("שגיאה במחיקת משימה");
          throw error;
        }
      } catch (error) {
        console.error("Error in delete task mutation:", error);
        toast.error("שגיאה במחיקת משימה - אנא ודא שהנך מחובר");
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
    error,
    refetch,
    addTask,
    updateTask,
    deleteTask,
  };
}
