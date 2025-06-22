-- Create a test user through Supabase Auth
-- Note: You'll need to use the Supabase Dashboard to create users
-- or implement a signup flow in your app

-- Once you've created a user through Supabase Auth, you can verify it exists:
SELECT * FROM auth.users;

-- The user profile should be automatically created in public.users table
SELECT * FROM public.users;

-- If you need to manually insert a user profile (after creating auth user):
-- INSERT INTO public.users (id, email, first_name, last_name, user_type)
-- VALUES (
--   'YOUR_USER_ID_FROM_AUTH_USERS',
--   'test@example.com',
--   'Test',
--   'User',
--   'BUYER'
-- );