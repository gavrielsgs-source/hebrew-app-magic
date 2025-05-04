
import { CarFormValues } from "../car-form-schema";

/**
 * Helper function to create default form values from a car object
 */
export function createDefaultFormValues(car: any): CarFormValues {
  return {
    make: car.make,
    model: car.model,
    year: car.year.toString(),
    kilometers: car.kilometers.toString(),
    price: car.price.toString(),
    description: car.description || "",
    interior_color: car.interior_color || "",
    exterior_color: car.exterior_color || "",
    transmission: car.transmission || "",
    fuel_type: car.fuel_type || "",
    engine_size: car.engine_size || "",
    registration_year: car.registration_year?.toString() || "",
    last_test_date: car.last_test_date || "",
    ownership_history: car.ownership_history || "",
    agency_id: car.agency_id,
  };
}
