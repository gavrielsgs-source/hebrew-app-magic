import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Company } from "@/types/user";
import { toast } from "sonner";

import { useAuth } from "@/hooks/use-auth";

export function useCompanies() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  // Fetch user's companies
  const { data: companies = [], isLoading, error } = useQuery({
    queryKey: ["companies"],
    queryFn: async (): Promise<Company[]> => {
      const { data, error } = await supabase
        .from("companies")
        .select("*")
        .order("created_at", { ascending: false });
      
      if (error) {
        console.error("Error fetching companies:", error);
        throw error;
      }
      
      return data || [];
    },
  });

  // Create company
  const createCompany = useMutation({
    mutationFn: async (name: string) => {
      if (!user?.id) throw new Error("User not authenticated");
      
      const { data, error } = await supabase
        .from("companies")
        .insert([{ name, owner_id: user.id }])
        .select()
        .single();
      
      if (error) {
        console.error("Error creating company:", error);
        throw error;
      }
      
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["companies"] });
      queryClient.invalidateQueries({ queryKey: ["subscription"] });
      toast.success("החברה נוצרה בהצלחה");
    },
    onError: (error) => {
      console.error("Failed to create company:", error);
      toast.error("שגיאה ביצירת החברה");
    },
  });

  // Update company
  const updateCompany = useMutation({
    mutationFn: async ({ id, name }: { id: string; name: string }) => {
      const { data, error } = await supabase
        .from("companies")
        .update({ name })
        .eq("id", id)
        .select()
        .single();
      
      if (error) {
        console.error("Error updating company:", error);
        throw error;
      }
      
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["companies"] });
      toast.success("החברה עודכנה בהצלחה");
    },
    onError: (error) => {
      console.error("Failed to update company:", error);
      toast.error("שגיאה בעדכון החברה");
    },
  });

  return {
    companies,
    isLoading,
    error,
    createCompany,
    updateCompany,
  };
}

export function useCompanyUsers(companyId: string) {
  return useQuery({
    queryKey: ["company-users", companyId],
    queryFn: async () => {
      // Fetch users through agencies and user_roles
      const { data, error } = await supabase
        .from("user_roles")
        .select(`
          *,
          agencies!inner(
            id,
            name,
            company_id
          )
        `)
        .eq("agencies.company_id", companyId);
      
      if (error) {
        console.error("Error fetching company users:", error);
        throw error;
      }
      
      return data || [];
    },
    enabled: !!companyId,
  });
}