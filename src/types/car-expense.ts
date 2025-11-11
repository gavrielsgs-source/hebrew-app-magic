export interface CarExpense {
  id: string;
  car_id: string;
  user_id: string;
  expense_date: string;
  expense_type: 'repair' | 'cleaning' | 'paint' | 'parts' | 'transport' | 'other';
  description: string;
  amount: number;
  include_vat: boolean;
  vat_rate: number;
  document_url?: string;
  invoice_number?: string;
  created_at: string;
  updated_at: string;
}

export interface NewCarExpense {
  car_id: string;
  expense_date: string;
  expense_type: string;
  description: string;
  amount: number;
  include_vat: boolean;
  vat_rate?: number;
  document?: File;
  invoice_number?: string;
}

export interface CarExpenseWithTotal extends CarExpense {
  total_with_vat: number;
}

export const EXPENSE_TYPES = [
  { value: 'repair', label: 'תיקון' },
  { value: 'cleaning', label: 'שטיפה וניקיון' },
  { value: 'paint', label: 'צביעה' },
  { value: 'parts', label: 'חלפים ואביזרים' },
  { value: 'transport', label: 'הובלה' },
  { value: 'other', label: 'אחר' },
] as const;
