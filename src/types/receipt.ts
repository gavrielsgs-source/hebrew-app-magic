export interface ReceiptPayment {
  id: string;
  type: 'cash' | 'check' | 'credit_card' | 'bank_transfer' | 'other' | 'tax_deduction' | 'vehicle';
  amount: number;
  date: string;
  reference?: string;
  // For check
  checkNumber?: string;
  bankName?: string;
  // For credit card
  lastFourDigits?: string;
  // For bank transfer
  bankBranch?: string;
  accountNumber?: string;
  // For vehicle
  vehicleDetails?: string;
}

export interface ReceiptData {
  // Header Information
  receiptNumber: string;
  date: string;
  branch: string;
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
  };

  // Customer Information
  customer: {
    name: string;
    address: string;
    hp: string;
    phone: string;
  };

  // Receipt for type
  receiptForType: 'none' | 'tax_invoice' | 'receipt_cancellation';

  // Original invoice reference (if receiptForType is 'tax_invoice')
  originalInvoice?: {
    id: string;
    invoiceNumber: string;
    date: string;
    totalAmount: number;
  };

  // Payments by type
  payments: ReceiptPayment[];

  // Totals per payment type
  totals: {
    cash: number;
    check: number;
    creditCard: number;
    bankTransfer: number;
    other: number;
    taxDeduction: number;
    vehicle: number;
    totalWithTaxDeduction: number;
    grandTotal: number;
  };

  // Additional
  notes?: string;

  // Relations
  leadId?: string;
  carId?: string;
  customerId?: string;
}
