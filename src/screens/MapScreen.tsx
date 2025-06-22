import React, { useState, useRef, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Dimensions,
  Platform,
  Image,
  Animated,
} from 'react-native';
import MapView, { Marker, Region, MapPressEvent } from 'react-native-maps';
import Icon from 'react-native-vector-icons/Ionicons';
import { useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootState } from '../store';
import { RootStackParamList } from '../navigation/AppNavigator';
import { useTheme } from '../theme/ThemeContext';
import { Property } from '../types';

type NavigationProp = StackNavigationProp<RootStackParamList, 'Main'>;

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

const INITIAL_REGION = {
  latitude: 36.1627,
  longitude: -86.7816,
  latitudeDelta: 0.15,
  longitudeDelta: 0.15,
};

const MapScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const { colors } = useTheme();
  const mapRef = useRef<MapView>(null);
  
  const properties = useSelector((state: RootState) => state.properties.properties);
  const filters = useSelector((state: RootState) => state.filter);
  
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [region, setRegion] = useState<Region>(INITIAL_REGION);
  const slideAnim = useRef(new Animated.Value(-300)).current;

  // Dark map style for consistency with app theme
  const darkMapStyle = [
    {
      elementType: 'geometry',
      stylers: [{ color: '#212121' }],
    },
    {
      elementType: 'labels.icon',
      stylers: [{ visibility: 'off' }],
    },
    {
      elementType: 'labels.text.fill',
      stylers: [{ color: '#757575' }],
    },
    {
      elementType: 'labels.text.stroke',
      stylers: [{ color: '#212121' }],
    },
    {
      featureType: 'administrative',
      elementType: 'geometry',
      stylers: [{ color: '#757575' }],
    },
    {
      featureType: 'poi',
      elementType: 'labels.text.fill',
      stylers: [{ color: '#757575' }],
    },
    {
      featureType: 'poi.park',
      elementType: 'geometry',
      stylers: [{ color: '#181818' }],
    },
    {
      featureType: 'poi.park',
      elementType: 'labels.text.fill',
      stylers: [{ color: '#616161' }],
    },
    {
      featureType: 'poi.park',
      elementType: 'labels.text.stroke',
      stylers: [{ color: '#1b1b1b' }],
    },
    {
      featureType: 'road',
      elementType: 'geometry.fill',
      stylers: [{ color: '#2c2c2c' }],
    },
    {
      featureType: 'road',
      elementType: 'labels.text.fill',
      stylers: [{ color: '#8a8a8a' }],
    },
    {
      featureType: 'road.arterial',
      elementType: 'geometry',
      stylers: [{ color: '#373737' }],
    },
    {
      featureType: 'road.highway',
      elementType: 'geometry',
      stylers: [{ color: '#3c3c3c' }],
    },
    {
      featureType: 'road.highway.controlled_access',
      elementType: 'geometry',
      stylers: [{ color: '#4e4e4e' }],
    },
    {
      featureType: 'road.local',
      elementType: 'labels.text.fill',
      stylers: [{ color: '#616161' }],
    },
    {
      featureType: 'transit',
      elementType: 'labels.text.fill',
      stylers: [{ color: '#757575' }],
    },
    {
      featureType: 'water',
      elementType: 'geometry',
      stylers: [{ color: '#000000' }],
    },
    {
      featureType: 'water',
      elementType: 'labels.text.fill',
      stylers: [{ color: '#3d3d3d' }],
    },
  ];

  // Filter properties based on current filters
  const filteredProperties = useMemo(() => {
    // First, ensure unique properties by ID
    const uniqueProperties = properties.reduce((acc, property) => {
      if (!acc.find(p => p.id === property.id)) {
        acc.push(property);
      }
      return acc;
    }, [] as Property[]);
    
    return uniqueProperties.filter(property => {
      if (property.price < filters.priceRange.min || property.price > filters.priceRange.max) {
        return false;
      }
      if (property.bedrooms < filters.bedrooms.min) return false;
      if (property.bathrooms < filters.bathrooms.min) return false;
      if (filters.propertyTypes.length > 0 && !filters.propertyTypes.includes(property.propertyType)) {
        return false;
      }
      return true;
    });
  }, [properties, filters]);

  // Update region based on filter location
  useEffect(() => {
    const locationCoords: Record<string, { lat: number; lng: number }> = {
      Nashville: { lat: 36.1627, lng: -86.7816 },
      Franklin: { lat: 35.9251, lng: -86.8689 },
      Brentwood: { lat: 36.0331, lng: -86.7828 },
      Murfreesboro: { lat: 35.8456, lng: -86.3903 },
      Hendersonville: { lat: 36.3048, lng: -86.6200 },
    };
    
    const city = filters.location.city || 'Nashville';
    const coords = locationCoords[city] || locationCoords.Nashville;
    
    const newRegion = {
      latitude: coords.lat,
      longitude: coords.lng,
      latitudeDelta: 0.15,
      longitudeDelta: 0.15,
    };
    
    setRegion(newRegion);
    mapRef.current?.animateToRegion(newRegion, 1000);
  }, [filters.location.city]);

  // Animate property card in/out
  useEffect(() => {
    Animated.timing(slideAnim, {
      toValue: selectedProperty ? 0 : -300,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [selectedProperty, slideAnim]);

  const handleMarkerPress = (property: Property) => {
    setSelectedProperty(property);
  };

  const handleMapPress = (e: MapPressEvent) => {
    // Only close if not clicking on a marker
    if (e.nativeEvent.action !== 'marker-press') {
      setSelectedProperty(null);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  const centerOnUserLocation = () => {
    // In production, this would get actual user location
    const mockUserLocation = {
      latitude: region.latitude + (Math.random() - 0.5) * 0.05,
      longitude: region.longitude + (Math.random() - 0.5) * 0.05,
      latitudeDelta: 0.05,
      longitudeDelta: 0.05,
    };
    mapRef.current?.animateToRegion(mockUserLocation, 1000);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.mapContainer}>
        <MapView
          ref={mapRef}
          style={styles.map}
          initialRegion={INITIAL_REGION}
          customMapStyle={darkMapStyle}
          showsUserLocation
          showsMyLocationButton={false}
          showsCompass={false}
          onPress={handleMapPress}
        >
          {filteredProperties.map((property, index) => (
            <Marker
              key={property.id || `property-${index}`}
              coordinate={{
                latitude: property.latitude,
                longitude: property.longitude,
              }}
              onPress={() => handleMarkerPress(property)}
            >
              <View style={[
                styles.markerContainer,
                selectedProperty?.id === property.id && styles.selectedMarker
              ]}>
                <Text style={[
                  styles.markerText,
                  selectedProperty?.id === property.id && styles.selectedMarkerText
                ]}>
                  {formatPrice(property.price).replace(',000', 'k')}
                </Text>
              </View>
            </Marker>
          ))}
        </MapView>

        {/* Location Button */}
        <TouchableOpacity
          style={[styles.locationButton, { backgroundColor: colors.cardBackground }]}
          onPress={centerOnUserLocation}
        >
          <Icon name="locate" size={24} color={colors.primary} />
        </TouchableOpacity>

        {/* Property count */}
        <View style={[styles.propertyCount, { backgroundColor: colors.cardBackground }]}>
          <Text style={[styles.propertyCountText, { color: colors.text }]}>
            {filteredProperties.length} properties
          </Text>
        </View>

        {/* Selected Property Card */}
        <Animated.View
          style={[
            styles.propertyCardContainer,
            {
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          {selectedProperty && (
            <TouchableOpacity
              style={[styles.propertyCard, { backgroundColor: colors.cardBackground }]}
              onPress={() => navigation.navigate('PropertyDetails', { propertyId: selectedProperty.id })}
              activeOpacity={0.9}
            >
              <Image 
                source={{ uri: selectedProperty.images[0] }} 
                style={styles.propertyImage}
              />
              <View style={styles.propertyInfo}>
                <View style={styles.propertyHeader}>
                  <Text style={[styles.propertyPrice, { color: colors.primary }]}>
                    {formatPrice(selectedProperty.price)}
                  </Text>
                  <TouchableOpacity
                    onPress={() => setSelectedProperty(null)}
                    style={styles.closeButton}
                  >
                    <Icon name="close" size={20} color={colors.textSecondary} />
                  </TouchableOpacity>
                </View>
                <Text style={[styles.propertyAddress, { color: colors.text }]} numberOfLines={1}>
                  {selectedProperty.address}
                </Text>
                <Text style={[styles.propertyCity, { color: colors.textSecondary }]}>
                  {selectedProperty.city}, {selectedProperty.state}
                </Text>
                <View style={styles.propertyDetails}>
                  <View style={styles.detailItem}>
                    <Icon name="bed-outline" size={16} color={colors.textSecondary} />
                    <Text style={[styles.detailText, { color: colors.textSecondary }]}>
                      {selectedProperty.bedrooms}
                    </Text>
                  </View>
                  <View style={styles.detailDivider} />
                  <View style={styles.detailItem}>
                    <Icon name="water-outline" size={16} color={colors.textSecondary} />
                    <Text style={[styles.detailText, { color: colors.textSecondary }]}>
                      {selectedProperty.bathrooms}
                    </Text>
                  </View>
                  <View style={styles.detailDivider} />
                  <View style={styles.detailItem}>
                    <Icon name="resize-outline" size={16} color={colors.textSecondary} />
                    <Text style={[styles.detailText, { color: colors.textSecondary }]}>
                      {selectedProperty.squareFeet.toLocaleString()} sqft
                    </Text>
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          )}
        </Animated.View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  mapContainer: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
  markerContainer: {
    backgroundColor: '#FF6B6B',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  selectedMarker: {
    backgroundColor: '#4CCC93',
    transform: [{ scale: 1.1 }],
  },
  markerText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  selectedMarkerText: {
    color: '#fff',
  },
  locationButton: {
    position: 'absolute',
    top: 20,
    right: 20,
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  propertyCount: {
    position: 'absolute',
    top: 20,
    left: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  propertyCountText: {
    fontSize: 14,
    fontWeight: '600',
  },
  propertyCardContainer: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
  },
  propertyCard: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  propertyImage: {
    width: '100%',
    height: 150,
  },
  propertyInfo: {
    padding: 16,
  },
  propertyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  propertyPrice: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  closeButton: {
    padding: 4,
  },
  propertyAddress: {
    fontSize: 16,
    marginBottom: 2,
  },
  propertyCity: {
    fontSize: 14,
    marginBottom: 12,
  },
  propertyDetails: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  detailText: {
    marginLeft: 4,
    fontSize: 14,
  },
  detailDivider: {
    width: 1,
    height: 16,
    backgroundColor: 'rgba(255,255,255,0.2)',
    marginHorizontal: 8,
  },
});

export default MapScreen;