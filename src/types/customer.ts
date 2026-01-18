export interface Customer {
  id: string;
  user_id: string;
  customer_number: number;
  full_name: string;
  id_number?: string;
  phone?: string;
  email?: string;
  address?: string;
  city?: string;
  country?: string;
  fax?: string;
  source?: string;
  join_date?: string;
  customer_type: 'private' | 'business';
  status: 'active' | 'inactive';
  credit_amount: number;
  created_at: string;
  updated_at: string;
}

export interface CustomerNote {
  id: string;
  customer_id: string;
  user_id: string;
  note: string;
  created_at: string;
}

export interface CustomerVehiclePurchase {
  id: string;
  customer_id: string;
  car_id: string;
  purchase_price?: number;
  purchase_date?: string;
  amount_paid?: number;
  created_at: string;
  car?: {
    make: string;
    model: string;
    year: number;
    license_number?: string;
  };
}

export interface CustomerVehicleSale {
  id: string;
  customer_id: string;
  car_id: string;
  sale_price?: number;
  sale_date?: string;
  created_at: string;
  car?: {
    make: string;
    model: string;
    year: number;
    license_number?: string;
  };
}

export interface CustomerDocument {
  id: string;
  customer_id: string;
  user_id: string;
  document_number: string;
  title: string;
  amount?: number;
  date?: string;
  type: string;
  status: 'draft' | 'sent' | 'signed' | 'cancelled';
  file_path?: string;
  created_at: string;
  updated_at: string;
}

export interface CustomerDocumentReturn {
  id: string;
  customer_document_id: string;
  file_path: string;
  uploaded_at: string;
  created_at: string;
}

export interface CustomerPayment {
  id: string;
  customer_id: string;
  purchase_id?: string;
  amount: number;
  payment_date: string;
  payment_method: 'cash' | 'credit' | 'transfer' | 'check';
  reference?: string;
  notes?: string;
  document_id?: string;
  user_id: string;
  created_at: string;
  purchase?: CustomerVehiclePurchase;
}

export interface CustomerBalance {
  totalPurchases: number;
  totalPayments: number;
  outstandingBalance: number;
  paymentPercentage: number;
}

export type CreateCustomerData = Omit<Customer, 'id' | 'user_id' | 'customer_number' | 'created_at' | 'updated_at'>;
export type UpdateCustomerData = Partial<CreateCustomerData>;
