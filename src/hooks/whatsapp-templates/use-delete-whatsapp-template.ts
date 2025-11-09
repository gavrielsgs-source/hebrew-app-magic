import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const useDeleteWhatsappTemplate = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (templateId: string) => {
      const { error } = await supabase
        .from("whatsapp_templates" as any)
        .delete()
        .eq("id", templateId);

      if (error) throw error;
      return templateId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["whatsapp-templates"] });
      toast.success("התבנית נמחקה בהצלחה");
    },
    onError: (error) => {
      console.error("Error deleting template:", error);
      toast.error("שגיאה במחיקת התבנית");
    },
  });
};
