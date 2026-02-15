
## תיקון שליחת וואטסאפ במסמכי לקוח

### הבעיה
הכתובת `api.whatsapp.com` חסומה בדפדפן (ERR_BLOCKED_BY_RESPONSE). צריך להחליף לפורמט `wa.me` שעובד בכל דפדפן.

### הפתרון
שינוי שורה אחת בקובץ `src/components/customers/CustomerDocuments.tsx`:

החלפת:
```
https://api.whatsapp.com/send?phone=...&text=...
```
ב:
```
https://wa.me/PHONE?text=...
```

בנוסף, שימוש ב-`window.location.href` במקום anchor element כדי לנווט ישירות ללא חסימת popup.

### היקף השינוי
- קובץ אחד בלבד: `src/components/customers/CustomerDocuments.tsx`
- פונקציית `handleSendWhatsApp` בלבד
- אין שינוי בשום מקום אחר במערכת
