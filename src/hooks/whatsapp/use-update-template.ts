import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface UpdateTemplateData {
  id: string;
  name?: string;
  description?: string;
  type?: 'car' | 'lead';
  template_content?: string;
  is_shared?: boolean;
}

export function useUpdateTemplate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...data }: UpdateTemplateData) => {
      const { data: template, error } = await supabase
        .from('whatsapp_templates')
        .update(data)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating template:', error);
        throw error;
      }

      return template;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['whatsapp-templates'] });
      toast.success('התבנית עודכנה בהצלחה');
    },
    onError: (error) => {
      console.error('Error updating template:', error);
      toast.error('שגיאה בעדכון התבנית');
    },
  });
}
