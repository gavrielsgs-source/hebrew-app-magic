
import type { Database } from "@/integrations/supabase/types";

export type Car = Database["public"]["Tables"]["cars"]["Row"];
export type NewCar = Omit<Car, "id" | "created_at" | "updated_at" | "user_id" | "features"> & {
  images?: File[];
  description?: string | null;
  interior_color?: string | null;
  exterior_color?: string | null;
  transmission?: string | null;
  fuel_type?: string | null;
  engine_size?: string | null;
  registration_year?: number | null;
  last_test_date?: string | null;
  ownership_history?: string | null;
  status?: string | null;
  agency_id?: string | null;
  trim_level?: string | null;
  // New fields
  entry_date?: string | null;
  license_number?: string | null;
  chassis_number?: string | null;
  next_test_date?: string | null;
};
