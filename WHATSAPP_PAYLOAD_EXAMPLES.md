# WhatsApp Business API - Payload Examples

## תבניות WhatsApp שנוצרו

להלן דוגמאות ל-payloads לשליחה ל-WhatsApp Business API עבור כל אחת מהתבניות שיצרת.

### 1. Basic Car Details (פרטי רכב בסיסיים)

```json
{
  "messaging_product": "whatsapp",
  "to": "972534318411",
  "type": "template",
  "template": {
    "name": "basic_car_details",
    "language": {
      "code": "he"
    },
    "components": [
      {
        "type": "body",
        "parameters": [
          {
            "type": "text",
            "text": "טויוטה"
          },
          {
            "type": "text",
            "text": "קורולה"
          },
          {
            "type": "text",
            "text": "2020"
          },
          {
            "type": "text",
            "text": "₪85,000"
          },
          {
            "type": "text",
            "text": "45,000 ק״מ"
          }
        ]
      }
    ]
  }
}
```

### 2. Extended Car Details (מפרט מפורט)

```json
{
  "messaging_product": "whatsapp",
  "to": "972534318411",
  "type": "template",
  "template": {
    "name": "extended_car_details",
    "language": {
      "code": "he"
    },
    "components": [
      {
        "type": "body",
        "parameters": [
          {
            "type": "text",
            "text": "טויוטה"
          },
          {
            "type": "text",
            "text": "קורולה"
          },
          {
            "type": "text",
            "text": "2020"
          },
          {
            "type": "text",
            "text": "₪85,000"
          },
          {
            "type": "text",
            "text": "45,000 ק״מ"
          },
          {
            "type": "text",
            "text": "כסוף"
          },
          {
            "type": "text",
            "text": "1600cc"
          },
          {
            "type": "text",
            "text": "אוטומטית"
          },
          {
            "type": "text",
            "text": "בנזין"
          }
        ]
      }
    ]
  }
}
```

### 3. Limited Offer Car (הזדמנות לזמן מוגבל)

```json
{
  "messaging_product": "whatsapp",
  "to": "972534318411",
  "type": "template",
  "template": {
    "name": "limited_offer_car",
    "language": {
      "code": "he"
    },
    "components": [
      {
        "type": "body",
        "parameters": [
          {
            "type": "text",
            "text": "מאזדה"
          },
          {
            "type": "text",
            "text": "CX-5"
          },
          {
            "type": "text",
            "text": "2021"
          },
          {
            "type": "text",
            "text": "₪125,000"
          },
          {
            "type": "text",
            "text": "35,000"
          }
        ]
      }
    ]
  }
}
```

### 4. Test Drive Car (נסיעת מבחן)

```json
{
  "messaging_product": "whatsapp",
  "to": "972534318411",
  "type": "template",
  "template": {
    "name": "test_drive_car",
    "language": {
      "code": "he"
    },
    "components": [
      {
        "type": "body",
        "parameters": [
          {
            "type": "text",
            "text": "הונדה"
          },
          {
            "type": "text",
            "text": "סיוויק"
          },
          {
            "type": "text",
            "text": "2022"
          },
          {
            "type": "text",
            "text": "₪95,000"
          },
          {
            "type": "text",
            "text": "25,000"
          }
        ]
      }
    ]
  }
}
```

### 5. New Contact (יצירת קשר חדש)

```json
{
  "messaging_product": "whatsapp",
  "to": "972534318411",
  "type": "template",
  "template": {
    "name": "new_contact",
    "language": {
      "code": "he"
    },
    "components": [
      {
        "type": "body",
        "parameters": [
          {
            "type": "text",
            "text": "פולקסווגן"
          },
          {
            "type": "text",
            "text": "גולף"
          },
          {
            "type": "text",
            "text": "2019"
          }
        ]
      }
    ]
  }
}
```

### 6. Sales Team Reachout (הצגה מקצועית)

```json
{
  "messaging_product": "whatsapp",
  "to": "972534318411",
  "type": "template",
  "template": {
    "name": "sales_team_reachout",
    "language": {
      "code": "he"
    },
    "components": [
      {
        "type": "body",
        "parameters": [
          {
            "type": "text",
            "text": "ניסאן"
          },
          {
            "type": "text",
            "text": "אקס-טרייל"
          },
          {
            "type": "text",
            "text": "2021"
          }
        ]
      }
    ]
  }
}
```

### 7. Special Offer Notification (הצעה מיוחדת)

```json
{
  "messaging_product": "whatsapp",
  "to": "972534318411",
  "type": "template",
  "template": {
    "name": "special_offer_notification",
    "language": {
      "code": "he"
    },
    "components": [
      {
        "type": "body",
        "parameters": [
          {
            "type": "text",
            "text": "יונדאי"
          },
          {
            "type": "text",
            "text": "טוסון"
          },
          {
            "type": "text",
            "text": "2020"
          }
        ]
      }
    ]
  }
}
```

### 8. Second Follow Up (מעקב שני)

