ALTER TABLE public.leads DROP CONSTRAINT IF EXISTS leads_status_check;
ALTER TABLE public.leads ADD CONSTRAINT leads_status_check
  CHECK (status = ANY (ARRAY[
    'new'::text,'in_treatment'::text,'waiting'::text,'meeting_scheduled'::text,
    'handled'::text,'not_relevant'::text,'no_answer'::text,'call_back'::text,'searching_specific_car'::text
  ]));