import { Alert } from 'react-native';

interface GeocodeResult {
  latitude: number;
  longitude: number;
  formatted_address: string;
}

// Mock geocoding function - in production, use Google Maps Geocoding API or similar
export const geocodeAddress = async (address: string): Promise<GeocodeResult | null> => {
  try {
    // Mock implementation - returns coordinates based on known Nashville area addresses
    const mockResults: Record<string, GeocodeResult> = {
      'downtown nashville': {
        latitude: 36.1627,
        longitude: -86.7816,
        formatted_address: 'Downtown Nashville, TN'
      },
      'vanderbilt university': {
        latitude: 36.1447,
        longitude: -86.8027,
        formatted_address: 'Vanderbilt University, Nashville, TN'
      },
      'nashville airport': {
        latitude: 36.1267,
        longitude: -86.6774,
        formatted_address: 'Nashville International Airport, Nashville, TN'
      },
      'green hills': {
        latitude: 36.1068,
        longitude: -86.8174,
        formatted_address: 'Green Hills, Nashville, TN'
      },
      'franklin': {
        latitude: 35.9251,
        longitude: -86.8689,
        formatted_address: 'Franklin, TN'
      },
      'brentwood': {
        latitude: 36.0331,
        longitude: -86.7828,
        formatted_address: 'Brentwood, TN'
      }
    };

    const searchKey = address.toLowerCase().trim();
    
    // Check for exact match
    if (mockResults[searchKey]) {
      return mockResults[searchKey];
    }

    // Check for partial match
    for (const [key, value] of Object.entries(mockResults)) {
      if (searchKey.includes(key) || key.includes(searchKey)) {
        return value;
      }
    }

    // Default to Nashville center with some randomization
    const defaultResult: GeocodeResult = {
      latitude: 36.1627 + (Math.random() - 0.5) * 0.2,
      longitude: -86.7816 + (Math.random() - 0.5) * 0.2,
      formatted_address: address
    };

    return defaultResult;
  } catch (error) {
    console.error('Geocoding error:', error);
    Alert.alert('Geocoding Error', 'Unable to find location. Please try again.');
    return null;
  }
};

// Reverse geocoding - get address from coordinates
export const reverseGeocode = async (latitude: number, longitude: number): Promise<string> => {
  try {
    // Mock implementation
    const areas = [
      { name: 'Downtown Nashville', lat: 36.1627, lng: -86.7816, radius: 0.05 },
      { name: 'East Nashville', lat: 36.1834, lng: -86.7668, radius: 0.05 },
      { name: 'Green Hills', lat: 36.1068, lng: -86.8174, radius: 0.05 },
      { name: 'Franklin', lat: 35.9251, lng: -86.8689, radius: 0.1 },
      { name: 'Brentwood', lat: 36.0331, lng: -86.7828, radius: 0.05 },
      { name: 'Murfreesboro', lat: 35.8456, lng: -86.3903, radius: 0.1 },
    ];

    // Find the closest area
    for (const area of areas) {
      const distance = Math.sqrt(
        Math.pow(latitude - area.lat, 2) + Math.pow(longitude - area.lng, 2)
      );
      if (distance < area.radius) {
        return `${area.name}, TN`;
      }
    }

    // Default to generic Nashville address
    return 'Nashville, TN';
  } catch (error) {
    console.error('Reverse geocoding error:', error);
    return 'Unknown Location';
  }
};

// Calculate commute times from origin to multiple destinations
export const calculateCommuteTimes = async (
  origin: { latitude: number; longitude: number },
  destinations: Array<{ latitude: number; longitude: number }>,
  mode: 'driving' | 'transit' | 'walking' = 'driving'
): Promise<number[]> => {
  // Mock implementation - in production, use Google Maps Distance Matrix API
  const baseTimes = {
    driving: 1.5, // minutes per mile
    transit: 2.5, // minutes per mile
    walking: 20, // minutes per mile
  };

  return destinations.map(dest => {
    const distance = Math.sqrt(
      Math.pow(dest.latitude - origin.latitude, 2) + 
      Math.pow(dest.longitude - origin.longitude, 2)
    ) * 69; // rough conversion to miles

    const time = distance * baseTimes[mode];
    
    // Add some randomization for traffic
    const trafficFactor = mode === 'driving' ? 1 + Math.random() * 0.3 : 1;
    
    return Math.round(time * trafficFactor);
  });
};