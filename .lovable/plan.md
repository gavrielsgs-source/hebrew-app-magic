

## תוכנית: חתימה דיגיטלית על הסכמי מכר

### למה זה בטוח ולא ישבור שום דבר

השינוי הוא **אדיטיבי בלבד** — לא משנים שום לוגיקה קיימת:

1. **ה-PDF נוצר בדיוק כמו היום** — רק מוסיפים `<img>` אופציונלי באזור החתימות
2. **אם אין חתימה** — הקו הריק נשאר כמו שהוא (fallback מובנה)
3. **ה-type `SalesAgreementData`** מקבל שדה אופציונלי בלבד (`signatures?`)
4. **אין ספריות חדשות** — Canvas API מובנה בדפדפן

### מה נבנה

**1. `SignaturePad.tsx`** — קומפוננטת canvas לציור חתימה
- Touch + mouse events
- כפתורי "נקה" ו"אישור"
- מחזיר base64 PNG

**2. `SignatureDialog.tsx`** — דיאלוג עם שני שדות חתימה (מוכר + קונה)

**3. עדכון `SalesAgreementData`** — הוספת `signatures?: { seller?: string; buyer?: string }` (אופציונלי)

**4. עדכון `sales-agreement-pdf.ts`** — בבלוק `.signatures` בסוף ה-HTML:
- אם יש חתימה → מציג `<img src="data:image/png;base64,...">` מעל הקו
- אם אין → משאיר את הקו הריק כמו היום

**5. עדכון `SalesAgreement.tsx`** — כפתור "חתום דיגיטלית" + state לחתימות

**6. עדכון `SalesAgreementPreview.tsx`** — הצגת חתימות בתצוגה מקדימה

### קבצים

| קובץ | סוג שינוי |
|-------|-----------|
| `src/components/signature/SignaturePad.tsx` | חדש |
| `src/components/signature/SignatureDialog.tsx` | חדש |
| `src/types/document-production.ts` | שדה אופציונלי |
| `src/utils/pdf/sales-agreement-pdf.ts` | תוספת `<img>` מותנית |
| `src/pages/SalesAgreement.tsx` | כפתור + state |
| `src/components/sales-agreement/SalesAgreementPreview.tsx` | הצגת חתימות |

