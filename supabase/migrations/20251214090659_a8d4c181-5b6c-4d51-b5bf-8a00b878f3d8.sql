-- Insert default templates for all existing users
INSERT INTO public.whatsapp_templates (user_id, name, description, type, template_content, is_default, facebook_template_name)
SELECT 
  u.id,
  t.name,
  t.description,
  t.type,
  t.template_content,
  true,
  t.facebook_template_name
FROM auth.users u
CROSS JOIN (
  VALUES 
    ('ברכת יום הולדת', 'הודעת ברכה ליום הולדת ללקוח', 'lead', 'היי {leadName}! 🎉 רציתי לאחל לך יום הולדת שמח! 🎂 אשמח להמשיך לעזור לך למצוא את הרכב המושלם.', NULL),
    ('מעקב ראשוני', 'הודעת מעקב ראשונית ללקוח חדש', 'lead', 'שלום {leadName}, תודה שפנית אלינו! אשמח לעזור לך למצוא את הרכב המושלם. מתי נוח לך לשיחה קצרה?', NULL),
    ('תזכורת לפגישה', 'תזכורת לפגישה מתוכננת', 'lead', 'היי {leadName}, רק רציתי להזכיר על הפגישה שלנו מחר. נתראה! 👋', NULL),
    ('הכרות עם לקוח פוטנציאלי', 'הודעת היכרות ראשונית עם לקוח שפנה אלינו', 'lead', 'היי {{leadName}} ! 👋

קיבלנו את הפנייה שלך {{leadSource}} וראינו שאתה מתעניין ברכב.

מתי תהיה זמין ל{{CTA}}? 📞

נשמח לעזור לך למצוא בדיוק מה שמתאים לך!

בברכה,
צוות המכירות', 'potential_customer'),
    ('פרטי רכב', 'שליחת פרטי רכב ללקוח', 'car', 'היי! מצאתי רכב שעשוי לעניין אותך:
🚗 {make} {model}
📅 שנה: {year}
💰 מחיר: ₪{price}
🛣️ קילומטרז׳: {kilometers} ק״מ', NULL),
    ('הזמנה למבחן דרכים', 'הזמנה ללקוח למבחן דרכים', 'car', 'שלום! ה-{make} {model} משנת {year} זמין למבחן דרכים. מתי נוח לך להגיע?', NULL)
) AS t(name, description, type, template_content, facebook_template_name)
ON CONFLICT DO NOTHING;