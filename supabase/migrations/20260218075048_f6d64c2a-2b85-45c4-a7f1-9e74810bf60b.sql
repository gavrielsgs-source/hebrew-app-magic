
-- Delete in correct foreign key order
DELETE FROM public.tasks WHERE user_id = '4588e0ff-3cb1-40e6-b301-635da14d8e60';
DELETE FROM public.leads WHERE user_id = '4588e0ff-3cb1-40e6-b301-635da14d8e60';
DELETE FROM public.cars WHERE user_id = '4588e0ff-3cb1-40e6-b301-635da14d8e60';
DELETE FROM public.notifications WHERE user_id = '4588e0ff-3cb1-40e6-b301-635da14d8e60';
DELETE FROM public.whatsapp_templates WHERE user_id = '4588e0ff-3cb1-40e6-b301-635da14d8e60';
DELETE FROM public.subscriptions WHERE user_id = '4588e0ff-3cb1-40e6-b301-635da14d8e60';
DELETE FROM public.user_roles WHERE user_id = '4588e0ff-3cb1-40e6-b301-635da14d8e60';
DELETE FROM public.profiles WHERE id = '4588e0ff-3cb1-40e6-b301-635da14d8e60';
