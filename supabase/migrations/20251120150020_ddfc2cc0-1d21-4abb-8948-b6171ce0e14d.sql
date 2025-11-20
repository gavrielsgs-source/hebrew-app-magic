-- Add facebook_template_name column to whatsapp_templates table
ALTER TABLE whatsapp_templates 
ADD COLUMN facebook_template_name text;

-- Add comment explaining the column
COMMENT ON COLUMN whatsapp_templates.facebook_template_name IS 'The official template name registered in WhatsApp Business API (Meta)';

-- Example: Update default templates with their Facebook API names
-- Users will need to set these according to their approved templates in Meta Business Manager
UPDATE whatsapp_templates 
SET facebook_template_name = CASE 
  WHEN name = 'פרטי רכב בסיסיים' THEN 'basic_car_details'
  WHEN name = 'מפרט מפורט' THEN 'extended_car_details'
  WHEN name = 'הזדמנות לזמן מוגבל' THEN 'limited_offer_car'
  WHEN name = 'הזמנה לנסיעת מבחן' THEN 'test_drive_car'
  WHEN name = 'יצירת קשר חדש' THEN 'new_contact'
  WHEN name = 'הצגה מקצועית' THEN 'sales_team_reachout'
  WHEN name = 'הצעה מיוחדת' THEN 'special_offer_notification'
  WHEN name = 'מעקב שני' THEN 'second_follow_up'
  ELSE NULL
END
WHERE type = 'car';