import React, { useRef, useEffect, useCallback, useState, useMemo } from 'react';
import {
  View,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Text,
  ActivityIndicator,
  Animated,
  Dimensions,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import ReactNativeHapticFeedback from 'react-native-haptic-feedback';

import OptimizedPropertyCard from '../components/OptimizedPropertyCard';
import SwipeCardStack, { SwipeCardStackRef } from '../components/SwipeCardStack';
import SimpleSwiper, { SimpleSwiperRef } from '../components/SimpleSwiper';
import FilterModal from '../components/FilterModal';
import AnimatedFeedback from '../components/AnimatedFeedback';
import NoMoreProperties from '../components/NoMoreProperties';
import { RootState } from '../store';
import {
  incrementIndex,
  decrementIndex,
  resetProperties,
  fetchProperties,
} from '../store/slices/propertiesSlice';
import {
  addSavedProperty,
  addPriorityProperty,
  addRejectedProperty,
  removeRejectedProperty,
  removeSavedProperty,
  savePropertyAsync,
  rejectPropertyAsync,
} from '../store/slices/userSlice';
import { Property, PropertyType, PropertyStatus, ListingType } from '../types';
import { RootStackParamList } from '../navigation/AppNavigator';
import { useTheme } from '../theme/ThemeContext';

type NavigationProp = StackNavigationProp<RootStackParamList, 'Main'>;

const { height: screenHeight } = Dimensions.get('window');

// Haptic feedback options
const hapticOptions = {
  enableVibrateFallback: true,
  ignoreAndroidSystemSettings: false,
};

// Location-specific data
const locationData: Record<
  string,
  {
    addresses: string[];
    priceMultiplier: number;
    features: string[];
    imageIds: number[];
    coordinates: { lat: number; lng: number };
  }
> = {
  Nashville: {
    addresses: [
      '123 Broadway',
      '456 Music Row',
      '789 Gulch Ave',
      '321 East Nashville St',
      '654 12 South Blvd',
    ],
    priceMultiplier: 1.2,
    features: ['Downtown Views', 'Walk to Honky Tonks', 'Music Room', 'Rooftop Deck'],
    imageIds: [1011, 1015, 1022, 1029, 1047],
    coordinates: { lat: 36.1627, lng: -86.7816 },
  },
  Franklin: {
    addresses: [
      '123 Main St',
      '456 Historic Downtown',
      '789 Cool Springs Blvd',
      "321 Leiper's Fork Rd",
      '654 Westhaven Dr',
    ],
    priceMultiplier: 1.1,
    features: ['Historic Charm', 'Large Lot', 'Walkable Downtown', 'Top Schools'],
    imageIds: [1018, 1021, 1035, 1043, 1054],
    coordinates: { lat: 35.9251, lng: -86.8689 },
  },
  Brentwood: {
    addresses: [
      "123 Governor's Way",
      '456 Concord Rd',
      '789 Wilson Pike',
      '321 Murray Ln',
      '654 Sunset Rd',
    ],
    priceMultiplier: 1.3,
    features: ['Gated Community', 'Premium Schools', 'Country Club Access', 'Large Estate'],
    imageIds: [1004, 1009, 1025, 1031, 1040],
    coordinates: { lat: 36.0331, lng: -86.7828 },
  },
  Murfreesboro: {
    addresses: [
      '123 MTSU Blvd',
      '456 Old Fort Pkwy',
      '789 Memorial Blvd',
      '321 Church St',
      '654 Greenway Dr',
    ],
    priceMultiplier: 0.8,
    features: ['Near MTSU', 'Growing Area', 'New Construction', 'First-Time Buyer Friendly'],
    imageIds: [1016, 1023, 1032, 1036, 1044],
    coordinates: { lat: 35.8456, lng: -86.3903 },
  },
  Hendersonville: {
    addresses: [
      '123 Lakeside Park Dr',
      '456 Indian Lake Blvd',
      '789 Sanders Ferry Rd',
      '321 Walton Ferry Rd',
      '654 New Shackle Island Rd',
    ],
    priceMultiplier: 0.9,
    features: ['Lake Access', 'Boat Dock', 'Water Views', 'Family Neighborhood'],
    imageIds: [1013, 1026, 1037, 1041, 1048],
    coordinates: { lat: 36.3048, lng: -86.62 },
  },
};

// Mock data generator with enhanced location support
const generateMockProperties = (filters?: any): Property[] => {
  const properties: Property[] = [];
  const defaultCity = 'Nashville';
  const propertyTypes = [PropertyType.SINGLE_FAMILY, PropertyType.CONDO, PropertyType.TOWNHOUSE];

  // Generate more properties to account for filtering
  for (let i = 0; i < 20; i++) {
    const city = filters?.location?.city || defaultCity;
    const state = filters?.location?.state || 'TN';
    const locationInfo = locationData[city] || locationData[defaultCity];

    // Calculate price based on location
    const basePrice = Math.floor(Math.random() * 500000) + 200000;
    const adjustedPrice = Math.floor(basePrice * locationInfo.priceMultiplier);
    const price =
      Math.floor(
        Math.random() *
          ((filters?.priceRange?.max || 2000000) - (filters?.priceRange?.min || 200000))
      ) + (filters?.priceRange?.min || 200000);

    const bedrooms = Math.floor(Math.random() * 4) + 1;
    const bathrooms = Math.floor(Math.random() * 3) + 1;
    const propertyType = propertyTypes[Math.floor(Math.random() * propertyTypes.length)];

    // Apply filters
    if (filters) {
      if (
        filters.priceRange &&
        (price < filters.priceRange.min || price > filters.priceRange.max)
      )
        continue;
      if (filters.bedrooms?.min && bedrooms < filters.bedrooms.min) continue;
      if (filters.bathrooms?.min && bathrooms < filters.bathrooms.min) continue;
      if (filters.propertyTypes?.length > 0 && !filters.propertyTypes.includes(propertyType))
        continue;
    }

    // Use location-specific addresses
    const address = locationInfo.addresses[i % locationInfo.addresses.length];

    // Generate 3-5 images per property using consistent image IDs
    const imageCount = Math.floor(Math.random() * 3) + 3;
    const images = [];
    for (let j = 0; j < imageCount; j++) {
      const imageId = locationInfo.imageIds[(i + j) % locationInfo.imageIds.length];
      images.push(`https://picsum.photos/id/${imageId}/400/600`);
    }

    // Mix location-specific features with general features
    const generalFeatures = [
      'Garage',
      'Updated Kitchen',
      'Hardwood Floors',
      'Stainless Appliances',
      'Master Suite',
    ];
    const selectedFeatures = [
      locationInfo.features[i % locationInfo.features.length],
      ...generalFeatures.sort(() => 0.5 - Math.random()).slice(0, 2),
    ];

    properties.push({
      id: `prop_${Date.now()}_${i}`,
      address,
      city,
      state,
      zipCode: city === 'Nashville' ? `3720${i}` : `3${Math.floor(Math.random() * 9000) + 1000}`,
      price: adjustedPrice,
      bedrooms,
      bathrooms,
      squareFeet: Math.floor(Math.random() * 2000) + 1500,
      propertyType,
      listingType: ListingType.FOR_SALE,
      images,
      description: `Beautiful ${propertyType.toLowerCase()} in the heart of ${city}. ${
        locationInfo.features[0]
      }.`,
      yearBuilt: 2000 + Math.floor(Math.random() * 24),
      lotSize: Math.random() * 0.5 + 0.1,
      features: selectedFeatures,
      latitude: locationInfo.coordinates.lat + (Math.random() - 0.5) * 0.1,
      longitude: locationInfo.coordinates.lng + (Math.random() - 0.5) * 0.1,
      daysOnMarket: Math.floor(Math.random() * 30) + 1,
      status: PropertyStatus.ACTIVE,
    });

    // Stop when we have enough properties
    if (properties.length >= 10) break;
  }

  return properties;
};

const SwipeScreen = () => {
  const dispatch = useDispatch();
  const navigation = useNavigation<NavigationProp>();
  const { colors } = useTheme();
  const swiperRef = useRef<SwipeCardStackRef | SimpleSwiperRef>(null);
  const USE_SIMPLE_SWIPER = false; // Toggle for fallback to simple swiper
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [feedbackType, setFeedbackType] = useState<'like' | 'dislike' | 'superlike' | null>(null);

  const { properties, currentIndex, isLoading, previousIndices } = useSelector(
    (state: RootState) => state.properties
  );
  const filters = useSelector((state: RootState) => state.filter);
  const { savedProperties, rejectedProperties } = useSelector((state: RootState) => state.user);

  const canUndo = previousIndices.length > 0 && currentIndex > 0;
  const hasMoreProperties = currentIndex < properties.length;
  const totalPropertiesViewed = currentIndex;

  // Memoize sliced properties to prevent unnecessary re-renders
  const currentCards = useMemo(
    () => properties.slice(currentIndex),
    [properties, currentIndex]
  );

  const loadProperties = useCallback(() => {
    dispatch(fetchProperties({ limit: 10, offset: properties.length }));
  }, [dispatch, properties.length]);

  useEffect(() => {
    if (properties.length === 0) {
      loadProperties();
    }
  }, [properties.length, loadProperties]);

  useEffect(() => {
    // Load more properties when getting close to the end
    if (properties.length - currentIndex < 3) {
      loadProperties();
    }
  }, [currentIndex, properties.length, loadProperties]);

  // Reload properties when filters change
  useEffect(() => {
    // Clear existing properties and reload with new filters
    dispatch(resetProperties());
    dispatch(fetchProperties({ limit: 10, offset: 0 }));
  }, [filters, dispatch]);


  const showFeedback = useCallback((type: 'like' | 'dislike' | 'superlike') => {
    setFeedbackType(type);
    ReactNativeHapticFeedback.trigger('impactMedium', hapticOptions);
  }, []);

  const handleSwipeRight = useCallback(
    (cardIndex: number) => {
      const property = properties[currentIndex];
      if (property) {
        dispatch(addSavedProperty(property.id));
        // Temporarily disable API call until server is properly configured
        // dispatch(savePropertyAsync(property.id));
        dispatch(incrementIndex());
        showFeedback('like');
      }
    },
    [currentIndex, dispatch, properties, showFeedback]
  );

  const handleSwipeLeft = useCallback(
    (cardIndex: number) => {
      const property = properties[currentIndex];
      if (property) {
        dispatch(addRejectedProperty(property.id));
        // Temporarily disable API call until server is properly configured
        // dispatch(rejectPropertyAsync(property.id));
        dispatch(incrementIndex());
        showFeedback('dislike');
      }
    },
    [currentIndex, dispatch, properties, showFeedback]
  );

  const handleSwipeTop = useCallback(
    (cardIndex: number) => {
      // Super like - save with priority flag
      const property = properties[currentIndex];
      if (property) {
        dispatch(addPriorityProperty(property.id));
        dispatch(incrementIndex());
        showFeedback('superlike');
      }
    },
    [currentIndex, dispatch, properties, showFeedback]
  );

  const handleUndo = useCallback(() => {
    if (!canUndo) return;

    dispatch(decrementIndex());
    ReactNativeHapticFeedback.trigger('impactLight', hapticOptions);

    // Remove the last action from saved/rejected properties
    const previousProperty = properties[previousIndices[previousIndices.length - 1]];
    if (previousProperty) {
      if (savedProperties.includes(previousProperty.id)) {
        dispatch(removeSavedProperty(previousProperty.id));
      } else if (rejectedProperties.includes(previousProperty.id)) {
        dispatch(removeRejectedProperty(previousProperty.id));
      }
    }
  }, [canUndo, dispatch, previousIndices, properties, rejectedProperties, savedProperties]);

  const navigateToPropertyDetails = useCallback(
    (propertyId: string) => {
      navigation.navigate('PropertyDetails', { propertyId });
    },
    [navigation]
  );

  const getActiveFiltersCount = useCallback(() => {
    let count = 0;
    if (filters.priceRange.min > 0 || filters.priceRange.max < 2000000) count++;
    if (filters.bedrooms.min > 0) count++;
    if (filters.bathrooms.min > 0) count++;
    if (filters.propertyTypes.length > 0) count++;
    if (filters.location.city !== 'Nashville' || filters.location.state !== 'TN') count++;
    return count;
  }, [filters]);

  const handleReset = useCallback(() => {
    dispatch(resetProperties());
    loadProperties();
  }, [dispatch, loadProperties]);

  const renderCard = useCallback(
    (property: Property, index: number) => (
      <OptimizedPropertyCard
        property={property}
        onPress={() => navigateToPropertyDetails(property.id)}
        style={styles.card}
      />
    ),
    [navigateToPropertyDetails]
  );

  if (properties.length === 0 && isLoading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
            Finding properties for you...
          </Text>
          </View>
        </SafeAreaView>
      </View>
    );
  }

  if (!hasMoreProperties) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <SafeAreaView style={styles.safeArea}>
          <View style={[styles.header, { backgroundColor: colors.background }]}>
          <Text style={[styles.headerTitle, { color: colors.primary }]}>That House</Text>
          <TouchableOpacity
            style={styles.filterButton}
            onPress={() => {
              ReactNativeHapticFeedback.trigger('impactLight', hapticOptions);
              setFilterModalVisible(true);
            }}
            activeOpacity={0.8}
          >
            <Icon name="options-outline" size={24} color={colors.text} />
            {getActiveFiltersCount() > 0 && (
              <View style={[styles.filterBadge, { backgroundColor: colors.primary }]}>
                <Text style={styles.filterBadgeText}>{getActiveFiltersCount()}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        <NoMoreProperties
          propertiesViewed={totalPropertiesViewed}
          onReset={handleReset}
          onOpenFilters={() => setFilterModalVisible(true)}
        />

        <FilterModal visible={filterModalVisible} onClose={() => setFilterModalVisible(false)} />
        </SafeAreaView>
      </View>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.innerContainer}>
        <View style={[styles.header, { backgroundColor: colors.background, borderBottomColor: colors.border }]}>
        <Text style={[styles.headerTitle, { color: colors.primary }]}>That House</Text>
        <TouchableOpacity
          style={styles.filterButton}
          onPress={() => {
            ReactNativeHapticFeedback.trigger('impactLight', hapticOptions);
            setFilterModalVisible(true);
          }}
          activeOpacity={0.8}
        >
          <Icon name="options-outline" size={24} color={colors.text} />
          {getActiveFiltersCount() > 0 && (
            <View style={[styles.filterBadge, { backgroundColor: colors.primary }]}>
              <Text style={styles.filterBadgeText}>{getActiveFiltersCount()}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>


      <AnimatedFeedback
        type={feedbackType || 'like'}
        visible={feedbackType !== null}
        onAnimationComplete={() => setFeedbackType(null)}
      />

      <View style={styles.swiperContainer}>
        {currentCards.length > 0 && hasMoreProperties && (
          USE_SIMPLE_SWIPER ? (
            <SimpleSwiper
              ref={swiperRef as React.RefObject<SimpleSwiperRef>}
              cards={currentCards}
              renderCard={(property) => renderCard(property, 0)}
              onSwipedRight={handleSwipeRight}
              onSwipedLeft={handleSwipeLeft}
              onSwipedTop={handleSwipeTop}
            />
          ) : (
            <SwipeCardStack
              ref={swiperRef as React.RefObject<SwipeCardStackRef>}
              cards={currentCards}
              renderCard={renderCard}
              onSwipedRight={handleSwipeRight}
              onSwipedLeft={handleSwipeLeft}
              onSwipedTop={handleSwipeTop}
              stackSize={3}
              stackScale={5}
              stackSeparation={15}
            />
          )
        )}
      </View>


      <FilterModal visible={filterModalVisible} onClose={() => setFilterModalVisible(false)} />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  innerContainer: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    paddingTop: 5,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
    backgroundColor: '#fff',
    zIndex: 10,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: 'bold',
  },
  filterButton: {
    padding: 8,
    position: 'relative',
  },
  filterBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  swiperContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  card: {
    position: 'absolute',
    top: 0,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  safeArea: {
    flex: 1,
  },
});

export default SwipeScreen;