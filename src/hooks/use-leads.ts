
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";

const fetchLeads = async () => {
  const { data, error } = await supabase
    .from("leads")
    .select(`
      *,
      cars (
        make,
        model,
        year
      ),
      profiles (
        full_name,
        phone
      )
    `)
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(error.message);
  }
  return data;
};

export const useLeads = () => {
  const { data, isLoading, error } = useQuery({
    queryKey: ["leads"],
    queryFn: fetchLeads,
  });

  return { 
    leads: data || [], 
    isLoading, 
    error 
  };
};

export const useCreateLead = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (newLead: any) => {
      const { data, error } = await supabase.from("leads").insert([newLead]);
      if (error) {
        throw new Error(error.message);
      }
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["leads"] });
    },
  });

  return mutation;
};

export const useUpdateLead = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const { data: responseData, error } = await supabase
        .from("leads")
        .update(data)
        .eq("id", id);

      if (error) {
        throw new Error(error.message);
      }
      return responseData;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["leads"] });
    },
  });

  return mutation;
};

export const useDeleteLead = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (id: string) => {
      const { data, error } = await supabase.from("leads").delete().eq("id", id);
      if (error) {
        throw new Error(error.message);
      }
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["leads"] });
    },
  });

  return mutation;
};
