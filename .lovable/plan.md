

## Investigation Results: Document Production PDF Save & Customer Page

### Findings

I checked all document production pages for two things:
1. Does the PDF get uploaded to cloud storage (so it appears on the customer page)?
2. Does the `publicUrl` get captured for the WhatsApp link?

| Page | Uploads PDF to Storage | Captures URL for WhatsApp | Appears on Customer Page |
|------|----------------------|--------------------------|------------------------|
| Tax Invoice | Yes | Yes | Yes |
| Tax Invoice Receipt | Yes | Yes | Yes |
| Tax Invoice Credit | Yes | Yes | Yes |
| Receipt | Yes | Yes | Yes |
| Sales Agreement | Yes | Yes | Yes |
| **Price Quote** | **Yes** | **No (bug)** | **Yes** |

### The One Bug Found

**PriceQuote.tsx (line 210)**: The `uploadDocument()` call does NOT capture the returned `publicUrl` into the `documentUrl` state. This means:
- The PDF **does** get uploaded and **will** appear on the customer page (entity_type/entity_id are passed correctly)
- But the WhatsApp message won't include the document link until the page is refreshed or the quote is re-generated

All other pages (Receipt, SalesAgreement, TaxInvoice, TaxInvoiceReceipt, TaxInvoiceCredit) correctly do:
```ts
const publicUrl = await uploadDocument({...});
if (publicUrl) setDocumentUrl(publicUrl);
```

### Plan

**Single fix in `src/pages/PriceQuote.tsx`** (lines 210-217):
- Capture the `publicUrl` returned from `uploadDocument()` and store it in `documentUrl` state, matching the pattern used in all other document pages.

