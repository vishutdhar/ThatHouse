-- Temporarily disable RLS for property import
-- Run this before importing SimplyRETS data

-- Disable RLS on properties and property_images
ALTER TABLE public.properties DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.property_images DISABLE ROW LEVEL SECURITY;

-- After import, re-enable with:
-- ALTER TABLE public.properties ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.property_images ENABLE ROW LEVEL SECURITY;