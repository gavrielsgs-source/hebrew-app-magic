
export interface WhatsappTemplate {
  id: string;
  name: string;
  description: string;
  type: 'car';
  usesCta: boolean;
  generateMessage: (carName: string, car: any, cta?: string) => string;
  templateContent?: string;
  facebookTemplateName?: string;
}

export const whatsappTemplates: WhatsappTemplate[] = [
  {
    id: "car_template",
    name: "תבנית רכב מלאה",
    description: "תבנית מפורטת עם כל פרטי הרכב והקונטקט",
    type: 'car' as const,
    usesCta: true,
    facebookTemplateName: "car_template",
    templateContent: `שלום לקוח יקר! 👋

רציתי לשתף אותך בפרטים על הרכב הזה:

*{{1}}*
💰 מחיר: ₪{{2}}
⚡ סוג דלק: {{3}}
📍 קילומטראז׳: {{4}} ק"מ
⚙️ תיבת הילוכים: {{5}}

מעוניין {{7}}?
{{6}}

בברכה,
צוות המכירות`,
    generateMessage: (carName, car, cta = 'לתאם צפייה') => {
      const phone = car.contactPhone || '';
      return `שלום לקוח יקר! 👋

רציתי לשתף אותך בפרטים על הרכב הזה:

*${carName}*
💰 מחיר: ₪${car.price ? car.price.toLocaleString() : '0'}
⚡ סוג דלק: ${car.fuel_type || 'לא צוין'}
📍 קילומטראז׳: ${car.mileage ? car.mileage.toLocaleString() : '0'} ק"מ
⚙️ תיבת הילוכים: ${car.transmission || 'לא צוין'}

מעוניין ${cta}?
${phone}

בברכה,
צוות המכירות`;
    }
  },
  {
    id: "basic_car_details",
    name: "פרטי רכב בסיסיים",
    description: "הודעה פשוטה עם פרטי הרכב העיקריים",
    type: 'car' as const,
    usesCta: true,
    templateContent: `שלום! 👋

רציתי לשתף אותך בפרטים על הרכב הזה:

🚗 *{{carName}}*
💰 מחיר: {{price}}
📏 קילומטר: {{mileage}}

מעוניין {{CTA}}?

בברכה,
צוות המכירות`,
    generateMessage: (carName, car, cta = 'לשמוע עוד פרטים או לתאם צפייה') => `שלום! 👋

רציתי לשתף אותך בפרטים על הרכב הזה:

🚗 *${carName}*
💰 מחיר: ${car.price ? `₪${car.price.toLocaleString()}` : 'בהתאם להצעה'}
📏 קילומטר: ${car.mileage ? `${car.mileage.toLocaleString()} ק"מ` : 'לא צוין'}

מעוניין ${cta}?

בברכה,
צוות המכירות`
  },
  {
    id: "extended_car_details",
    name: "מפרט מפורט",
    description: "הודעה מפורטת עם כל המפרטים הטכניים",
    type: 'car' as const,
    usesCta: true,
    templateContent: `🚗 *{{carName}}*

📋 *פרטים טכניים:*
💰 מחיר: {{price}}
📏 קילומטר: {{mileage}}
🎨 צבע: {{color}}
⚙️ נפח מנוע: {{engine}}
🔧 תיבת הילוכים: {{transmission}}
⛽ סוג דלק: {{fuel}}

האם תרצה {{CTA}}?

צוות המכירות 📞`,
    generateMessage: (carName, car, cta = 'לתאם נסיעת מבחן או יש שאלות נוספות') => `🚗 *${carName}*

📋 *פרטים טכניים:*
💰 מחיר: ${car.price ? `₪${car.price.toLocaleString()}` : 'בהתאם להצעה'}
📏 קילומטר: ${car.mileage ? `${car.mileage.toLocaleString()} ק"מ` : 'לא צוין'}
🎨 צבע: ${car.exterior_color || 'לא צוין'}
⚙️ נפח מנוע: ${car.engine_size || 'לא צוין'}
🔧 תיבת הילוכים: ${car.transmission || 'לא צוין'}
⛽ סוג דלק: ${car.fuel_type || 'לא צוין'}

האם תרצה ${cta}?

צוות המכירות 📞`
  },
  {
    id: "limited_offer_car",
    name: "הזדמנות לזמן מוגבל",
    description: "הודעה עם דחיפות למכירה מהירה",
    type: 'car' as const,
    usesCta: false,
    templateContent: `🔥 *הזדמנות לזמן מוגבל!* 🔥

🚗 {{carName}}
💰 מחיר מיוחד: {{price}}
📏 {{mileage}} ק"מ

⚡ *למה לחטוף עכשיו:*
✅ מחיר מוזל לתקופה קצרה  
✅ רכב באיכות גבוהה  
✅ אחריות מלאה  
✅ אפשרות למימון נוח

📞 התקשר עכשיו - הרכב לא יחכה!

בברכה,  
צוות המכירות`,
    generateMessage: (carName, car) => `🔥 *הזדמנות לזמן מוגבל!* 🔥

🚗 ${carName}
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
    id: "test_drive_car",
    name: "הזמנה לנסיעת מבחן",
    description: "הודעה המזמינה לנסיעת מבחן",
    type: 'car' as const,
    usesCta: false,
    templateContent: `שלום! 🚗

מעוניין לחוות נסיעה ב{{carName}}?

🔑 *נסיעת מבחן חינם:*  
📅 נוכל לתאם לך מועד נוח  
⏰ הנסיעה אורכת כ-30 דקות  
📍 ניתן לצאת ישירות מהמכירות שלנו

💰 מחיר: {{price}}  
📏 קילומטר: {{mileage}} ק"מ

מתי נוח לך להגיע? 📞

בברכה,  
צוות המכירות`,
    generateMessage: (carName, car) => `שלום! 🚗

מעוניין לחוות נסיעה ב${carName}?

🔑 *נסיעת מבחן חינם:*  
📅 נוכל לתאם לך מועד נוח  
⏰ הנסיעה אורכת כ-30 דקות  
📍 ניתן לצאת ישירות מהמכירות שלנו

💰 מחיר: ${car.price ? `₪${car.price.toLocaleString()}` : 'בהתאם להצעה'}  
📏 קילומטר: ${car.mileage ? `${car.mileage.toLocaleString()} ק"מ` : 'מצב מעולה'}

מתי נוח לך להגיע? 📞

בברכה,  
צוות המכירות`
  },
  {
    id: "new_contact",
    name: "יצירת קשר חדש",
    description: "הודעה חמה ופתוחה לפתיחת שיחה",
    type: 'car' as const,
    usesCta: true,
    templateContent: `שלום! 😊

איך שלומך? אני מהצוות שלנו ורציתי ליצור איתך קשר בנושא {{carName}}.

האם {{CTA}}?

נשמח לעזור לך למצוא בדיוק מה שמתאים לך! 🚗

בברכה,  
צוות המכירות`,
    generateMessage: (carName, car, cta = 'זה זמן נוח לשיחה קצרה על המכונית שאתה מחפש') => `שלום! 😊

איך שלומך? אני מהצוות שלנו ורציתי ליצור איתך קשר בנושא ${carName}.

האם ${cta}?

נשמח לעזור לך למצוא בדיוק מה שמתאים לך! 🚗

בברכה,  
צוות המכירות`
  },
  {
    id: "sales_team_reachout",
    name: "הצגה מקצועית",
    description: "הודעה עסקית ופרקטית",
    type: 'car' as const,
    usesCta: true,
    templateContent: `שלום,

אני פונה אליך מצוות המכירות של חברת הרכב שלנו בנושא {{carName}}.

נשמח לשמוע מה המפרט שאתה מחפש ולהציע לך את הפתרונות הטובים ביותר.

האם {{CTA}}?

בברכה,
צוות המכירות`,
    generateMessage: (carName, car, cta = 'נוח לך שנתקשר או שאתה מעדיף לתאם פגישה') => `שלום,

אני פונה אליך מצוות המכירות של חברת הרכב שלנו בנושא ${carName}.

נשמח לשמוע מה המפרט שאתה מחפש ולהציע לך את הפתרונות הטובים ביותר.

האם ${cta}?

בברכה,
צוות המכירות`
  },
  {
    id: "special_offer_notification",
    name: "הצעה מיוחדת",
    description: "הודעה עם דגש על מבצעים וייתרונות",
    type: 'car' as const,
    usesCta: true,
    templateContent: `שלום! 🎉

יש לנו חדשות נהדרות בשבילך!

{{carName}} - כרגע במבצע מיוחד! 🚗

🔹 מחירים מיוחדים לתקופה מוגבלת  
🔹 אחריות מורחבת  
🔹 אפשרות למימון נוח  
🔹 נסיעת מבחן ללא התחייבות

האם {{CTA}}?

בברכה,
צוות המכירות`,
    generateMessage: (carName, car, cta = 'תרצה לשמוע עוד פרטים או לתאם ביקור במכירות') => `שלום! 🎉

יש לנו חדשות נהדרות בשבילך!

${carName} - כרגע במבצע מיוחד! 🚗

🔹 מחירים מיוחדים לתקופה מוגבלת  
🔹 אחריות מורחבת  
🔹 אפשרות למימון נוח  
🔹 נסיעת מבחן ללא התחייבות

האם ${cta}?

בברכה,
צוות המכירות`
  },
  {
    id: "second_follow_up",
    name: "מעקב שני",
    description: "הודעה לטיפול בפנייה קיימת",
    type: 'car' as const,
    usesCta: true,
    templateContent: `שלום, 👋

אני חוזר אליך בנושא {{carName}}.

רציתי לוודא שקיבלת את כל המידע שחיפשת ולראות אם יש עוד שאלות או דברים שאוכל לעזור לך איתם.

האם {{CTA}}?

אני כאן לכל שאלה! 😊

בברכה,
צוות המכירות`,
    generateMessage: (carName, car, cta = 'יש מידע נוסף שמעניין אותך על הרכב הזה') => `שלום, 👋

אני חוזר אליך בנושא ${carName}.

רציתי לוודא שקיבלת את כל המידע שחיפשת ולראות אם יש עוד שאלות או דברים שאוכל לעזור לך איתם.

האם ${cta}?

אני כאן לכל שאלה! 😊

בברכה,
צוות המכירות`
  }
];
