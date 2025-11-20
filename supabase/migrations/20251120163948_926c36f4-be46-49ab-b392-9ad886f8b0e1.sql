-- מיזוג customer ל-lead בטבלת whatsapp_templates
UPDATE whatsapp_templates 
SET type = 'lead' 
WHERE type = 'customer';

-- עדכון ה-CHECK constraint אם קיים
ALTER TABLE whatsapp_templates 
DROP CONSTRAINT IF EXISTS whatsapp_templates_type_check;

ALTER TABLE whatsapp_templates 
ADD CONSTRAINT whatsapp_templates_type_check 
CHECK (type IN ('car', 'lead'));