import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useTheme } from '../theme/ThemeContext';

let MapView: any = null;
let Marker: any = null;
let Callout: any = null;
let PROVIDER_GOOGLE: any = null;
let isMapAvailable = false;

// Try different import methods
try {
  // Method 1: Direct require
  const RNMaps = require('react-native-maps');
  console.log('RNMaps loaded successfully');
  console.log('RNMaps type:', typeof RNMaps);
  console.log('RNMaps keys:', Object.keys(RNMaps || {}));
  
  // Method 2: Check for default export
  if (RNMaps && RNMaps.default) {
    console.log('Using RNMaps.default');
    MapView = RNMaps.default;
    Marker = RNMaps.Marker;
    Callout = RNMaps.Callout;
    PROVIDER_GOOGLE = RNMaps.PROVIDER_GOOGLE;
  } else if (RNMaps && RNMaps.MapView) {
    console.log('Using RNMaps.MapView');
    MapView = RNMaps.MapView;
    Marker = RNMaps.Marker;
    Callout = RNMaps.Callout;
    PROVIDER_GOOGLE = RNMaps.PROVIDER_GOOGLE;
  } else if (RNMaps && typeof RNMaps === 'function') {
    console.log('RNMaps is a function/component');
    MapView = RNMaps;
    // Try to access nested exports
    Marker = RNMaps.Marker || null;
    Callout = RNMaps.Callout || null;
    PROVIDER_GOOGLE = RNMaps.PROVIDER_GOOGLE || null;
  }
  
  isMapAvailable = !!MapView;
  console.log('MapView available:', isMapAvailable);
  console.log('MapView type:', typeof MapView);
} catch (error) {
  console.error('Failed to load react-native-maps:', error);
  console.error('Error message:', error.message);
  console.error('Error stack:', error.stack);
}

interface MapViewWrapperProps {
  children?: React.ReactNode;
  onFallbackPress?: () => void;
  [key: string]: any;
}

const MapFallback: React.FC<{ onPress?: () => void }> = ({ onPress }) => {
  const { colors } = useTheme();
  
  return (
    <View style={[styles.fallbackContainer, { backgroundColor: colors.backgroundSecondary }]}>
      <Icon name="map" size={80} color={colors.textTertiary} />
      <Text style={[styles.fallbackText, { color: colors.text }]}>
        Map View
      </Text>
      <Text style={[styles.fallbackSubtext, { color: colors.textSecondary }]}>
        Interactive map is not available in this environment
      </Text>
      {onPress && (
        <TouchableOpacity 
          style={[styles.fallbackButton, { backgroundColor: colors.primary }]}
          onPress={onPress}
        >
          <Text style={styles.fallbackButtonText}>View Properties List</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

export const MapViewWrapper: React.FC<MapViewWrapperProps> = ({ 
  children, 
  onFallbackPress,
  ...props 
}) => {
  React.useEffect(() => {
    console.log('MapViewWrapper mounted');
    console.log('MapView available:', isMapAvailable);
    console.log('MapView type:', typeof MapView);
  }, []);

  if (!MapView || !isMapAvailable) {
    console.log('MapView not available, showing fallback');
    console.log('MapView value:', MapView);
    console.log('isMapAvailable:', isMapAvailable);
    return <MapFallback onPress={onFallbackPress} />;
  }

  try {
    console.log('Attempting to render MapView with props:', Object.keys(props));
    return <MapView {...props}>{children}</MapView>;
  } catch (error) {
    console.error('MapView render error:', error);
    console.error('Error details:', error.message);
    return <MapFallback onPress={onFallbackPress} />;
  }
};

export const MarkerWrapper: React.FC<any> = (props) => {
  if (!Marker) return null;
  return <Marker {...props} />;
};

export const CalloutWrapper: React.FC<any> = (props) => {
  if (!Callout) return null;
  return <Callout {...props} />;
};

export const MapProvider = {
  GOOGLE: PROVIDER_GOOGLE || undefined,
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