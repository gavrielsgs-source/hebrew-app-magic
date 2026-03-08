

## Problem

When you produce a Sales Agreement from the production page, **two separate records** are created:
1. A record in the `documents` table — contains the **styled PDF** with a `file_path` in cloud storage
2. A record in `customer_documents` table — contains only **metadata** (title, amount, date) with **no file_path**

The customer profile page displays `customer_documents` records. When you click download, the code only searches the `documents` table for the styled PDF when the document status is `'attached'` (which applies to records from the `documents` table shown in the "attached" section). But the `customer_documents` records have status `'draft'` — so they skip the styled PDF lookup and fall through to the basic on-the-fly HTML generator, producing the ugly version you see in the screenshot.

## Solution

Modify `handleDownloadPDF` in `CustomerDocuments.tsx` to **always** search the `documents` table for a matching styled PDF before falling back to on-the-fly generation — regardless of the document's status.

### Changes

**`src/components/customers/CustomerDocuments.tsx`** — `handleDownloadPDF` function:

1. **Remove the `if (doc.status === 'attached')` guard** around the `documents` table lookup (lines 336-359)
2. **Search the `documents` table** for any record matching this customer that has a `file_path`, using multiple matching strategies:
   - Match by `entity_id = customerId` + `entity_type = 'customer'` + similar document type/name
   - Match by document name containing the type (e.g., "הסכם מכר" for contracts)
   - Fall back to matching by creation date proximity (within a few seconds)
3. If a styled PDF is found in `documents`, download it from the `documents` bucket
4. Only if no styled PDF exists, fall through to the existing priorities (file_path on the record itself, URL, on-the-fly generation)

This is a single function change in one file. The lookup becomes universal rather than conditional on status.

