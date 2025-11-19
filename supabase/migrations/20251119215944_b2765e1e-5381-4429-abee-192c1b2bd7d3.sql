-- מחיקת policies קיימים
DROP POLICY IF EXISTS "Users can view their own templates and defaults" ON public.whatsapp_templates;
DROP POLICY IF EXISTS "Users can create their own templates" ON public.whatsapp_templates;
DROP POLICY IF EXISTS "Users can update their own templates" ON public.whatsapp_templates;
DROP POLICY IF EXISTS "Users can delete their own templates" ON public.whatsapp_templates;
DROP POLICY IF EXISTS "Admins can manage all templates" ON public.whatsapp_templates;

-- הפעלת Row Level Security
ALTER TABLE public.whatsapp_templates ENABLE ROW LEVEL SECURITY;

-- משתמשים יכולים לצפות בתבניות שלהם, תבניות ברירת מחדל, ותבניות משותפות של החברה
CREATE POLICY "Users can view their own templates and defaults"
ON public.whatsapp_templates
FOR SELECT
TO authenticated
USING (
  auth.uid() = user_id OR
  is_default = true OR
  (is_shared = true AND company_id IS NOT NULL AND company_id IN (
    SELECT company_id FROM public.user_roles WHERE user_id = auth.uid()
  ))
);

-- משתמשים יכולים ליצור תבניות משלהם
CREATE POLICY "Users can create their own templates"
ON public.whatsapp_templates
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- משתמשים יכולים לעדכן רק תבניות שלהם (לא תבניות ברירת מחדל)
CREATE POLICY "Users can update their own templates"
ON public.whatsapp_templates
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id AND is_default = false);

-- משתמשים יכולים למחוק רק תבניות שלהם (לא תבניות ברירת מחדל)
CREATE POLICY "Users can delete their own templates"
ON public.whatsapp_templates
FOR DELETE
TO authenticated
USING (auth.uid() = user_id AND is_default = false);

-- אדמינים יכולים לנהל הכל
CREATE POLICY "Admins can manage all templates"
ON public.whatsapp_templates
FOR ALL
TO authenticated
USING (public.is_admin());