import React, { useRef, useEffect, useCallback, useState } from 'react';
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
import Swiper from 'react-native-deck-swiper';
import Icon from 'react-native-vector-icons/Ionicons';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import ReactNativeHapticFeedback from 'react-native-haptic-feedback';

import PropertyCard from '../components/PropertyCard';
import FilterModal from '../components/FilterModal';
import AnimatedFeedback from '../components/AnimatedFeedback';
import ProgressIndicator from '../components/ProgressIndicator';
import NoMoreProperties from '../components/NoMoreProperties';
import { RootState } from '../store';
import { 
  incrementIndex, 
  decrementIndex,
  fetchPropertiesStart, 
  fetchPropertiesSuccess,
  resetProperties 
} from '../store/slices/propertiesSlice';
import { 
  addSavedProperty, 
  addPriorityProperty,
  addRejectedProperty,
  removeRejectedProperty,
  removeSavedProperty,
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
const locationData: Record<string, {
  addresses: string[];
  priceMultiplier: number;
  features: string[];
  imageIds: number[];
  coordinates: { lat: number; lng: number };
}> = {
  Nashville: {
    addresses: ['123 Broadway', '456 Music Row', '789 Gulch Ave', '321 East Nashville St', '654 12 South Blvd'],
    priceMultiplier: 1.2,
    features: ['Downtown Views', 'Walk to Honky Tonks', 'Music Room', 'Rooftop Deck'],
    imageIds: [1011, 1015, 1022, 1029, 1047],
    coordinates: { lat: 36.1627, lng: -86.7816 }
  },
  Franklin: {
    addresses: ['123 Main St', '456 Historic Downtown', '789 Cool Springs Blvd', '321 Leiper\'s Fork Rd', '654 Westhaven Dr'],
    priceMultiplier: 1.1,
    features: ['Historic Charm', 'Large Lot', 'Walkable Downtown', 'Top Schools'],
    imageIds: [1018, 1021, 1035, 1043, 1054],
    coordinates: { lat: 35.9251, lng: -86.8689 }
  },
  Brentwood: {
    addresses: ['123 Governor\'s Way', '456 Concord Rd', '789 Wilson Pike', '321 Murray Ln', '654 Sunset Rd'],
    priceMultiplier: 1.3,
    features: ['Gated Community', 'Premium Schools', 'Country Club Access', 'Large Estate'],
    imageIds: [1004, 1009, 1025, 1031, 1040],
    coordinates: { lat: 36.0331, lng: -86.7828 }
  },
  Murfreesboro: {
    addresses: ['123 MTSU Blvd', '456 Old Fort Pkwy', '789 Memorial Blvd', '321 Church St', '654 Greenway Dr'],
    priceMultiplier: 0.8,
    features: ['Near MTSU', 'Growing Area', 'New Construction', 'First-Time Buyer Friendly'],
    imageIds: [1016, 1023, 1032, 1036, 1044],
    coordinates: { lat: 35.8456, lng: -86.3903 }
  },
  Hendersonville: {
    addresses: ['123 Lakeside Park Dr', '456 Indian Lake Blvd', '789 Sanders Ferry Rd', '321 Walton Ferry Rd', '654 New Shackle Island Rd'],
    priceMultiplier: 0.9,
    features: ['Lake Access', 'Boat Dock', 'Water Views', 'Family Neighborhood'],
    imageIds: [1013, 1026, 1037, 1041, 1048],
    coordinates: { lat: 36.3048, lng: -86.6200 }
  }
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
    const price = Math.floor(Math.random() * ((filters?.priceRange?.max || 2000000) - (filters?.priceRange?.min || 200000))) + (filters?.priceRange?.min || 200000);
    
    const bedrooms = Math.floor(Math.random() * 4) + 1;
    const bathrooms = Math.floor(Math.random() * 3) + 1;
    const propertyType = propertyTypes[Math.floor(Math.random() * propertyTypes.length)];
    
    // Apply filters
    if (filters) {
      if (filters.priceRange && (price < filters.priceRange.min || price > filters.priceRange.max)) continue;
      if (filters.bedrooms?.min && bedrooms < filters.bedrooms.min) continue;
      if (filters.bathrooms?.min && bathrooms < filters.bathrooms.min) continue;
      if (filters.propertyTypes?.length > 0 && !filters.propertyTypes.includes(propertyType)) continue;
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
    const generalFeatures = ['Garage', 'Updated Kitchen', 'Hardwood Floors', 'Stainless Appliances', 'Master Suite'];
    const selectedFeatures = [
      locationInfo.features[i % locationInfo.features.length],
      ...generalFeatures.sort(() => 0.5 - Math.random()).slice(0, 2)
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
      description: `Beautiful ${propertyType.toLowerCase()} in the heart of ${city}. ${locationInfo.features[0]}.`,
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
  const swiperRef = useRef<Swiper<Property>>(null);
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [feedbackType, setFeedbackType] = useState<'like' | 'dislike' | 'superlike' | null>(null);
  const [showProgress, setShowProgress] = useState(false);
  const [undoButtonScale] = useState(new Animated.Value(1));
  
  const { properties, currentIndex, isLoading, previousIndices } = useSelector(
    (state: RootState) => state.properties
  );
  const filters = useSelector((state: RootState) => state.filter);
  const { savedProperties, rejectedProperties } = useSelector((state: RootState) => state.user);

  const canUndo = previousIndices.length > 0 && currentIndex > 0;
  const hasMoreProperties = currentIndex < properties.length;
  const totalPropertiesViewed = currentIndex;

  const loadProperties = useCallback(() => {
    dispatch(fetchPropertiesStart());
    // Simulate API call with filters
    setTimeout(() => {
      const newProperties = generateMockProperties(filters);
      dispatch(fetchPropertiesSuccess(newProperties));
    }, 1000);
  }, [dispatch, filters]);

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
    dispatch(fetchPropertiesStart());
    setTimeout(() => {
      const newProperties = generateMockProperties(filters);
      dispatch(fetchPropertiesSuccess(newProperties));
    }, 1000);
  }, [filters, dispatch]);

  // Animate undo button when it becomes available
  useEffect(() => {
    if (canUndo) {
      Animated.sequence([
        Animated.spring(undoButtonScale, {
          toValue: 1.1,
          friction: 3,
          tension: 100,
          useNativeDriver: true,
        }),
        Animated.spring(undoButtonScale, {
          toValue: 1,
          friction: 3,
          tension: 100,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [canUndo, undoButtonScale]);

  const showFeedback = (type: 'like' | 'dislike' | 'superlike') => {
    setFeedbackType(type);
    ReactNativeHapticFeedback.trigger('impactMedium', hapticOptions);
  };

  const handleSwipeRight = (cardIndex: number) => {
    const property = properties[currentIndex];
    if (property) {
      dispatch(addSavedProperty(property.id));
      dispatch(incrementIndex());
      showFeedback('like');
    }
  };

  const handleSwipeLeft = (cardIndex: number) => {
    const property = properties[currentIndex];
    if (property) {
      dispatch(addRejectedProperty(property.id));
      dispatch(incrementIndex());
      showFeedback('dislike');
    }
  };

  const handleSwipeTop = (cardIndex: number) => {
    // Super like - save with priority flag
    const property = properties[currentIndex];
    if (property) {
      dispatch(addPriorityProperty(property.id));
      dispatch(incrementIndex());
      showFeedback('superlike');
    }
  };

  const handleUndo = () => {
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
  };

  const navigateToPropertyDetails = (propertyId: string) => {
    navigation.navigate('PropertyDetails', { propertyId });
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (filters.priceRange.min > 0 || filters.priceRange.max < 2000000) count++;
    if (filters.bedrooms.min > 0) count++;
    if (filters.bathrooms.min > 0) count++;
    if (filters.propertyTypes.length > 0) count++;
    if (filters.location.city !== 'Nashville' || filters.location.state !== 'TN') count++;
    return count;
  };

  const handleReset = () => {
    dispatch(resetProperties());
    loadProperties();
  };

  if (properties.length === 0 && isLoading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.textSecondary }]}>Finding properties for you...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!hasMoreProperties) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
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
        
        <FilterModal 
          visible={filterModalVisible}
          onClose={() => setFilterModalVisible(false)}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.background }]}>
        <Text style={[styles.headerTitle, { color: colors.primary }]}>That House</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity 
            style={styles.progressButton}
            onPress={() => {
              ReactNativeHapticFeedback.trigger('impactLight', hapticOptions);
              setShowProgress(!showProgress);
            }}
            activeOpacity={0.8}
          >
            <Icon name="stats-chart" size={20} color={colors.text} />
          </TouchableOpacity>
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
      </View>

      <ProgressIndicator
        currentIndex={currentIndex}
        totalProperties={properties.length}
        visible={showProgress}
      />

      <AnimatedFeedback
        type={feedbackType || 'like'}
        visible={feedbackType !== null}
        onAnimationComplete={() => setFeedbackType(null)}
      />

      <View style={styles.swiperContainer}>
        {properties.length > 0 && hasMoreProperties && (
          <Swiper
            ref={swiperRef}
            cards={properties.slice(currentIndex)}
            renderCard={(property) => (
              <PropertyCard 
                property={property} 
                onPress={() => navigateToPropertyDetails(property.id)}
                style={styles.card}
              />
            )}
            onSwipedRight={handleSwipeRight}
            onSwipedLeft={handleSwipeLeft}
            onSwipedTop={handleSwipeTop}
            onSwipedBottom={() => {}}
            cardIndex={0}
            backgroundColor="transparent"
            stackSize={3}
            stackScale={10}
            stackSeparation={15}
            animateCardOpacity
            animateOverlayLabelsOpacity
            swipeAnimationDuration={350}
            overlayLabels={{
              left: {
                title: 'NOPE',
                style: {
                  label: {
                    backgroundColor: '#FF6B6B',
                    color: 'white',
                    fontSize: 24,
                    fontWeight: 'bold',
                    borderRadius: 10,
                    padding: 10,
                  },
                  wrapper: {
                    flexDirection: 'column',
                    alignItems: 'flex-end',
                    justifyContent: 'flex-start',
                    marginTop: 30,
                    marginLeft: -30,
                  },
                },
              },
              right: {
                title: 'LIKE',
                style: {
                  label: {
                    backgroundColor: '#4CCC93',
                    color: 'white',
                    fontSize: 24,
                    fontWeight: 'bold',
                    borderRadius: 10,
                    padding: 10,
                  },
                  wrapper: {
                    flexDirection: 'column',
                    alignItems: 'flex-start',
                    justifyContent: 'flex-start',
                    marginTop: 30,
                    marginLeft: 30,
                  },
                },
              },
              top: {
                title: 'SUPER LIKE',
                style: {
                  label: {
                    backgroundColor: '#4B7BFF',
                    color: 'white',
                    fontSize: 24,
                    fontWeight: 'bold',
                    borderRadius: 10,
                    padding: 10,
                  },
                  wrapper: {
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                  },
                },
              },
            }}
          />
        )}
      </View>

      <View style={styles.buttonContainer}>
        <Animated.View style={{ transform: [{ scale: undoButtonScale }] }}>
          <TouchableOpacity
            style={[
              styles.button, 
              styles.undoButton, 
              { opacity: canUndo ? 1 : 0.5 }
            ]}
            onPress={handleUndo}
            disabled={!canUndo}
          >
            <Icon name="arrow-undo" size={25} color="#666" />
          </TouchableOpacity>
        </Animated.View>
        
        <TouchableOpacity
          style={[styles.button, styles.rejectButton]}
          onPress={() => {
            ReactNativeHapticFeedback.trigger('impactMedium', hapticOptions);
            swiperRef.current?.swipeLeft();
          }}
          activeOpacity={0.8}
        >
          <Icon name="close" size={30} color="#FF6B6B" />
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.button, styles.superLikeButton]}
          onPress={() => {
            ReactNativeHapticFeedback.trigger('impactHeavy', hapticOptions);
            swiperRef.current?.swipeTop();
          }}
          activeOpacity={0.8}
        >
          <Icon name="star" size={25} color="#4B7BFF" />
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.button, styles.likeButton]}
          onPress={() => {
            ReactNativeHapticFeedback.trigger('impactMedium', hapticOptions);
            swiperRef.current?.swipeRight();
          }}
          activeOpacity={0.8}
        >
          <Icon name="heart" size={30} color="#4CCC93" />
        </TouchableOpacity>
      </View>

      <FilterModal 
        visible={filterModalVisible}
        onClose={() => setFilterModalVisible(false)}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FF6B6B',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  progressButton: {
    padding: 8,
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
    marginTop: -50,
  },
  card: {
    position: 'absolute',
    top: 0,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 20,
    paddingHorizontal: 30,
    gap: 15,
  },
  button: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 6,
  },
  undoButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderColor: '#666',
    borderWidth: 2,
  },
  rejectButton: {
    borderColor: '#FF6B6B',
    borderWidth: 2,
  },
  superLikeButton: {
    borderColor: '#4B7BFF',
    borderWidth: 2,
  },
  likeButton: {
    borderColor: '#4CCC93',
    borderWidth: 2,
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
});

export default SwipeScreen;