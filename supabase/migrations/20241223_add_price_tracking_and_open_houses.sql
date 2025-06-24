-- Add price tracking columns to properties table
ALTER TABLE properties 
ADD COLUMN previous_price DECIMAL(10,2),
ADD COLUMN price_changed_date TIMESTAMP,
ADD COLUMN is_price_reduced BOOLEAN DEFAULT FALSE;

-- Create price history table
CREATE TABLE property_price_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id TEXT NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  date_changed TIMESTAMP NOT NULL DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW(),
  FOREIGN KEY (property_id) REFERENCES properties(id) ON DELETE CASCADE
);

-- Create open houses table
CREATE TABLE property_open_houses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id TEXT NOT NULL,
  start_time TIMESTAMP NOT NULL,
  end_time TIMESTAMP NOT NULL,
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  FOREIGN KEY (property_id) REFERENCES properties(id) ON DELETE CASCADE
);

-- Create indexes for better performance
CREATE INDEX idx_property_price_history_property_id ON property_price_history(property_id);
CREATE INDEX idx_property_price_history_date_changed ON property_price_history(date_changed);
CREATE INDEX idx_property_open_houses_property_id ON property_open_houses(property_id);
CREATE INDEX idx_property_open_houses_start_time ON property_open_houses(start_time);

-- Function to automatically track price changes
CREATE OR REPLACE FUNCTION track_price_change()
RETURNS TRIGGER AS $$
BEGIN
  -- If price has changed
  IF OLD.price IS DISTINCT FROM NEW.price THEN
    -- Insert into price history
    INSERT INTO property_price_history (property_id, price, date_changed)
    VALUES (NEW.id, NEW.price, NOW());
    
    -- Update price tracking fields
    NEW.previous_price = OLD.price;
    NEW.price_changed_date = NOW();
    NEW.is_price_reduced = NEW.price < OLD.price;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for price tracking
CREATE TRIGGER trigger_track_price_change
BEFORE UPDATE OF price ON properties
FOR EACH ROW
EXECUTE FUNCTION track_price_change();

-- Create view for properties with next open house
CREATE OR REPLACE VIEW properties_with_open_houses AS
SELECT 
  p.*,
  poh.start_time as next_open_house_start,
  poh.end_time as next_open_house_end,
  poh.notes as next_open_house_notes
FROM properties p
LEFT JOIN LATERAL (
  SELECT * 
  FROM property_open_houses 
  WHERE property_id = p.id 
    AND start_time > NOW()
  ORDER BY start_time ASC
  LIMIT 1
) poh ON TRUE;

-- Add RLS policies
ALTER TABLE property_price_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE property_open_houses ENABLE ROW LEVEL SECURITY;

-- Anyone can view price history and open houses
CREATE POLICY "Price history viewable by all" ON property_price_history
  FOR SELECT USING (true);

CREATE POLICY "Open houses viewable by all" ON property_open_houses
  FOR SELECT USING (true);

-- Only authenticated users can insert/update/delete
CREATE POLICY "Authenticated users can manage price history" ON property_price_history
  FOR ALL USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can manage open houses" ON property_open_houses
  FOR ALL USING (auth.uid() IS NOT NULL);