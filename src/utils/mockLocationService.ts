import { Alert } from 'react-native';

// Mock implementation of location services for development
// In production, use react-native-permissions and @react-native-community/geolocation

interface LocationCoords {
  latitude: number;
  longitude: number;
}

let hasPermission = false;

export const requestLocationPermission = async (): Promise<boolean> => {
  return new Promise((resolve) => {
    if (hasPermission) {
      resolve(true);
      return;
    }

    Alert.alert(
      'Location Permission',
      'ThatHouse would like to access your location to show nearby properties and calculate distances.',
      [
        {
          text: 'Don\'t Allow',
          onPress: () => {
            hasPermission = false;
            resolve(false);
          },
          style: 'cancel'
        },
        {
          text: 'Allow',
          onPress: () => {
            hasPermission = true;
            resolve(true);
          }
        }
      ]
    );
  });
};

export const getCurrentLocation = async (): Promise<LocationCoords | null> => {
  const permission = await requestLocationPermission();
  
  if (!permission) {
    return null;
  }

  // Mock location - Nashville area with some randomization
  const mockLocations = [
    { latitude: 36.1627, longitude: -86.7816 }, // Downtown Nashville
    { latitude: 36.1447, longitude: -86.8027 }, // Vanderbilt area
    { latitude: 36.1068, longitude: -86.8174 }, // Green Hills
    { latitude: 36.1834, longitude: -86.7668 }, // East Nashville
    { latitude: 36.0331, longitude: -86.7828 }, // Brentwood
  ];

  // Return a random location from the list
  const location = mockLocations[Math.floor(Math.random() * mockLocations.length)];
  
  // Add small random offset
  return {
    latitude: location.latitude + (Math.random() - 0.5) * 0.01,
    longitude: location.longitude + (Math.random() - 0.5) * 0.01,
  };
};