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
  return useQuery({
    queryKey: ["leads"],
    queryFn: fetchLeads,
  });
};

export const useCreateLead = () => {
  const queryClient = useQueryClient();

  return useMutation(
    async (newLead: any) => {
      const { data, error } = await supabase.from("leads").insert([newLead]);
      if (error) {
        throw new Error(error.message);
      }
      return data;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["leads"] });
      },
    }
  );
};

export const useUpdateLead = () => {
  const queryClient = useQueryClient();

  return useMutation(
    async (updatedLead: any) => {
      const { data, error } = await supabase
        .from("leads")
        .update(updatedLead)
        .eq("id", updatedLead.id);

      if (error) {
        throw new Error(error.message);
      }
      return data;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["leads"] });
      },
    }
  );
};

export const useDeleteLead = () => {
  const queryClient = useQueryClient();

  return useMutation(
    async (id: string) => {
      const { data, error } = await supabase.from("leads").delete().eq("id", id);
      if (error) {
        throw new Error(error.message);
      }
      return data;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["leads"] });
      },
    }
  );
};
