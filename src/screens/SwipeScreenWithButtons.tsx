import React, { useRef, useEffect, useCallback } from 'react';
import {
  View,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Text,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import Swiper from 'react-native-deck-swiper';
import Icon from 'react-native-vector-icons/Ionicons';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';

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

const { height: screenHeight } = Dimensions.get('window');

// Mock data generator with more variety
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

const SwipeScreenWithButtons = () => {
  const dispatch = useDispatch();
  const navigation = useNavigation<NavigationProp>();
  const swiperRef = useRef<Swiper<Property>>(null);
  
  const { properties, currentIndex, isLoading } = useSelector(
    (state: RootState) => state.properties
  );

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
    if (properties.length - currentIndex < 3) {
      loadProperties();
    }
  }, [currentIndex, properties.length, loadProperties]);

  const handleSwipeRight = (cardIndex: number) => {
    const property = properties[cardIndex];
    dispatch(addSavedProperty(property.id));
    dispatch(incrementIndex());
  };

  const handleSwipeLeft = (cardIndex: number) => {
    const property = properties[cardIndex];
    dispatch(addRejectedProperty(property.id));
    dispatch(incrementIndex());
  };

  const handleSwipeTop = (cardIndex: number) => {
    // Super like
    const property = properties[cardIndex];
    dispatch(addSavedProperty(property.id));
    dispatch(incrementIndex());
  };

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
      <View style={styles.header}>
        <Text style={styles.headerTitle}>That House</Text>
        <TouchableOpacity style={styles.filterButton}>
          <Icon name="options-outline" size={24} color="#333" />
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <View style={styles.swiperWrapper}>
          {properties.length > 0 && (
            <Swiper
              ref={swiperRef}
              cards={properties}
              renderCard={(property) => (
                <PropertyCard 
                  property={property} 
                  onPress={() => navigateToPropertyDetails(property.id)}
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
          <TouchableOpacity
            style={[styles.button, styles.rejectButton]}
            onPress={() => swiperRef.current?.swipeLeft()}
            activeOpacity={0.8}
          >
            <Icon name="close" size={35} color="#FF6B6B" />
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.button, styles.superLikeButton]}
            onPress={() => swiperRef.current?.swipeTop()}
            activeOpacity={0.8}
          >
            <Icon name="star" size={30} color="#4B7BFF" />
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.button, styles.likeButton]}
            onPress={() => swiperRef.current?.swipeRight()}
            activeOpacity={0.8}
          >
            <Icon name="heart" size={35} color="#4CCC93" />
          </TouchableOpacity>
        </View>
      </View>
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
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FF6B6B',
  },
  filterButton: {
    padding: 8,
  },
  content: {
    flex: 1,
  },
  swiperWrapper: {
    flex: 1,
    marginTop: -20,
  },
  buttonContainer: {
    position: 'absolute',
    bottom: 30,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 50,
  },
  button: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 8,
    marginHorizontal: 20,
  },
  rejectButton: {
    backgroundColor: '#fff',
  },
  superLikeButton: {
    backgroundColor: '#fff',
  },
  likeButton: {
    backgroundColor: '#fff',
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

export default SwipeScreenWithButtons;