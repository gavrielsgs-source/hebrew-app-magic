
-- Remove duplicate RLS policies from leads table (keep "Users can view/create/update/delete their own leads")
DROP POLICY IF EXISTS "Enable users to view their leads" ON public.leads;
DROP POLICY IF EXISTS "User can select their own leads" ON public.leads;
DROP POLICY IF EXISTS "Enable users to insert their leads" ON public.leads;
DROP POLICY IF EXISTS "User can insert their own leads" ON public.leads;
DROP POLICY IF EXISTS "Enable users to update their leads" ON public.leads;
DROP POLICY IF EXISTS "User can update their own leads" ON public.leads;
DROP POLICY IF EXISTS "Enable users to delete their leads" ON public.leads;
DROP POLICY IF EXISTS "User can delete their own leads" ON public.leads;

-- Remove duplicate RLS policies from cars table (keep role-based + "User can select/insert/update/delete their own cars")
DROP POLICY IF EXISTS "Users can view their own cars" ON public.cars;
DROP POLICY IF EXISTS "Users can create their own cars" ON public.cars;
DROP POLICY IF EXISTS "Users can update their own cars" ON public.cars;
DROP POLICY IF EXISTS "Users can delete their own cars" ON public.cars;

-- Remove duplicate RLS policies from tasks table (keep role-based + "User can select/insert/update/delete their own tasks")
DROP POLICY IF EXISTS "Users can create their own tasks" ON public.tasks;
DROP POLICY IF EXISTS "Users can update their own tasks" ON public.tasks;
DROP POLICY IF EXISTS "Users can delete their own tasks" ON public.tasks;

-- Remove duplicate RLS policies from documents table
DROP POLICY IF EXISTS "Users can insert their own documents" ON public.documents;
DROP POLICY IF EXISTS "Users can view their own documents" ON public.documents;

-- Remove duplicate RLS policies from profiles table (keep "User can see/update/insert/delete own profile" + public inventory)
DROP POLICY IF EXISTS "User can select their own profile" ON public.profiles;
DROP POLICY IF EXISTS "User can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "משתמשים יכולים ליצור את הפרופיל של" ON public.profiles;
DROP POLICY IF EXISTS "משתמשים יכולים למחוק את הפרופיל של" ON public.profiles;
DROP POLICY IF EXISTS "משתמשים יכולים לעדכן את הפרופיל של" ON public.profiles;
DROP POLICY IF EXISTS "משתמשים יכולים לצפות בפרופיל שלהם" ON public.profiles;

-- Remove duplicate RLS policies from facebook_leads table
DROP POLICY IF EXISTS "insert_own_leads" ON public.facebook_leads;
