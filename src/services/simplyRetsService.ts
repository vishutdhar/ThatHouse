import { supabase } from '../lib/supabase';
import { ENV } from '../config/env';

// SimplyRETS configuration
const SIMPLYRETS_API_URL = 'https://api.simplyrets.com';
const SIMPLYRETS_AUTH = 'simplyrets:simplyrets'; // Demo credentials

// SimplyRETS property type from their API
interface SimplyRETSProperty {
  mlsId: number;
  listPrice: number;
  listDate: string;
  modified: string;
  address: {
    full?: string;
    streetNumber?: number;
    streetName?: string;
    city?: string;
    state?: string;
    postalCode?: string;
    crossStreet?: string;
  };
  property: {
    bedrooms?: number;
    bathsFull?: number;
    bathsHalf?: number;
    area?: number;
    type?: string;
    subType?: string;
    yearBuilt?: number;
    lotSize?: number;
    stories?: number;
    garageSpaces?: number;
    rooms?: string;
    subdivision?: string;
    cooling?: string;
    heating?: string;
    fireplaces?: number;
    pool?: string;
    style?: string;
    view?: string;
  };
  geo: {
    lat?: number;
    lng?: number;
    county?: string;
    directions?: string;
  };
  photos?: string[];
  agent?: {
    firstName?: string;
    lastName?: string;
    contact?: {
      email?: string;
      cell?: string;
      office?: string;
    };
  };
  office?: {
    name?: string;
    contact?: {
      email?: string;
      cell?: string;
    };
  };
  mls?: {
    status?: string;
    daysOnMarket?: number;
  };
  school?: {
    district?: string;
    elementarySchool?: string;
    middleSchool?: string;
    highSchool?: string;
  };
  remarks?: string;
  virtualTourUrl?: string;
}

// Map SimplyRETS property type to ThatHouse property type
const mapPropertyType = (type?: string, subType?: string): string => {
  if (!type) return 'SINGLE_FAMILY';
  
  const typeMap: Record<string, string> = {
    'RES': 'SINGLE_FAMILY',
    'CND': 'CONDO',
    'MUL': 'MULTI_FAMILY',
    'RNT': 'SINGLE_FAMILY',
    'LND': 'LAND',
    'COM': 'COMMERCIAL',
  };
  
  // Check subType for more specific mapping
  if (subType?.toLowerCase().includes('condo')) return 'CONDO';
  if (subType?.toLowerCase().includes('townhouse')) return 'TOWNHOUSE';
  
  return typeMap[type] || 'SINGLE_FAMILY';
};

// Map SimplyRETS status to ThatHouse status
const mapStatus = (mlsStatus?: string): string => {
  if (!mlsStatus) return 'ACTIVE';
  
  const statusMap: Record<string, string> = {
    'Active': 'ACTIVE',
    'Pending': 'PENDING',
    'Closed': 'SOLD',
    'Sold': 'SOLD',
    'Withdrawn': 'OFF_MARKET',
    'Expired': 'OFF_MARKET',
  };
  
  return statusMap[mlsStatus] || 'ACTIVE';
};

// Transform SimplyRETS property to our database format
export const transformProperty = (srProperty: SimplyRETSProperty): any => {
  // Calculate total bathrooms (full + half * 0.5)
  const bathrooms = (srProperty.property?.bathsFull || 0) + 
                   (srProperty.property?.bathsHalf || 0) * 0.5;

  // Build features array from available amenities
  const features: string[] = [];
  if (srProperty.property?.pool) features.push('Pool');
  if (srProperty.property?.fireplaces) features.push('Fireplace');
  if (srProperty.property?.garageSpaces) features.push(`${srProperty.property.garageSpaces} Car Garage`);
  if (srProperty.property?.cooling) features.push(srProperty.property.cooling);
  if (srProperty.property?.heating) features.push(srProperty.property.heating);
  if (srProperty.property?.view) features.push(`${srProperty.property.view} View`);
  if (srProperty.property?.style) features.push(srProperty.property.style);

  return {
    // Use MLS ID as unique identifier with prefix
    id: `sr_${srProperty.mlsId}`,
    
    // Address information
    address: srProperty.address?.full || 
             `${srProperty.address?.streetNumber || ''} ${srProperty.address?.streetName || ''}`.trim(),
    city: srProperty.address?.city || 'Unknown',
    state: srProperty.address?.state || 'Unknown',
    zip_code: srProperty.address?.postalCode || '00000',
    
    // Property details
    price: srProperty.listPrice || 0,
    bedrooms: srProperty.property?.bedrooms || 0,
    bathrooms: bathrooms,
    square_feet: srProperty.property?.area || 0,
    year_built: srProperty.property?.yearBuilt || null,
    property_type: mapPropertyType(srProperty.property?.type, srProperty.property?.subType),
    
    // Description from remarks
    description: srProperty.remarks || `Beautiful ${srProperty.property?.type} property in ${srProperty.address?.city}`,
    
    // Features array
    features: features,
    
    // Location
    latitude: srProperty.geo?.lat || 0,
    longitude: srProperty.geo?.lng || 0,
    
    // Status
    days_on_market: srProperty.mls?.daysOnMarket || 0,
    status: mapStatus(srProperty.mls?.status),
    
    // Virtual tour
    virtual_tour_url: srProperty.virtualTourUrl || null,
    
    // Timestamps
    created_at: srProperty.listDate || new Date().toISOString(),
    updated_at: srProperty.modified || new Date().toISOString(),
  };
};

