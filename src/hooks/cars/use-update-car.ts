
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { NewCar } from "@/types/car";

/**
 * Hook for updating a car
 */
export function useUpdateCar() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...car }: NewCar & { id: string }) => {
      try {
        const { data: userData, error: userError } = await supabase.auth.getUser();
        if (userError || !userData.user) {
          throw userError || new Error("User not authenticated");
        }

        const updateData: Record<string, any> = {
          make: car.make,
          model: car.model,
          year: car.year,
          kilometers: car.kilometers,
          price: car.price,
          description: car.description || null,
          interior_color: car.interior_color || null,
          exterior_color: car.exterior_color || null,
          transmission: car.transmission || null,
          fuel_type: car.fuel_type || null,
          engine_size: car.engine_size || null,
          registration_year: car.registration_year || null,
          last_test_date: car.last_test_date || null,
          ownership_history: car.ownership_history || null,
          status: car.status || "available",
          agency_id: car.agency_id || null,
          entry_date: car.entry_date || null,
          license_number: car.license_number || null,
          chassis_number: car.chassis_number || null,
          next_test_date: car.next_test_date || null,
          updated_at: new Date().toISOString(),
        };

        // Add new wizard fields if provided
        if (car.car_type !== undefined) updateData.car_type = car.car_type || 'regular';
        if (car.owner_customer_id !== undefined) updateData.owner_customer_id = car.owner_customer_id || null;
        if (car.origin_type !== undefined) updateData.origin_type = car.origin_type || null;
        if (car.model_code !== undefined) updateData.model_code = car.model_code || null;
        if (car.engine_number !== undefined) updateData.engine_number = car.engine_number || null;
        if (car.vat_paid !== undefined) updateData.vat_paid = car.vat_paid || null;
        if (car.asking_price !== undefined) updateData.asking_price = car.asking_price || null;
        if (car.minimum_price !== undefined) updateData.minimum_price = car.minimum_price || null;
        if (car.list_price !== undefined) updateData.list_price = car.list_price || null;
        if (car.registration_fee !== undefined) updateData.registration_fee = car.registration_fee || null;
        if (car.is_pledged !== undefined) updateData.is_pledged = car.is_pledged;
        if (car.show_in_catalog !== undefined) updateData.show_in_catalog = car.show_in_catalog;
        if (car.dealer_price !== undefined) updateData.dealer_price = car.dealer_price || null;
        if (car.catalog_price !== undefined) updateData.catalog_price = car.catalog_price || null;
        if (car.purchase_cost !== undefined) updateData.purchase_cost = car.purchase_cost || null;
        if (car.purchase_date !== undefined) updateData.purchase_date = car.purchase_date || null;
        if (car.supplier_name !== undefined) updateData.supplier_name = car.supplier_name || null;

        const { data, error: carError } = await supabase
          .from("cars")
          .update(updateData)
          .eq('id', id)
          .select()
          .single();

        if (carError) throw carError;

        // Check for matching leads after successful car update
        if (data) {
          try {
            console.log('Checking lead matches for updated car:', data.make, data.model, data.year);
            
            let query = supabase
              .from('leads')
              .select('id, name, phone, interested_make, interested_model')
              .not('status', 'in', '(completed,cancelled)')
              .not('interested_make', 'is', null);

            query = query.ilike('interested_make', data.make);

            const { data: matchingLeads, error: matchError } = await query;

            if (!matchError && matchingLeads && matchingLeads.length > 0) {
              const filtered = matchingLeads.filter(lead => {
                const ld = lead as any;
                if (ld.interested_model && !data.model.toLowerCase().includes(ld.interested_model.toLowerCase())) return false;
                return true;
              });

              if (filtered.length > 0) {
                const leadIds = filtered.map(l => l.id);
                const { data: fullLeads } = await supabase
                  .from('leads')
                  .select('id, name, phone, interested_year_from, interested_year_to, interested_max_price, interested_max_km')
                  .in('id', leadIds);

                const finalMatches = (fullLeads || []).filter((lead: any) => {
                  if (lead.interested_year_from && data.year < lead.interested_year_from) return false;
                  if (lead.interested_year_to && data.year > lead.interested_year_to) return false;
                  if (lead.interested_max_price && data.price > lead.interested_max_price) return false;
                  if (lead.interested_max_km && data.kilometers > lead.interested_max_km) return false;
                  return true;
                });

                console.log(`Found ${finalMatches.length} matching leads for updated car`);

                // Dispatch custom event for prominent dialog
                const matchDetails = finalMatches.map((m: any) => ({
                  id: m.id,
                  name: m.name,
                  phone: m.phone,
                  carInfo: `${data.make} ${data.model} ${data.year}`,
                }));
                window.dispatchEvent(new CustomEvent('lead-match-found', { detail: matchDetails }));

                // Also save notifications to DB
                for (const match of finalMatches) {
                  await supabase.from('notifications').insert({
                    user_id: userData.user.id,
                    title: 'התאמת רכב לליד',
                    message: `הרכב ${data.make} ${data.model} ${data.year} תואם לדרישות של ${match.name}`,
                    type: 'lead_match',
                    entity_type: 'lead',
                    entity_id: match.id,
                  });
                }
              }
            }
          } catch (matchError) {
            console.error('Error checking lead matches:', matchError);
          }
        }

        // Handle image uploads if provided
        if (car.images && car.images.length > 0) {
          try {
            const { data: existingFiles } = await supabase.storage.from('cars').list(`${id}`);
            if (existingFiles && existingFiles.length > 0) {
              const filesToDelete = existingFiles.map(file => `${id}/${file.name}`);
              await supabase.storage.from('cars').remove(filesToDelete);
            }

            const uploadPromises = car.images.map(async (image, index) => {
              const fileExt = image.name.split('.').pop();
              const filePath = `${id}/${index}-${Date.now()}.${fileExt}`;
              const { error: uploadError } = await supabase.storage
                .from('cars')
                .upload(filePath, image, { cacheControl: '0', upsert: false });
              if (uploadError) return { success: false, error: uploadError, index };
              return { success: true, path: filePath, index };
            });
            
            const results = await Promise.all(uploadPromises);
            const failed = results.filter(r => !r.success);
            const succeeded = results.filter(r => r.success);
            if (failed.length > 0) toast.error(`${failed.length} תמונות לא הועלו בהצלחה`);
            if (succeeded.length > 0) toast.success(`${succeeded.length} תמונות הועלו בהצלחה`);
          } catch (imageError) {
            console.error("Error during image upload:", imageError);
            toast.error("שגיאה בהעלאת תמונות");
          }
        }

        return data;
      } catch (error) {
        console.error("Error updating car:", error);
        throw error;
      }
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["cars"] });
      queryClient.invalidateQueries({ queryKey: ["car-images"] });
      queryClient.invalidateQueries({ queryKey: ["customer"] });
      queryClient.invalidateQueries({ queryKey: ["documents", "car", variables.id] });
    },
    onError: (error) => {
      console.error("Car update mutation error:", error);
    }
  });
}
