-- Create whatsapp_templates table
CREATE TABLE IF NOT EXISTS public.whatsapp_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  type TEXT CHECK (type IN ('car', 'lead')) NOT NULL,
  template_content TEXT NOT NULL,
  is_default BOOLEAN DEFAULT false,
  is_shared BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Enable RLS
ALTER TABLE public.whatsapp_templates ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own and shared company templates"
ON public.whatsapp_templates FOR SELECT
USING (
  auth.uid() = user_id 
  OR (is_shared = true AND company_id IN (
    SELECT company_id FROM public.user_roles WHERE user_id = auth.uid()
  ))
);

CREATE POLICY "Users can create their own templates"
ON public.whatsapp_templates FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own templates"
ON public.whatsapp_templates FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own non-default templates"
ON public.whatsapp_templates FOR DELETE
USING (auth.uid() = user_id AND is_default = false);

-- Indexes for performance
CREATE INDEX idx_whatsapp_templates_user_id ON public.whatsapp_templates(user_id);
CREATE INDEX idx_whatsapp_templates_company_id ON public.whatsapp_templates(company_id);
CREATE INDEX idx_whatsapp_templates_type ON public.whatsapp_templates(type);

-- Trigger for updated_at
CREATE TRIGGER update_whatsapp_templates_updated_at
BEFORE UPDATE ON public.whatsapp_templates
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Function to create default templates for new users
CREATE OR REPLACE FUNCTION public.create_default_whatsapp_templates()
RETURNS TRIGGER AS $$
BEGIN
  -- Default lead templates
  INSERT INTO public.whatsapp_templates (user_id, name, description, type, template_content, is_default)
  VALUES 
    (NEW.id, 'ברכת יום הולדת', 'הודעת ברכה ליום הולדת ללקוח', 'lead', 'היי {leadName}! 🎉 רציתי לאחל לך יום הולדת שמח! 🎂 אשמח להמשיך לעזור לך למצוא את הרכב המושלם.', true),
    (NEW.id, 'מעקב ראשוני', 'הודעת מעקב ראשונית ללקוח חדש', 'lead', 'שלום {leadName}, תודה שפנית אלינו! אשמח לעזור לך למצוא את הרכב המושלם. מתי נוח לך לשיחה קצרה?', true),
    (NEW.id, 'תזכורת לפגישה', 'תזכורת לפגישה מתוכננת', 'lead', 'היי {leadName}, רק רציתי להזכיר על הפגישה שלנו מחר. נתראה! 👋', true);
  
  -- Default car templates
  INSERT INTO public.whatsapp_templates (user_id, name, description, type, template_content, is_default)
  VALUES 
    (NEW.id, 'פרטי רכב', 'שליחת פרטי רכב ללקוח', 'car', 'היי! מצאתי רכב שעשוי לעניין אותך:\n🚗 {make} {model}\n📅 שנה: {year}\n💰 מחיר: ₪{price}\n🛣️ קילומטרז׳: {kilometers} ק״מ', true),
    (NEW.id, 'הזמנה למבחן דרכים', 'הזמנה ללקוח למבחן דרכים', 'car', 'שלום! ה-{make} {model} משנת {year} זמין למבחן דרכים. מתי נוח לך להגיע?', true);
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Trigger to create default templates when profile is created
CREATE TRIGGER create_user_default_templates
AFTER INSERT ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.create_default_whatsapp_templates();