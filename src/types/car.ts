
import type { Database } from "@/integrations/supabase/types";

export type Car = Database["public"]["Tables"]["cars"]["Row"];

// NewCar: required fields + all optional fields from the DB
type CarRow = Database["public"]["Tables"]["cars"]["Row"];
type RequiredCarFields = Pick<CarRow, "make" | "model" | "year" | "kilometers" | "price">;
type OptionalCarFields = Partial<Omit<CarRow, "id" | "created_at" | "updated_at" | "user_id" | "features" | "make" | "model" | "year" | "kilometers" | "price">>;

export type NewCar = RequiredCarFields & OptionalCarFields & {
  images?: File[];
};
