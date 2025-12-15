-- Step 1: Delete all duplicates, keeping only the oldest template for each user+name combination
DELETE FROM whatsapp_templates
WHERE id NOT IN (
  SELECT DISTINCT ON (user_id, name) id
  FROM whatsapp_templates
  ORDER BY user_id, name, created_at ASC
);

-- Step 2: Clear facebook_template_name for non-default templates
UPDATE whatsapp_templates
SET facebook_template_name = NULL
WHERE is_default = false;