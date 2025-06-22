import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  Platform,
  Alert,
  Image,
} from 'react-native';
import { NativeMapView, NativeMarker, NativeCallout } from '../components/NativeMapView';
import EnhancedSimpleMapView from '../components/EnhancedSimpleMapView';
import Icon from 'react-native-vector-icons/Ionicons';
import { useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootState } from '../store';
import { RootStackParamList } from '../navigation/AppNavigator';
import { useTheme } from '../theme/ThemeContext';
import { Property } from '../types';
import MapControls, { MapStyle, ViewMode } from '../components/map/MapControls';
import DrawingTools from '../components/map/DrawingTools';
import CommuteTimeOverlay from '../components/map/CommuteTimeOverlay';
import EnhancedPropertyPreview from '../components/map/EnhancedPropertyPreview';
import { MapCacheManager, generateRegionKey } from '../utils/mapCache';
import { getCurrentLocation, screenToGeoCoords, isPointInPolygon } from '../utils/locationUtils';

type NavigationProp = StackNavigationProp<RootStackParamList, 'Main'>;

interface Region {
  latitude: number;
  longitude: number;
  latitudeDelta: number;
  longitudeDelta: number;
}

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

const MapScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const { colors, isDark } = useTheme();
  const filters = useSelector((state: RootState) => state.filter);
  const properties = useSelector((state: RootState) => state.properties.properties);
  
  const mapRef = useRef<any>(null);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [showPropertyList, setShowPropertyList] = useState(true);
  const [useSimpleMap, setUseSimpleMap] = useState(true);
  const [showControls, setShowControls] = useState(false);
  
  // Map control states
  const [mapStyle, setMapStyle] = useState<MapStyle>('standard');
  const [viewMode, setViewMode] = useState<ViewMode>('map');
  const [showAmenities, setShowAmenities] = useState(false);
  const [showSchoolDistricts, setShowSchoolDistricts] = useState(false);
  const [showNeighborhoods, setShowNeighborhoods] = useState(false);
  const [isNorthUp, setIsNorthUp] = useState(true);
  const [showDrawingTools, setShowDrawingTools] = useState(false);
  const [showCommuteTime, setShowCommuteTime] = useState(false);
  const [drawnArea, setDrawnArea] = useState<{ x: number; y: number }[]>();
  const [commuteOrigin, setCommuteOrigin] = useState<{ latitude: number; longitude: number }>();
  const [currentLocation, setCurrentLocation] = useState<{ latitude: number; longitude: number }>();
  
  // Get initial region based on filters or default to Nashville
  const getInitialRegion = (): Region => {
    const locationData: Record<string, { lat: number; lng: number }> = {
      Nashville: { lat: 36.1627, lng: -86.7816 },
      Franklin: { lat: 35.9251, lng: -86.8689 },
      Brentwood: { lat: 36.0331, lng: -86.7828 },
      Murfreesboro: { lat: 35.8456, lng: -86.3903 },
      Hendersonville: { lat: 36.3048, lng: -86.6200 },
    };
    
    const city = filters.location.city || 'Nashville';
    const coords = locationData[city] || locationData.Nashville;
    
    return {
      latitude: coords.lat,
      longitude: coords.lng,
      latitudeDelta: 0.15,
      longitudeDelta: 0.15,
    };
  };
  
  const [region, setRegion] = useState<Region>(getInitialRegion());
  
  // Update region when filter location changes
  useEffect(() => {
    setRegion(getInitialRegion());
  }, [filters.location.city]);

  // Cache current region data
  useEffect(() => {
    const cacheCurrentRegion = async () => {
      const regionKey = generateRegionKey(region);
      const simplifiedProperties = properties.map(p => ({
        id: p.id,
        latitude: p.latitude,
        longitude: p.longitude,
        price: p.price,
        address: p.address,
      }));

      await MapCacheManager.cacheRegion(regionKey, {
        region,
        properties: simplifiedProperties,
        timestamp: Date.now(),
      });
    };

    cacheCurrentRegion();
  }, [region, properties]);

  // Get actual current location on mount
  useEffect(() => {
    const fetchCurrentLocation = async () => {
      const location = await getCurrentLocation();
      if (location) {
        setCurrentLocation(location);
      }
    };
    fetchCurrentLocation();
  }, []);
  
  const handleMarkerPress = (property: Property) => {
    setSelectedProperty(property);
    mapRef.current?.animateToRegion({
      latitude: property.latitude,
      longitude: property.longitude,
      latitudeDelta: 0.05,
      longitudeDelta: 0.05,
    }, 500);
  };

  const handleZoomToLocation = async () => {
    const location = await getCurrentLocation();
    if (location) {
      setCurrentLocation(location);
      const newRegion = {
        ...location,
        latitudeDelta: 0.02,
        longitudeDelta: 0.02,
      };
      setRegion(newRegion);
      mapRef.current?.animateToRegion(newRegion, 500);
    }
  };

  const handleZoomToFit = () => {
    if (properties.length === 0) return;

    const minLat = Math.min(...properties.map(p => p.latitude));
    const maxLat = Math.max(...properties.map(p => p.latitude));
    const minLng = Math.min(...properties.map(p => p.longitude));
    const maxLng = Math.max(...properties.map(p => p.longitude));

    const newRegion = {
      latitude: (minLat + maxLat) / 2,
      longitude: (minLng + maxLng) / 2,
      latitudeDelta: (maxLat - minLat) * 1.2,
      longitudeDelta: (maxLng - minLng) * 1.2,
    };

    setRegion(newRegion);
    mapRef.current?.animateToRegion(newRegion, 500);
  };

  const handleToggleOrientation = () => {
    setIsNorthUp(!isNorthUp);
    // Note: Map rotation would require native map implementation
    // For now, we just toggle the state for UI feedback
    if (!isNorthUp) {
      mapRef.current?.animateToRegion(region, 300);
    }
  };

  const handleAreaComplete = (points: { x: number; y: number }[]) => {
    setDrawnArea(points);
    
    // Convert screen coordinates to geographic coordinates and filter properties
    const geoPolygon = points.map(point => 
      screenToGeoCoords(point, region, { width: screenWidth, height: screenHeight })
    );
    
    // Filter properties within the drawn area
    const propertiesInArea = properties.filter(property => {
      const screenPoint = {
        x: ((property.longitude - region.longitude + region.longitudeDelta / 2) / region.longitudeDelta) * screenWidth,
        y: ((region.latitude + region.latitudeDelta / 2 - property.latitude) / region.latitudeDelta) * screenHeight
      };
      return isPointInPolygon(screenPoint, points);
    });
    
    Alert.alert(
      'Area Selection', 
      `Found ${propertiesInArea.length} properties in the selected area`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Apply Filter', 
          onPress: () => {
            // Here you could dispatch an action to filter properties
            console.log('Properties in area:', propertiesInArea);
          }
        }
      ]
    );
  };

  const handleSetCommuteOrigin = async (address: string) => {
    // In a production app, you would geocode the address using a geocoding service
    // For now, we'll use the current region center as a placeholder
    const mockGeocodeResult = {
      latitude: region.latitude + (Math.random() - 0.5) * 0.1,
      longitude: region.longitude + (Math.random() - 0.5) * 0.1,
    };
    
    setCommuteOrigin(mockGeocodeResult);
    setShowCommuteTime(false);
    
    // Show commute time zones (this would be calculated with real routing data)
    Alert.alert(
      'Commute Origin Set', 
      `Origin set to: ${address}\nCommute time zones will be displayed on the map.`,
      [{ text: 'OK' }]
    );
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 20,
      paddingVertical: 15,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
      flexWrap: 'wrap',
    },
    headerTitle: {
      fontSize: 20,
      fontWeight: 'bold',
      color: colors.text,
    },
    locationInfo: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    locationText: {
      fontSize: 14,
      color: colors.textSecondary,
      marginLeft: 5,
    },
    headerControls: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    controlButton: {
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 6,
      backgroundColor: colors.backgroundSecondary,
      borderWidth: 1,
      borderColor: colors.border,
    },
    controlButtonActive: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
    },
    controlButtonText: {
      color: colors.text,
      fontSize: 12,
      fontWeight: '600',
    },
    controlButtonTextActive: {
      color: colors.textInverse,
    },
    mapContainer: {
      flex: 1,
      position: 'relative',
    },
    map: {
      flex: 1,
    },
    markerContainer: {
      backgroundColor: colors.background,
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 12,
      borderWidth: 2,
      borderColor: colors.primary,
      shadowColor: colors.shadowColor,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.2,
      shadowRadius: 4,
      elevation: 3,
    },
    selectedMarker: {
      backgroundColor: colors.primary,
      transform: [{ scale: 1.1 }],
    },
    markerText: {
      fontSize: 12,
      fontWeight: 'bold',
      color: colors.primary,
    },
    selectedMarkerText: {
      color: colors.textInverse,
    },
    listToggleButton: {
      position: 'absolute',
      bottom: showPropertyList ? 160 : 20,
      right: 20,
      backgroundColor: colors.background,
      padding: 12,
      borderRadius: 8,
      shadowColor: colors.shadowColor,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    propertyListContainer: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      height: 150,
      backgroundColor: 'transparent',
    },
    propertyList: {
      flex: 1,
    },
    propertyListContent: {
      paddingHorizontal: 10,
      paddingVertical: 10,
    },
    propertyCard: {
      width: 280,
      backgroundColor: colors.cardBackground,
      borderRadius: 12,
      marginHorizontal: 5,
      shadowColor: colors.shadowColor,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
      flexDirection: 'row',
      overflow: 'hidden',
    },
    selectedPropertyCard: {
      borderWidth: 2,
      borderColor: colors.primary,
    },
    propertyImage: {
      width: 100,
      height: '100%',
    },
    propertyInfo: {
      flex: 1,
      padding: 12,
    },
    propertyPrice: {
      fontSize: 18,
      fontWeight: 'bold',
      color: colors.text,
    },
    propertyAddress: {
      fontSize: 14,
      color: colors.textSecondary,
      marginTop: 2,
    },
    propertyDetails: {
      fontSize: 12,
      color: colors.textTertiary,
      marginTop: 4,
    },
    calloutContainer: {
      width: 200,
      backgroundColor: colors.background,
      borderRadius: 12,
      overflow: 'hidden',
      shadowColor: colors.shadowColor,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.2,
      shadowRadius: 4,
      elevation: 5,
    },
    calloutImage: {
      width: '100%',
      height: 100,
    },
    calloutInfo: {
      padding: 10,
    },
    calloutPrice: {
      fontSize: 16,
      fontWeight: 'bold',
      color: colors.text,
    },
    calloutAddress: {
      fontSize: 14,
      color: colors.textSecondary,
      marginTop: 2,
    },
    calloutDetails: {
      fontSize: 12,
      color: colors.textTertiary,
      marginTop: 2,
    },
  });

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  const renderPropertyCard = (property: Property) => (
    <TouchableOpacity
      key={property.id}
      style={[styles.propertyCard, selectedProperty?.id === property.id && styles.selectedPropertyCard]}
      onPress={() => {
        setSelectedProperty(property);
        handleMarkerPress(property);
      }}
      activeOpacity={0.9}
    >
      <Image source={{ uri: property.images[0] }} style={styles.propertyImage} />
      <View style={styles.propertyInfo}>
        <Text style={styles.propertyPrice}>{formatPrice(property.price)}</Text>
        <Text style={styles.propertyAddress}>{property.address}</Text>
        <Text style={styles.propertyDetails}>
          {property.bedrooms} bed • {property.bathrooms} bath • {property.squareFeet.toLocaleString()} sqft
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Map View</Text>
        <View style={styles.headerControls}>
          <TouchableOpacity 
            style={[styles.controlButton, showControls && styles.controlButtonActive]}
            onPress={() => setShowControls(!showControls)}
          >
            <Text style={[styles.controlButtonText, showControls && styles.controlButtonTextActive]}>
              Controls
            </Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.controlButton, { backgroundColor: colors.primary }]}
            onPress={() => setUseSimpleMap(!useSimpleMap)}
          >
            <Text style={[styles.controlButtonText, styles.controlButtonTextActive]}>
              {useSimpleMap ? 'Try Native Map' : 'Use Simple Map'}
            </Text>
          </TouchableOpacity>
        </View>
        <View style={styles.locationInfo}>
          <Icon name="location" size={16} color={colors.primary} />
          <Text style={styles.locationText}>
            {filters.location.city}, {filters.location.state}
          </Text>
        </View>
      </View>

      <View style={styles.mapContainer}>
        {useSimpleMap ? (
          <EnhancedSimpleMapView
            properties={properties}
            selectedProperty={selectedProperty}
            onPropertySelect={handleMarkerPress}
            onPropertyPress={(property) => navigation.navigate('PropertyDetails', { propertyId: property.id })}
            region={region}
            mapStyle={mapStyle}
            viewMode={viewMode}
            showAmenities={showAmenities}
            showSchoolDistricts={showSchoolDistricts}
            showNeighborhoods={showNeighborhoods}
            drawnArea={drawnArea}
            commuteOrigin={commuteOrigin}
          />
        ) : (
          <NativeMapView
            ref={mapRef}
            style={styles.map}
            provider={undefined}
            initialRegion={region}
            region={region}
            onRegionChangeComplete={setRegion}
            customMapStyle={[]}
            showsUserLocation
            showsMyLocationButton={false}
            userInterfaceStyle={isDark ? 'dark' : 'light'}
            onFallbackPress={() => setUseSimpleMap(true)}
          >
            {properties.map((property) => (
              <NativeMarker
                key={property.id}
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
                    {formatPrice(property.price)}
                  </Text>
                </View>
                
                <NativeCallout tooltip>
                  <View style={styles.calloutContainer}>
                    <Image source={{ uri: property.images[0] }} style={styles.calloutImage} />
                    <View style={styles.calloutInfo}>
                      <Text style={styles.calloutPrice}>{formatPrice(property.price)}</Text>
                      <Text style={styles.calloutAddress}>{property.address}</Text>
                      <Text style={styles.calloutDetails}>
                        {property.bedrooms} bed • {property.bathrooms} bath
                      </Text>
                    </View>
                  </View>
                </NativeCallout>
              </NativeMarker>
            ))}
          </NativeMapView>
        )}

        {/* Map Controls */}
        {showControls && (
          <MapControls
            mapStyle={mapStyle}
            onMapStyleChange={setMapStyle}
            viewMode={viewMode}
            onViewModeChange={setViewMode}
            showAmenities={showAmenities}
            onToggleAmenities={() => setShowAmenities(!showAmenities)}
            showSchoolDistricts={showSchoolDistricts}
            onToggleSchoolDistricts={() => setShowSchoolDistricts(!showSchoolDistricts)}
            showNeighborhoods={showNeighborhoods}
            onToggleNeighborhoods={() => setShowNeighborhoods(!showNeighborhoods)}
            onZoomToLocation={handleZoomToLocation}
            onZoomToFit={handleZoomToFit}
            onToggleOrientation={handleToggleOrientation}
            isNorthUp={isNorthUp}
            showDrawingTools={showDrawingTools}
            onToggleDrawingTools={() => setShowDrawingTools(!showDrawingTools)}
            showCommuteTime={showCommuteTime}
            onToggleCommuteTime={() => setShowCommuteTime(!showCommuteTime)}
          />
        )}

        {/* Drawing Tools */}
        {showDrawingTools && (
          <DrawingTools
            onAreaComplete={handleAreaComplete}
            onClear={() => setDrawnArea(undefined)}
          />
        )}

        {/* Commute Time Overlay */}
        {showCommuteTime && (
          <CommuteTimeOverlay
            origin={commuteOrigin || null}
            onSetOrigin={handleSetCommuteOrigin}
            onClose={() => setShowCommuteTime(false)}
          />
        )}

        {/* Enhanced Property Preview */}
        {selectedProperty && !showPropertyList && (
          <EnhancedPropertyPreview
            property={selectedProperty}
            onClose={() => setSelectedProperty(null)}
            onViewDetails={() => navigation.navigate('PropertyDetails', { propertyId: selectedProperty.id })}
            currentLocation={currentLocation}
          />
        )}

        <TouchableOpacity 
          style={styles.listToggleButton}
          onPress={() => setShowPropertyList(!showPropertyList)}
        >
          <Icon 
            name={showPropertyList ? "chevron-down" : "chevron-up"} 
            size={24} 
            color={colors.text} 
          />
        </TouchableOpacity>
      </View>

      {/* Property list at bottom */}
      {showPropertyList && (
        <View style={styles.propertyListContainer}>
          <ScrollView 
            style={styles.propertyList} 
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.propertyListContent}
          >
            {properties.map(renderPropertyCard)}
          </ScrollView>
        </View>
      )}
    </SafeAreaView>
  );
};

export default MapScreen;