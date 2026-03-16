

## Fix VAT Display in Document Production Pages

### Problem
In PriceQuote, NewCarOrder, TaxInvoice, and TaxInvoiceReceipt — when the VAT toggle is OFF, the VAT line is completely hidden from the financial summary. The user wants it to always show, displaying "מע"מ: ₪0" when VAT is off.

### Changes

**1. `src/pages/PriceQuote.tsx`**
- Mobile summary (~line 580): Change `{includeVAT && (` to always render the VAT row, showing `₪0` when off
- Desktop summary (~line 1020-1040): Same fix — find the conditional VAT display and make it always visible

**2. `src/pages/NewCarOrder.tsx`**  
- `FinancialSummaryCard` component (~line 296): Change `{includeVAT && (` to always render the VAT row

**3. `src/pages/TaxInvoice.tsx`**
- Already has per-item `includeVat` toggle. Need to verify the financial summary section always shows the VAT line (even when all items have `includeVat: false`). If it conditionally hides, fix it to always show.

**4. `src/pages/TaxInvoiceReceipt.tsx`**
- Same as TaxInvoice — per-item toggles. Verify the summary always shows the מע"מ row regardless of toggle states.

### The fix pattern (applied everywhere)
Replace:
```tsx
{includeVAT && (
  <div>מע"מ (18%): {formatPrice(vatAmount)}</div>
)}
```
With:
```tsx
<div>מע"מ (18%): {formatPrice(vatAmount)}</div>
```
Since `vatAmount` is already calculated as `0` when the toggle is off, the value will naturally show ₪0.

