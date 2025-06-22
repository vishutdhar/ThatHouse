import { Platform, Alert, Linking } from 'react-native';
// For development, using mock location service
// In production, uncomment the following:
// import Geolocation from '@react-native-community/geolocation';
// import { check, request, PERMISSIONS, RESULTS, openSettings } from 'react-native-permissions';
import { requestLocationPermission as mockRequestPermission, getCurrentLocation as mockGetLocation } from './mockLocationService';

interface LocationCoords {
  latitude: number;
  longitude: number;
}

export const requestLocationPermission = async (): Promise<boolean> => {
  // Using mock implementation for development
  return mockRequestPermission();
  
  // Production implementation (uncomment when ready):
  /*
  try {
    let permission;
    
    if (Platform.OS === 'ios') {
      permission = PERMISSIONS.IOS.LOCATION_WHEN_IN_USE;
    } else {
      permission = PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION;
    }

    const result = await check(permission);
    
    if (result === RESULTS.GRANTED) {
      return true;
    }
    
    if (result === RESULTS.DENIED) {
      const requestResult = await request(permission);
      return requestResult === RESULTS.GRANTED;
    }
    
    if (result === RESULTS.BLOCKED) {
      Alert.alert(
        'Location Permission Required',
        'Please enable location services in your device settings to use this feature.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Open Settings', onPress: () => openSettings() }
        ]
      );
      return false;
    }
    
    return false;
  } catch (error) {
    console.error('Error requesting location permission:', error);
    return false;
  }
  */
};

export const getCurrentLocation = async (): Promise<LocationCoords | null> => {
  // Using mock implementation for development
  return mockGetLocation();
  
  // Production implementation (uncomment when ready):
  /*
  const hasPermission = await requestLocationPermission();
  
  if (!hasPermission) {
    return null;
  }

  return new Promise((resolve, reject) => {
    Geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
      },
      (error) => {
        console.error('Error getting location:', error);
        Alert.alert(
          'Location Error',
          'Unable to get your current location. Please make sure location services are enabled.',
          [{ text: 'OK' }]
        );
        resolve(null);
      },
      {
        enableHighAccuracy: true,
        timeout: 20000,
        maximumAge: 1000,
      }
    );
  });
  */
};

export const openMapsWithDirections = (
  destination: LocationCoords,
  address: string,
  origin?: LocationCoords
) => {
  const scheme = Platform.select({
    ios: 'maps:',
    android: 'geo:',
  });
  
  if (Platform.OS === 'ios') {
    // iOS Maps URL scheme
    let url = `${scheme}?daddr=${destination.latitude},${destination.longitude}`;
    if (origin) {
      url = `${scheme}?saddr=${origin.latitude},${origin.longitude}&daddr=${destination.latitude},${destination.longitude}`;
    }
    Linking.openURL(url);
  } else {
    // Android Maps URL scheme
    const latLng = `${destination.latitude},${destination.longitude}`;
    const label = encodeURIComponent(address);
    const url = `${scheme}0,0?q=${latLng}(${label})`;
    Linking.openURL(url);
  }
};

export const calculateDistance = (
  point1: LocationCoords,
  point2: LocationCoords
): number => {
  const R = 3959; // Earth's radius in miles
  const lat1 = point1.latitude * (Math.PI / 180);
  const lat2 = point2.latitude * (Math.PI / 180);
  const dLat = (point2.latitude - point1.latitude) * (Math.PI / 180);
  const dLon = (point2.longitude - point1.longitude) * (Math.PI / 180);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;

  return distance;
};

export const isPointInPolygon = (
  point: { x: number; y: number },
  polygon: { x: number; y: number }[]
): boolean => {
  let inside = false;
  
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const xi = polygon[i].x;
    const yi = polygon[i].y;
    const xj = polygon[j].x;
    const yj = polygon[j].y;
    
    const intersect = ((yi > point.y) !== (yj > point.y))
      && (point.x < (xj - xi) * (point.y - yi) / (yj - yi) + xi);
    
    if (intersect) inside = !inside;
  }
  
  return inside;
};

export const screenToGeoCoords = (
  screenPoint: { x: number; y: number },
  region: { latitude: number; longitude: number; latitudeDelta: number; longitudeDelta: number },
  screenDimensions: { width: number; height: number }
): LocationCoords => {
  const { x, y } = screenPoint;
  const { latitude, longitude, latitudeDelta, longitudeDelta } = region;
  const { width, height } = screenDimensions;
  
  // Convert screen coordinates to lat/lng
  const lat = latitude - (latitudeDelta / 2) + (latitudeDelta * (y / height));
  const lng = longitude - (longitudeDelta / 2) + (longitudeDelta * (x / width));
  
  return { latitude: lat, longitude: lng };
};