-- מחיקת תבנית customer follow_up
DELETE FROM whatsapp_templates WHERE id = 'e3b25825-508e-49e0-9657-539d8c56c0e2';

-- עדכון תבנית lead follow_up
UPDATE whatsapp_templates 
SET 
  name = 'מעקב - פרטי רכב',
  description = 'הודעת מעקב לאחר שליחת פרטי רכב',
  template_content = 'היי {{name}}! 👋  

רק רצינו לוודא שקיבלת את הפרטים על הרכב{{carDetails}} 🚗  
אם תרצה {{CTA}} - נשמח לעזור!

בברכה,
צוות המכירות',
  facebook_template_name = 'follow_up_car'
WHERE id = 'a46c3691-3bf5-4251-be58-55486498edb7';

-- הוספת תבנית car_template חדשה
INSERT INTO whatsapp_templates (name, description, type, template_content, facebook_template_name, is_default, user_id)
SELECT 
  'תבנית רכב מלאה',
  'תבנית מפורטת עם כל פרטי הרכב והקונטקט',
  'car',
  'שלום לקוח יקר! 👋

רציתי לשתף אותך בפרטים על הרכב הזה:

*{{1}}*
💰 מחיר: ₪{{2}}
⚡ סוג דלק: {{3}}
📍 קילומטראז׳: {{4}} ק"מ
⚙️ תיבת הילוכים: {{5}}

מעוניין {{7}}?
{{6}}

בברכה,
צוות המכירות',
  'car_template',
  false,
  user_id
FROM whatsapp_templates
WHERE type = 'car'
LIMIT 1;