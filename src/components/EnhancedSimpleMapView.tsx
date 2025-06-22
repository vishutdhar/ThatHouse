import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Dimensions,
  ScrollView,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import Svg, { Path, Circle, Polygon, Rect, Text as SvgText } from 'react-native-svg';
import { useTheme } from '../theme/ThemeContext';
import { Property } from '../types';
import PropertyCluster from './map/PropertyCluster';
import HeatmapOverlay from './map/HeatmapOverlay';
import { ViewMode } from './map/MapControls';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

interface EnhancedSimpleMapViewProps {
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
  mapStyle: 'standard' | 'satellite' | 'terrain';
  viewMode: ViewMode;
  showAmenities: boolean;
  showSchoolDistricts: boolean;
  showNeighborhoods: boolean;
  drawnArea?: { x: number; y: number }[];
  commuteOrigin?: { latitude: number; longitude: number };
}

interface Cluster {
  id: string;
  properties: Property[];
  centerLat: number;
  centerLng: number;
  averagePrice: number;
}

const EnhancedSimpleMapView: React.FC<EnhancedSimpleMapViewProps> = ({
  properties,
  selectedProperty,
  onPropertySelect,
  onPropertyPress,
  region,
  mapStyle,
  viewMode,
  showAmenities,
  showSchoolDistricts,
  showNeighborhoods,
  drawnArea,
  commuteOrigin,
}) => {
  const { colors, isDark } = useTheme();
  const [clusters, setClusters] = useState<Cluster[]>([]);
  const [zoomLevel, setZoomLevel] = useState(1);

  // Mock data for overlays
  const amenities = [
    { id: '1', type: 'school', name: 'Nashville Elementary', lat: 36.17, lng: -86.78 },
    { id: '2', type: 'shopping', name: 'Green Hills Mall', lat: 36.10, lng: -86.81 },
    { id: '3', type: 'transit', name: 'Music City Star', lat: 36.16, lng: -86.78 },
  ];

  const schoolDistricts = [
    { id: '1', name: 'Davidson County Schools', color: 'rgba(54, 162, 235, 0.3)' },
    { id: '2', name: 'Williamson County Schools', color: 'rgba(255, 206, 86, 0.3)' },
  ];

  const neighborhoods = [
    { id: '1', name: 'Green Hills', bounds: { x: 100, y: 200, width: 150, height: 100 } },
    { id: '2', name: 'East Nashville', bounds: { x: 300, y: 150, width: 120, height: 120 } },
  ];

  // Calculate clusters based on zoom level
  useEffect(() => {
    const calculateClusters = () => {
      if (zoomLevel > 0.5 || properties.length < 5) {
        setClusters([]);
        return;
      }

      const clusterDistance = 50; // pixels
      const newClusters: Cluster[] = [];
      const clusteredProperties = new Set<string>();

      properties.forEach((property) => {
        if (clusteredProperties.has(property.id)) return;

        const cluster: Cluster = {
          id: `cluster-${property.id}`,
          properties: [property],
          centerLat: property.latitude,
          centerLng: property.longitude,
          averagePrice: property.price,
        };

        // Find nearby properties
        properties.forEach((otherProperty) => {
          if (
            otherProperty.id !== property.id &&
            !clusteredProperties.has(otherProperty.id)
          ) {
            const distance = getPixelDistance(property, otherProperty);
            if (distance < clusterDistance) {
              cluster.properties.push(otherProperty);
              clusteredProperties.add(otherProperty.id);
            }
          }
        });

        if (cluster.properties.length > 1) {
          // Calculate cluster center
          cluster.centerLat =
            cluster.properties.reduce((sum, p) => sum + p.latitude, 0) /
            cluster.properties.length;
          cluster.centerLng =
            cluster.properties.reduce((sum, p) => sum + p.longitude, 0) /
            cluster.properties.length;
          cluster.averagePrice =
            cluster.properties.reduce((sum, p) => sum + p.price, 0) /
            cluster.properties.length;

          newClusters.push(cluster);
          cluster.properties.forEach((p) => clusteredProperties.add(p.id));
        }
      });

      setClusters(newClusters);
    };

    calculateClusters();
  }, [properties, zoomLevel]);

  const getPixelDistance = (p1: Property, p2: Property) => {
    const coords1 = getScreenCoords(p1.latitude, p1.longitude);
    const coords2 = getScreenCoords(p2.latitude, p2.longitude);
    return Math.sqrt(
      Math.pow(coords2.x - coords1.x, 2) + Math.pow(coords2.y - coords1.y, 2)
    );
  };

  const getScreenCoords = (lat: number, lng: number) => {
    const x = ((lng - region.longitude) / region.longitudeDelta + 0.5) * screenWidth;
    const y = ((region.latitude - lat) / region.latitudeDelta + 0.5) * screenHeight * 0.7;
    return { x, y };
  };

  const getMapBackground = () => {
    switch (mapStyle) {
      case 'satellite':
        return colors.backgroundDark;
      case 'terrain':
        return '#E8DCC0';
      default:
        return colors.backgroundSecondary;
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

  const renderAmenityIcon = (type: string) => {
    switch (type) {
      case 'school':
        return 'school-outline';
      case 'shopping':
        return 'cart-outline';
      case 'transit':
        return 'train-outline';
      default:
        return 'location-outline';
    }
  };

  const getCommuteTimeColor = (property: Property) => {
    if (!commuteOrigin) return null;
    
    // Simplified commute time calculation based on distance
    const distance = Math.sqrt(
      Math.pow(property.latitude - commuteOrigin.latitude, 2) +
      Math.pow(property.longitude - commuteOrigin.longitude, 2)
    );
    
    if (distance < 0.1) return '#4CAF50';
    if (distance < 0.2) return '#FFC107';
    if (distance < 0.3) return '#FF9800';
    return '#F44336';
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: getMapBackground(),
    },
    mapContainer: {
      flex: 1,
      position: 'relative',
      overflow: 'hidden',
    },
    gridOverlay: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
    },
    marker: {
      position: 'absolute',
      paddingHorizontal: 10,
      paddingVertical: 6,
      borderRadius: 15,
      borderWidth: 2,
      borderColor: colors.primary,
      backgroundColor: colors.background,
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
    amenityMarker: {
      position: 'absolute',
      width: 32,
      height: 32,
      borderRadius: 16,
      backgroundColor: colors.background,
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 2,
      borderColor: colors.secondary,
      shadowColor: colors.shadowColor,
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.1,
      shadowRadius: 2,
      elevation: 2,
    },
    overlayText: {
      position: 'absolute',
      backgroundColor: 'rgba(255, 255, 255, 0.9)',
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 4,
      fontSize: 12,
      fontWeight: '600',
    },
    mapStyleIndicator: {
      position: 'absolute',
      top: 10,
      left: 10,
      backgroundColor: colors.background,
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 20,
      flexDirection: 'row',
      alignItems: 'center',
      shadowColor: colors.shadowColor,
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.1,
      shadowRadius: 2,
      elevation: 2,
    },
    mapStyleText: {
      fontSize: 12,
      color: colors.text,
      marginLeft: 6,
      textTransform: 'capitalize',
    },
  });

  const clusteredPropertyIds = new Set(
    clusters.flatMap((cluster) => cluster.properties.map((p) => p.id))
  );

  return (
    <View style={styles.container}>
      <View style={styles.mapContainer}>
        {/* Grid overlay for terrain style */}
        {mapStyle === 'terrain' && (
          <Svg style={styles.gridOverlay} width={screenWidth} height={screenHeight * 0.7}>
            {Array.from({ length: 10 }).map((_, i) => (
              <React.Fragment key={i}>
                <Path
                  d={`M0,${(i + 1) * 70} L${screenWidth},${(i + 1) * 70}`}
                  stroke="rgba(0,0,0,0.1)"
                  strokeWidth="1"
                />
                <Path
                  d={`M${(i + 1) * (screenWidth / 10)},0 L${(i + 1) * (screenWidth / 10)},${screenHeight * 0.7}`}
                  stroke="rgba(0,0,0,0.1)"
                  strokeWidth="1"
                />
              </React.Fragment>
            ))}
          </Svg>
        )}

        {/* School Districts Overlay */}
        {showSchoolDistricts && viewMode === 'boundaries' && (
          <Svg style={StyleSheet.absoluteFillObject} width={screenWidth} height={screenHeight * 0.7}>
            <Rect x="50" y="100" width="200" height="150" fill={schoolDistricts[0].color} />
            <Rect x="250" y="150" width="180" height="200" fill={schoolDistricts[1].color} />
            <SvgText x="150" y="175" fill="black" fontSize="14" fontWeight="bold" textAnchor="middle">
              {schoolDistricts[0].name}
            </SvgText>
            <SvgText x="340" y="250" fill="black" fontSize="14" fontWeight="bold" textAnchor="middle">
              {schoolDistricts[1].name}
            </SvgText>
          </Svg>
        )}

        {/* Neighborhoods Overlay */}
        {showNeighborhoods && viewMode === 'boundaries' && neighborhoods.map((neighborhood) => (
          <View
            key={neighborhood.id}
            style={[
              styles.overlayText,
              {
                left: neighborhood.bounds.x + neighborhood.bounds.width / 2 - 40,
                top: neighborhood.bounds.y + neighborhood.bounds.height / 2 - 10,
              },
            ]}
          >
            <Text style={{ color: colors.text }}>{neighborhood.name}</Text>
          </View>
        ))}

        {/* Heatmap Overlay */}
        {viewMode === 'heatmap' && <HeatmapOverlay properties={properties} region={region} />}

        {/* Drawn Area Overlay */}
        {drawnArea && drawnArea.length > 2 && (
          <Svg style={StyleSheet.absoluteFillObject} width={screenWidth} height={screenHeight * 0.7}>
            <Polygon
              points={drawnArea.map((p) => `${p.x},${p.y}`).join(' ')}
              fill="rgba(255, 107, 107, 0.2)"
              stroke={colors.primary}
              strokeWidth="3"
            />
          </Svg>
        )}

        {/* Commute Time Zones */}
        {commuteOrigin && (
          <Svg style={StyleSheet.absoluteFillObject} width={screenWidth} height={screenHeight * 0.7}>
            {[15, 30, 45].map((minutes, index) => {
              const radius = (index + 1) * 80;
              const originCoords = getScreenCoords(commuteOrigin.latitude, commuteOrigin.longitude);
              return (
                <Circle
                  key={minutes}
                  cx={originCoords.x}
                  cy={originCoords.y}
                  r={radius}
                  fill="none"
                  stroke={['#4CAF50', '#FFC107', '#FF9800'][index]}
                  strokeWidth="2"
                  strokeDasharray="5,5"
                />
              );
            })}
          </Svg>
        )}

        {/* Property Clusters */}
        {viewMode === 'map' && clusters.map((cluster) => {
          const position = getScreenCoords(cluster.centerLat, cluster.centerLng);
          return (
            <TouchableOpacity
              key={cluster.id}
              style={[styles.marker, { left: position.x - 30, top: position.y - 15 }]}
              onPress={() => {
                // Zoom in on cluster
                setZoomLevel(0.6);
              }}
            >
              <PropertyCluster
                count={cluster.properties.length}
                averagePrice={cluster.averagePrice}
              />
            </TouchableOpacity>
          );
        })}

        {/* Individual Property Markers */}
        {viewMode === 'map' && properties
          .filter((property) => !clusteredPropertyIds.has(property.id))
          .map((property) => {
            const position = getScreenCoords(property.latitude, property.longitude);
            const isSelected = selectedProperty?.id === property.id;
            const commuteColor = getCommuteTimeColor(property);

            return (
              <TouchableOpacity
                key={property.id}
                style={[
                  styles.marker,
                  { left: position.x - 40, top: position.y - 15 },
                  isSelected && styles.selectedMarker,
                  commuteColor && { borderColor: commuteColor },
                ]}
                onPress={() => onPropertySelect(property)}
                activeOpacity={0.8}
              >
                <Text
                  style={[
                    styles.markerText,
                    isSelected && styles.selectedMarkerText,
                  ]}
                >
                  {formatPrice(property.price)}
                </Text>
              </TouchableOpacity>
            );
          })}

        {/* Amenities Markers */}
        {showAmenities && amenities.map((amenity) => {
          const position = getScreenCoords(amenity.lat, amenity.lng);
          return (
            <View
              key={amenity.id}
              style={[
                styles.amenityMarker,
                { left: position.x - 16, top: position.y - 16 },
              ]}
            >
              <Icon
                name={renderAmenityIcon(amenity.type)}
                size={16}
                color={colors.secondary}
              />
            </View>
          );
        })}

        {/* Map Style Indicator */}
        <View style={styles.mapStyleIndicator}>
          <Icon
            name={
              mapStyle === 'satellite'
                ? 'globe-outline'
                : mapStyle === 'terrain'
                ? 'trail-sign-outline'
                : 'map-outline'
            }
            size={16}
            color={colors.text}
          />
          <Text style={styles.mapStyleText}>{mapStyle}</Text>
        </View>
      </View>
    </View>
  );
};

export default EnhancedSimpleMapView;