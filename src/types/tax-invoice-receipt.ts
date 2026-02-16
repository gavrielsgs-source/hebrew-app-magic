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
  reference?: string;
  // Check-specific fields
  checkAccountNumber?: string;
  checkBranchNumber?: string;
  checkBankNumber?: string;
  checkNumber?: string;
  // Credit card fields
  lastFourDigits?: string;
  expiryDate?: string;
  cardType?: string;
  idNumber?: string;
  installments?: number;
  // Bank transfer fields
  bankAccountNumber?: string;
  bankBranchNumber?: string;
  bankNumber?: string;
  // Other
  paymentTypeName?: string;
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
    hp: string;
    phone: string;
    authorizedDealer: boolean;
    logoUrl?: string;
    companyType?: string;
  };

  // Customer Information
  customer: {
    type: 'new' | 'existing' | 'individual' | 'business';
    name: string;
    address: string;
    hp: string;
    phone: string;
  };

  // Items
  items: TaxInvoiceReceiptItem[];

  // Issue Number (optional)
  issueNumber?: string;

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
