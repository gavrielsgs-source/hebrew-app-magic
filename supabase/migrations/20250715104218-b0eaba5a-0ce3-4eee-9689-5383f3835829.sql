
-- יצירת טבלה לניהול הרשאות אדמין
CREATE TABLE public.admin_emails (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- הוספת האימייל שלך כאדמין
INSERT INTO public.admin_emails (email) VALUES ('gavrielsgs@gmail.com');

-- יצירת פונקציה לבדיקה אם המשתמש הוא אדמין
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 
    FROM public.admin_emails 
    WHERE email = (
      SELECT email 
      FROM auth.users 
      WHERE id = auth.uid()
    )
  );
$$;

-- הוספת מדיניות RLS לטבלת admin_emails
ALTER TABLE public.admin_emails ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Only admins can manage admin emails"
ON public.admin_emails
FOR ALL
USING (public.is_admin());

-- עדכון מדיניות RLS לטבלת user_roles
DROP POLICY IF EXISTS "Admin can manage all user roles" ON public.user_roles;
CREATE POLICY "Admin can manage all user roles"
ON public.user_roles
FOR ALL
USING (public.is_admin());

-- מדיניות לכל המשתמשים לראות את התפקידים שלהם
CREATE POLICY "Users can view their own roles"
ON public.user_roles
FOR SELECT
USING (user_id = auth.uid());
