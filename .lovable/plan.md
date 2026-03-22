

## תוכנית: הוספת חשבוניות מס קבלה וחשבוניות זיכוי לדוח לרו"ח + סינון מסמכים מבוטלים

### מצב נוכחי
- הדוח שולף חשבוניות מס מטבלת `tax_invoices` (סעיף 4)
- חשבוניות מס קבלה (`tax_invoice_receipt`) וחשבוניות זיכוי (`tax_invoice_credit`) נשמרות בטבלת `customer_documents` אבל **לא נכללות כשורות עסקה ב-CSV**
- אין סינון של מסמכים מבוטלים (`status = 'cancelled'`) — מסמכים מבוטלים עדיין נכללים בדוח

### שינויים

#### קובץ: `supabase/functions/generate-accountant-report/index.ts`

**1. סינון מסמכים מבוטלים בכל השאילתות הקיימות**
- בשאילתת `tax_invoices` (סעיף 4) — הוספת `.neq("status", "cancelled")` (אם יש עמודת status)
- בשאילתת `customer_documents` (סעיף 6) — הוספת `.neq("status", "cancelled")` לסינון מסמכים מבוטלים מהקבצים המצורפים

**2. הוספת סעיף חדש: שליפת חשבוניות מס קבלה וחשבוניות זיכוי מ-`customer_documents`**
- שאילתה על `customer_documents` עם `type IN ('tax_invoice_receipt', 'tax_invoice_credit')` ו-`status != 'cancelled'`
- לכל חשבונית מס קבלה — יצירת שורת עסקה מסוג `tax_invoice_receipt` עם הסכום מ-`amount` וחישוב מע"מ (18%)
- לכל חשבונית זיכוי — יצירת שורת עסקה מסוג `tax_invoice_credit` עם הסכום כ**שלילי** (כי זה זיכוי/החזר)

**3. עדכון מיפוי סוגי עסקאות ב-CSV**
- הוספת `tax_invoice_receipt: "חשבונית מס קבלה"` ו-`tax_invoice_credit: "חשבונית זיכוי"` למילון `typeMap`

**4. עדכון חישוב הסיכומים**
- הוספת סיכום `totalTaxInvoiceReceipts` ו-`totalCredits` לסיכום הפיננסי
- חשבוניות זיכוי מפחיתות מהמכירות ברווח הנקי

#### קובץ: `src/types/accountant-report.ts`
- הוספת `'tax_invoice_receipt' | 'tax_invoice_credit'` ל-`transaction_type`

#### קובץ: `src/pages/AccountantReports.tsx`
- הצגת שורות סיכום חדשות בפאנל (חשבוניות מס קבלה, חשבוניות זיכוי) אם רלוונטי

### תוצאה
- חשבוניות מס קבלה וחשבוניות זיכוי מופיעות כשורות נפרדות ב-CSV
- מסמכים מבוטלים לא נכללים בדוח
- הסיכום הפיננסי מדויק יותר (זיכויים מקוזזים)

