import React, { useState, useEffect, useCallback } from 'react';
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
import PropertyCard from '../components/PropertyCard';
import FilterModal from '../components/FilterModal';
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
import { useTheme } from '../theme/ThemeContext';

type NavigationProp = StackNavigationProp<RootStackParamList, 'Main'>;

// Mock data generator (same as before)
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

const SwipeScreenSimpler = () => {
  const dispatch = useDispatch();
  const navigation = useNavigation<NavigationProp>();
  const { colors } = useTheme();
  const [localProperties, setLocalProperties] = useState<Property[]>([]);
  const [filteredProperties, setFilteredProperties] = useState<Property[]>([]);
  const [swipeHistory, setSwipeHistory] = useState<{property: Property, direction: 'left' | 'right'}[]>([]);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [showFilterModal, setShowFilterModal] = useState(false);
  
  const { isLoading } = useSelector(
    (state: RootState) => state.properties
  );
  
  const filters = useSelector((state: RootState) => state.filter);

  const loadProperties = useCallback(() => {
    if (!isLoadingMore) {
      setIsLoadingMore(true);
      dispatch(fetchPropertiesStart());
      setTimeout(() => {
        const newProperties = generateMockProperties();
        setLocalProperties(prev => [...prev, ...newProperties]);
        dispatch(fetchPropertiesSuccess(newProperties));
        setIsLoadingMore(false);
      }, 1000);
    }
  }, [isLoadingMore, dispatch]);

  // Apply filters to properties
  const applyFilters = useCallback((properties: Property[]) => {
    if (!filters.isActive) {
      return properties;
    }

    return properties.filter(property => {
      // Price filter
      if (property.price < filters.priceRange.min || property.price > filters.priceRange.max) {
        return false;
      }

      // Bedrooms filter
      if (property.bedrooms < filters.bedrooms.min) {
        return false;
      }

      // Bathrooms filter
      if (property.bathrooms < filters.bathrooms.min) {
        return false;
      }

      // Property type filter
      if (filters.propertyTypes.length > 0 && !filters.propertyTypes.includes(property.propertyType)) {
        return false;
      }

      return true;
    });
  }, [filters]);

  // Update filtered properties when local properties or filters change
  useEffect(() => {
    const filtered = applyFilters(localProperties);
    setFilteredProperties(filtered);
  }, [localProperties, applyFilters]);

  useEffect(() => {
    if (localProperties.length === 0) {
      loadProperties();
    }
  }, []);

  useEffect(() => {
    if (filteredProperties.length > 0 && filteredProperties.length < 5) {
      loadProperties();
    }
  }, [filteredProperties.length, loadProperties]);

  const handleSwipe = (direction: 'left' | 'right') => {
    const property = filteredProperties[0];
    if (property) {
      // Add to history
      setSwipeHistory(prev => [...prev, { property, direction }]);
      
      // Update Redux
      if (direction === 'right') {
        dispatch(addSavedProperty(property.id));
      } else {
        dispatch(addRejectedProperty(property.id));
      }
      
      // Remove from both arrays
      setLocalProperties(prev => prev.filter(p => p.id !== property.id));
      setFilteredProperties(prev => prev.slice(1));
    }
  };

  const handleUndo = () => {
    if (swipeHistory.length > 0) {
      const lastSwipe = swipeHistory[swipeHistory.length - 1];
      
      // Reverse the Redux action
      if (lastSwipe.direction === 'right') {
        dispatch(removeSavedProperty(lastSwipe.property.id));
      } else {
        dispatch(removeRejectedProperty(lastSwipe.property.id));
      }
      
      // Add property back to front
      setLocalProperties(prev => [lastSwipe.property, ...prev]);
      
      // Re-apply filters after adding back
      const updatedLocal = [lastSwipe.property, ...localProperties];
      const filtered = applyFilters(updatedLocal);
      setFilteredProperties(filtered);
      
      // Remove from history
      setSwipeHistory(prev => prev.slice(0, -1));
    }
  };

  const navigateToPropertyDetails = (propertyId: string) => {
    navigation.navigate('PropertyDetails', { propertyId });
  };

  // Create dynamic styles based on theme
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
      color: '#FF6B6B', // Keep brand color
    },
    locationButton: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: 4,
    },
    locationText: {
      fontSize: 14,
      color: colors.textSecondary,
      marginHorizontal: 4,
    },
    headerButtons: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    undoButton: {
      padding: 8,
      marginRight: 10,
    },
    filterButton: {
      padding: 8,
      position: 'relative',
    },
    filterBadge: {
      position: 'absolute',
      top: 2,
      right: 2,
      backgroundColor: colors.primary,
      borderRadius: 8,
      minWidth: 16,
      height: 16,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: 4,
    },
    filterBadgeText: {
      color: colors.textInverse,
      fontSize: 10,
      fontWeight: 'bold',
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
    },
    noMoreCards: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    noMoreCardsText: {
      fontSize: 18,
      marginBottom: 20,
    },
    reloadButton: {
      backgroundColor: '#FF6B6B', // Keep brand color
      paddingHorizontal: 30,
      paddingVertical: 12,
      borderRadius: 25,
    },
    reloadButtonText: {
      color: 'white', // Keep white for contrast on brand color
      fontSize: 16,
      fontWeight: '600',
    },
  });

  if (filteredProperties.length === 0 && localProperties.length === 0 && (isLoading || isLoadingMore)) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FF6B6B" />
          <Text style={[styles.loadingText, { color: colors.textSecondary }]}>Finding properties for you...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>That House</Text>
          <TouchableOpacity style={styles.locationButton} onPress={() => setShowFilterModal(true)}>
            <Icon name="location-outline" size={16} color={colors.textSecondary} />
            <Text style={styles.locationText}>
              {filters.location.city}, {filters.location.state}
            </Text>
            <Icon name="chevron-down" size={16} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>
        <View style={styles.headerButtons}>
          {swipeHistory.length > 0 && (
            <TouchableOpacity style={styles.undoButton} onPress={handleUndo}>
              <Icon name="arrow-back" size={24} color={colors.text} />
            </TouchableOpacity>
          )}
          <TouchableOpacity style={styles.filterButton} onPress={() => setShowFilterModal(true)}>
            <Icon name="options-outline" size={24} color={colors.text} />
            {filters.isActive && (
              <View style={styles.filterBadge}>
                <Text style={styles.filterBadgeText}>
                  {(() => {
                    let count = 0;
                    if (filters.priceRange.min > 0 || filters.priceRange.max < 2000000) count++;
                    if (filters.bedrooms.min > 0) count++;
                    if (filters.bathrooms.min > 0) count++;
                    if (filters.propertyTypes.length > 0) count++;
                    return count;
                  })()}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.swiperContainer}>
        {filteredProperties.length > 0 ? (
          <CustomSwiper
            key={`swiper-${filteredProperties[0].id}`}
            cards={filteredProperties}
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
            <Text style={[styles.noMoreCardsText, { color: colors.textSecondary }]}>
              {filters.isActive ? 'No properties match your filters' : 'No more properties!'}
            </Text>
            <TouchableOpacity style={styles.reloadButton} onPress={loadProperties}>
              <Text style={styles.reloadButtonText}>Load More</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      <FilterModal 
        visible={showFilterModal}
        onClose={() => setShowFilterModal(false)}
      />
    </SafeAreaView>
  );
};

export default SwipeScreenSimpler;