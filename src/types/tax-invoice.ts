export interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  vatRate: number;
  total: number;
  includeVat: boolean;
}

export interface TaxInvoiceData {
  // Header Information
  invoiceNumber: string;
  date: string;
  title: string;
  currency: 'ILS' | 'USD';

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
    name: string;
    address: string;
    hp: string; // ח.פ / ת.ז
    phone: string;
  };

  // Items
  items: InvoiceItem[];

  // Financial Summary
  subtotal: number;
  vatAmount: number;
  totalAmount: number;

  // Additional Information
  notes?: string;
  paymentTerms?: string;

  // Relations
  leadId?: string;
  carId?: string;
}

export interface DocumentSequence {
  id: string;
  userId: string;
  documentType: string;
  currentNumber: number;
  prefix: string;
  createdAt: string;
  updatedAt: string;
}