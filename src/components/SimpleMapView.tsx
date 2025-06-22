import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Dimensions,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useTheme } from '../theme/ThemeContext';
import { Property } from '../types';

const { width: screenWidth } = Dimensions.get('window');

interface SimpleMapViewProps {
  properties: Property[];
  selectedProperty: Property | null;
  onPropertySelect: (property: Property) => void;
  onPropertyPress: (property: Property) => void;
  region: {
    latitude: number;
    longitude: number;
    latitudeDelta: number;
    longitudeDelta: number;
  };
}

const SimpleMapView: React.FC<SimpleMapViewProps> = ({
  properties,
  selectedProperty,
  onPropertySelect,
  onPropertyPress,
  region,
}) => {
  const { colors, isDark } = useTheme();
  
  // Group properties by general area for visual organization
  const getPropertyPosition = (property: Property, index: number) => {
    // Create a grid-like layout for properties
    const angle = (index * 137.5) % 360; // Golden angle for better distribution
    const radius = 80 + (index % 3) * 40;
    const x = Math.cos(angle * Math.PI / 180) * radius;
    const y = Math.sin(angle * Math.PI / 180) * radius;
    
    return {
      left: screenWidth / 2 + x - 40,
      top: 200 + y,
    };
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.backgroundSecondary }]}>
      {/* Map Background */}
      <View style={styles.mapContainer}>
        {/* Center marker for current location */}
        <View style={styles.centerPoint}>
          <Icon name="location" size={30} color={colors.primary} />
          <Text style={[styles.locationLabel, { color: colors.text }]}>
            {region.latitude.toFixed(2)}, {region.longitude.toFixed(2)}
          </Text>
        </View>

        {/* Property Markers */}
        {properties.slice(0, 10).map((property, index) => {
          const position = getPropertyPosition(property, index);
          const isSelected = selectedProperty?.id === property.id;
          
          return (
            <TouchableOpacity
              key={property.id}
              style={[
                styles.marker,
                position,
                isSelected && styles.selectedMarker,
                { backgroundColor: isSelected ? colors.primary : colors.background }
              ]}
              onPress={() => onPropertySelect(property)}
              activeOpacity={0.8}
            >
              <Text style={[
                styles.markerText,
                { color: isSelected ? colors.textInverse : colors.primary }
              ]}>
                {formatPrice(property.price)}
              </Text>
            </TouchableOpacity>
          );
        })}

        {/* Grid lines for visual effect */}
        <View style={[styles.gridLine, styles.horizontalLine]} />
        <View style={[styles.gridLine, styles.verticalLine]} />
      </View>

      {/* Selected Property Preview */}
      {selectedProperty && (
        <TouchableOpacity
          style={[styles.propertyPreview, { backgroundColor: colors.cardBackground }]}
          onPress={() => onPropertyPress(selectedProperty)}
          activeOpacity={0.9}
        >
          <Image
            source={{ uri: selectedProperty.images[0] }}
            style={styles.previewImage}
          />
          <View style={styles.previewInfo}>
            <Text style={[styles.previewPrice, { color: colors.text }]}>
              {formatPrice(selectedProperty.price)}
            </Text>
            <Text style={[styles.previewAddress, { color: colors.textSecondary }]}>
              {selectedProperty.address}
            </Text>
            <Text style={[styles.previewDetails, { color: colors.textTertiary }]}>
              {selectedProperty.bedrooms} bed • {selectedProperty.bathrooms} bath • {selectedProperty.squareFeet.toLocaleString()} sqft
            </Text>
          </View>
          <Icon name="chevron-forward" size={20} color={colors.textSecondary} />
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  mapContainer: {
    flex: 1,
    position: 'relative',
    overflow: 'hidden',
  },
  centerPoint: {
    position: 'absolute',
    top: '40%',
    left: '50%',
    transform: [{ translateX: -15 }, { translateY: -15 }],
    alignItems: 'center',
  },
  locationLabel: {
    fontSize: 12,
    marginTop: 4,
  },
  marker: {
    position: 'absolute',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 15,
    borderWidth: 2,
    borderColor: '#FF6B6B',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  selectedMarker: {
    transform: [{ scale: 1.1 }],
  },
  markerText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  gridLine: {
    position: 'absolute',
    backgroundColor: 'rgba(0,0,0,0.05)',
  },
  horizontalLine: {
    top: '50%',
    left: 0,
    right: 0,
    height: 1,
  },
  verticalLine: {
    left: '50%',
    top: 0,
    bottom: 0,
    width: 1,
  },
  propertyPreview: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    flexDirection: 'row',
    padding: 15,
    borderRadius: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    alignItems: 'center',
  },
  previewImage: {
    width: 60,
    height: 60,
    borderRadius: 10,
    marginRight: 15,
  },
  previewInfo: {
    flex: 1,
  },
  previewPrice: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  previewAddress: {
    fontSize: 14,
    marginTop: 2,
  },
  previewDetails: {
    fontSize: 12,
    marginTop: 4,
  },
});

export default SimpleMapView;