UPDATE public.open_format_doc_type_mappings
SET tax_authority_code = '100',
    description = 'הזמנה / הסכם מכר',
    notes = 'קוד תקני לפי רשות המיסים (פלט 2.6): הסכם מכר/הזמנה = 100'
WHERE internal_type = 'contract' AND tax_authority_code = '900';