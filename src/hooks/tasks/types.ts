
// Task types and interfaces
export interface TaskFromDB {
  id: string;
  title: string;
  description?: string | null;
  status: string;
  priority: string;
  due_date?: string | null;
  car_id?: string | null;
  lead_id?: string | null;
  created_at: string;
  updated_at: string;
  user_id: string;
  cars: any; // Using any for simplicity, but ideally should be typed properly
  leads: any; // Using any for simplicity, but ideally should be typed properly
  type?: string | null; // Add optional type field
}

// Task interface with the additional type field
export interface Task extends TaskFromDB {
  type: string; // Make type non-optional with a default
}

export type NewTask = {
  title: string;
  description?: string | null;
  status: string;
  priority: string;
  type?: string | null; // Added type field as optional
  due_date?: string | null; // Using string for ISO dates
  car_id?: string | null;
  lead_id?: string | null;
  assigned_to?: string | null; // Add assigned_to field
  agency_id?: string | null; // Add agency_id field
};
