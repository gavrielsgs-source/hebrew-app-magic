
import { Car } from "@/types/car";
import { CarFormValues } from "../car-form-schema";

export function createDefaultFormValues(car: Car): CarFormValues {
  console.log("createDefaultFormValues - Input car:", car);
  
  const defaultValues: CarFormValues = {
    make: car.make || "",
    model: car.model || "",
    trim_level: car.trim_level || "",
    year: car.year?.toString() || "",
    kilometers: car.kilometers?.toString() || "",
    price: car.price?.toString() || "",
    description: car.description || "",
    interior_color: car.interior_color || "",
    exterior_color: car.exterior_color || "",
    transmission: car.transmission || "",
    fuel_type: car.fuel_type || "",
    engine_size: car.engine_size || "",
    registration_year: car.registration_year?.toString() || "",
    last_test_date: car.last_test_date || "",
    ownership_history: car.ownership_history || "",
    agency_id: car.agency_id || "", // Convert null to empty string
    // New fields
    entry_date: car.entry_date || "",
    license_number: car.license_number || "",
    chassis_number: car.chassis_number || "",
    next_test_date: car.next_test_date || "",
  };

  console.log("createDefaultFormValues - Output defaultValues:", defaultValues);
  return defaultValues;
}
