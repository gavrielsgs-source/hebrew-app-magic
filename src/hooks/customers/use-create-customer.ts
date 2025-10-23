import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";
import type { CreateCustomerData } from "@/types/customer";
import { formatPhoneForWhatsApp } from "@/utils/phone-utils";

interface CreateCustomerParams {
  customerData: CreateCustomerData;
  sendWelcomeMessage?: boolean;
}

export function useCreateCustomer() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ customerData, sendWelcomeMessage = false }: CreateCustomerParams) => {
      if (!user) throw new Error('User not authenticated');

      // Insert customer
      const { data, error } = await supabase
        .from('customers')
        .insert({
          ...customerData,
          user_id: user.id,
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating customer:', error);
        throw error;
      }

      // Send welcome message if requested and phone exists
      if (sendWelcomeMessage && customerData.phone) {
        try {
          const formattedPhone = formatPhoneForWhatsApp(customerData.phone);
          
          if (formattedPhone) {
            const { data: whatsappResponse, error: whatsappError } = await supabase.functions.invoke('send-whatsapp-message', {
              body: {
                to: formattedPhone,
                type: 'text',
                message: `היי ${customerData.full_name}! 👋

ברוך הבא למשפחת הלקוחות שלנו! 🎉

קיבלנו את הפרטים שלך${customerData.source && customerData.source !== 'ידני' ? ` דרך ${customerData.source}` : ''} ואנחנו מוכנים לעזור לך למצוא את הרכב המושלם!

מתי תהיה זמין לשיחת ייעוץ קצרה? 📞

נשמח לעזור לך למצוא בדיוק מה שמתאים לך!

בברכה,
צוות המכירות`
              }
            });

            if (whatsappError) {
              console.error('Error sending WhatsApp message:', whatsappError);
              toast.warning('הלקוח נוצר בהצלחה אך לא ניתן היה לשלוח הודעת ברכה');
            } else {
              const messageStatus = whatsappResponse?.messageStatus || 'unknown';
              console.log('WhatsApp message status:', messageStatus);
              
              if (messageStatus === 'failed' || messageStatus === 'undelivered') {
                toast.warning('הלקוח נוצר בהצלחה אך ההודעה לא נשלחה - ייתכן שהלקוח לא יצר קשר עם הבוט ב-24 השעות האחרונות');
              } else {
                toast.success('לקוח נוצר והודעת ברכה נשלחה בהצלחה');
              }
            }
          }
        } catch (whatsappError) {
          console.error('Error sending WhatsApp message:', whatsappError);
        }
      }

      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      // Only show success toast if we didn't send welcome message (otherwise it was already shown)
      if (!variables.sendWelcomeMessage) {
        toast.success('לקוח נוצר בהצלחה');
      }
    },
    onError: (error) => {
      console.error('Error creating customer:', error);
      toast.error('שגיאה ביצירת לקוח');
    },
  });
}