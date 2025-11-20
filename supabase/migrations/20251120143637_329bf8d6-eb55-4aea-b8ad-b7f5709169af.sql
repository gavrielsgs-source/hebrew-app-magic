-- Update all car WhatsApp templates to use single {{carName}} variable
UPDATE whatsapp_templates 
SET 
  template_content = REPLACE(template_content, '{{make}} {{model}} {{year}}', '{{carName}}'),
  updated_at = now()
WHERE type = 'car' 
  AND (template_content LIKE '%{{make}}%' OR template_content LIKE '%{{model}}%' OR template_content LIKE '%{{year}}%');