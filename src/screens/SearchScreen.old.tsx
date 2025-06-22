import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  FlatList,
  Modal,
  Dimensions,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Switch,
  Alert,
  Image,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import MapView, { Region, PROVIDER_GOOGLE } from 'react-native-maps';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../store';
import { useTheme } from '../theme/ThemeContext';
import { Property } from '../types';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { launchImageLibrary } from 'react-native-image-picker';
import Slider from '@react-native-community/slider';
import { addSearchHistory, addSavedSearch, removeSavedSearch } from '../store/slices/searchSlice';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

type NavigationProp = StackNavigationProp<RootStackParamList>;

interface SearchFilters {
  priceRange: { min: number; max: number };
  bedrooms: { min: number; max: number };
  bathrooms: { min: number; max: number };
  propertyType: string[];
  features: string[];
  yearBuiltRange: { min: number; max: number };
  hoaFeesRange: { min: number; max: number };
  lotSizeRange: { min: number; max: number };
  daysOnMarket: number;
  schoolRatings: { min: number; max: number };
  sortBy: 'price-asc' | 'price-desc' | 'newest' | 'oldest' | 'sqft-asc' | 'sqft-desc';
}

const initialFilters: SearchFilters = {
  priceRange: { min: 0, max: 5000000 },
  bedrooms: { min: 0, max: 10 },
  bathrooms: { min: 0, max: 10 },
  propertyType: [],
  features: [],
  yearBuiltRange: { min: 1900, max: 2024 },
  hoaFeesRange: { min: 0, max: 2000 },
  lotSizeRange: { min: 0, max: 50000 },
  daysOnMarket: 365,
  schoolRatings: { min: 1, max: 10 },
  sortBy: 'newest',
};

const propertyTypes = ['SINGLE_FAMILY', 'CONDO', 'TOWNHOUSE', 'MULTI_FAMILY', 'LAND', 'COMMERCIAL'];
const propertyTypeLabels: Record<string, string> = {
  'SINGLE_FAMILY': 'House',
  'CONDO': 'Condo',
  'TOWNHOUSE': 'Townhouse',
  'MULTI_FAMILY': 'Multi-Family',
  'LAND': 'Land',
  'COMMERCIAL': 'Commercial',
};
const propertyFeatures = [
  'Pool',
  'Garage',
  'Fireplace',
  'Garden',
  'Balcony',
  'Gym',
  'Security',
  'Elevator',
  'Parking',
  'Storage',
  'Pet Friendly',
  'Furnished',
];

