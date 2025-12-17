-- Add supports_image_header field to whatsapp_templates
ALTER TABLE public.whatsapp_templates 
ADD COLUMN supports_image_header boolean DEFAULT false;

-- Update templates that support image headers
UPDATE public.whatsapp_templates 
SET supports_image_header = true 
WHERE facebook_template_name = 'basic_car_details';