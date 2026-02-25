-- Add admin role for the existing admin user
INSERT INTO public.user_roles (user_id, role)
VALUES ('7c70fd91-cfcd-406d-a98d-de96edc5d9ae', 'admin')
ON CONFLICT DO NOTHING;