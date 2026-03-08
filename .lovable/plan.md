

## Analysis: Accountant Report vs. Real Accounting Needs

### What the system CAN provide today (data exists in DB)

| Accountant Need | Data Source | Currently in Report? |
|---|---|---|
| **1. Sales invoices (חשבוניות מס)** | `tax_invoices` table (invoice_number, date, items, subtotal, vat_amount, total_amount, customer details) | Only IDs collected, **not included as transactions** |
| **2. Receipts (קבלות)** | `customer_payments` table (amount, payment_method, payment_date, reference) | **Not included at all** |
| **3. Sales agreements (הסכמי מכר)** | `customer_documents` (type='sales_agreement', amount, date, file_path) | **Not included** |
| **4. Vehicle sales** | `customer_vehicle_sales` (sale_price, sale_date + car + customer) | Yes |
| **5. Vehicle purchases** | `customer_vehicle_purchases` (purchase_price, purchase_date + car + customer) | Yes |
| **6. Car expenses** | `car_expenses` (amount, vat_rate, include_vat, expense_type, invoice_number, document_url) | Yes |
| **7. Inventory snapshot (ספירת מלאי)** | `cars` where status='available' (make, model, year, chassis_number, purchase_cost) | **Not included** |
| **8. Customer balances (חובות לקוחות)** | `customer_vehicle_purchases` + `customer_payments` (can calculate outstanding) | **Not included** |
| **9. PDF documents** | Storage bucket `documents` + `customer-documents` (file_path on expenses, invoices, agreements) | Collected but **not attached to ZIP** |
| **10. VAT rate** | Hardcoded 17% for sales/purchases | **Should be 18%** |

### What the system CANNOT provide (no data in DB)

- Import files (רשימוני יבוא, מכס) - no customs/import table
- Bank statements (דפי בנק) - external data
- Credit card statements - external data
- Bank balance confirmations - external data
- Fixed asset registry (טופס 1214) - no fixed assets table
- Supplier balances (חובות ספקים) - no supplier ledger

---

### Plan: Upgrade the Accountant Report

**Edge function changes** (`supabase/functions/generate-accountant-report/index.ts`):

1. **Fix VAT rate**: Change hardcoded `0.17` to `0.18` for sales and purchases

2. **Add tax invoices as transactions**: Query `tax_invoices` and add each as a transaction row with type `tax_invoice`, pulling invoice_number, customer_name, subtotal, vat_amount, total_amount

3. **Add receipts/payments**: Query `customer_payments` with customer join, add as transaction type `payment` with payment_method, reference, amount

4. **Add inventory snapshot**: Query `cars` where `status = 'available'` and `user_id = user.id`, generate a separate CSV sheet "inventory.csv" listing chassis_number, make, model, year, purchase_cost

5. **Add customer balances**: For each customer with purchases, calculate total_purchased - total_paid = outstanding balance. Generate "balances.csv" in the ZIP

6. **Attach PDF documents to ZIP**: Download actual PDFs from storage for expenses with `document_url` and for `customer_documents` in the period, include them in a `documents/` folder inside the ZIP

7. **Improve CSV structure**: Split into multiple CSV files in the ZIP:
   - `transactions.csv` - all transactions (sales, purchases, expenses, invoices, payments)
   - `inventory.csv` - inventory snapshot as of end date
   - `balances.csv` - customer outstanding balances
   - `summary.csv` - financial summary

8. **Add validation warnings** for: missing invoice numbers on sales, expenses without documents, customers with outstanding balances

**Type changes** (`src/types/accountant-report.ts`):
- Add new transaction types: `tax_invoice`, `payment`
- Add inventory and balance types to the response
- Update `FinancialSummary` to include totalPayments, inventoryValue, outstandingBalances

**Frontend changes** (`src/pages/AccountantReports.tsx`):
- Display new summary fields: total payments received, inventory value, outstanding customer balances
- Add note explaining what's included vs. what the accountant needs externally (bank statements, import files)

**No DB migrations needed** - all data already exists in current tables.

