-- Drop existing policies on whatsapp_templates
DROP POLICY IF EXISTS "Users can view their own templates" ON public.whatsapp_templates;
DROP POLICY IF EXISTS "Users can create their own templates" ON public.whatsapp_templates;
DROP POLICY IF EXISTS "Users can update their own templates" ON public.whatsapp_templates;
DROP POLICY IF EXISTS "Users can delete their own templates" ON public.whatsapp_templates;

-- Create new RLS policies that protect default templates

-- SELECT: Users can view their own templates OR default templates
CREATE POLICY "Users can view templates"
ON public.whatsapp_templates
FOR SELECT
USING (
  auth.uid() = user_id 
  OR is_default = true
);

-- INSERT: Users can only create non-default templates (admins can create default ones)
CREATE POLICY "Users can create non-default templates"
ON public.whatsapp_templates
FOR INSERT
WITH CHECK (
  auth.uid() = user_id 
  AND (is_default = false OR is_admin())
);

-- UPDATE: Users can only update their own non-default templates (admins can update any)
CREATE POLICY "Users can update non-default templates"
ON public.whatsapp_templates
FOR UPDATE
USING (
  (auth.uid() = user_id AND is_default = false)
  OR is_admin()
);

-- DELETE: Users can only delete their own non-default templates (admins can delete any)
CREATE POLICY "Users can delete non-default templates"
ON public.whatsapp_templates
FOR DELETE
USING (
  (auth.uid() = user_id AND is_default = false)
  OR is_admin()
);

-- Delete all existing default templates to restore them fresh
DELETE FROM public.whatsapp_templates WHERE is_default = true;

-- Update the trigger function to create proper default templates
CREATE OR REPLACE FUNCTION public.create_default_whatsapp_templates()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  -- Default lead templates
  INSERT INTO public.whatsapp_templates (user_id, name, description, type, template_content, is_default, facebook_template_name)
  VALUES 
    (NEW.id, 'ברכת יום הולדת', 'הודעת ברכה ליום הולדת ללקוח', 'lead', 'היי {leadName}! 🎉 רציתי לאחל לך יום הולדת שמח! 🎂 אשמח להמשיך לעזור לך למצוא את הרכב המושלם.', true, NULL),
    (NEW.id, 'מעקב ראשוני', 'הודעת מעקב ראשונית ללקוח חדש', 'lead', 'שלום {leadName}, תודה שפנית אלינו! אשמח לעזור לך למצוא את הרכב המושלם. מתי נוח לך לשיחה קצרה?', true, NULL),
    (NEW.id, 'תזכורת לפגישה', 'תזכורת לפגישה מתוכננת', 'lead', 'היי {leadName}, רק רציתי להזכיר על הפגישה שלנו מחר. נתראה! 👋', true, NULL),
    (NEW.id, 'הכרות עם לקוח פוטנציאלי', 'הודעת היכרות ראשונית עם לקוח שפנה אלינו', 'lead', 'היי {{leadName}} ! 👋

קיבלנו את הפנייה שלך {{leadSource}} וראינו שאתה מתעניין ברכב.

מתי תהיה זמין ל{{CTA}}? 📞

נשמח לעזור לך למצוא בדיוק מה שמתאים לך!

בברכה,
צוות המכירות', true, 'potential_customer');
  
  -- Default car templates
  INSERT INTO public.whatsapp_templates (user_id, name, description, type, template_content, is_default, facebook_template_name)
  VALUES 
    (NEW.id, 'פרטי רכב', 'שליחת פרטי רכב ללקוח', 'car', 'היי! מצאתי רכב שעשוי לעניין אותך:
🚗 {make} {model}
📅 שנה: {year}
💰 מחיר: ₪{price}
🛣️ קילומטרז׳: {kilometers} ק״מ', true, NULL),
    (NEW.id, 'הזמנה למבחן דרכים', 'הזמנה ללקוח למבחן דרכים', 'car', 'שלום! ה-{make} {model} משנת {year} זמין למבחן דרכים. מתי נוח לך להגיע?', true, NULL);
  
  RETURN NEW;
END;
$function$;
