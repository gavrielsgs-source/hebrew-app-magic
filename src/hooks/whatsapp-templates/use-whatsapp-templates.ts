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
        .from("whatsapp_templates" as any)
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      const allTemplates = data as unknown as WhatsappTemplate[];

      // Deduplicate default templates: keep one per facebook_template_name
      const defaults = allTemplates.filter(t => t.is_default);
      const custom = allTemplates.filter(t => !t.is_default);
      const grouped = new Map<string, WhatsappTemplate>();
      for (const t of defaults) {
        const key = t.facebook_template_name || t.name;
        const existing = grouped.get(key);
        if (!existing || t.user_id === user.id) {
          grouped.set(key, t);
        }
      }
      return [...grouped.values(), ...custom];
    },
  });
};
