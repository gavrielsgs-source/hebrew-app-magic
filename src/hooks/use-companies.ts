import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Company } from "@/types/user";
import { toast } from "sonner";

import { useAuth } from "@/hooks/use-auth";

export function useCompanies() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  // Fetch user's companies (only owned by user or user has roles in)
  const { data: companies = [], isLoading, error } = useQuery({
    queryKey: ["companies", user?.id],
    queryFn: async (): Promise<Company[]> => {
      if (!user?.id) return [];

      // Get companies owned by user
      const { data: ownedCompanies, error: ownedError } = await supabase
        .from("companies")
        .select("*")
        .eq("owner_id", user.id)
        .order("created_at", { ascending: false });
      
      if (ownedError) {
        console.error("Error fetching owned companies:", ownedError);
        throw ownedError;
      }

      // Get companies user has roles in through user_roles table
      const { data: userRoles, error: rolesError } = await supabase
        .from("user_roles")
        .select(`
          company_id,
          companies!inner(*)
        `)
        .eq("user_id", user.id)
        .not("company_id", "is", null);

      if (rolesError) {
        console.error("Error fetching user role companies:", rolesError);
        throw rolesError;
      }

      // Extract companies from user roles
      const roleCompanies = userRoles?.map(ur => ur.companies).filter(Boolean) || [];

      // Merge and deduplicate companies
      const allCompanies = [...(ownedCompanies || []), ...roleCompanies];
      const uniqueCompanies = allCompanies.filter((company, index, arr) => 
        arr.findIndex(c => c.id === company.id) === index
      );

      return uniqueCompanies.sort((a, b) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
    },
    enabled: !!user?.id,
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
      queryClient.invalidateQueries({ queryKey: ["companies", user?.id] });
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
      queryClient.invalidateQueries({ queryKey: ["companies", user?.id] });
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