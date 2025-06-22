import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
  Modal,
  ScrollView,
  Alert,
  Dimensions,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useTheme } from '../theme/ThemeContext';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../store';
import { Property } from '../types';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { launchImageLibrary } from 'react-native-image-picker';
import Slider from '@react-native-community/slider';
import { addSearchHistory, addSavedSearch, removeSavedSearch } from '../store/slices/searchSlice';

type NavigationProp = StackNavigationProp<RootStackParamList, 'Main'>;

const { width: screenWidth } = Dimensions.get('window');

const SearchScreen = () => {
  const { colors, isDark } = useTheme();
  const navigation = useNavigation<NavigationProp>();
  const dispatch = useDispatch();
  
  const properties = useSelector((state: RootState) => state.properties.properties);
  const searchHistory = useSelector((state: RootState) => state.search.searchHistory);
  const savedSearches = useSelector((state: RootState) => state.search.savedSearches);

  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [viewType, setViewType] = useState<'list' | 'map'>('list');
  const [isLoading, setIsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [searchResults, setSearchResults] = useState<Property[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const resultsPerPage = 10;

  // Filter states
  const [filters, setFilters] = useState({
    priceMin: 0,
    priceMax: 2000000,
    beds: 0,
    baths: 0,
    squareFeetMin: 0,
    squareFeetMax: 10000,
    propertyType: 'all',
    features: {
      pool: false,
      garage: false,
      fireplace: false,
      garden: false,
      balcony: false,
      gym: false,
    },
    yearBuiltMin: 1900,
    yearBuiltMax: new Date().getFullYear(),
    hoaFeesMax: 1000,
    lotSizeMin: 0,
    lotSizeMax: 50000,
    daysOnMarket: 365,
    schoolRating: 1,
    sortBy: 'price_asc',
  });

  const locationSuggestions = [
    'Nashville, TN',
    'Franklin, TN',
    'Brentwood, TN',
    'Murfreesboro, TN',
    'Hendersonville, TN',
  ];

  useEffect(() => {
    handleSearch(searchQuery);
  }, [searchQuery, filters]);

  const handleSearch = (query: string) => {
    if (!query && Object.keys(filters).every(key => !filters[key as keyof typeof filters])) {
      setSearchResults([]);
      return;
    }

    setIsLoading(true);
    
    // Filter properties based on search query and filters
    const filtered = properties.filter(property => {
      // Text search
      if (query) {
        const searchLower = query.toLowerCase();
        const matchesText = 
          property.address.toLowerCase().includes(searchLower) ||
          property.city.toLowerCase().includes(searchLower) ||
          property.state.toLowerCase().includes(searchLower);
        if (!matchesText) return false;
      }

      // Price filter
      if (property.price < filters.priceMin || property.price > filters.priceMax) return false;
      
      // Beds/Baths filter
      if (filters.beds > 0 && property.bedrooms < filters.beds) return false;
      if (filters.baths > 0 && property.bathrooms < filters.baths) return false;
      
      // Square feet filter
      if (property.squareFeet < filters.squareFeetMin || property.squareFeet > filters.squareFeetMax) return false;
      
      // Property type filter
      if (filters.propertyType !== 'all' && property.propertyType !== filters.propertyType) return false;
      
      return true;
    });

    // Sort results
    const sorted = [...filtered].sort((a, b) => {
      switch (filters.sortBy) {
        case 'price_asc':
          return a.price - b.price;
        case 'price_desc':
          return b.price - a.price;
        case 'size_asc':
          return a.squareFeet - b.squareFeet;
        case 'size_desc':
          return b.squareFeet - a.squareFeet;
        case 'newest':
          return new Date(b.listingDate || 0).getTime() - new Date(a.listingDate || 0).getTime();
        case 'oldest':
          return new Date(a.listingDate || 0).getTime() - new Date(b.listingDate || 0).getTime();
        default:
          return 0;
      }
    });

    setSearchResults(sorted);
    setIsLoading(false);
    setCurrentPage(1);
  };

  const handleSearchSubmit = () => {
    if (searchQuery.trim()) {
      dispatch(addSearchHistory(searchQuery));
      setShowSuggestions(false);
    }
  };

  const handleVoiceSearch = () => {
    Alert.alert('Voice Search', 'Voice search is temporarily disabled');
  };

  const handleImageSearch = () => {
    launchImageLibrary(
      {
        mediaType: 'photo',
        maxWidth: 1000,
        maxHeight: 1000,
        quality: 0.8,
      },
      (response) => {
        if (response.assets && response.assets[0]) {
          Alert.alert(
            'Image Search',
            'Finding similar properties based on your image...',
            [{ text: 'OK' }]
          );
          // In a real app, this would upload the image and search
          setIsLoading(true);
          setTimeout(() => {
            setIsLoading(false);
            handleSearch('modern house');
          }, 2000);
        }
      }
    );
  };

  const handleSaveSearch = () => {
    if (searchQuery || Object.keys(filters).some(key => filters[key as keyof typeof filters])) {
      const searchCriteria = {
        id: Date.now().toString(),
        query: searchQuery,
        filters: filters,
        timestamp: new Date().toISOString(),
      };
      dispatch(addSavedSearch(searchCriteria));
      Alert.alert('Search Saved', 'You will be notified of new matching properties');
    }
  };

  const activeFilterCount = () => {
    let count = 0;
    if (filters.priceMin > 0 || filters.priceMax < 2000000) count++;
    if (filters.beds > 0) count++;
    if (filters.baths > 0) count++;
    if (filters.propertyType !== 'all') count++;
    if (Object.values(filters.features).some(v => v)) count++;
    if (filters.yearBuiltMin > 1900 || filters.yearBuiltMax < new Date().getFullYear()) count++;
    if (filters.hoaFeesMax < 1000) count++;
    if (filters.daysOnMarket < 365) count++;
    if (filters.schoolRating > 1) count++;
    return count;
  };

  const renderProperty = ({ item }: { item: Property }) => (
    <TouchableOpacity
      style={[styles.propertyCard, { backgroundColor: colors.cardBackground }]}
      onPress={() => navigation.navigate('PropertyDetails', { propertyId: item.id })}
      onLongPress={() => {
        Alert.alert(
          'Quick Actions',
          '',
          [
            { text: 'View Details', onPress: () => navigation.navigate('PropertyDetails', { propertyId: item.id }) },
            { text: 'Save Property', onPress: () => console.log('Save property') },
            { text: 'Share', onPress: () => console.log('Share property') },
            { text: 'Cancel', style: 'cancel' },
          ]
        );
      }}
    >
      <View style={styles.propertyImageContainer}>
        {/* Property image would go here */}
        <View style={[styles.placeholderImage, { backgroundColor: colors.border }]}>
          <Icon name="home" size={40} color={colors.textTertiary} />
        </View>
      </View>
      <View style={styles.propertyInfo}>
        <Text style={[styles.propertyPrice, { color: colors.text }]}>
          ${item.price.toLocaleString()}
        </Text>
        <Text style={[styles.propertyAddress, { color: colors.textSecondary }]} numberOfLines={1}>
          {item.address}
        </Text>
        <View style={styles.propertyDetails}>
          <Text style={[styles.propertyDetail, { color: colors.textTertiary }]}>
            {item.bedrooms} beds
          </Text>
          <Text style={[styles.propertyDetail, { color: colors.textTertiary }]}>
            {item.bathrooms} baths
          </Text>
          <Text style={[styles.propertyDetail, { color: colors.textTertiary }]}>
            {item.squareFeet.toLocaleString()} sqft
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderFilterModal = () => (
    <Modal
      animationType="slide"
      transparent={true}
      visible={showFilters}
      onRequestClose={() => setShowFilters(false)}
    >
      <View style={styles.modalContainer}>
        <View style={[styles.modalContent, { backgroundColor: colors.background }]}>
          <View style={styles.modalHeader}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>Search Filters</Text>
            <TouchableOpacity onPress={() => setShowFilters(false)}>
              <Icon name="close" size={24} color={colors.text} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.filterScroll} showsVerticalScrollIndicator={false}>
            {/* Price Range */}
            <View style={styles.filterSection}>
              <Text style={[styles.filterLabel, { color: colors.text }]}>Price Range</Text>
              <View style={styles.rangeContainer}>
                <Text style={[styles.rangeText, { color: colors.textSecondary }]}>
                  ${filters.priceMin.toLocaleString()} - ${filters.priceMax.toLocaleString()}
                </Text>
              </View>
              <Slider
                style={styles.slider}
                minimumValue={0}
                maximumValue={2000000}
                value={filters.priceMax}
                onValueChange={(value) => setFilters({ ...filters, priceMax: Math.round(value) })}
                minimumTrackTintColor={colors.primary}
                maximumTrackTintColor={colors.border}
                thumbTintColor={colors.primary}
              />
            </View>

            {/* Bedrooms */}
            <View style={styles.filterSection}>
              <Text style={[styles.filterLabel, { color: colors.text }]}>Bedrooms</Text>
              <View style={styles.buttonGroup}>
                {[0, 1, 2, 3, 4, 5].map((num) => (
                  <TouchableOpacity
                    key={num}
                    style={[
                      styles.filterButton,
                      { 
                        backgroundColor: filters.beds === num ? colors.primary : colors.chipBackground,
                        borderColor: colors.border,
                      }
                    ]}
                    onPress={() => setFilters({ ...filters, beds: num })}
                  >
                    <Text style={[
                      styles.filterButtonText,
                      { color: filters.beds === num ? '#fff' : colors.chipText }
                    ]}>
                      {num === 0 ? 'Any' : `${num}+`}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Property Type */}
            <View style={styles.filterSection}>
              <Text style={[styles.filterLabel, { color: colors.text }]}>Property Type</Text>
              <View style={styles.buttonGroup}>
                {['all', 'house', 'condo', 'townhouse'].map((type) => (
                  <TouchableOpacity
                    key={type}
                    style={[
                      styles.filterButton,
                      { 
                        backgroundColor: filters.propertyType === type ? colors.primary : colors.chipBackground,
                        borderColor: colors.border,
                      }
                    ]}
                    onPress={() => setFilters({ ...filters, propertyType: type })}
                  >
                    <Text style={[
                      styles.filterButtonText,
                      { color: filters.propertyType === type ? '#fff' : colors.chipText }
                    ]}>
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Features */}
            <View style={styles.filterSection}>
              <Text style={[styles.filterLabel, { color: colors.text }]}>Features</Text>
              <View style={styles.featuresGrid}>
                {Object.entries(filters.features).map(([feature, enabled]) => (
                  <TouchableOpacity
                    key={feature}
                    style={[
                      styles.featureChip,
                      { 
                        backgroundColor: enabled ? colors.primary : colors.chipBackground,
                        borderColor: colors.border,
                      }
                    ]}
                    onPress={() => setFilters({
                      ...filters,
                      features: { ...filters.features, [feature]: !enabled }
                    })}
                  >
                    <Text style={[
                      styles.featureText,
                      { color: enabled ? '#fff' : colors.chipText }
                    ]}>
                      {feature.charAt(0).toUpperCase() + feature.slice(1)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Apply Filters Button */}
            <TouchableOpacity
              style={[styles.applyButton, { backgroundColor: colors.primary }]}
              onPress={() => {
                setShowFilters(false);
                handleSearch(searchQuery);
              }}
            >
              <Text style={styles.applyButtonText}>Apply Filters</Text>
            </TouchableOpacity>

            {/* Reset Filters */}
            <TouchableOpacity
              style={[styles.resetButton, { borderColor: colors.primary }]}
              onPress={() => {
                setFilters({
                  priceMin: 0,
                  priceMax: 2000000,
                  beds: 0,
                  baths: 0,
                  squareFeetMin: 0,
                  squareFeetMax: 10000,
                  propertyType: 'all',
                  features: {
                    pool: false,
                    garage: false,
                    fireplace: false,
                    garden: false,
                    balcony: false,
                    gym: false,
                  },
                  yearBuiltMin: 1900,
                  yearBuiltMax: new Date().getFullYear(),
                  hoaFeesMax: 1000,
                  lotSizeMin: 0,
                  lotSizeMax: 50000,
                  daysOnMarket: 365,
                  schoolRating: 1,
                  sortBy: 'price_asc',
                });
              }}
            >
              <Text style={[styles.resetButtonText, { color: colors.primary }]}>Reset Filters</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    header: {
      padding: 16,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    searchContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.inputBackground,
      borderRadius: 12,
      paddingHorizontal: 12,
      height: 44,
      marginBottom: 12,
    },
    searchInput: {
      flex: 1,
      fontSize: 16,
      color: colors.text,
      marginLeft: 8,
    },
    searchButton: {
      padding: 8,
      marginHorizontal: 4,
    },
    activeFilter: {
      backgroundColor: colors.primary + '20',
      borderRadius: 20,
    },
    filterCount: {
      position: 'absolute',
      top: -4,
      right: -4,
      backgroundColor: colors.primary,
      borderRadius: 10,
      width: 20,
      height: 20,
      justifyContent: 'center',
      alignItems: 'center',
    },
    filterCountText: {
      color: '#fff',
      fontSize: 12,
      fontWeight: 'bold',
    },
    viewToggle: {
      flexDirection: 'row',
      justifyContent: 'center',
      gap: 8,
    },
    viewButton: {
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 20,
      backgroundColor: colors.chipBackground,
    },
    viewButtonActive: {
      backgroundColor: colors.primary,
    },
    viewButtonText: {
      fontSize: 14,
      color: colors.chipText,
    },
    viewButtonTextActive: {
      color: '#fff',
      fontWeight: '600',
    },
    suggestions: {
      position: 'absolute',
      top: 56,
      left: 0,
      right: 0,
      backgroundColor: colors.background,
      borderRadius: 12,
      maxHeight: 200,
      shadowColor: colors.shadowColor,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 5,
      zIndex: 1000,
    },
    suggestionItem: {
      padding: 12,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    suggestionText: {
      fontSize: 16,
      color: colors.text,
    },
    recentSection: {
      padding: 16,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      color: colors.text,
      marginBottom: 12,
    },
    recentItem: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 8,
    },
    recentText: {
      fontSize: 16,
      color: colors.textSecondary,
      marginLeft: 8,
      flex: 1,
    },
    savedSearchItem: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    savedSearchInfo: {
      flex: 1,
    },
    savedSearchQuery: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.text,
    },
    savedSearchFilters: {
      fontSize: 14,
      color: colors.textSecondary,
      marginTop: 2,
    },
    resultsHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: 16,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    resultCount: {
      fontSize: 16,
      color: colors.text,
    },
    sortButton: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    sortText: {
      fontSize: 14,
      color: colors.primary,
      marginRight: 4,
    },
    propertyCard: {
      flexDirection: 'row',
      padding: 12,
      marginHorizontal: 16,
      marginVertical: 8,
      borderRadius: 12,
      shadowColor: colors.shadowColor,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    propertyImageContainer: {
      width: 100,
      height: 100,
      borderRadius: 8,
      overflow: 'hidden',
    },
    placeholderImage: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    propertyInfo: {
      flex: 1,
      marginLeft: 12,
      justifyContent: 'space-between',
    },
    propertyPrice: {
      fontSize: 20,
      fontWeight: 'bold',
    },
    propertyAddress: {
      fontSize: 16,
      marginTop: 4,
    },
    propertyDetails: {
      flexDirection: 'row',
      marginTop: 8,
    },
    propertyDetail: {
      fontSize: 14,
      marginRight: 12,
    },
    emptyState: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 32,
    },
    emptyIcon: {
      marginBottom: 16,
    },
    emptyText: {
      fontSize: 18,
      fontWeight: '600',
      color: colors.text,
      marginBottom: 8,
    },
    emptySubtext: {
      fontSize: 16,
      color: colors.textSecondary,
      textAlign: 'center',
    },
    loadMoreButton: {
      margin: 16,
      padding: 12,
      backgroundColor: colors.primary,
      borderRadius: 8,
      alignItems: 'center',
    },
    loadMoreText: {
      color: '#fff',
      fontSize: 16,
      fontWeight: '600',
    },
    modalContainer: {
      flex: 1,
      justifyContent: 'flex-end',
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalContent: {
      borderTopLeftRadius: 24,
      borderTopRightRadius: 24,
      paddingTop: 20,
      paddingBottom: 40,
      maxHeight: '90%',
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
    filterScroll: {
      paddingHorizontal: 20,
    },
    filterSection: {
      marginBottom: 24,
    },
    filterLabel: {
      fontSize: 18,
      fontWeight: '600',
      marginBottom: 12,
    },
    rangeContainer: {
      marginBottom: 8,
    },
    rangeText: {
      fontSize: 16,
      textAlign: 'center',
    },
    slider: {
      width: '100%',
      height: 40,
    },
    buttonGroup: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
    },
    filterButton: {
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 20,
      borderWidth: 1,
    },
    filterButtonText: {
      fontSize: 14,
      fontWeight: '500',
    },
    featuresGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
    },
    featureChip: {
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 20,
      borderWidth: 1,
    },
    featureText: {
      fontSize: 14,
    },
    applyButton: {
      paddingVertical: 14,
      borderRadius: 8,
      alignItems: 'center',
      marginTop: 20,
    },
    applyButtonText: {
      color: '#fff',
      fontSize: 16,
      fontWeight: '600',
    },
    resetButton: {
      paddingVertical: 14,
      borderRadius: 8,
      alignItems: 'center',
      marginTop: 12,
      borderWidth: 1,
    },
    resetButtonText: {
      fontSize: 16,
      fontWeight: '600',
    },
  });

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.searchContainer}>
          <Icon name="search" size={20} color={colors.textSecondary} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search by location, address..."
            placeholderTextColor={colors.textTertiary}
            value={searchQuery}
            onChangeText={(text) => {
              setSearchQuery(text);
              setShowSuggestions(text.length > 0);
            }}
            onSubmitEditing={handleSearchSubmit}
            returnKeyType="search"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => {
              setSearchQuery('');
              setSearchResults([]);
              setShowSuggestions(false);
            }}>
              <Icon name="close-circle" size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          )}
          <TouchableOpacity
            style={[styles.searchButton, isListening && styles.activeFilter]}
            onPress={handleVoiceSearch}
          >
            <Icon name={isListening ? "mic" : "mic-outline"} size={24} color={isListening ? colors.primary : colors.textSecondary} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.searchButton} onPress={handleImageSearch}>
            <Icon name="camera-outline" size={24} color={colors.textSecondary} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.searchButton}
            onPress={() => setShowFilters(true)}
          >
            <Icon name="options-outline" size={24} color={colors.textSecondary} />
            {activeFilterCount() > 0 && (
              <View style={styles.filterCount}>
                <Text style={styles.filterCountText}>{activeFilterCount()}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.viewToggle}>
          <TouchableOpacity
            style={[styles.viewButton, viewType === 'list' && styles.viewButtonActive]}
            onPress={() => setViewType('list')}
          >
            <Text style={[styles.viewButtonText, viewType === 'list' && styles.viewButtonTextActive]}>
              List
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.viewButton, viewType === 'map' && styles.viewButtonActive]}
            onPress={() => setViewType('map')}
          >
            <Text style={[styles.viewButtonText, viewType === 'map' && styles.viewButtonTextActive]}>
              Map
            </Text>
          </TouchableOpacity>
        </View>

        {showSuggestions && searchQuery.length > 0 && (
          <View style={styles.suggestions}>
            {locationSuggestions
              .filter(loc => loc.toLowerCase().includes(searchQuery.toLowerCase()))
              .map((suggestion, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.suggestionItem}
                  onPress={() => {
                    setSearchQuery(suggestion);
                    setShowSuggestions(false);
                    handleSearchSubmit();
                  }}
                >
                  <Text style={styles.suggestionText}>{suggestion}</Text>
                </TouchableOpacity>
              ))
            }
          </View>
        )}
      </View>

      {isLoading ? (
        <View style={styles.emptyState}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.emptyText, { marginTop: 16 }]}>Searching...</Text>
        </View>
      ) : searchResults.length > 0 ? (
        <>
          <View style={styles.resultsHeader}>
            <Text style={styles.resultCount}>
              {searchResults.length} properties found
            </Text>
            <TouchableOpacity style={styles.sortButton}>
              <Text style={styles.sortText}>Sort</Text>
              <Icon name="chevron-down" size={16} color={colors.primary} />
            </TouchableOpacity>
          </View>
          <FlatList
            data={searchResults.slice(0, currentPage * resultsPerPage)}
            renderItem={renderProperty}
            keyExtractor={(item) => item.id}
            contentContainerStyle={{ paddingBottom: 20 }}
            ListFooterComponent={
              searchResults.length > currentPage * resultsPerPage ? (
                <TouchableOpacity
                  style={styles.loadMoreButton}
                  onPress={() => setCurrentPage(currentPage + 1)}
                >
                  <Text style={styles.loadMoreText}>Load More</Text>
                </TouchableOpacity>
              ) : null
            }
          />
        </>
      ) : searchQuery || activeFilterCount() > 0 ? (
        <View style={styles.emptyState}>
          <Icon name="search" size={64} color={colors.textTertiary} style={styles.emptyIcon} />
          <Text style={styles.emptyText}>No properties found</Text>
          <Text style={styles.emptySubtext}>
            Try adjusting your search criteria or filters
          </Text>
        </View>
      ) : (
        <ScrollView style={{ flex: 1 }}>
          {searchHistory.length > 0 && (
            <View style={styles.recentSection}>
              <Text style={styles.sectionTitle}>Recent Searches</Text>
              {searchHistory.slice(0, 5).map((search, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.recentItem}
                  onPress={() => {
                    setSearchQuery(search);
                    handleSearchSubmit();
                  }}
                >
                  <Icon name="time-outline" size={20} color={colors.textTertiary} />
                  <Text style={styles.recentText}>{search}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

          {savedSearches.length > 0 && (
            <View style={styles.recentSection}>
              <View style={styles.resultsHeader}>
                <Text style={styles.sectionTitle}>Saved Searches</Text>
                <TouchableOpacity onPress={handleSaveSearch}>
                  <Icon name="add-circle-outline" size={24} color={colors.primary} />
                </TouchableOpacity>
              </View>
              {savedSearches.map((search) => (
                <TouchableOpacity
                  key={search.id}
                  style={styles.savedSearchItem}
                  onPress={() => {
                    setSearchQuery(search.query);
                    setFilters(search.filters);
                    handleSearchSubmit();
                  }}
                >
                  <View style={styles.savedSearchInfo}>
                    <Text style={styles.savedSearchQuery}>
                      {search.query || 'Custom Filter'}
                    </Text>
                    <Text style={styles.savedSearchFilters}>
                      {Object.entries(search.filters).filter(([_, value]) => value).length} filters
                    </Text>
                  </View>
                  <TouchableOpacity
                    onPress={() => dispatch(removeSavedSearch(search.id))}
                  >
                    <Icon name="close-circle" size={20} color={colors.textSecondary} />
                  </TouchableOpacity>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </ScrollView>
      )}

      {renderFilterModal()}
    </SafeAreaView>
  );
};

export default SearchScreen;