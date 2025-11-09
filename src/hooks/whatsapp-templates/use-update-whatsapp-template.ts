import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface UpdateTemplateData {
  id: string;
  name?: string;
  description?: string;
  template_content?: string;
  is_shared?: boolean;
}

export const useUpdateWhatsappTemplate = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: UpdateTemplateData) => {
      const { data, error } = await supabase
        .from("whatsapp_templates" as any)
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["whatsapp-templates"] });
      toast.success("התבנית עודכנה בהצלחה");
    },
    onError: (error) => {
      console.error("Error updating template:", error);
      toast.error("שגיאה בעדכון התבנית");
    },
  });
};
