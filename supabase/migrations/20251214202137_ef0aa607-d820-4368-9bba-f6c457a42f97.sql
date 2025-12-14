-- First, set all templates to NOT default
UPDATE public.whatsapp_templates
SET is_default = false;

-- Then, set only the specific templates as default by name
UPDATE public.whatsapp_templates
SET is_default = true
WHERE name IN (
  'מעקב שני',
  'הצעה מיוחדת',
  'הצגה מקצועית',
  'יצירת קשר חדש',
  'הזמנה לנסיעת מבחן',
  'הזדמנות לזמן מוגבל',
  'מפרט מפורט',
  'מעקב - פרטי רכב',
  'ברוכים הבאים - לקוח חדש',
  'הכרות עם לקוח פוטנציאלי',
  'תבנית רכב מלאה',
  'פרטי רכב בסיסיים'
);