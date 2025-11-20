-- עדכון תבנית car_template להיות דפולטיבית
UPDATE whatsapp_templates 
SET is_default = true 
WHERE facebook_template_name = 'car_template' AND type = 'car';