import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useTheme } from '../theme/ThemeContext';

// Dynamic import to avoid build-time errors
let MapViewComponent: any = null;
let MarkerComponent: any = null;
let CalloutComponent: any = null;

interface NativeMapViewProps {
  children?: React.ReactNode;
  onFallbackPress?: () => void;
  [key: string]: any;
}

const MapFallback: React.FC<{ onPress?: () => void; loading?: boolean }> = ({ 
  onPress, 
  loading = false 
}) => {
  const { colors } = useTheme();
  
  return (
    <View style={[styles.fallbackContainer, { backgroundColor: colors.backgroundSecondary }]}>
      {loading ? (
        <>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.fallbackText, { color: colors.text }]}>
            Loading Map...
          </Text>
        </>
      ) : (
        <>
          <Icon name="map" size={80} color={colors.textTertiary} />
          <Text style={[styles.fallbackText, { color: colors.text }]}>
            Map View
          </Text>
          <Text style={[styles.fallbackSubtext, { color: colors.textSecondary }]}>
            Interactive map is not available
          </Text>
          {onPress && (
            <TouchableOpacity 
              style={[styles.fallbackButton, { backgroundColor: colors.primary }]}
              onPress={onPress}
            >
              <Text style={styles.fallbackButtonText}>View Properties List</Text>
            </TouchableOpacity>
          )}
        </>
      )}
    </View>
  );
};

export const NativeMapView: React.FC<NativeMapViewProps> = ({ 
  children, 
  onFallbackPress,
  ...props 
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [isMapAvailable, setIsMapAvailable] = useState(false);

  useEffect(() => {
    // Dynamically import react-native-maps
    const loadMapComponents = async () => {
      try {
        console.log('Attempting to dynamically import react-native-maps...');
        const RNMaps = require('react-native-maps');
        console.log('RNMaps imported:', Object.keys(RNMaps));
        
        // Check different export patterns
        if (RNMaps.default) {
          MapViewComponent = RNMaps.default;
          MarkerComponent = RNMaps.Marker;
          CalloutComponent = RNMaps.Callout;
        } else if (RNMaps.MapView) {
          MapViewComponent = RNMaps.MapView;
          MarkerComponent = RNMaps.Marker;
          CalloutComponent = RNMaps.Callout;
        } else {
          throw new Error('MapView component not found in exports');
        }
        
        setIsMapAvailable(true);
        console.log('Map components loaded successfully');
      } catch (error) {
        console.error('Failed to load react-native-maps:', error);
        setIsMapAvailable(false);
      } finally {
        setIsLoading(false);
      }
    };

    loadMapComponents();
  }, []);

  if (isLoading) {
    return <MapFallback loading={true} />;
  }

  if (!isMapAvailable || !MapViewComponent) {
    return <MapFallback onPress={onFallbackPress} />;
  }

  try {
    return <MapViewComponent {...props}>{children}</MapViewComponent>;
  } catch (error) {
    console.error('MapView render error:', error);
    return <MapFallback onPress={onFallbackPress} />;
  }
};

export const NativeMarker: React.FC<any> = (props) => {
  if (!MarkerComponent) return null;
  return <MarkerComponent {...props} />;
};

export const NativeCallout: React.FC<any> = (props) => {
  if (!CalloutComponent) return null;
  return <CalloutComponent {...props} />;
};

const styles = StyleSheet.create({
  fallbackContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  fallbackText: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 10,
  },
  fallbackSubtext: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 30,
  },
  fallbackButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  fallbackButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});