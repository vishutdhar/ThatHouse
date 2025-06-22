-- Security fixes for Supabase Security Advisor warnings

-- Fix 1: Update handle_new_user function with explicit search path
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.users (id, email, first_name, last_name)
    VALUES (
        NEW.id,
        NEW.email,
        NEW.raw_user_meta_data->>'first_name',
        NEW.raw_user_meta_data->>'last_name'
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public;

-- Fix 2: Update update_updated_at_column function with explicit search path
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql
SET search_path = public;

-- Fix 3: Add RLS policy for property_views table
-- Allow authenticated users to insert their own views
CREATE POLICY "Users can insert own property views" ON public.property_views
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Allow authenticated users to view their own property views
CREATE POLICY "Users can view own property views" ON public.property_views
    FOR SELECT USING (auth.uid() = user_id);

-- Allow anonymous users to insert views (for tracking before login)
CREATE POLICY "Anonymous users can insert property views" ON public.property_views
    FOR INSERT WITH CHECK (user_id IS NULL);

-- Note: For the auth warnings (Leaked Password Protection and MFA), you need to:
-- 1. Go to your Supabase dashboard
-- 2. Navigate to Authentication > Settings
-- 3. Enable "Leaked password protection"
-- 4. Enable MFA options (TOTP/SMS) under "Multi-Factor Authentication"