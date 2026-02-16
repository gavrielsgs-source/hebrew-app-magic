export interface TaxInvoiceCreditData {
  // Header Information
  creditInvoiceNumber: string;
  date: string;
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
    name: string;
    address: string;
    hp: string;
    phone: string;
  };

  // Credit for (original invoice type)
  creditForType: 'tax_invoice' | 'tax_invoice_receipt';
  
  // Original invoice reference
  originalInvoice?: {
    id: string;
    invoiceNumber: string;
    date: string;
    totalAmount: number;
  };

  // Allocation number
  allocationMode: 'manual' | 'request';
  allocationNumber?: string;

  // Financial
  creditAmount: number;
  vatAmount: number;
  totalCreditAmount: number;

  // Additional
  notes?: string;

  // Relations
  leadId?: string;
  carId?: string;
  customerId?: string;
}

export interface OriginalInvoice {
  id: string;
  invoiceNumber: string;
  date: string;
  totalAmount: number;
  customerName: string;
  type: 'tax_invoice' | 'tax_invoice_receipt';
}