// Fetch properties from SimplyRETS
export const fetchSimplyRETSProperties = async (params?: {
  limit?: number;
  offset?: number;
  city?: string;
  minPrice?: number;
  maxPrice?: number;
  minBeds?: number;
  type?: string[];
}) => {
  try {
    // Build query parameters
    const queryParams = new URLSearchParams();
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.offset) queryParams.append('offset', params.offset.toString());
    if (params?.city) queryParams.append('cities', params.city);
    if (params?.minPrice) queryParams.append('minprice', params.minPrice.toString());
    if (params?.maxPrice) queryParams.append('maxprice', params.maxPrice.toString());
    if (params?.minBeds) queryParams.append('minbeds', params.minBeds.toString());
    if (params?.type) queryParams.append('type', params.type.join(','));

    // Create auth header
    const authBase64 = Buffer.from(SIMPLYRETS_AUTH).toString('base64');
    
    // Fetch from SimplyRETS
    const response = await fetch(`${SIMPLYRETS_API_URL}/properties?${queryParams}`, {
      headers: {
        'Authorization': `Basic ${authBase64}`,
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`SimplyRETS API error: ${response.status}`);
    }

    const properties: SimplyRETSProperty[] = await response.json();
    
    // Transform to our format
    return properties.map(transformProperty);
    
  } catch (error) {
    console.error('Error fetching SimplyRETS properties:', error);
    throw error;
  }
};

// Sync properties to Supabase
export const syncPropertiesToSupabase = async (properties: any[]) => {
  try {
    // First, insert/update properties
    const { data: propertyData, error: propertyError } = await supabase
      .from('properties')
      .upsert(properties, { 
        onConflict: 'id',
        ignoreDuplicates: false 
      })
      .select();

    if (propertyError) throw propertyError;

    // Then, handle images
    const imagePromises = properties.map(async (property) => {
      // Get images from SimplyRETS
      const srProperty = await fetchPropertyDetails(property.id.replace('sr_', ''));
      if (!srProperty?.photos || srProperty.photos.length === 0) return;

      // Prepare image records
      const images = srProperty.photos.map((url, index) => ({
        property_id: property.id,
        image_url: url,
        display_order: index,
      }));

      // Delete existing images for this property
      await supabase
        .from('property_images')
        .delete()
        .eq('property_id', property.id);

      // Insert new images
      await supabase
        .from('property_images')
        .insert(images);
    });

    await Promise.all(imagePromises);

    console.log(`✅ Synced ${propertyData?.length || 0} properties to Supabase`);
    return propertyData;
    
  } catch (error) {
    console.error('Error syncing to Supabase:', error);
    throw error;
  }
};

// Fetch single property details
export const fetchPropertyDetails = async (mlsId: string): Promise<SimplyRETSProperty | null> => {
  try {
    const authBase64 = Buffer.from(SIMPLYRETS_AUTH).toString('base64');
    
    const response = await fetch(`${SIMPLYRETS_API_URL}/properties/${mlsId}`, {
      headers: {
        'Authorization': `Basic ${authBase64}`,
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      if (response.status === 404) return null;
      throw new Error(`SimplyRETS API error: ${response.status}`);
    }

    return await response.json();
    
  } catch (error) {
    console.error('Error fetching property details:', error);
    return null;
  }
};

// Main sync function to run periodically
export const runSimplyRETSSync = async (options?: {
  limit?: number;
  city?: string;
}) => {
  try {
    console.log('🔄 Starting SimplyRETS sync...');
    
    // Fetch properties from SimplyRETS
    const properties = await fetchSimplyRETSProperties({
      limit: options?.limit || 50,
      city: options?.city,
    });
    
    console.log(`📊 Fetched ${properties.length} properties from SimplyRETS`);
    
    // Sync to Supabase
    const synced = await syncPropertiesToSupabase(properties);
    
    console.log('✅ SimplyRETS sync completed!');
    return synced;
    
  } catch (error) {
    console.error('❌ SimplyRETS sync failed:', error);
    throw error;
  }
};