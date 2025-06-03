
export interface WhatsappTemplate {
  id: string;
  name: string;
  description: string;
  type: 'car';
  generateMessage: (car: any) => string;
}

export const whatsappTemplates: WhatsappTemplate[] = [
  {
    id: "car_details",
    name: "פרטי רכב בסיסיים",
    description: "הודעה פשוטה עם פרטי הרכב העיקריים",
    type: 'car' as const,
    generateMessage: (car) => `שלום! 👋

רציתי לשתף אותך בפרטים על הרכב הזה:

🚗 *${car.make} ${car.model} ${car.year}*
💰 מחיר: ${car.price ? `₪${car.price.toLocaleString()}` : 'בהתאם להצעה'}
📏 קילומטר: ${car.mileage ? `${car.mileage.toLocaleString()} ק"מ` : 'לא צוין'}

מעוניין לשמוע עוד פרטים או לתאם צפייה?

בברכה,
צוות המכירות`
  },
  {
    id: "detailed_specs",
    name: "מפרט מפורט",
    description: "הודעה מפורטת עם כל המפרטים הטכניים",
    type: 'car' as const,
    generateMessage: (car) => `🚗 *${car.make} ${car.model} ${car.year}*

📋 *פרטים טכניים:*
💰 מחיר: ${car.price ? `₪${car.price.toLocaleString()}` : 'בהתאם להצעה'}
📏 קילומטר: ${car.mileage ? `${car.mileage.toLocaleString()} ק"מ` : 'לא צוין'}
🎨 צבע: ${car.exterior_color || 'לא צוין'}
⚙️ נפח מנוע: ${car.engine_size || 'לא צוין'}
🔧 תיבת הילוכים: ${car.transmission || 'לא צוין'}
⛽ סוג דלק: ${car.fuel_type || 'לא צוין'}

${car.description ? `📝 *תיאור נוסף:*\n${car.description}\n\n` : ''}האם תרצה לתאם נסיעת מבחן או יש שאלות נוספות?

צוות המכירות 📞`
  },
  {
    id: "urgent_sale",
    name: "מכירה דחופה",
    description: "הודעה עם דחיפות למכירה מהירה",
    type: 'car' as const,
    generateMessage: (car) => `🔥 *הזדמנות לזמן מוגבל!* 🔥

🚗 ${car.make} ${car.model} ${car.year}
💰 מחיר מיוחד: ${car.price ? `₪${car.price.toLocaleString()}` : 'התקשר לפרטים'}
📏 ${car.mileage ? `${car.mileage.toLocaleString()} ק"מ` : 'מצב מעולה'}

⚡ *למה לחטוף עכשיו:*
✅ מחיר מוזל לתקופה קצרה
✅ רכב באיכות גבוהה
✅ אחריות מלאה
✅ אפשרות למימון נוח

📞 התקשר עכשיו - הרכב לא יחכה!

בברכה,
צוות המכירות`
  },
  {
    id: "test_drive_invitation",
    name: "הזמנה לנסיעת מבחן",
    description: "הודעה המזמינה לנסיעת מבחן",
    type: 'car' as const,
    generateMessage: (car) => `שלום! 🚗

מעוניין לחוות נסיעה ב${car.make} ${car.model} ${car.year}?

🔑 *נסיעת מבחן חינם:*
📅 נוכל לתאם לך מועד נוח
⏰ הנסיעה אורכת כ-30 דקות
📍 ניתן לצאת ישירות מהמכירות שלנו

💰 מחיר: ${car.price ? `₪${car.price.toLocaleString()}` : 'בהתאם להצעה'}
📏 קילומטר: ${car.mileage ? `${car.mileage.toLocaleString()} ק"מ` : 'מצב מעולה'}

מתי נוח לך להגיע? 📞

בברכה,
צוות המכירות`
  }
];
