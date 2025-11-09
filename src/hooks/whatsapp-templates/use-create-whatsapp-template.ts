import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface CreateTemplateData {
  name: string;
  description: string;
  type: "car" | "lead";
  template_content: string;
  is_shared?: boolean;
}

export const useCreateWhatsappTemplate = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (templateData: CreateTemplateData) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      const { data, error } = await supabase
        .from("whatsapp_templates" as any)
        .insert({
          user_id: user.id,
          name: templateData.name,
          description: templateData.description,
          type: templateData.type,
          template_content: templateData.template_content,
          is_default: false,
          is_shared: templateData.is_shared || false,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["whatsapp-templates"] });
      toast.success("התבנית נשמרה בהצלחה");
    },
    onError: (error) => {
      console.error("Error creating template:", error);
      toast.error("שגיאה בשמירת התבנית");
    },
  });
};
