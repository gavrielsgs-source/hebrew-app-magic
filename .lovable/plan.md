

## תיקון שליחת וואטסאפ - שימוש ב-window.location.href

### הבעיה
`window.open` נחסם בתוך ה-iframe של סביבת ה-Preview. זו הסיבה שזה לא עובד גם אחרי רענון.

### הפתרון
בקובץ `src/components/customers/CustomerDocuments.tsx`, שורה 94:

**מ:**
```
window.open(whatsappUrl, '_blank');
```

**ל:**
```
window.location.href = whatsappUrl;
```

זה מנווט ישירות לוואטסאפ בטאב הנוכחי במקום לנסות לפתוח טאב חדש. שיטה זו לא נחסמת על ידי iframe.

### היקף השינוי
- קובץ אחד: `src/components/customers/CustomerDocuments.tsx`
- שורה אחת בלבד (שורה 94)
- אין שינוי בשום מקום אחר

