export interface DocumentType {
  id: string;
  name: string;
  icon: string;
  category: 'invoice' | 'receipt' | 'contract' | 'delivery' | 'quote';
  beta?: boolean;
}

export const DOCUMENT_TYPES: DocumentType[] = [
  // חשבונית מס הוסרה מכאן כי היא מטופלת בנפרד בתפריט
  { id: 'tax-invoice-receipt', name: 'חשבונית מס קבלה', icon: 'FileText', category: 'invoice' },
  { id: 'tax-invoice-credit', name: 'חשבונית מס זיכוי', icon: 'CreditCard', category: 'invoice' },
  { id: 'receipt', name: 'קבלה', icon: 'Receipt', category: 'receipt' },
  { id: 'purchase-invoice', name: 'חשבונית רכש', icon: 'ShoppingCart', category: 'invoice' },
  { id: 'purchase-invoice-credit', name: 'חשבונית רכש זיכוי', icon: 'RefreshCw', category: 'invoice' },
  { id: 'transaction-invoice', name: 'חשבונית עסקה', icon: 'Zap', category: 'invoice' },
  { id: 'purchase-delivery', name: 'תעודת משלוח רכש', icon: 'Truck', category: 'delivery' },
  { id: 'new-car-order', name: 'הזמנת רכב חדש', icon: 'Car', category: 'contract' },
  { id: 'price-quote', name: 'הצעת מחיר', icon: 'Calculator', category: 'quote' },
  { id: 'delivery-certificate', name: 'תעודת משלוח', icon: 'Package', category: 'delivery' },
  { id: 'sales-agreement', name: 'הסכם מכר', icon: 'FileCheck', category: 'contract' },
  { id: 'purchase-agreement', name: 'הסכם רכש', icon: 'FilePlus', category: 'contract' },
  { id: 'brokerage-agreement', name: 'הסכם תיווך', icon: 'Handshake', category: 'contract' },
  { id: 'disclosure-document', name: 'גילוי נאות', icon: 'Eye', category: 'contract' },
  { id: 'transaction-summary', name: 'סיכום עסקה', icon: 'CheckSquare', category: 'contract' },
];

export interface SalesAgreementData {
  date: string;
  seller: {
    company: string;
    id: string;
    phone: string;
    address: {
      street: string;
      city: string;
      country: string;
    };
  };
  buyer: {
    name: string;
    id: string;
    phone: string;
    address: string;
  };
  car: {
    make: string;
    model: string;
    licenseNumber: string;
    chassisNumber: string;
    year: number;
    mileage: number;
    hand: string;
    originality: string;
  };
  financial: {
    totalPrice: number;
    downPayment: number;
    remainingAmount?: number;
    paymentTerms: string;
    specialTerms: string;
  };
}

export interface NewCarOrderData {
  date: string;
  customer: {
    fullName: string;
    firstName: string;
    birthYear: string;
    idNumber: string;
    city: string;
    address: string;
  };
  items: Array<{
    id: string;
    description: string;
    netPrice: number;
    discount: number;
    quantity: number;
    finalPrice: number;
    route: string;
  }>;
  financial: {
    subtotal: number;
    discount: number;
    total: number;
  };
}

export interface PriceQuoteData {
  date: string;
  quoteNumber: string;
  customer: {
    fullName: string;
    firstName: string;
    phone?: string;
    email?: string;
    city: string;
    address: string;
  };
  items: Array<{
    id: string;
    description: string;
    unitPrice: number;
    quantity: number;
    discount: number;
    totalPrice: number;
    notes?: string;
  }>;
  validUntil: string;
  terms?: string;
  notes?: string;
  financial: {
    subtotal: number;
    totalDiscount: number;
    vat?: number;
    total: number;
  };
  includeVAT?: boolean;
}

export interface DocumentFormData {
  type: string;
  leadId?: string;
  carId?: string;
  customData: Record<string, any>;
}