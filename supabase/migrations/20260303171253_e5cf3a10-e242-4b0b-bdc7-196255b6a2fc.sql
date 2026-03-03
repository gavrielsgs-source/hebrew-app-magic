
-- Only car_template actually has an image header registered in Meta
-- All other car templates do NOT have image headers
UPDATE public.whatsapp_templates 
SET supports_image_header = false 
WHERE is_default = true AND type = 'car' AND facebook_template_name != 'car_template';

-- Also update the trigger for future users
CREATE OR REPLACE FUNCTION public.create_default_whatsapp_templates()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  -- Car templates (9)
  INSERT INTO public.whatsapp_templates (user_id, name, description, type, template_content, is_default, facebook_template_name, supports_image_header)
  VALUES 
    (NEW.id, 'תבנית רכב מלאה', 'תבנית מפורטת עם כל פרטי הרכב והקונטקט', 'car', 'שלום לקוח יקר! 👋

רציתי לשתף אותך בפרטים על הרכב הזה:

*{{1}}*

💰 מחיר: ₪{{2}}

⚡ סוג דלק: {{3}}

📍 קילומטראז׳: {{4}} ק"מ

⚙️ תיבת הילוכים: {{5}}

מעוניין {{7}}?

{{6}}

בברכה,

צוות המכירות', true, 'car_template', true),
    (NEW.id, 'פרטי רכב בסיסיים', 'הודעה פשוטה עם פרטי הרכב העיקריים', 'car', 'שלום! 👋

רציתי לשתף אותך בפרטים על הרכב הזה:

🚗 *{{carName}}*
💰 מחיר: {{price}}
📏 קילומטר: {{mileage}}

מעוניין {{CTA}}?

בברכה,
צוות המכירות', true, 'basic_car_details', false),
    (NEW.id, 'מפרט מפורט', 'הודעה מפורטת עם כל המפרטים הטכניים', 'car', '🚗 *{{carName}}*

📋 *פרטים טכניים:*
💰 מחיר: {{price}}
📏 קילומטר: {{mileage}}
🎨 צבע: {{color}}
⚙️ נפח מנוע: {{engine}}
🔧 תיבת הילוכים: {{transmission}}
⛽ סוג דלק: {{fuel}}

האם תרצה {{CTA}}?

צוות המכירות 📞', true, 'extended_car_details', false),
    (NEW.id, 'הזדמנות לזמן מוגבל', 'הודעה עם דחיפות למכירה מהירה', 'car', '🔥 *הזדמנות לזמן מוגבל!* 🔥

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
צוות המכירות', true, 'limited_offer_car', false),
    (NEW.id, 'הזמנה לנסיעת מבחן', 'הודעה המזמינה לנסיעת מבחן', 'car', 'שלום! 🚗

מעוניין לחוות נסיעה ב{{carName}}?

🔑 *נסיעת מבחן חינם:*  
📅 נוכל לתאם לך מועד נוח  
⏰ הנסיעה אורכת כ-30 דקות  
📍 ניתן לצאת ישירות מהמכירות שלנו

💰 מחיר: {{price}}  
📏 קילומטר: {{mileage}} ק"מ

מתי נוח לך להגיע? 📞

בברכה,  
צוות המכירות', true, 'test_drive_car', false),
    (NEW.id, 'יצירת קשר חדש', 'הודעה חמה ופתוחה לפתיחת שיחה', 'car', 'שלום! 😊

איך שלומך? אני מהצוות שלנו ורציתי ליצור איתך קשר בנושא {{carName}}.

האם {{CTA}}?

נשמח לעזור לך למצוא בדיוק מה שמתאים לך! 🚗

בברכה,  
צוות המכירות', true, 'new_contact', false),
    (NEW.id, 'הצגה מקצועית', 'הודעה עסקית ופרקטית', 'car', 'שלום,

אני פונה אליך מצוות המכירות של חברת הרכב שלנו בנושא {{carName}}.

נשמח לשמוע מה המפרט שאתה מחפש ולהציע לך את הפתרונות הטובים ביותר.

האם {{CTA}}?

בברכה,
צוות המכירות', true, 'sales_team_reachout', false),
    (NEW.id, 'הצעה מיוחדת', 'הודעה עם דגש על מבצעים וייתרונות', 'car', 'שלום! 🎉

יש לנו חדשות נהדרות בשבילך!

{{carName}} - כרגע במבצע מיוחד! 🚗

🔹 מחירים מיוחדים לתקופה מוגבלת  
🔹 אחריות מורחבת  
🔹 אפשרות למימון נוח  
🔹 נסיעת מבחן ללא התחייבות

האם {{CTA}}?

בברכה,
צוות המכירות', true, 'special_offer_notification', false),
    (NEW.id, 'מעקב שני', 'הודעה לטיפול בפנייה קיימת', 'car', 'שלום, 👋

אני חוזר אליך בנושא {{carName}}.

רציתי לוודא שקיבלת את כל המידע שחיפשת ולראות אם יש עוד שאלות או דברים שאוכל לעזור לך איתם.

האם {{CTA}}?

אני כאן לכל שאלה! 😊

בברכה,
צוות המכירות', true, 'second_follow_up', false);
  
  -- Lead templates (3)
  INSERT INTO public.whatsapp_templates (user_id, name, description, type, template_content, is_default, facebook_template_name, supports_image_header)
  VALUES 
    (NEW.id, 'ברוכים הבאים - לקוח חדש', 'הודעת ברכה ללקוח שנוסף למערכת', 'lead', 'שלום {{customerName}}! 👋

קיבלנו את פנייתך 🙏 

צוות המכירות שלנו יחזור אליך בקרוב 😊', true, 'customer_welcome', false),
    (NEW.id, 'הכרות עם לקוח פוטנציאלי', 'הודעת היכרות ראשונית עם לקוח שפנה אלינו', 'lead', 'היי {{leadName}} ! 👋

קיבלנו את הפנייה שלך {{leadSource}} וראינו שאתה מתעניין ברכב.

מתי תהיה זמין ל{{CTA}}? 📞

נשמח לעזור לך למצוא בדיוק מה שמתאים לך!

בברכה,
צוות המכירות', true, 'potential_customer', false),
    (NEW.id, 'מעקב - פרטי רכב', 'הודעת מעקב לאחר שליחת פרטי רכב', 'lead', 'היי {{name}}! 👋  

רק רצינו לוודא שקיבלת את הפרטים על הרכב{{carDetails}} 🚗  
אם תרצה {{CTA}} - נשמח לעזור!

בברכה,
צוות המכירות', true, 'follow_up', false);
  
  RETURN NEW;
END;
$function$;
