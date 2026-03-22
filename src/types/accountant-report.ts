export interface AccountantReportTransaction {
  date: string;
  transaction_type: 'sale' | 'purchase' | 'expense' | 'tax_invoice' | 'payment' | 'tax_invoice_receipt' | 'tax_invoice_credit';
  description: string;
  car_make?: string;
  car_model?: string;
  car_year?: number;
  customer_name?: string;
  supplier_name?: string;
  expense_type?: string;
  amount: number;
  vat_amount: number;
  total_with_vat: number;
  invoice_number?: string;
  document_id?: string;
  notes?: string;
  payment_method?: string;
}

export interface GenerateReportRequest {
  startDate: string;
  endDate: string;
}

export interface ValidationError {
  type: 'missing_purchase_cost' | 'missing_invoice' | 'missing_expense_document' | 'invalid_data' | 'outstanding_balance';
  message: string;
  carId?: string;
  transactionId?: string;
  details?: string;
}

export interface FinancialSummary {
  totalSales: number;
  totalPurchases: number;
  totalExpenses: number;
  totalPayments: number;
  totalTaxInvoiceReceipts: number;
  totalCredits: number;
  grossProfit: number;
  totalVAT: number;
  netProfit: number;
  transactionCount: number;
  inventoryCount: number;
  inventoryValue: number;
  totalOutstanding: number;
}

export interface GenerateReportResponse {
  success: boolean;
  reportUrl?: string;
  summary: FinancialSummary;
  validationErrors: ValidationError[];
  generatedAt: string;
  period: {
    start: string;
    end: string;
  };
}
