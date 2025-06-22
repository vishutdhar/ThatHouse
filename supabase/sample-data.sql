-- Sample properties data for Nashville, TN
-- Note: You'll need to create a test user first through Supabase Auth

-- Insert sample properties
INSERT INTO public.properties (
    address, city, state, zip_code, price, bedrooms, bathrooms, 
    square_feet, year_built, property_type, description, features,
    latitude, longitude, days_on_market, status
) VALUES 
(
    '123 Broadway', 'Nashville', 'TN', '37203',
    450000, 3, 2.5, 2200, 2015, 'CONDO',
    'Modern downtown condo with skyline views',
    ARRAY['Granite Counters', 'Hardwood Floors', 'Balcony', 'Gym', 'Concierge'],
    36.1627, -86.7816, 5, 'ACTIVE'
),
(
    '456 Music Row', 'Nashville', 'TN', '37203',
    850000, 4, 3.5, 3500, 2018, 'SINGLE_FAMILY',
    'Stunning home in the heart of Music Row',
    ARRAY['Pool', 'Home Theater', 'Wine Cellar', 'Smart Home', 'Three Car Garage'],
    36.1494, -86.7919, 12, 'ACTIVE'
),
(
    '789 East Nashville Dr', 'Nashville', 'TN', '37206',
    325000, 2, 2, 1400, 1925, 'SINGLE_FAMILY',
    'Charming bungalow in trendy East Nashville',
    ARRAY['Original Hardwood', 'Updated Kitchen', 'Large Yard', 'Detached Garage'],
    36.1866, -86.7333, 3, 'ACTIVE'
),
(
    '321 Germantown Ave', 'Nashville', 'TN', '37207',
    575000, 3, 2.5, 2800, 2020, 'TOWNHOUSE',
    'New construction townhome with rooftop deck',
    ARRAY['Rooftop Deck', 'Modern Finishes', 'Walk to Restaurants', 'Two Car Garage'],
    36.1914, -86.7774, 8, 'ACTIVE'
),
(
    '654 Green Hills Blvd', 'Nashville', 'TN', '37215',
    1200000, 5, 4.5, 5200, 2012, 'SINGLE_FAMILY',
    'Luxury estate in prestigious Green Hills',
    ARRAY['Pool', 'Guest House', 'Home Gym', 'Wine Room', 'Four Car Garage'],
    36.1048, -86.8089, 20, 'ACTIVE'
),
(
    '987 12 South Ave', 'Nashville', 'TN', '37204',
    425000, 2, 1, 1100, 1940, 'SINGLE_FAMILY',
    'Adorable cottage in walkable 12 South neighborhood',
    ARRAY['Updated Throughout', 'Walkable', 'Fenced Yard', 'Original Charm'],
    36.1184, -86.7897, 2, 'ACTIVE'
),
(
    '246 Sylvan Park Ln', 'Nashville', 'TN', '37209',
    395000, 3, 2, 1800, 1955, 'SINGLE_FAMILY',
    'Mid-century home with modern updates',
    ARRAY['Open Floor Plan', 'Large Windows', 'Renovated Kitchen', 'Hardwood Floors'],
    36.1483, -86.8525, 15, 'ACTIVE'
),
(
    '135 Gulch St', 'Nashville', 'TN', '37203',
    650000, 2, 2.5, 1900, 2019, 'CONDO',
    'Luxury high-rise condo in The Gulch',
    ARRAY['City Views', 'Concierge', 'Fitness Center', 'Rooftop Pool', 'Valet Parking'],
    36.1526, -86.7863, 7, 'ACTIVE'
);

-- Insert sample property images (using placeholder URLs)
INSERT INTO public.property_images (property_id, image_url, display_order)
SELECT 
    p.id,
    'https://picsum.photos/800/600?random=' || generate_series || '&property=' || row_number() OVER (ORDER BY p.id),
    generate_series - 1
FROM 
    public.properties p,
    generate_series(1, 5)
WHERE 
    p.city = 'Nashville'
ORDER BY 
    p.id, generate_series;

-- Note: To test saved/rejected properties, you'll need to:
-- 1. Create a user account through Supabase Auth
-- 2. Get the user's ID
-- 3. Insert records into saved_properties or rejected_properties tables