const SearchScreen: React.FC = () => {
  const { colors } = useTheme();
  const navigation = useNavigation<NavigationProp>();
  const dispatch = useDispatch();
  const { searchHistory, savedSearches } = useSelector((state: RootState) => state.search);
  const { properties } = useSelector((state: RootState) => state.properties);

  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<SearchFilters>(initialFilters);
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');
  const [searchResults, setSearchResults] = useState<Property[]>([]);
  const [loading, setLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showQuickView, setShowQuickView] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [drawingMode, setDrawingMode] = useState(false);
  const [drawnArea, setDrawnArea] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [activeFiltersCount, setActiveFiltersCount] = useState(0);

  const mapRef = useRef<MapView>(null);

  // Voice search functionality has been removed

  useEffect(() => {
    // Count active filters
    let count = 0;
    if (filters.priceRange.min > 0 || filters.priceRange.max < 5000000) count++;
    if (filters.bedrooms.min > 0 || filters.bedrooms.max < 10) count++;
    if (filters.bathrooms.min > 0 || filters.bathrooms.max < 10) count++;
    if (filters.propertyType.length > 0) count++;
    if (filters.features.length > 0) count++;
    if (filters.yearBuiltRange.min > 1900 || filters.yearBuiltRange.max < 2024) count++;
    if (filters.hoaFeesRange.min > 0 || filters.hoaFeesRange.max < 2000) count++;
    if (filters.lotSizeRange.min > 0 || filters.lotSizeRange.max < 50000) count++;
    if (filters.daysOnMarket < 365) count++;
    if (filters.schoolRatings.min > 1 || filters.schoolRatings.max < 10) count++;
    setActiveFiltersCount(count);
  }, [filters]);

  // Voice search methods removed - functionality no longer available

  const handleImageSearch = () => {
    launchImageLibrary(
      {
        mediaType: 'photo',
        quality: 0.5,
      },
      (response) => {
        if (response.assets && response.assets[0]) {
          // Here you would typically send the image to your ML service
          // For now, we'll just show a placeholder message
          Alert.alert(
            'Image Search',
            'Finding similar properties based on your image...',
            [{ text: 'OK' }]
          );
          // Simulate search
          setTimeout(() => {
            performSearch();
          }, 1500);
        }
      }
    );
  };

  const generateSuggestions = (query: string) => {
    const locationSuggestions = [
      'San Francisco, CA',
      'San Jose, CA',
      'Los Angeles, CA',
      'New York, NY',
      'Chicago, IL',
      'Seattle, WA',
      'Austin, TX',
      'Boston, MA',
    ];

    const filtered = locationSuggestions.filter((loc) =>
      loc.toLowerCase().includes(query.toLowerCase())
    );
    setSuggestions(filtered);
  };

  const handleSearch = (query: string = searchQuery) => {
    if (query.trim()) {
      dispatch(addSearchHistory(query));
      performSearch();
      setShowSuggestions(false);
    }
  };

  const performSearch = () => {
    setLoading(true);
    setPage(1);
    
    // Filter properties based on search criteria and filters
    setTimeout(() => {
      let filtered = properties.filter((property) => {
        // Price filter
        if (property.price < filters.priceRange.min || property.price > filters.priceRange.max) {
          return false;
        }
        
        // Bedrooms filter
        if (property.bedrooms < filters.bedrooms.min || property.bedrooms > filters.bedrooms.max) {
          return false;
        }
        
        // Bathrooms filter
        if (property.bathrooms < filters.bathrooms.min || property.bathrooms > filters.bathrooms.max) {
          return false;
        }
        
        // Property type filter
        if (filters.propertyType.length > 0 && !filters.propertyType.includes(property.propertyType)) {
          return false;
        }
        
        // Search query (location/address)
        if (searchQuery && !property.address.toLowerCase().includes(searchQuery.toLowerCase())) {
          return false;
        }
        
        return true;
      });

      // Sort results
      switch (filters.sortBy) {
        case 'price-asc':
          filtered.sort((a, b) => a.price - b.price);
          break;
        case 'price-desc':
          filtered.sort((a, b) => b.price - a.price);
          break;
        case 'newest':
          filtered.sort((a, b) => b.daysOnMarket - a.daysOnMarket);
          break;
        case 'oldest':
          filtered.sort((a, b) => a.daysOnMarket - b.daysOnMarket);
          break;
        case 'sqft-asc':
          filtered.sort((a, b) => a.squareFeet - b.squareFeet);
          break;
        case 'sqft-desc':
          filtered.sort((a, b) => b.squareFeet - a.squareFeet);
          break;
      }

      setSearchResults(filtered.slice(0, 10));
      setHasMore(filtered.length > 10);
      setLoading(false);
    }, 500);
  };

  const loadMore = () => {
    if (!hasMore || loading) return;

    setLoading(true);
    setTimeout(() => {
      const nextPage = page + 1;
      const startIndex = (nextPage - 1) * 10;
      const endIndex = startIndex + 10;
      
      setSearchResults([...searchResults, ...properties.slice(startIndex, endIndex)]);
      setPage(nextPage);
      setHasMore(endIndex < properties.length);
      setLoading(false);
    }, 500);
  };

  const handleSaveSearch = () => {
    const searchCriteria = {
      id: Date.now().toString(),
      query: searchQuery,
      filters,
      createdAt: new Date().toISOString(),
    };
    dispatch(addSavedSearch(searchCriteria));
    Alert.alert('Success', 'Search saved successfully!');
  };

  const handleQuickView = (property: Property) => {
    setSelectedProperty(property);
    setShowQuickView(true);
  };

  const renderPropertyItem = ({ item }: { item: Property }) => (
    <TouchableOpacity
      style={[styles.propertyItem, { backgroundColor: colors.cardBackground }]}
      onPress={() => navigation.navigate('PropertyDetails', { propertyId: item.id })}
      onLongPress={() => handleQuickView(item)}
    >
      <Image source={{ uri: item.images[0] }} style={styles.propertyImage} />
      <View style={styles.propertyInfo}>
        <Text style={[styles.propertyPrice, { color: colors.primary }]}>
          ${item.price.toLocaleString()}
        </Text>
        <Text style={[styles.propertyAddress, { color: colors.text }]}>{item.address}</Text>
        <View style={styles.propertyDetails}>
          <Text style={[styles.propertyDetail, { color: colors.textSecondary }]}>
            {item.bedrooms} beds • {item.bathrooms} baths • {item.squareFeet} sqft
          </Text>
        </View>
      </View>
      <TouchableOpacity
        style={styles.quickViewButton}
        onPress={() => handleQuickView(item)}
      >
        <Icon name="eye-outline" size={20} color={colors.primary} />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  const renderFiltersModal = () => (
    <Modal
      visible={showFilters}
      animationType="slide"
      transparent={true}
      onRequestClose={() => setShowFilters(false)}
    >
      <View style={[styles.modalContainer, { backgroundColor: colors.modalBackground }]}>
        <View style={[styles.modalContent, { backgroundColor: colors.cardBackground }]}>
          <View style={styles.modalHeader}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>Search Filters</Text>
            <TouchableOpacity onPress={() => setShowFilters(false)}>
              <Icon name="close" size={24} color={colors.text} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.filtersList}>
            {/* Price Range */}
            <View style={styles.filterSection}>
              <Text style={[styles.filterLabel, { color: colors.text }]}>Price Range</Text>
              <View style={styles.rangeContainer}>
                <Text style={[styles.rangeText, { color: colors.textSecondary }]}>
                  ${filters.priceRange.min.toLocaleString()} - ${filters.priceRange.max.toLocaleString()}
                </Text>
                <Slider
                  style={styles.slider}
                  minimumValue={0}
                  maximumValue={5000000}
                  value={filters.priceRange.max}
                  onValueChange={(value) =>
                    setFilters({ ...filters, priceRange: { ...filters.priceRange, max: Math.round(value) } })
                  }
                  minimumTrackTintColor={colors.primary}
                  maximumTrackTintColor={colors.border}
                />
              </View>
            </View>

            {/* Property Type */}
            <View style={styles.filterSection}>
              <Text style={[styles.filterLabel, { color: colors.text }]}>Property Type</Text>
              <View style={styles.chipContainer}>
                {propertyTypes.map((type) => (
                  <TouchableOpacity
                    key={type}
                    style={[
                      styles.chip,
                      {
                        backgroundColor: filters.propertyType.includes(type)
                          ? colors.primary
                          : colors.chipBackground,
                      },
                    ]}
                    onPress={() => {
                      const updated = filters.propertyType.includes(type)
                        ? filters.propertyType.filter((t) => t !== type)
                        : [...filters.propertyType, type];
                      setFilters({ ...filters, propertyType: updated });
                    }}
                  >
                    <Text
                      style={[
                        styles.chipText,
                        {
                          color: filters.propertyType.includes(type)
                            ? colors.chipTextActive
                            : colors.chipText,
                        },
                      ]}
                    >
                      {propertyTypeLabels[type]}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Features */}
            <View style={styles.filterSection}>
              <Text style={[styles.filterLabel, { color: colors.text }]}>Features</Text>
              <View style={styles.chipContainer}>
                {propertyFeatures.map((feature) => (
                  <TouchableOpacity
                    key={feature}
                    style={[
                      styles.chip,
                      {
                        backgroundColor: filters.features.includes(feature)
                          ? colors.primary
                          : colors.chipBackground,
                      },
                    ]}
                    onPress={() => {
                      const updated = filters.features.includes(feature)
                        ? filters.features.filter((f) => f !== feature)
                        : [...filters.features, feature];
                      setFilters({ ...filters, features: updated });
                    }}
                  >
                    <Text
                      style={[
                        styles.chipText,
                        {
                          color: filters.features.includes(feature)
                            ? colors.chipTextActive
                            : colors.chipText,
                        },
                      ]}
                    >
                      {feature}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Year Built */}
            <View style={styles.filterSection}>
              <Text style={[styles.filterLabel, { color: colors.text }]}>Year Built</Text>
              <View style={styles.rangeContainer}>
                <Text style={[styles.rangeText, { color: colors.textSecondary }]}>
                  {filters.yearBuiltRange.min} - {filters.yearBuiltRange.max}
                </Text>
                <Slider
                  style={styles.slider}
                  minimumValue={1900}
                  maximumValue={2024}
                  value={filters.yearBuiltRange.min}
                  onValueChange={(value) =>
                    setFilters({ ...filters, yearBuiltRange: { ...filters.yearBuiltRange, min: Math.round(value) } })
                  }
                  minimumTrackTintColor={colors.primary}
                  maximumTrackTintColor={colors.border}
                />
              </View>
            </View>

            {/* HOA Fees */}
            <View style={styles.filterSection}>
              <Text style={[styles.filterLabel, { color: colors.text }]}>HOA Fees (Monthly)</Text>
              <View style={styles.rangeContainer}>
                <Text style={[styles.rangeText, { color: colors.textSecondary }]}>
                  ${filters.hoaFeesRange.min} - ${filters.hoaFeesRange.max}
                </Text>
                <Slider
                  style={styles.slider}
                  minimumValue={0}
                  maximumValue={2000}
                  value={filters.hoaFeesRange.max}
                  onValueChange={(value) =>
                    setFilters({ ...filters, hoaFeesRange: { ...filters.hoaFeesRange, max: Math.round(value) } })
                  }
                  minimumTrackTintColor={colors.primary}
                  maximumTrackTintColor={colors.border}
                />
              </View>
            </View>

            {/* Sort By */}
            <View style={styles.filterSection}>
              <Text style={[styles.filterLabel, { color: colors.text }]}>Sort By</Text>
              <View style={styles.sortOptions}>
                {[
                  { value: 'newest', label: 'Newest' },
                  { value: 'price-asc', label: 'Price: Low to High' },
                  { value: 'price-desc', label: 'Price: High to Low' },
                  { value: 'sqft-asc', label: 'Size: Small to Large' },
                  { value: 'sqft-desc', label: 'Size: Large to Small' },
                ].map((option) => (
                  <TouchableOpacity
                    key={option.value}
                    style={[
                      styles.sortOption,
                      {
                        backgroundColor:
                          filters.sortBy === option.value ? colors.primary : colors.chipBackground,
                      },
                    ]}
                    onPress={() => setFilters({ ...filters, sortBy: option.value as any })}
                  >
                    <Text
                      style={[
                        styles.sortOptionText,
                        {
                          color:
                            filters.sortBy === option.value ? colors.chipTextActive : colors.chipText,
                        },
                      ]}
                    >
                      {option.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </ScrollView>

          <View style={styles.modalFooter}>
            <TouchableOpacity
              style={[styles.resetButton, { borderColor: colors.primary }]}
              onPress={() => setFilters(initialFilters)}
            >
              <Text style={[styles.resetButtonText, { color: colors.primary }]}>Reset</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.applyButton, { backgroundColor: colors.primary }]}
              onPress={() => {
                setShowFilters(false);
                performSearch();
              }}
            >
              <Text style={styles.applyButtonText}>Apply</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  const renderQuickViewModal = () => {
    if (!selectedProperty) return null;

    return (
      <Modal
        visible={showQuickView}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setShowQuickView(false)}
      >
        <TouchableOpacity
          style={[styles.modalContainer, { backgroundColor: colors.modalBackground }]}
          activeOpacity={1}
          onPress={() => setShowQuickView(false)}
        >
          <View style={[styles.quickViewContent, { backgroundColor: colors.cardBackground }]}>
            <ScrollView horizontal pagingEnabled style={styles.quickViewImages}>
              {selectedProperty.images.map((image, index) => (
                <Image key={index} source={{ uri: image }} style={styles.quickViewImage} />
              ))}
            </ScrollView>
            <View style={styles.quickViewInfo}>
              <Text style={[styles.quickViewPrice, { color: colors.primary }]}>
                ${selectedProperty.price.toLocaleString()}
              </Text>
              <Text style={[styles.quickViewAddress, { color: colors.text }]}>
                {selectedProperty.address}
              </Text>
              <View style={styles.quickViewDetails}>
                <View style={styles.quickViewDetail}>
                  <Icon name="bed-outline" size={16} color={colors.textSecondary} />
                  <Text style={[styles.quickViewDetailText, { color: colors.textSecondary }]}>
                    {selectedProperty.bedrooms} Beds
                  </Text>
                </View>
                <View style={styles.quickViewDetail}>
                  <Icon name="water-outline" size={16} color={colors.textSecondary} />
                  <Text style={[styles.quickViewDetailText, { color: colors.textSecondary }]}>
                    {selectedProperty.bathrooms} Baths
                  </Text>
                </View>
                <View style={styles.quickViewDetail}>
                  <Icon name="square-outline" size={16} color={colors.textSecondary} />
                  <Text style={[styles.quickViewDetailText, { color: colors.textSecondary }]}>
                    {selectedProperty.squareFeet} sqft
                  </Text>
                </View>
              </View>
              <TouchableOpacity
                style={[styles.viewDetailsButton, { backgroundColor: colors.primary }]}
                onPress={() => {
                  setShowQuickView(false);
                  navigation.navigate('PropertyDetails', { propertyId: selectedProperty.id });
                }}
              >
                <Text style={styles.viewDetailsButtonText}>View Full Details</Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>
      </Modal>
    );
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      {/* Search Header */}
      <View style={[styles.searchHeader, { backgroundColor: colors.headerBackground }]}>
        <View style={styles.searchBarContainer}>
          <View style={[styles.searchBar, { backgroundColor: colors.inputBackground }]}>
            <Icon name="search" size={20} color={colors.textSecondary} />
            <TextInput
              style={[styles.searchInput, { color: colors.text }]}
              placeholder="Search by location, address..."
              placeholderTextColor={colors.textSecondary}
              value={searchQuery}
              onChangeText={(text) => {
                setSearchQuery(text);
                if (text.length > 2) {
                  generateSuggestions(text);
                  setShowSuggestions(true);
                } else {
                  setShowSuggestions(false);
                }
              }}
              onSubmitEditing={() => handleSearch()}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <Icon name="close-circle" size={20} color={colors.textSecondary} />
              </TouchableOpacity>
            )}
          </View>
          
          <View style={styles.searchActions}>            
            <TouchableOpacity
              style={[styles.iconButton, { backgroundColor: colors.chipBackground }]}
              onPress={handleImageSearch}
            >
              <Icon name="camera-outline" size={20} color={colors.primary} />
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.iconButton, { backgroundColor: colors.chipBackground }]}
              onPress={() => setShowFilters(true)}
            >
              <Icon name="options-outline" size={20} color={colors.primary} />
              {activeFiltersCount > 0 && (
                <View style={[styles.filterBadge, { backgroundColor: colors.error }]}>
                  <Text style={styles.filterBadgeText}>{activeFiltersCount}</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>
        </View>

        {/* Search Suggestions */}
        {showSuggestions && suggestions.length > 0 && (
          <View style={[styles.suggestionsContainer, { backgroundColor: colors.cardBackground }]}>
            {suggestions.map((suggestion, index) => (
              <TouchableOpacity
                key={index}
                style={styles.suggestionItem}
                onPress={() => {
                  setSearchQuery(suggestion);
                  handleSearch(suggestion);
                }}
              >
                <Icon name="location-outline" size={16} color={colors.textSecondary} />
                <Text style={[styles.suggestionText, { color: colors.text }]}>{suggestion}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* View Mode Toggle */}
        <View style={styles.viewModeContainer}>
          <TouchableOpacity
            style={[
              styles.viewModeButton,
              viewMode === 'list' && { backgroundColor: colors.primary },
            ]}
            onPress={() => setViewMode('list')}
          >
            <Icon
              name="list"
              size={20}
              color={viewMode === 'list' ? colors.chipTextActive : colors.textSecondary}
            />
            <Text
              style={[
                styles.viewModeText,
                { color: viewMode === 'list' ? colors.chipTextActive : colors.textSecondary },
              ]}
            >
              List
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[
              styles.viewModeButton,
              viewMode === 'map' && { backgroundColor: colors.primary },
            ]}
            onPress={() => setViewMode('map')}
          >
            <Icon
              name="map"
              size={20}
              color={viewMode === 'map' ? colors.chipTextActive : colors.textSecondary}
            />
            <Text
              style={[
                styles.viewModeText,
                { color: viewMode === 'map' ? colors.chipTextActive : colors.textSecondary },
              ]}
            >
              Map
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Results Count and Active Filters */}
      {searchResults.length > 0 && (
        <View style={[styles.resultsHeader, { backgroundColor: colors.background }]}>
          <Text style={[styles.resultsCount, { color: colors.text }]}>
            {searchResults.length} properties found
          </Text>
          <TouchableOpacity onPress={handleSaveSearch}>
            <Icon name="bookmark-outline" size={20} color={colors.primary} />
          </TouchableOpacity>
        </View>
      )}

      {/* Content */}
      {viewMode === 'list' ? (
        <FlatList
          data={searchResults}
          renderItem={renderPropertyItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          onEndReached={loadMore}
          onEndReachedThreshold={0.5}
          ListEmptyComponent={
            !loading && (
              <View style={styles.emptyState}>
                <Icon name="search" size={64} color={colors.textSecondary} />
                <Text style={[styles.emptyStateText, { color: colors.textSecondary }]}>
                  {searchQuery ? 'No properties found' : 'Start searching for your dream home'}
                </Text>
              </View>
            )
          }
          ListFooterComponent={
            loading && (
              <View style={styles.loadingFooter}>
                <ActivityIndicator color={colors.primary} />
              </View>
            )
          }
        />
      ) : (
        <View style={styles.mapContainer}>
          <MapView
            ref={mapRef}
            style={styles.map}
            provider={PROVIDER_GOOGLE}
            initialRegion={{
              latitude: 37.78825,
              longitude: -122.4324,
              latitudeDelta: 0.0922,
              longitudeDelta: 0.0421,
            }}
          >
            {/* Map markers for search results */}
          </MapView>
          
          {drawingMode && (
            <View style={styles.drawingControls}>
              <TouchableOpacity
                style={[styles.drawButton, { backgroundColor: colors.primary }]}
                onPress={() => setDrawingMode(false)}
              >
                <Text style={styles.drawButtonText}>Done Drawing</Text>
              </TouchableOpacity>
            </View>
          )}
          
          <TouchableOpacity
            style={[styles.drawAreaButton, { backgroundColor: colors.primary }]}
            onPress={() => setDrawingMode(true)}
          >
            <Icon name="create-outline" size={20} color={colors.chipTextActive} />
            <Text style={styles.drawAreaButtonText}>Draw Area</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Recent Searches */}
      {searchHistory.length > 0 && searchQuery === '' && viewMode === 'list' && (
        <View style={styles.recentSearches}>
          <Text style={[styles.recentSearchesTitle, { color: colors.text }]}>Recent Searches</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {searchHistory.slice(0, 5).map((search, index) => (
              <TouchableOpacity
                key={index}
                style={[styles.recentSearchItem, { backgroundColor: colors.chipBackground }]}
                onPress={() => {
                  setSearchQuery(search);
                  handleSearch(search);
                }}
              >
                <Icon name="time-outline" size={16} color={colors.textSecondary} />
                <Text style={[styles.recentSearchText, { color: colors.text }]}>{search}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      {/* Modals */}
      {renderFiltersModal()}
      {renderQuickViewModal()}
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  searchHeader: {
    paddingTop: Platform.OS === 'ios' ? 50 : 20,
    paddingHorizontal: 16,
    paddingBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  searchBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 25,
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
  },
  searchActions: {
    flexDirection: 'row',
    gap: 8,
  },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  filterBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 16,
    height: 16,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterBadgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  suggestionsContainer: {
    position: 'absolute',
    top: 110,
    left: 16,
    right: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
    zIndex: 1000,
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  suggestionText: {
    marginLeft: 8,
    fontSize: 16,
  },
  viewModeContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  viewModeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 4,
  },
  viewModeText: {
    fontSize: 14,
    fontWeight: '500',
  },
  resultsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  resultsCount: {
    fontSize: 16,
    fontWeight: '500',
  },
  listContent: {
    paddingBottom: 100,
  },
  propertyItem: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  propertyImage: {
    width: 120,
    height: 120,
  },
  propertyInfo: {
    flex: 1,
    padding: 12,
  },
  propertyPrice: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  propertyAddress: {
    fontSize: 16,
    marginBottom: 8,
  },
  propertyDetails: {
    flexDirection: 'row',
  },
  propertyDetail: {
    fontSize: 14,
  },
  quickViewButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 100,
  },
  emptyStateText: {
    fontSize: 16,
    marginTop: 16,
    textAlign: 'center',
  },
  loadingFooter: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  mapContainer: {
    flex: 1,
    position: 'relative',
  },
  map: {
    flex: 1,
  },
  drawAreaButton: {
    position: 'absolute',
    bottom: 100,
    right: 16,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
    gap: 8,
  },
  drawAreaButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  drawingControls: {
    position: 'absolute',
    top: 20,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  drawButton: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
  },
  drawButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  recentSearches: {
    paddingVertical: 16,
  },
  recentSearchesTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
    paddingHorizontal: 16,
  },
  recentSearchItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginLeft: 16,
    gap: 4,
  },
  recentSearchText: {
    fontSize: 14,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 20,
    maxHeight: screenHeight * 0.9,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  filtersList: {
    paddingHorizontal: 20,
  },
  filterSection: {
    marginBottom: 24,
  },
  filterLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  rangeContainer: {
    marginTop: 8,
  },
  rangeText: {
    fontSize: 14,
    marginBottom: 8,
  },
  slider: {
    width: '100%',
    height: 40,
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  chipText: {
    fontSize: 14,
  },
  sortOptions: {
    gap: 8,
  },
  sortOption: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  sortOptionText: {
    fontSize: 14,
  },
  modalFooter: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 20,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
  },
  resetButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 2,
    alignItems: 'center',
  },
  resetButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  applyButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  applyButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  quickViewContent: {
    width: screenWidth - 32,
    maxHeight: screenHeight * 0.8,
    borderRadius: 20,
    overflow: 'hidden',
    alignSelf: 'center',
    marginTop: 100,
  },
  quickViewImages: {
    height: 250,
  },
  quickViewImage: {
    width: screenWidth - 32,
    height: 250,
  },
  quickViewInfo: {
    padding: 20,
  },
  quickViewPrice: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  quickViewAddress: {
    fontSize: 18,
    marginBottom: 16,
  },
  quickViewDetails: {
    flexDirection: 'row',
    gap: 20,
    marginBottom: 24,
  },
  quickViewDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  quickViewDetailText: {
    fontSize: 14,
  },
  viewDetailsButton: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  viewDetailsButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default SearchScreen;