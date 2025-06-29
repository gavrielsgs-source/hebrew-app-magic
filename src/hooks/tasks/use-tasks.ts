
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { fetchTasks, createTask, updateTask, deleteTask } from "./task-api";
import type { NewTask } from "./types";

export function useTasks() {
  const queryClient = useQueryClient();

  const { data: tasks = [], isLoading, error, refetch } = useQuery({
    queryKey: ["tasks"],
    queryFn: fetchTasks,
    retry: (failureCount, error) => {
      console.log(`Query failed ${failureCount} times:`, error);
      return failureCount < 2; // Retry up to 2 times
    },
    refetchOnWindowFocus: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const addTask = useMutation({
    mutationFn: createTask,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      toast.success("משימה נוספה בהצלחה");
    },
    onError: (error) => {
      console.error("Add task mutation error:", error);
      toast.error("שגיאה בהוספת משימה - " + error.message);
    }
  });

  const updateTaskMutation = useMutation({
    mutationFn: updateTask,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      toast.success("משימה עודכנה בהצלחה");
    },
    onError: (error) => {
      console.error("Update task mutation error:", error);
      toast.error("שגיאה בעדכון משימה - " + error.message);
    }
  });

  const deleteTaskMutation = useMutation({
    mutationFn: deleteTask,
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
    updateTask: updateTaskMutation,
    deleteTask: deleteTaskMutation,
  };
}
