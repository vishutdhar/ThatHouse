-- First, let's check the structure of the properties table
SELECT 
    column_name, 
    data_type, 
    is_nullable
FROM 
    information_schema.columns
WHERE 
    table_name = 'properties'
    AND column_name = 'id';