```json
{
  "messaging_product": "whatsapp",
  "to": "972534318411",
  "type": "template",
  "template": {
    "name": "second_follow_up",
    "language": {
      "code": "he"
    },
    "components": [
      {
        "type": "body",
        "parameters": [
          {
            "type": "text",
            "text": "קיה"
          },
          {
            "type": "text",
            "text": "ספורטאז'"
          },
          {
            "type": "text",
            "text": "2022"
          }
        ]
      }
    ]
  }
}
```

### 9. Potential Customer (לקוח פוטנציאלי)

```json
{
  "messaging_product": "whatsapp",
  "to": "972534318411",
  "type": "template",
  "template": {
    "name": "potential_customer",
    "language": {
      "code": "he"
    },
    "components": [
      {
        "type": "body",
        "parameters": [
          {
            "type": "text",
            "text": "יוסי"
          },
          {
            "type": "text",
            "text": " דרך פייסבוק"
          }
        ]
      }
    ]
  }
}
```

---

## איך להשתמש ב-Payloads האלה?

### 1. שליחה מה-Edge Function הקיים

המערכת כבר מכילה את ה-Edge Function `send-whatsapp-message`. תוכל לשלוח payload כזה:

```typescript
const { data, error } = await supabase.functions.invoke('send-whatsapp-message', {
  body: {
    to: "972534318411",
    type: "template",
    templateName: "basic_car_details",
    languageCode: "he",
    parameters: [
      "טויוטה",      // {{1}} - make
      "קורולה",      // {{2}} - model
      "2020",        // {{3}} - year
      "₪85,000",     // {{4}} - price
      "45,000 ק״מ"   // {{5}} - mileage
    ]
  }
});
```

### 2. שליחה ישירה ל-WhatsApp API

אם אתה רוצה לשלוח ישירות:

```bash
curl -X POST "https://graph.facebook.com/v21.0/734825146390804/messages" \
  -H "Authorization: Bearer YOUR_WHATSAPP_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "messaging_product": "whatsapp",
    "to": "972534318411",
    "type": "template",
    "template": {
      "name": "basic_car_details",
      "language": {
        "code": "he"
      },
      "components": [
        {
          "type": "body",
          "parameters": [
            {"type": "text", "text": "טויוטה"},
            {"type": "text", "text": "קורולה"},
            {"type": "text", "text": "2020"},
            {"type": "text", "text": "₪85,000"},
            {"type": "text", "text": "45,000 ק״מ"}
          ]
        }
      ]
    }
  }'
```

---

## שלבים נוספים נדרשים

### 1. רישום התבניות ב-WhatsApp Business Manager

כל תבנית חייבת להיות מאושרת על ידי Facebook לפני השימוש. עליך:

1. להיכנס ל-[WhatsApp Business Manager](https://business.facebook.com/wa/manage/message-templates/)
2. ליצור תבנית חדשה עבור כל אחת מהתבניות לעיל
3. להעתיק את התוכן המדויק מהשדה `templateContent` בקוד
4. להגדיר את המשתנים ({{1}}, {{2}}, וכו')
5. לשלוח לאישור
6. להמתין לאישור Facebook (בדרך כלל 1-24 שעות)

### 2. שימוש בתבניות מאושרות בלבד

**חשוב:** WhatsApp מאפשר לשלוח הודעות לשיחות פתוחות (24 שעות) בלבד. אם השיחה סגורה, אתה חייב להשתמש בתבניות מאושרות.

### 3. מעקב אחרי סטטוס ההודעות

ה-Edge Function הקיים (`send-whatsapp-message`) כבר מחזיר את סטטוס ההודעה:

```typescript
{
  "success": true,
  "data": {
    "messaging_product": "whatsapp",
    "contacts": [...],
    "messages": [
      {
        "id": "wamid.HBgLM...",
        "message_status": "accepted"
      }
    ]
  },
  "messageStatus": "accepted"
}
```

סטטוסים אפשריים:
- `accepted` - ההודעה התקבלה
- `sent` - ההודעה נשלחה
- `delivered` - ההודעה הגיעה ללקוח
- `read` - הלקוח קרא את ההודעה
- `failed` - ההודעה נכשלה

---

## טיפים לשימוש

1. **בדיקת פורמט מספר טלפון:** וודא שהמספר בפורמט `972XXXXXXXXX` (ללא +, ללא 0 בהתחלה)
2. **שמירה על 24 שעות:** אם הלקוח לא השיב תוך 24 שעות, תצטרך להשתמש בתבניות מאושרות בלבד
3. **משתנים:** כל משתנה ({{1}}, {{2}}, וכו') חייב לקבל ערך בשליחה
4. **שפה:** כרגע התבניות רק בעברית (`he`), תוכל להוסיף גרסאות באנגלית/ספרדית/פורטוגזית

---

## בדיקת התבניות

לאחר שהתבניות אושרו ב-Facebook, תוכל לבדוק אותן דרך המערכת:

1. פתח את דף ה-Leads
2. לחץ על WhatsApp ליד
3. בחר תבנית מהרשימה
4. המערכת תשלח את התבנית עם הנתונים המתאימים
