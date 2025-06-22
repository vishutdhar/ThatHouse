import React, { useRef, useEffect, useCallback } from 'react';
import {
  View,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Text,
  ActivityIndicator,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';

import CustomSwiper from '../components/CustomSwiper';
import DebugOverlay from '../components/DebugOverlay';
import PropertyCard from '../components/PropertyCard';
import { RootState } from '../store';
import { 
  incrementIndex, 
  fetchPropertiesStart, 
  fetchPropertiesSuccess 
} from '../store/slices/propertiesSlice';
import { 
  addSavedProperty, 
  addRejectedProperty 
} from '../store/slices/userSlice';
import { Property, PropertyType, PropertyStatus, ListingType } from '../types';
import { RootStackParamList } from '../navigation/AppNavigator';

type NavigationProp = StackNavigationProp<RootStackParamList, 'Main'>;

// Enhanced mock data generator with more variety
const generateMockProperties = (): Property[] => {
  const properties: Property[] = [];
  const neighborhoods = [
    { address: '123 Sunset Boulevard', city: 'Nashville', type: PropertyType.SINGLE_FAMILY },
    { address: '456 River View Drive', city: 'Franklin', type: PropertyType.CONDO },
    { address: '789 Mountain Vista', city: 'Brentwood', type: PropertyType.TOWNHOUSE },
    { address: '321 Downtown Loft', city: 'Nashville', type: PropertyType.CONDO },
    { address: '654 Green Hills Lane', city: 'Nashville', type: PropertyType.SINGLE_FAMILY },
    { address: '987 Cool Springs Blvd', city: 'Franklin', type: PropertyType.TOWNHOUSE },
    { address: '147 Belle Meade Circle', city: 'Nashville', type: PropertyType.SINGLE_FAMILY },
    { address: '258 Music Row', city: 'Nashville', type: PropertyType.CONDO },
    { address: '369 Hillsboro Pike', city: 'Nashville', type: PropertyType.TOWNHOUSE },
    { address: '741 Germantown Road', city: 'Nashville', type: PropertyType.SINGLE_FAMILY }
  ];
  
  const features = [
    ['Granite Countertops', 'Hardwood Floors', 'Walk-in Closet'],
    ['Pool', 'Hot Tub', 'Outdoor Kitchen'],
    ['Home Theater', 'Wine Cellar', 'Game Room'],
    ['Smart Home', 'Solar Panels', 'EV Charger'],
    ['Renovated Kitchen', 'New Roof', 'Updated HVAC'],
  ];
  
  for (let i = 0; i < 10; i++) {
    const neighborhood = neighborhoods[i % neighborhoods.length];
    properties.push({
      id: `prop_${Date.now()}_${i}`,
      address: neighborhood.address,
      city: neighborhood.city,
      state: 'TN',
      zipCode: `3720${i}`,
      price: Math.floor(Math.random() * 600000) + 250000,
      bedrooms: Math.floor(Math.random() * 3) + 2,
      bathrooms: Math.floor(Math.random() * 2) + 2,
      squareFeet: Math.floor(Math.random() * 2500) + 1500,
      propertyType: neighborhood.type,
      listingType: ListingType.FOR_SALE,
      images: [`https://picsum.photos/400/600?random=${Date.now()}_${i}`],
      description: 'Stunning property with modern amenities and excellent location. Recently renovated with attention to detail.',
      yearBuilt: 1990 + Math.floor(Math.random() * 34),
      lotSize: Math.round((Math.random() * 0.5 + 0.1) * 100) / 100,
      features: features[i % features.length],
      latitude: 36.1627 + (Math.random() - 0.5) * 0.1,
      longitude: -86.7816 + (Math.random() - 0.5) * 0.1,
      daysOnMarket: Math.floor(Math.random() * 60) + 1,
      status: PropertyStatus.ACTIVE,
      mlsNumber: `MLS${Math.floor(Math.random() * 900000) + 100000}`,
    });
  }
  
  return properties;
};

const SwipeScreenClean = () => {
  const dispatch = useDispatch();
  const navigation = useNavigation<NavigationProp>();
  const swiperRef = useRef<any>(null);
  
  const { properties, currentIndex, isLoading } = useSelector(
    (state: RootState) => state.properties
  );

  // Debug logging
  console.log(`SwipeScreenClean: currentIndex=${currentIndex}, properties=${properties.length}, remaining=${properties.length - currentIndex}`);

  const loadProperties = useCallback(() => {
    dispatch(fetchPropertiesStart());
    // Simulate API call
    setTimeout(() => {
      const newProperties = generateMockProperties();
      dispatch(fetchPropertiesSuccess(newProperties));
    }, 1000);
  }, [dispatch]);

  useEffect(() => {
    if (properties.length === 0) {
      loadProperties();
    }
  }, [properties.length, loadProperties]);

  useEffect(() => {
    // Load more properties when getting close to the end
    if (properties.length > 0 && properties.length - currentIndex < 5) {
      console.log('Loading more properties - running low');
      loadProperties();
    }
  }, [currentIndex, properties.length, loadProperties]);

  // Instructions removed for cleaner UI

  const handleSwipeRight = (cardIndex: number) => {
    const property = properties[currentIndex];
    if (property) {
      dispatch(addSavedProperty(property.id));
      dispatch(incrementIndex());
    }
  };

  const handleSwipeLeft = (cardIndex: number) => {
    const property = properties[currentIndex];
    if (property) {
      dispatch(addRejectedProperty(property.id));
      dispatch(incrementIndex());
    }
  };

  // Removed super like feature - keeping it simple with just like/pass

  const navigateToPropertyDetails = (propertyId: string) => {
    navigation.navigate('PropertyDetails', { propertyId });
  };

  if (properties.length === 0 && isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FF6B6B" />
          <Text style={styles.loadingText}>Finding properties for you...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <DebugOverlay />
      <View style={styles.header}>
        <Text style={styles.headerTitle}>That House</Text>
        <TouchableOpacity style={styles.filterButton}>
          <Icon name="options-outline" size={24} color="#333" />
        </TouchableOpacity>
      </View>

      <View style={styles.swiperContainer}>
        {properties.length > 0 && currentIndex < properties.length ? (
          <CustomSwiper
            key={`swiper-${currentIndex}`} // Force remount when index changes
            cards={properties.slice(currentIndex)}
            renderCard={(property) => (
              <PropertyCard 
                property={property} 
                onPress={() => navigateToPropertyDetails(property.id)}
              />
            )}
            onSwipedRight={handleSwipeRight}
            onSwipedLeft={handleSwipeLeft}
            cardIndex={0}
            backgroundColor="transparent"
            stackSize={3}
            stackScale={10}
            stackSeparation={15}
          />
        ) : (
          <View style={styles.noMoreCards}>
            <Text style={styles.noMoreCardsText}>No more properties!</Text>
            <TouchableOpacity style={styles.reloadButton} onPress={loadProperties}>
              <Text style={styles.reloadButtonText}>Load More</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Instructions removed for cleaner UI */}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
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
  filterButton: {
    padding: 8,
  },
  swiperContainer: {
    flex: 1,
    marginTop: -50,
  },
  instructionContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 40,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  instruction: {
    alignItems: 'center',
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  instructionText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
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
  noMoreCards: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noMoreCardsText: {
    fontSize: 18,
    color: '#666',
    marginBottom: 20,
  },
  reloadButton: {
    backgroundColor: '#FF6B6B',
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 25,
  },
  reloadButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default SwipeScreenClean;