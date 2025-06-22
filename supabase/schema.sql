-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create users table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    first_name TEXT,
    last_name TEXT,
    user_type TEXT DEFAULT 'BUYER' CHECK (user_type IN ('BUYER', 'SELLER', 'AGENT')),
    phone TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create properties table
CREATE TABLE IF NOT EXISTS public.properties (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    address TEXT NOT NULL,
    city TEXT NOT NULL,
    state TEXT NOT NULL,
    zip_code TEXT NOT NULL,
    price INTEGER NOT NULL,
    bedrooms INTEGER NOT NULL,
    bathrooms DECIMAL NOT NULL,
    square_feet INTEGER NOT NULL,
    year_built INTEGER,
    property_type TEXT NOT NULL CHECK (property_type IN ('SINGLE_FAMILY', 'CONDO', 'TOWNHOUSE', 'MULTI_FAMILY')),
    description TEXT,
    features TEXT[] DEFAULT '{}',
    latitude DECIMAL NOT NULL,
    longitude DECIMAL NOT NULL,
    days_on_market INTEGER DEFAULT 0,
    status TEXT DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'PENDING', 'SOLD')),
    virtual_tour_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create property_images table
CREATE TABLE IF NOT EXISTS public.property_images (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    property_id UUID NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create saved_properties table
CREATE TABLE IF NOT EXISTS public.saved_properties (
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    property_id UUID NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
    saved_at TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY (user_id, property_id)
);

-- Create rejected_properties table
CREATE TABLE IF NOT EXISTS public.rejected_properties (
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    property_id UUID NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
    rejected_at TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY (user_id, property_id)
);

-- Create property_views table for analytics
CREATE TABLE IF NOT EXISTS public.property_views (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    property_id UUID NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
    viewed_at TIMESTAMPTZ DEFAULT NOW(),
    duration_seconds INTEGER
);

-- Create agents table
CREATE TABLE IF NOT EXISTS public.agents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    phone TEXT NOT NULL,
    email TEXT NOT NULL,
    agency TEXT,
    license_number TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create property_agents junction table
CREATE TABLE IF NOT EXISTS public.property_agents (
    property_id UUID NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
    agent_id UUID NOT NULL REFERENCES public.agents(id) ON DELETE CASCADE,
    is_listing_agent BOOLEAN DEFAULT true,
    PRIMARY KEY (property_id, agent_id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_properties_city ON public.properties(city);
CREATE INDEX IF NOT EXISTS idx_properties_price ON public.properties(price);
CREATE INDEX IF NOT EXISTS idx_properties_bedrooms ON public.properties(bedrooms);
CREATE INDEX IF NOT EXISTS idx_properties_status ON public.properties(status);
CREATE INDEX IF NOT EXISTS idx_properties_location ON public.properties(latitude, longitude);
CREATE INDEX IF NOT EXISTS idx_saved_properties_user ON public.saved_properties(user_id);
CREATE INDEX IF NOT EXISTS idx_rejected_properties_user ON public.rejected_properties(user_id);

-- Enable Row Level Security (RLS)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.property_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rejected_properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.property_views ENABLE ROW LEVEL SECURITY;

-- Create RLS Policies

-- Users can read their own profile
CREATE POLICY "Users can view own profile" ON public.users
    FOR SELECT USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile" ON public.users
    FOR UPDATE USING (auth.uid() = id);

-- Anyone can view active properties
CREATE POLICY "Anyone can view active properties" ON public.properties
    FOR SELECT USING (status = 'ACTIVE');

-- Anyone can view property images
CREATE POLICY "Anyone can view property images" ON public.property_images
    FOR SELECT USING (true);

-- Users can view their own saved properties
CREATE POLICY "Users can view own saved properties" ON public.saved_properties
    FOR SELECT USING (auth.uid() = user_id);

-- Users can insert their own saved properties
CREATE POLICY "Users can insert own saved properties" ON public.saved_properties
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can delete their own saved properties
CREATE POLICY "Users can delete own saved properties" ON public.saved_properties
    FOR DELETE USING (auth.uid() = user_id);

-- Users can view their own rejected properties
CREATE POLICY "Users can view own rejected properties" ON public.rejected_properties
    FOR SELECT USING (auth.uid() = user_id);

-- Users can insert their own rejected properties
CREATE POLICY "Users can insert own rejected properties" ON public.rejected_properties
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can delete their own rejected properties
CREATE POLICY "Users can delete own rejected properties" ON public.rejected_properties
    FOR DELETE USING (auth.uid() = user_id);

-- Create function to automatically create user profile on signup
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user signup
CREATE OR REPLACE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add updated_at triggers
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_properties_updated_at BEFORE UPDATE ON public.properties
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();