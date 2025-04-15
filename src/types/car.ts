
import type { Database } from "@/integrations/supabase/types";

export type Car = Database["public"]["Tables"]["cars"]["Row"];
export type NewCar = Omit<Car, "id" | "created_at" | "updated_at" | "user_id" | "features">;
