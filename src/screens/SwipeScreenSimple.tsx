import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Text,
  ActivityIndicator,
  Animated,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';

import CustomSwiper from '../components/CustomSwiper';
import PropertyCard from '../components/PropertyCard';
import { RootState } from '../store';
import { 
  fetchPropertiesStart, 
  fetchPropertiesSuccess 
} from '../store/slices/propertiesSlice';
import { 
  addSavedProperty, 
  addRejectedProperty,
  removeSavedProperty,
  removeRejectedProperty 
} from '../store/slices/userSlice';
import { Property, PropertyType, PropertyStatus, ListingType } from '../types';
import { RootStackParamList } from '../navigation/AppNavigator';

type NavigationProp = StackNavigationProp<RootStackParamList, 'Main'>;

// Mock data generator
const generateMockProperties = (): Property[] => {
  const properties: Property[] = [];
  const neighborhoods = [
    { address: '123 Sunset Boulevard', city: 'Nashville', type: PropertyType.SINGLE_FAMILY },
    { address: '456 River View Drive', city: 'Franklin', type: PropertyType.CONDO },
    { address: '789 Mountain Vista', city: 'Brentwood', type: PropertyType.TOWNHOUSE },
    { address: '321 Downtown Loft', city: 'Nashville', type: PropertyType.CONDO },
    { address: '654 Green Hills Lane', city: 'Nashville', type: PropertyType.SINGLE_FAMILY },
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
      description: 'Beautiful property with modern amenities.',
      yearBuilt: 1990 + Math.floor(Math.random() * 34),
      lotSize: Math.round((Math.random() * 0.5 + 0.1) * 100) / 100,
      features: ['Hardwood Floors', 'Updated Kitchen', 'Pool'],
      latitude: 36.1627 + (Math.random() - 0.5) * 0.1,
      longitude: -86.7816 + (Math.random() - 0.5) * 0.1,
      daysOnMarket: Math.floor(Math.random() * 60) + 1,
      status: PropertyStatus.ACTIVE,
      mlsNumber: `MLS${Math.floor(Math.random() * 900000) + 100000}`,
    });
  }
  
  return properties;
};

const SwipeScreenSimple = () => {
  const dispatch = useDispatch();
  const navigation = useNavigation<NavigationProp>();
  const [localProperties, setLocalProperties] = useState<Property[]>([]);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [lastSwipedProperty, setLastSwipedProperty] = useState<{property: Property, direction: 'left' | 'right'} | null>(null);
  const undoOpacity = useRef(new Animated.Value(0)).current;
  const undoTimer = useRef<NodeJS.Timeout | null>(null);
  
  const { isLoading } = useSelector(
    (state: RootState) => state.properties
  );

  const loadProperties = useCallback(() => {
    if (!isLoadingMore) {
      setIsLoadingMore(true);
      dispatch(fetchPropertiesStart());
      // Simulate API call
      setTimeout(() => {
        const newProperties = generateMockProperties();
        setLocalProperties(prev => [...prev, ...newProperties]);
        // Also add to Redux store so saved properties can find them
        dispatch(fetchPropertiesSuccess(newProperties));
        setIsLoadingMore(false);
      }, 1000);
    }
  }, [isLoadingMore, dispatch]);

  useEffect(() => {
    if (localProperties.length === 0) {
      loadProperties();
    }
    
    // Cleanup timer on unmount
    return () => {
      if (undoTimer.current) {
        clearTimeout(undoTimer.current);
      }
    };
  }, []);

  useEffect(() => {
    // Load more when running low
    if (localProperties.length > 0 && localProperties.length < 5) {
      loadProperties();
    }
  }, [localProperties.length, loadProperties]);

  const handleSwipe = (direction: 'left' | 'right') => {
    const property = localProperties[0];
    if (property) {
      // Clear any existing undo timer
      if (undoTimer.current) {
        clearTimeout(undoTimer.current);
      }
      
      // Save the last swiped property for undo
      setLastSwipedProperty({ property, direction });
      
      // Show undo button
      Animated.timing(undoOpacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
      
      // Hide undo button after 3 seconds
      undoTimer.current = setTimeout(() => {
        Animated.timing(undoOpacity, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }).start(() => {
          setLastSwipedProperty(null);
        });
      }, 3000);
      
      if (direction === 'right') {
        dispatch(addSavedProperty(property.id));
      } else {
        dispatch(addRejectedProperty(property.id));
      }
      // Remove the swiped property from local state only
      setLocalProperties(prev => prev.slice(1));
    }
  };

  const handleUndo = () => {
    if (lastSwipedProperty) {
      const { property, direction } = lastSwipedProperty;
      
      // Reverse the action
      if (direction === 'right') {
        dispatch(removeSavedProperty(property.id));
      } else {
        dispatch(removeRejectedProperty(property.id));
      }
      
      // Add the property back to the beginning
      setLocalProperties(prev => [property, ...prev]);
      
      // Hide undo button
      Animated.timing(undoOpacity, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start(() => {
        setLastSwipedProperty(null);
      });
      
      // Clear the timer
      if (undoTimer.current) {
        clearTimeout(undoTimer.current);
      }
    }
  };

  const navigateToPropertyDetails = (propertyId: string) => {
    navigation.navigate('PropertyDetails', { propertyId });
  };

  if (localProperties.length === 0 && (isLoading || isLoadingMore)) {
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

      <View style={styles.swiperContainer}>
        {localProperties.length > 0 ? (
          <CustomSwiper
            key={`swiper-${localProperties[0].id}`}
            cards={localProperties}
            renderCard={(property) => (
              <PropertyCard 
                property={property} 
                onPress={() => navigateToPropertyDetails(property.id)}
              />
            )}
            onSwipedRight={() => handleSwipe('right')}
            onSwipedLeft={() => handleSwipe('left')}
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
      
      {/* Undo Button */}
      <Animated.View 
        style={[
          styles.undoButton, 
          { 
            opacity: undoOpacity,
            transform: [{
              translateY: undoOpacity.interpolate({
                inputRange: [0, 1],
                outputRange: [50, 0]
              })
            }]
          }
        ]}
        pointerEvents={lastSwipedProperty ? 'auto' : 'none'}
      >
        <TouchableOpacity 
          style={styles.undoTouchable} 
          onPress={handleUndo}
          activeOpacity={0.8}
        >
          <Icon name="arrow-back" size={20} color="#fff" />
          <Text style={styles.undoText}>Undo</Text>
        </TouchableOpacity>
      </Animated.View>
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
  undoButton: {
    position: 'absolute',
    bottom: 30,
    alignSelf: 'center',
  },
  undoTouchable: {
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
    flexDirection: 'row',
    alignItems: 'center',
  },
  undoText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});

export default SwipeScreenSimple;