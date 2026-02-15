

## תיקון שליחת וואטסאפ - anchor element (קובץ CustomerDocuments.tsx בלבד)

### הבעיה
`window.location.href` מנווט את כל האפליקציה ל-wa.me, מה שגורם לדף שבור.

### הפתרון
בקובץ `src/components/customers/CustomerDocuments.tsx` בלבד, שורות 93-94, החלפת:

```
window.location.href = whatsappUrl;
```

ב:

```typescript
const a = document.createElement('a');
a.href = whatsappUrl;
a.target = '_blank';
a.rel = 'noopener noreferrer';
document.body.appendChild(a);
a.click();
document.body.removeChild(a);
```

### היקף השינוי
- קובץ אחד בלבד: `src/components/customers/CustomerDocuments.tsx`
- פונקציית `handleSendToWhatsApp` בלבד (שורות 93-94)
- אין נגיעה בשום קובץ אחר - לא ב-WhatsAppCustomerDialog, לא ב-CarCardActions, ולא בשום קומפוננטה אחרת הקשורה לוואטסאפ

### הערה חשובה
בסביבת ה-Preview של Lovable ייתכן שפתיחת טאב חדש עדיין תיחסם. מומלץ לבדוק מהאתר המפורסם (hebrew-app-magic.lovable.app).

