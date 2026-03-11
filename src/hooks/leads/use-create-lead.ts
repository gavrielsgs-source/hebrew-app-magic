
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
        name: newLead.name?.trim() || null,
        phone: formattedPhone,
        car_id: newLead.car_id === "" ? null : newLead.car_id,
        assigned_to: newLead.assigned_to === "" ? null : newLead.assigned_to,
        agency_id: newLead.agency_id === "" ? null : newLead.agency_id,
        email: newLead.email === "" ? null : newLead.email,
        notes: newLead.notes === "" ? null : newLead.notes,
        source: newLead.source === "" ? "ידני" : newLead.source,
        interested_make: newLead.interested_make === "" ? null : newLead.interested_make || null,
        interested_model: newLead.interested_model === "" ? null : newLead.interested_model || null,
        interested_year_from: newLead.interested_year_from === "" ? null : newLead.interested_year_from || null,
        interested_year_to: newLead.interested_year_to === "" ? null : newLead.interested_year_to || null,
        interested_max_price: newLead.interested_max_price === "" ? null : newLead.interested_max_price || null,
        interested_max_km: newLead.interested_max_km === "" ? null : newLead.interested_max_km || null,
      };

      console.log('🔍 [useCreateLead] Cleaned lead data:', cleanedLead);

      // Create lead
      const { data: createdLead, error: leadError } = await supabase.from("leads").insert([cleanedLead]).select();
      
      if (leadError) {
        console.error("🔍 [useCreateLead] Database error:", leadError);
        throw new Error(leadError.message);
      }

      console.log('🔍 [useCreateLead] Lead created successfully:', createdLead);

      // Schedule automation messages
      try {
        const { data: automationSettings } = await supabase
          .from('automation_settings')
          .select('*')
          .eq('user_id', user.id)
          .maybeSingle();

        if (automationSettings && formattedPhone && cleanedLead.name?.trim()) {
          const now = new Date();
          const queueItems: any[] = [];

          // Queue welcome only if not sending immediately via sendWhatsApp flag
          if (automationSettings.welcome_enabled && !sendWhatsApp) {
            queueItems.push({
              user_id: user.id,
              lead_id: createdLead[0].id,
              automation_type: 'welcome',
              phone: formattedPhone,
              template_name: automationSettings.welcome_template || 'welcome_message',
              template_params: [cleanedLead.name.trim()],
              scheduled_for: new Date(now.getTime() + automationSettings.welcome_delay_minutes * 60 * 1000).toISOString(),
            });
          }

          if (automationSettings.followup1_enabled) {
            queueItems.push({
              user_id: user.id,
              lead_id: createdLead[0].id,
              automation_type: 'followup_1',
              phone: formattedPhone,
              template_name: automationSettings.followup1_template || 'lead_followup',
              template_params: [cleanedLead.name.trim()],
              scheduled_for: new Date(now.getTime() + automationSettings.followup1_delay_hours * 60 * 60 * 1000).toISOString(),
            });
          }

          if (automationSettings.followup2_enabled) {
            queueItems.push({
              user_id: user.id,
              lead_id: createdLead[0].id,
              automation_type: 'followup_2',
              phone: formattedPhone,
              template_name: automationSettings.followup2_template || 'lead_followup',
              template_params: [cleanedLead.name.trim()],
              scheduled_for: new Date(now.getTime() + automationSettings.followup2_delay_hours * 60 * 60 * 1000).toISOString(),
            });
          }

          if (queueItems.length > 0) {
            await supabase.from('automation_queue').insert(queueItems);
            console.log(`🤖 Queued ${queueItems.length} automation messages for lead`);
          }
        }
      } catch (automationErr) {
        console.error('Error scheduling automations:', automationErr);
        // Don't throw — lead was created successfully
      }

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
