import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface CreateTemplateData {
  name: string;
  description?: string;
  type: 'car' | 'lead';
  template_content: string;
  is_shared?: boolean;
  company_id?: string;
}

export function useCreateTemplate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateTemplateData) => {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('User not authenticated');
      }

      const { data: template, error } = await supabase
        .from('whatsapp_templates')
        .insert({
          ...data,
          user_id: user.id,
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating template:', error);
        throw error;
      }

      return template;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['whatsapp-templates'] });
      toast.success('התבנית נוצרה בהצלחה');
    },
    onError: (error) => {
      console.error('Error creating template:', error);
      toast.error('שגיאה ביצירת התבנית');
    },
  });
}
