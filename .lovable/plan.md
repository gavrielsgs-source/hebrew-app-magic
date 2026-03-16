

## ניהול מספור מסמכים מעמוד ניהול מנויים

### מה נבנה
כפתור "מספור" חדש בשורת הפעולות של כל מנוי בטבלה, שפותח דיאלוג המציג את כל רצפי המספור (`document_sequences`) של אותו משתמש ומאפשר לערוך את המספר הנוכחי של כל סוג מסמך.

### איך זה עובד
הטבלה `document_sequences` כבר קיימת במסד עם העמודות: `user_id`, `document_type`, `current_number`, `prefix`. כל משתמש יכול לייצר רשומות לסוגי מסמכים שונים (חשבונית מס, קבלה, הצעת מחיר וכו'). האדמין יוכל לראות ולשנות את `current_number` לכל סוג.

### קבצים

1. **`src/components/admin/DocumentSequencesDialog.tsx`** (חדש)
   - דיאלוג שמקבל `userId` ו-`userName`
   - טוען את כל הרשומות מ-`document_sequences` עבור אותו `user_id`
   - מציג טבלה: סוג מסמך | קידומת | מספר נוכחי | [שדה עריכה]
   - כפתור שמירה שמעדכן את `current_number` בכל רשומה שהשתנתה
   - אפשרות להוסיף רצף חדש (סוג מסמך + מספר התחלתי)

2. **`src/components/admin/SubscriptionTable.tsx`** (עריכה)
   - הוספת כפתור "מספור" (עם אייקון `Hash`) בשורת הפעולות של כל מנוי
   - state חדש ל-`sequencesDialogOpen`
   - רינדור של `DocumentSequencesDialog`

3. **`src/hooks/use-admin-subscriptions.ts`** (עריכה קלה)
   - הוספת mutation `updateDocumentSequence` שמעדכן `current_number` בטבלה ישירות

### מגבלת RLS
ל-`document_sequences` יש RLS שמגביל לבעלים בלבד. האדמין לא יוכל לערוך ישירות דרך ה-client. יש שתי אפשרויות:
- **אופציה א׳ (מומלץ)**: להוסיף מיגרציה קטנה שמוסיפה policy ל-admins: `is_admin()` על SELECT ו-UPDATE
- **אופציה ב׳**: ליצור RPC function עם `SECURITY DEFINER`

אמליץ על אופציה א׳ — מיגרציה פשוטה שמוסיפה שתי policies.

### מיגרציה
```sql
CREATE POLICY "Admins can view all document sequences"
  ON document_sequences FOR SELECT
  USING (is_admin());

CREATE POLICY "Admins can update all document sequences"
  ON document_sequences FOR UPDATE
  USING (is_admin());

CREATE POLICY "Admins can insert document sequences"
  ON document_sequences FOR INSERT
  WITH CHECK (is_admin());
```

### מיפוי שמות סוגי מסמכים בעברית
```text
tax_invoice      → חשבונית מס
receipt          → קבלה
tax_invoice_receipt → חשבונית מס קבלה
tax_invoice_credit → חשבונית מס זיכוי
price_quote      → הצעת מחיר
sales_agreement  → הסכם מכר
new_car_order    → הזמנת רכב חדש
customer_document → מסמך לקוח
```

### סיכום
שינוי קטן ומבודד — כפתור + דיאלוג + מיגרציה. לא משנה שום לוגיקה קיימת, רק מוסיף יכולת אדמין לצפות ולערוך מספור.

