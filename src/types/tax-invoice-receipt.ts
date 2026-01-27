export interface TaxInvoiceReceiptItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  vatRate: number;
  discount: number;
  includeVat: boolean;
  total: number;
}

export interface PaymentMethod {
  id: string;
  type: 'cash' | 'check' | 'credit_card' | 'bank_transfer' | 'other';
  amount: number;
  date: string;
  reference?: string; // מספר המחאה, 4 ספרות אחרונות של כרטיס וכו'
}

export interface TaxInvoiceReceiptData {
  // Header Information
  invoiceNumber: string;
  date: string;
  type: 'primary' | 'secondary';
  language: 'hebrew' | 'english';
  currency: 'ILS' | 'USD';
  title: string;

  // Company Information
  company: {
    name: string;
    address: string;
    hp: string; // חשבון פעילות
    phone: string;
    authorizedDealer: boolean;
    logoUrl?: string;
  };

  // Customer Information
  customer: {
    type: 'new' | 'existing' | 'individual' | 'business';
    name: string;
    address: string;
    hp: string; // ח.פ / ת.ז
    phone: string;
  };

  // Items
  items: TaxInvoiceReceiptItem[];

  // Issue Number
  issueNumber: string;

  // Payment Methods
  payments: PaymentMethod[];

  // Financial Summary
  subtotal: number;
  itemsWithoutVat: number;
  generalDiscount: number;
  amountAfterDiscount: number;
  vatAmount: number;
  totalAmount: number;

  // Additional Information
  lastPaymentDate?: string;
  notes?: string;

  // Relations
  leadId?: string;
  carId?: string;
}
