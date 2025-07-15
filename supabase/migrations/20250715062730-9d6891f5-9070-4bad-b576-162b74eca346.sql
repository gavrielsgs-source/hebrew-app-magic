
-- מחיקת מדיניות RLS מיותרת שדורשת תפקידים
DROP POLICY IF EXISTS "User can insert leads based on role" ON public.leads;
DROP POLICY IF EXISTS "User can see leads based on role" ON public.leads;
DROP POLICY IF EXISTS "User can update leads based on role" ON public.leads;
DROP POLICY IF EXISTS "User can delete leads based on role" ON public.leads;

-- השארת רק המדיניות הבסיסית שמאפשרת למשתמש לעבוד עם הלידים שלו
-- הבדיקה שהמדיניות הנכונה קיימת
DO $$
BEGIN
    -- בדיקה אם המדיניות קיימת, אם לא - יצירתה
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'leads' 
        AND policyname = 'Users can view their own leads'
    ) THEN
        CREATE POLICY "Users can view their own leads" 
        ON public.leads 
        FOR SELECT 
        USING (auth.uid() = user_id);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'leads' 
        AND policyname = 'Users can create their own leads'
    ) THEN
        CREATE POLICY "Users can create their own leads" 
        ON public.leads 
        FOR INSERT 
        WITH CHECK (auth.uid() = user_id);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'leads' 
        AND policyname = 'Users can update their own leads'
    ) THEN
        CREATE POLICY "Users can update their own leads" 
        ON public.leads 
        FOR UPDATE 
        USING (auth.uid() = user_id);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'leads' 
        AND policyname = 'Users can delete their own leads'
    ) THEN
        CREATE POLICY "Users can delete their own leads" 
        ON public.leads 
        FOR DELETE 
        USING (auth.uid() = user_id);
    END IF;
END
$$;

-- ודאות שהשדה user_id לא nullable (זה חשוב לעבודה עם RLS)
ALTER TABLE public.leads ALTER COLUMN user_id SET NOT NULL;
