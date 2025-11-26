-- עדכון התבנית potential_customer בטבלה עבור משתמשים קיימים
UPDATE whatsapp_templates 
SET template_content = 'היי {{leadName}} ! 👋

קיבלנו את הפנייה שלך {{leadSource}} וראינו שאתה מתעניין ברכב.

מתי תהיה זמין ל{{CTA}}? 📞

נשמח לעזור לך למצוא בדיוק מה שמתאים לך!

בברכה,
צוות המכירות'
WHERE name = 'הכרות עם לקוח פוטנציאלי' 
AND type = 'lead' 
AND is_default = true;

-- עדכון ה-trigger function למשתמשים חדשים
CREATE OR REPLACE FUNCTION public.create_default_whatsapp_templates()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  -- Default lead templates
  INSERT INTO public.whatsapp_templates (user_id, name, description, type, template_content, is_default)
  VALUES 
    (NEW.id, 'ברכת יום הולדת', 'הודעת ברכה ליום הולדת ללקוח', 'lead', 'היי {leadName}! 🎉 רציתי לאחל לך יום הולדת שמח! 🎂 אשמח להמשיך לעזור לך למצוא את הרכב המושלם.', true),
    (NEW.id, 'מעקב ראשוני', 'הודעת מעקב ראשונית ללקוח חדש', 'lead', 'שלום {leadName}, תודה שפנית אלינו! אשמח לעזור לך למצוא את הרכב המושלם. מתי נוח לך לשיחה קצרה?', true),
    (NEW.id, 'תזכורת לפגישה', 'תזכורת לפגישה מתוכננת', 'lead', 'היי {leadName}, רק רציתי להזכיר על הפגישה שלנו מחר. נתראה! 👋', true),
    (NEW.id, 'הכרות עם לקוח פוטנציאלי', 'הודעת היכרות ראשונית עם לקוח שפנה אלינו', 'lead', 'היי {{leadName}} ! 👋

קיבלנו את הפנייה שלך {{leadSource}} וראינו שאתה מתעניין ברכב.

מתי תהיה זמין ל{{CTA}}? 📞

נשמח לעזור לך למצוא בדיוק מה שמתאים לך!

בברכה,
צוות המכירות', true);
  
  -- Default car templates
  INSERT INTO public.whatsapp_templates (user_id, name, description, type, template_content, is_default)
  VALUES 
    (NEW.id, 'פרטי רכב', 'שליחת פרטי רכב ללקוח', 'car', 'היי! מצאתי רכב שעשוי לעניין אותך:
🚗 {make} {model}
📅 שנה: {year}
💰 מחיר: ₪{price}
🛣️ קילומטרז׳: {kilometers} ק״מ', true),
    (NEW.id, 'הזמנה למבחן דרכים', 'הזמנה ללקוח למבחן דרכים', 'car', 'שלום! ה-{make} {model} משנת {year} זמין למבחן דרכים. מתי נוח לך להגיע?', true);
  
  RETURN NEW;
END;
$function$;