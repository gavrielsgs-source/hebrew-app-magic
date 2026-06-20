ALTER TABLE public.leads DROP CONSTRAINT IF EXISTS leads_status_check;
ALTER TABLE public.leads ADD CONSTRAINT leads_status_check
  CHECK (status = ANY (ARRAY[
    'new','in_treatment','waiting','meeting_scheduled',
    'handled','not_relevant','no_answer','call_back',
    'searching_specific_car','deal_closed'
  ]));