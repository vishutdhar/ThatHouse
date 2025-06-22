// Test script to fetch and display SimplyRETS demo data
// Run with: node src/scripts/testSimplyRets.js

const fetch = require('node-fetch');

const SIMPLYRETS_DEMO_URL = 'https://api.simplyrets.com';
const SIMPLYRETS_DEMO_AUTH = 'simplyrets:simplyrets';

async function fetchSimplyRETSDemoData() {
  try {
    console.log('🏠 Fetching SimplyRETS demo properties...\n');
    
    // Create base64 encoded auth
    const authBase64 = Buffer.from(SIMPLYRETS_DEMO_AUTH).toString('base64');
    
    // Fetch properties with limit
    const response = await fetch(`${SIMPLYRETS_DEMO_URL}/properties?limit=2`, {
      headers: {
        'Authorization': `Basic ${authBase64}`,
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const properties = await response.json();
    
    console.log(`✅ Found ${properties.length} properties\n`);
    
    // Display first property details
    if (properties.length > 0) {
      const firstProperty = properties[0];
      
      console.log('📍 FIRST PROPERTY DETAILS:');
      console.log('==========================');
      console.log(`MLS #: ${firstProperty.mlsId}`);
      console.log(`Address: ${firstProperty.address?.full || 'N/A'}`);
      console.log(`City: ${firstProperty.address?.city}`);
      console.log(`State: ${firstProperty.address?.state}`);
      console.log(`Postal Code: ${firstProperty.address?.postalCode}`);
      console.log(`Price: $${firstProperty.listPrice?.toLocaleString()}`);
      console.log(`Bedrooms: ${firstProperty.property?.bedrooms}`);
      console.log(`Bathrooms: ${firstProperty.property?.bathsFull} full, ${firstProperty.property?.bathsHalf} half`);
      console.log(`Square Feet: ${firstProperty.property?.area?.toLocaleString()}`);
      console.log(`Year Built: ${firstProperty.property?.yearBuilt}`);
      console.log(`Type: ${firstProperty.property?.type}`);
      console.log(`Sub Type: ${firstProperty.property?.subType}`);
      
      console.log('\n📸 PHOTOS:');
      console.log(`Total Photos: ${firstProperty.photos?.length || 0}`);
      if (firstProperty.photos && firstProperty.photos.length > 0) {
        console.log(`First Photo: ${firstProperty.photos[0]}`);
      }
      
      console.log('\n🏢 AGENT INFO:');
      console.log(`Listing Agent: ${firstProperty.agent?.firstName} ${firstProperty.agent?.lastName}`);
      console.log(`Agent Email: ${firstProperty.agent?.contact?.email}`);
      console.log(`Agent Phone: ${firstProperty.agent?.contact?.cell}`);
      
      console.log('\n📍 GEO LOCATION:');
      console.log(`Latitude: ${firstProperty.geo?.lat}`);
      console.log(`Longitude: ${firstProperty.geo?.lng}`);
      
      console.log('\n\n📋 SUMMARY OF ALL FIELDS AVAILABLE:');
      console.log('- mlsId, listPrice, listDate, modified');
      console.log('- address (full, city, state, postalCode, streetNumber, streetName)');
      console.log('- property (bedrooms, bathrooms, area, type, yearBuilt, etc.)');
      console.log('- geo (lat, lng, county, directions)');
      console.log('- photos array');
      console.log('- agent info (name, email, phone)');
      console.log('- school info (district, elementary, middle, high)');
      console.log('- mls status and days on market');
      console.log('- amenities (cooling, heating, pool, etc.)');
    }
    
    return properties;
    
  } catch (error) {
    console.error('❌ Error fetching SimplyRETS data:', error);
    throw error;
  }
}

// Run the test
fetchSimplyRETSDemoData();