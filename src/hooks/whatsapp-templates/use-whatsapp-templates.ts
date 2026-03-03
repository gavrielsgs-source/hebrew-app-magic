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
  facebook_template_name?: string;
  supports_image_header?: boolean;
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
        .from("whatsapp_templates")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching whatsapp templates:", error);
        throw error;
      }
      console.log("Fetched whatsapp templates:", data?.length, "for user:", user.id);
      return (data || []) as unknown as WhatsappTemplate[];
    },
  });
};
