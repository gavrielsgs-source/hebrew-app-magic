import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface WhatsappTemplate {
  id: string;
  user_id: string;
  company_id?: string;
  name: string;
  description?: string;
  type: 'car' | 'lead';
  template_content: string;
  is_default: boolean;
  is_shared: boolean;
  created_at: string;
  updated_at: string;
  generateMessage?: (data: any) => string;
}

export function useWhatsappTemplates(type?: 'car' | 'lead') {
  return useQuery({
    queryKey: ['whatsapp-templates', type],
    queryFn: async () => {
      let query = supabase
        .from('whatsapp_templates')
        .select('*')
        .order('created_at', { ascending: true });

      if (type) {
        query = query.eq('type', type);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching templates:', error);
        throw error;
      }

      // Add generateMessage function to each template
      return (data || []).map(template => ({
        ...template,
        generateMessage: (replacements: Record<string, any>) => {
          let message = template.template_content;
          Object.entries(replacements).forEach(([key, value]) => {
            message = message.replace(new RegExp(`{${key}}`, 'g'), String(value || ''));
          });
          return message;
        }
      })) as WhatsappTemplate[];
    },
  });
}
