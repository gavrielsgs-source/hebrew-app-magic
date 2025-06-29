
import { supabase } from "@/integrations/supabase/client";
import { TaskFromDB, Task, NewTask } from "./types";

export const fetchTasks = async (): Promise<Task[]> => {
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
};

export const createTask = async (task: NewTask) => {
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
};

export const updateTask = async ({ id, data }: { id: string; data: Partial<NewTask> }) => {
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
};

export const deleteTask = async (id: string) => {
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
};
