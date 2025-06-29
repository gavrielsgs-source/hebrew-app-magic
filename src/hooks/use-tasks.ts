
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
  assigned_to?: string | null; // Add assigned_to field
  agency_id?: string | null; // Add agency_id field
};

export function useTasks() {
  const queryClient = useQueryClient();

  const { data: tasks = [], isLoading, error, refetch } = useQuery({
    queryKey: ["tasks"],
    queryFn: async () => {
      try {
        console.log("Fetching tasks...");
        
        // Check if user is authenticated
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        
        if (userError) {
          console.error("User authentication error:", userError);
          throw new Error("User not authenticated");
        }

        if (!user) {
          console.log("No authenticated user found");
          return [];
        }

        const { data, error } = await supabase
          .from("tasks")
          .select("*, cars(*), leads(*)")
          .eq("user_id", user.id)
          .order("due_date", { ascending: true });

        if (error) {
          console.error("Error fetching tasks:", error);
          throw new Error(`Database error: ${error.message}`);
        }

        console.log("Tasks fetched successfully:", data?.length || 0);

        // Ensure every task has a type, defaulting to 'task'
        return (data || []).map((task: TaskFromDB): Task => ({
          ...task,
          type: task.type || 'task'
        }));
      } catch (error) {
        console.error("Error in tasks query:", error);
        throw error;
      }
    },
    retry: (failureCount, error) => {
      console.log(`Query failed ${failureCount} times:`, error);
      return failureCount < 2; // Retry up to 2 times
    },
    refetchOnWindowFocus: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const addTask = useMutation({
    mutationFn: async (task: NewTask) => {
      try {
        console.log("Adding task:", task);
        
        const { data: userData, error: userError } = await supabase.auth.getUser();
        
        if (userError || !userData.user) {
          console.error("User authentication error:", userError);
          throw new Error("User not authenticated");
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
          throw new Error(`Failed to create task: ${error.message}`);
        }

        console.log("Task added successfully:", data);
        return data;
      } catch (error) {
        console.error("Error in add task mutation:", error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      toast.success("משימה נוספה בהצלחה");
    },
    onError: (error) => {
      console.error("Add task mutation error:", error);
      toast.error("שגיאה בהוספת משימה - " + error.message);
    }
  });

  const updateTask = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<NewTask> }) => {
      try {
        console.log("Updating task:", id, data);
        
        const { error } = await supabase
          .from("tasks")
          .update(data)
          .eq("id", id);

        if (error) {
          console.error("Error updating task:", error);
          throw new Error(`Failed to update task: ${error.message}`);
        }

        console.log("Task updated successfully");
      } catch (error) {
        console.error("Error in update task mutation:", error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      toast.success("משימה עודכנה בהצלחה");
    },
    onError: (error) => {
      console.error("Update task mutation error:", error);
      toast.error("שגיאה בעדכון משימה - " + error.message);
    }
  });

  const deleteTask = useMutation({
    mutationFn: async (id: string) => {
      try {
        console.log("Deleting task:", id);
        
        const { error } = await supabase
          .from("tasks")
          .delete()
          .eq("id", id);

        if (error) {
          console.error("Error deleting task:", error);
          throw new Error(`Failed to delete task: ${error.message}`);
        }

        console.log("Task deleted successfully");
      } catch (error) {
        console.error("Error in delete task mutation:", error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      toast.success("משימה נמחקה בהצלחה");
    },
    onError: (error) => {
      console.error("Delete task mutation error:", error);
      toast.error("שגיאה במחיקת משימה - " + error.message);
    }
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
