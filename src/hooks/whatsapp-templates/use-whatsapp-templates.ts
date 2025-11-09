import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface WhatsappTemplate {
  id: string;
  user_id: string;
  company_id?: string;
  name: string;
  description: string;
  type: "car" | "lead";
  template_content: string;
  is_default: boolean;
  is_shared: boolean;
  created_at: string;
  updated_at: string;
}

export const useWhatsappTemplates = () => {
  return useQuery({
    queryKey: ["whatsapp-templates"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      const { data, error } = await supabase
        .from("whatsapp_templates" as any)
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as unknown as WhatsappTemplate[];
    },
  });
};
