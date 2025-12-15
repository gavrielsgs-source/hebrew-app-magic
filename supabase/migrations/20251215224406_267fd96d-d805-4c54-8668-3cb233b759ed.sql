
-- Keep only ONE copy of each default template (the oldest one)
-- This will reduce from 216 to 12 default templates
DELETE FROM whatsapp_templates
WHERE is_default = true
AND id NOT IN (
  SELECT DISTINCT ON (name) id
  FROM whatsapp_templates
  WHERE is_default = true
  ORDER BY name, created_at ASC
);
