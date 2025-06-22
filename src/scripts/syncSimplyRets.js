// Script to sync SimplyRETS data to Supabase
// Run with: node src/scripts/syncSimplyRets.js

require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

// Import fetch for Node.js
async function loadFetch() {
  const module = await import('node-fetch');
  return module.default;
}

// Global fetch variable
let fetch;

// Initialize Supabase
const supabase = createClient(
  process.env.SUPABASE_URL || 'https://dtazuyrkfcuwteducwaw.supabase.co',
  process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR0YXp1eXJrZmN1d3RlZHVjd2F3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA2MjIyNjMsImV4cCI6MjA2NjE5ODI2M30.7-nviH_dAvgDfNtAvSXKdYc36no6XBvieDHEg5R27Gg'
);

// SimplyRETS configuration
const SIMPLYRETS_API_URL = 'https://api.simplyrets.com';
const SIMPLYRETS_AUTH = 'simplyrets:simplyrets';

// Map property type
const mapPropertyType = (type, subType) => {
  if (!type) return 'SINGLE_FAMILY';
  
  const typeMap = {
    'RES': 'SINGLE_FAMILY',
    'CND': 'CONDO',
    'MUL': 'MULTI_FAMILY',
    'RNT': 'SINGLE_FAMILY',
  };
  
  if (subType?.toLowerCase().includes('condo')) return 'CONDO';
  if (subType?.toLowerCase().includes('townhouse')) return 'TOWNHOUSE';
  
  return typeMap[type] || 'SINGLE_FAMILY';
};

// Transform SimplyRETS property
const transformProperty = (srProperty) => {
  const bathrooms = (srProperty.property?.bathsFull || 0) + 
                   (srProperty.property?.bathsHalf || 0) * 0.5;

  const features = [];
  if (srProperty.property?.pool) features.push('Pool');
  if (srProperty.property?.fireplaces) features.push('Fireplace');
  if (srProperty.property?.garageSpaces) features.push(`${srProperty.property.garageSpaces} Car Garage`);
  if (srProperty.property?.cooling) features.push(srProperty.property.cooling);
  if (srProperty.property?.heating) features.push(srProperty.property.heating);

  // Generate a deterministic UUID from the MLS ID
  const crypto = require('crypto');
  const namespace = '6ba7b810-9dad-11d1-80b4-00c04fd430c8'; // UUID v4 namespace
  const hash = crypto.createHash('sha1').update(namespace + srProperty.mlsId).digest();
  const uuid = [
    hash.toString('hex', 0, 4),
    hash.toString('hex', 4, 6),
    hash.toString('hex', 6, 8),
    hash.toString('hex', 8, 10),
    hash.toString('hex', 10, 16)
  ].join('-');

  return {
    id: uuid,
    address: srProperty.address?.full || 'No Address',
    city: srProperty.address?.city || 'Unknown',
    state: srProperty.address?.state || 'Unknown',
    zip_code: srProperty.address?.postalCode || '00000',
    price: srProperty.listPrice || 0,
    bedrooms: srProperty.property?.bedrooms || 0,
    bathrooms: bathrooms,
    square_feet: srProperty.property?.area || 0,
    year_built: srProperty.property?.yearBuilt || null,
    property_type: mapPropertyType(srProperty.property?.type, srProperty.property?.subType),
    description: srProperty.remarks || `Beautiful property in ${srProperty.address?.city}`,
    features: features,
    latitude: srProperty.geo?.lat || 0,
    longitude: srProperty.geo?.lng || 0,
    days_on_market: srProperty.mls?.daysOnMarket || 0,
    status: 'ACTIVE',
    virtual_tour_url: srProperty.virtualTourUrl || null,
  };
};

// Main sync function
async function syncProperties() {
  try {
    console.log('🔄 Starting SimplyRETS sync...\n');
    
    // Fetch properties from SimplyRETS
    const authBase64 = Buffer.from(SIMPLYRETS_AUTH).toString('base64');
    const response = await fetch(`${SIMPLYRETS_API_URL}/properties?limit=20&cities=Houston`, {
      headers: {
        'Authorization': `Basic ${authBase64}`,
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`SimplyRETS API error: ${response.status}`);
    }

    const srProperties = await response.json();
    console.log(`📊 Fetched ${srProperties.length} properties from SimplyRETS`);
    
    // Transform properties
    const properties = srProperties.map(transformProperty);
    
    // Clear existing properties (optional - remove this if you want to keep existing)
    console.log('🗑️  Clearing existing properties...');
    await supabase.from('properties').delete().neq('id', '');
    
    // Insert properties
    console.log('💾 Inserting properties into Supabase...');
    const { data, error } = await supabase
      .from('properties')
      .insert(properties)
      .select();

    if (error) {
      console.error('❌ Error inserting properties:', error);
      return;
    }

    console.log(`✅ Successfully inserted ${data.length} properties!\n`);
    
    // Handle images
    console.log('🖼️  Processing property images...');
    let totalImages = 0;
    
    for (let i = 0; i < srProperties.length; i++) {
      const srProperty = srProperties[i];
      const transformedProperty = properties[i];
      
      if (srProperty.photos && srProperty.photos.length > 0) {
        const images = srProperty.photos.map((url, index) => ({
          property_id: transformedProperty.id,
          image_url: url,
          display_order: index,
        }));
        
        const { error: imageError } = await supabase
          .from('property_images')
          .insert(images);
          
        if (!imageError) {
          totalImages += images.length;
        }
      }
    }
    
    console.log(`✅ Successfully inserted ${totalImages} images!\n`);
    
    // Show summary
    console.log('📈 SYNC SUMMARY:');
    console.log('================');
    console.log(`Properties synced: ${data.length}`);
    console.log(`Images synced: ${totalImages}`);
    console.log(`Average price: $${Math.round(properties.reduce((sum, p) => sum + p.price, 0) / properties.length).toLocaleString()}`);
    console.log(`Cities: ${[...new Set(properties.map(p => p.city))].join(', ')}`);
    
  } catch (error) {
    console.error('❌ Sync failed:', error);
  }
}

// Run the sync
(async () => {
  fetch = await loadFetch();
  await syncProperties();
})();