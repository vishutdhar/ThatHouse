-- Check if columns were added to properties table
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'properties' 
AND column_name IN ('previous_price', 'price_changed_date', 'is_price_reduced');

-- Check if new tables were created
SELECT table_name 
FROM information_schema.tables 
WHERE table_name IN ('property_price_history', 'property_open_houses');

-- Check if the view was created
SELECT table_name 
FROM information_schema.views 
WHERE table_name = 'properties_with_open_houses';

-- Test by updating a property price (this should trigger the price tracking)
UPDATE properties 
SET price = price * 0.95  -- 5% reduction
WHERE id = (SELECT id FROM properties LIMIT 1);

-- Check if price history was created
SELECT * FROM property_price_history;

-- Check the property to see if it was marked as reduced
SELECT id, price, previous_price, is_price_reduced 
FROM properties 
WHERE is_price_reduced = true;