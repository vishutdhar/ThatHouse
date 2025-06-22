// SimplyRETS Demo Data Test
// This file is for testing SimplyRETS API structure before integration

const SIMPLYRETS_DEMO_URL = 'https://api.simplyrets.com';
const SIMPLYRETS_DEMO_AUTH = 'simplyrets:simplyrets';

export const fetchSimplyRETSDemoData = async () => {
  try {
    console.log('🏠 Fetching SimplyRETS demo properties...\n');
    
    // Create base64 encoded auth
    const authBase64 = btoa(SIMPLYRETS_DEMO_AUTH);
    
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
      console.log(`Lot Size: ${firstProperty.property?.lotSize} sqft`);
      console.log(`Stories: ${firstProperty.property?.stories}`);
      console.log(`Garage Spaces: ${firstProperty.property?.garageSpaces}`);
      
      console.log('\n📸 PHOTOS:');
      console.log(`Total Photos: ${firstProperty.photos?.length || 0}`);
      if (firstProperty.photos && firstProperty.photos.length > 0) {
        console.log(`First Photo: ${firstProperty.photos[0]}`);
      }
      
      console.log('\n📝 LISTING INFO:');
      console.log(`List Date: ${firstProperty.listDate}`);
      console.log(`Modified: ${firstProperty.modified}`);
      console.log(`Status: ${firstProperty.mls?.status}`);
      console.log(`Days on Market: ${firstProperty.mls?.daysOnMarket}`);
      
      console.log('\n🏢 AGENT INFO:');
      console.log(`Listing Agent: ${firstProperty.agent?.firstName} ${firstProperty.agent?.lastName}`);
      console.log(`Agent Email: ${firstProperty.agent?.contact?.email}`);
      console.log(`Agent Phone: ${firstProperty.agent?.contact?.cell}`);
      
      console.log('\n📍 GEO LOCATION:');
      console.log(`Latitude: ${firstProperty.geo?.lat}`);
      console.log(`Longitude: ${firstProperty.geo?.lng}`);
      console.log(`County: ${firstProperty.geo?.county}`);
      
      console.log('\n📊 ADDITIONAL FIELDS:');
      console.log(`Rooms: ${firstProperty.property?.rooms}`);
      console.log(`Subdivision: ${firstProperty.property?.subdivision}`);
      console.log(`School District: ${firstProperty.school?.district}`);
      console.log(`Elementary School: ${firstProperty.school?.elementarySchool}`);
      console.log(`Middle School: ${firstProperty.school?.middleSchool}`);
      console.log(`High School: ${firstProperty.school?.highSchool}`);
      
      console.log('\n🏷️ FEATURES/AMENITIES:');
      console.log(`Cooling: ${firstProperty.property?.cooling}`);
      console.log(`Heating: ${firstProperty.property?.heating}`);
      console.log(`Fireplace: ${firstProperty.property?.fireplaces ? 'Yes' : 'No'}`);
      console.log(`Pool: ${firstProperty.property?.pool}`);
      console.log(`Style: ${firstProperty.property?.style}`);
      console.log(`View: ${firstProperty.property?.view}`);
      
      console.log('\n\n📋 FULL RAW DATA (First Property):');
      console.log(JSON.stringify(firstProperty, null, 2));
    }
    
    return properties;
    
  } catch (error) {
    console.error('❌ Error fetching SimplyRETS data:', error);
    throw error;
  }
};

// Function to test the API connection
export const testSimplyRETSConnection = async () => {
  try {
    const authBase64 = btoa(SIMPLYRETS_DEMO_AUTH);
    
    const response = await fetch(`${SIMPLYRETS_DEMO_URL}/properties?limit=1`, {
      headers: {
        'Authorization': `Basic ${authBase64}`,
        'Accept': 'application/json',
      },
    });

    if (response.ok) {
      console.log('✅ SimplyRETS API connection successful!');
      return true;
    } else {
      console.log('❌ SimplyRETS API connection failed:', response.status);
      return false;
    }
  } catch (error) {
    console.log('❌ SimplyRETS API connection error:', error);
    return false;
  }
};