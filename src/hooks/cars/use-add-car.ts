
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { NewCar } from "@/types/car";

/**
 * Hook for adding a new car
 */
export function useAddCar() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (car: NewCar) => {
      try {
        const { data: userData, error: userError } = await supabase.auth.getUser();
        
        if (userError || !userData.user) {
          toast.error("לא ניתן להוסיף רכב", { description: "המשתמש אינו מחובר" });
          throw userError || new Error("User not authenticated");
        }

        const { data, error: carError } = await supabase
          .from("cars")
          .insert({
            make: car.make,
            model: car.model,
            trim_level: car.trim_level || null,
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
            status: "available",
            agency_id: car.agency_id || null,
            user_id: userData.user.id,
            entry_date: car.entry_date || null,
            license_number: car.license_number || null,
            chassis_number: car.chassis_number || null,
            next_test_date: car.next_test_date || null,
            // New wizard fields
            car_type: car.car_type || 'regular',
            owner_customer_id: car.owner_customer_id === "none" ? null : car.owner_customer_id || null,
            origin_type: car.origin_type || null,
            model_code: car.model_code || null,
            engine_number: car.engine_number || null,
            vat_paid: car.vat_paid || null,
            asking_price: car.asking_price || null,
            minimum_price: car.minimum_price || null,
            list_price: car.list_price || null,
            registration_fee: car.registration_fee || null,
            is_pledged: car.is_pledged || false,
            show_in_catalog: car.show_in_catalog !== undefined ? car.show_in_catalog : true,
            dealer_price: car.dealer_price || null,
            catalog_price: car.catalog_price || null,
            purchase_cost: car.purchase_cost || null,
            purchase_date: car.purchase_date || null,
            supplier_name: car.supplier_name || null,
          })
          .select()
          .single();

        if (carError) {
          toast.error("שגיאה בהוספת רכב", { description: carError.message });
          throw carError;
        }

        // Upload images in background
        if (car.images && car.images.length > 0 && data.id) {
          const carId = data.id;
          const uploadPromises = car.images.map(async (image, index) => {
            const fileExt = image.name.split('.').pop();
            const filePath = `${carId}/${index}-${Date.now()}.${fileExt}`;
            const { error: uploadError } = await supabase.storage
              .from('cars')
              .upload(filePath, image, { cacheControl: '3600', upsert: false });
            if (uploadError) {
              console.error(`Error uploading image ${index + 1}:`, uploadError);
              return { success: false, error: uploadError };
            }
            return { success: true, path: filePath };
          });
          
          Promise.all(uploadPromises).then((results) => {
            const failed = results.filter(r => !r.success).length;
            if (failed > 0) toast.error(`${failed} תמונות לא הועלו בהצלחה`);
          });
        }

        // Check for matching leads after successful car creation
        if (data) {
          try {
            let query = supabase
              .from('leads')
              .select('id, name, phone, interested_make, interested_model')
              .not('status', 'in', '(completed,cancelled)')
              .not('interested_make', 'is', null);

            // Filter by make (case-insensitive)
            query = query.ilike('interested_make', data.make);

            const { data: matchingLeads, error: matchError } = await query;

            if (!matchError && matchingLeads && matchingLeads.length > 0) {
              // Further filter in JS for optional fields
              const filtered = matchingLeads.filter(lead => {
                const ld = lead as any;
                if (ld.interested_model && !data.model.toLowerCase().includes(ld.interested_model.toLowerCase())) return false;
                return true;
              });

              // Check year/price/km via a second query per match isn't efficient,
              // so we do a broader query and filter client-side
              if (filtered.length > 0) {
                // Get full lead data for filtered leads
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

                // Create notifications for matches
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
            // Don't fail the car creation if matching fails
          }
        }

        return data;
      } catch (error) {
        console.error("Error adding car:", error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cars"] });
      toast.success("רכב נוסף בהצלחה");
    },
    onError: (error) => {
      console.error("Mutation error:", error);
      toast.error("שגיאה בהוספת רכב", {
        description: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });
}
