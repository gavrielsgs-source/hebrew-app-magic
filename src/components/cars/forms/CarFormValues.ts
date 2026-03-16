
import { Car } from "@/types/car";
import { CarFormValues } from "../car-form-schema";

export function createDefaultFormValues(car: Car): CarFormValues {
  return {
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
    agency_id: car.agency_id || "",
    entry_date: car.entry_date || "",
    license_number: car.license_number || "",
    chassis_number: car.chassis_number || "",
    next_test_date: car.next_test_date || "",
    purchase_cost: car.purchase_cost?.toString() || "",
    purchase_date: car.purchase_date || "",
    supplier_name: car.supplier_name || "",
    // New wizard fields
    car_type: car.car_type || "regular",
    owner_customer_id: car.owner_customer_id || "",
    origin_type: car.origin_type || "",
    model_code: car.model_code || "",
    engine_number: car.engine_number || "",
    vat_paid: car.vat_paid?.toString() || "",
    asking_price: car.asking_price?.toString() || "",
    minimum_price: car.minimum_price?.toString() || "",
    list_price: car.list_price?.toString() || "",
    registration_fee: car.registration_fee?.toString() || "",
    is_pledged: car.is_pledged ? "true" : "false",
    show_in_catalog: car.show_in_catalog ? "true" : "false",
    dealer_price: car.dealer_price?.toString() || "",
    catalog_price: car.catalog_price?.toString() || "",
    purchase_source: (car as any).purchase_source || "",
  };
}
