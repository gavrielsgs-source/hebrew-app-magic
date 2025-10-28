
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { formatPhoneForWhatsApp } from "@/utils/phone-utils";
import { toast } from "sonner";

export const useCreateLead = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ leadData, sendWhatsApp = false }: { leadData: any; sendWhatsApp?: boolean }) => {
      const newLead = leadData;
      console.log('🔍 [useCreateLead] Creating lead with data:', newLead);
      
      if (!user) throw new Error('User not authenticated');
      
      // Convert phone to WhatsApp format (972XXXXXXXXX)
      const formattedPhone = newLead.phone ? formatPhoneForWhatsApp(newLead.phone) : null;
      
      // Convert empty strings to null for UUID fields to prevent database errors
      const cleanedLead = {
        ...newLead,
        name: newLead.name?.trim() || null, // Clean and validate name
        phone: formattedPhone,
        car_id: newLead.car_id === "" ? null : newLead.car_id,
        assigned_to: newLead.assigned_to === "" ? null : newLead.assigned_to,
        agency_id: newLead.agency_id === "" ? null : newLead.agency_id,
        // Also clean other optional fields
        email: newLead.email === "" ? null : newLead.email,
        notes: newLead.notes === "" ? null : newLead.notes,
        source: newLead.source === "" ? "ידני" : newLead.source, // Default source
      };

      console.log('🔍 [useCreateLead] Cleaned lead data:', cleanedLead);

      // Create lead
      const { data: createdLead, error: leadError } = await supabase.from("leads").insert([cleanedLead]).select();
      
      if (leadError) {
        console.error("🔍 [useCreateLead] Database error:", leadError);
        throw new Error(leadError.message);
      }

      console.log('🔍 [useCreateLead] Lead created successfully:', createdLead);

      // Send welcome WhatsApp message
      if (sendWhatsApp && formattedPhone && cleanedLead.name?.trim()) {
        try {
          console.log('📱 Attempting to send welcome WhatsApp message to:', formattedPhone, 'with name:', cleanedLead.name);
          const { data: whatsappData, error: whatsappError } = await supabase.functions.invoke('send-whatsapp-message', {
            body: {
              type: 'template',
              to: formattedPhone,
              templateName: 'welcome_message',
              languageCode: 'he',
              parameters: [cleanedLead.name.trim()]
            }
          });

          if (whatsappError) {
            console.error('❌ WhatsApp error:', whatsappError);
          } else {
            console.log('✅ Welcome WhatsApp message sent successfully:', whatsappData);
          }
        } catch (whatsappError) {
          console.error('❌ Failed to send welcome WhatsApp message:', whatsappError);
          // Don't throw error - continue with lead creation
        }
      } else {
        console.log('⚠️ Skipping WhatsApp message - missing phone or name:', { phone: formattedPhone, name: cleanedLead.name });
      }

      // Automatically create customer from lead data
      const customerData = {
        full_name: cleanedLead.name,
        phone: cleanedLead.phone,
        email: cleanedLead.email,
        source: cleanedLead.source,
        customer_type: 'private' as const,
        status: 'active' as const,
        credit_amount: 0,
      };

      // Check if customer with same phone or email already exists to prevent duplicates
      const { data: existingCustomer } = await supabase
        .from('customers')
        .select('id')
        .eq('user_id', user.id)
        .or(`phone.eq.${customerData.phone}${customerData.email ? `,email.eq.${customerData.email}` : ''}`)
        .maybeSingle();

      if (!existingCustomer && (customerData.phone || customerData.email)) {
        const { error: customerError } = await supabase
          .from('customers')
          .insert({
            ...customerData,
            user_id: user.id,
          });

        if (customerError) {
          console.error('🔍 [useCreateLead] Error creating customer:', customerError);
          // Don't throw error for customer creation failure, just log it
        } else {
          console.log('🔍 [useCreateLead] Customer created automatically from lead');
        }
      }
      
      console.log('🔍 [useCreateLead] Lead created successfully:', createdLead);
      return createdLead;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["leads"] });
      queryClient.invalidateQueries({ queryKey: ["customers"] });
      toast.success("הליד נוסף בהצלחה");
    },
    onError: (error) => {
      console.error("🔍 [useCreateLead] Mutation error:", error);
    }
  });
};
