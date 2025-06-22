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
  Image,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../store';
import { useTheme } from '../theme/ThemeContext';
import { Property, PropertyType } from '../types';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import Slider from '@react-native-community/slider';
import { addSearchHistory } from '../store/slices/searchSlice';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

type NavigationProp = StackNavigationProp<RootStackParamList>;

interface QuickFilter {
  id: string;
  label: string;
  value: any;
  active: boolean;
}

const SearchScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const dispatch = useDispatch();
  const { colors } = useTheme();
  const searchInputRef = useRef<TextInput>(null);

  const { properties } = useSelector((state: RootState) => state.properties);
  const { searchHistory } = useSelector((state: RootState) => state.search);

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Property[]>([]);
  const [loading, setLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  
  // Quick filters state
  const [quickFilters, setQuickFilters] = useState<QuickFilter[]>([
    { id: 'price1', label: 'Under $500k', value: { max: 500000 }, active: false },
    { id: 'price2', label: '$500k-$1M', value: { min: 500000, max: 1000000 }, active: false },
    { id: 'beds', label: '3+ Beds', value: { minBeds: 3 }, active: false },
    { id: 'baths', label: '2+ Baths', value: { minBaths: 2 }, active: false },
    { id: 'house', label: 'House', value: { type: PropertyType.SINGLE_FAMILY }, active: false },
    { id: 'condo', label: 'Condo', value: { type: PropertyType.CONDO }, active: false },
  ]);

  // Advanced filters
  const [filters, setFilters] = useState({
    priceRange: { min: 0, max: 2000000 },
    bedrooms: { min: 0, max: 10 },
    bathrooms: { min: 0, max: 10 },
    propertyTypes: [] as PropertyType[],
    squareFeet: { min: 0, max: 10000 },
  });

  // Search suggestions based on input
  const suggestions = searchQuery.length > 2
    ? ['Nashville, TN', 'Franklin, TN', 'Brentwood, TN', 'Murfreesboro, TN']
        .filter(s => s.toLowerCase().includes(searchQuery.toLowerCase()))
    : [];

  const handleSearch = useCallback((query: string = searchQuery) => {
    if (query.trim()) {
      dispatch(addSearchHistory(query));
      setShowSuggestions(false);
    }
    
    setLoading(true);
    
    // Simulate search with filters
    setTimeout(() => {
      // First, ensure unique properties by ID
      const uniqueProperties = properties.reduce((acc, property) => {
        if (!acc.find(p => p.id === property.id)) {
          acc.push(property);
        }
        return acc;
      }, [] as Property[]);

      let filtered = uniqueProperties.filter(property => {
        // Text search
        if (query && !property.address.toLowerCase().includes(query.toLowerCase()) &&
            !property.city.toLowerCase().includes(query.toLowerCase())) {
          return false;
        }

        // Apply quick filters
        const activeQuickFilters = quickFilters.filter(f => f.active);
        for (const qf of activeQuickFilters) {
          if (qf.value.max && property.price > qf.value.max) return false;
          if (qf.value.min && property.price < qf.value.min) return false;
          if (qf.value.minBeds && property.bedrooms < qf.value.minBeds) return false;
          if (qf.value.minBaths && property.bathrooms < qf.value.minBaths) return false;
          if (qf.value.type && property.propertyType !== qf.value.type) return false;
        }

        // Apply advanced filters if modal was used
        if (property.price < filters.priceRange.min || property.price > filters.priceRange.max) return false;
        if (property.bedrooms < filters.bedrooms.min || property.bedrooms > filters.bedrooms.max) return false;
        if (property.bathrooms < filters.bathrooms.min || property.bathrooms > filters.bathrooms.max) return false;
        if (filters.propertyTypes.length > 0 && !filters.propertyTypes.includes(property.propertyType)) return false;

        return true;
      });

      setSearchResults(filtered);
      setLoading(false);
    }, 500);
  }, [searchQuery, properties, quickFilters, filters, dispatch]);

  const toggleQuickFilter = (id: string) => {
    setQuickFilters(prev => 
      prev.map(filter => 
        filter.id === id ? { ...filter, active: !filter.active } : filter
      )
    );
  };

  useEffect(() => {
    handleSearch();
  }, [quickFilters]);

  const renderPropertyItem = ({ item }: { item: Property }) => (
    <TouchableOpacity
      style={[styles.propertyCard, { backgroundColor: colors.cardBackground }]}
      onPress={() => navigation.navigate('PropertyDetails', { propertyId: item.id })}
      activeOpacity={0.9}
    >
      <Image source={{ uri: item.images[0] }} style={styles.propertyImage} />
      <View style={styles.propertyInfo}>
        <Text style={[styles.propertyPrice, { color: colors.primary }]}>
          ${item.price.toLocaleString()}
        </Text>
        <Text style={[styles.propertyAddress, { color: colors.text }]} numberOfLines={1}>
          {item.address}
        </Text>
        <Text style={[styles.propertyCity, { color: colors.textSecondary }]}>
          {item.city}, {item.state}
        </Text>
        <View style={styles.propertyDetails}>
          <View style={styles.detailItem}>
            <Icon name="bed-outline" size={16} color={colors.textSecondary} />
            <Text style={[styles.detailText, { color: colors.textSecondary }]}>{item.bedrooms}</Text>
          </View>
          <View style={styles.detailDivider} />
          <View style={styles.detailItem}>
            <Icon name="water-outline" size={16} color={colors.textSecondary} />
            <Text style={[styles.detailText, { color: colors.textSecondary }]}>{item.bathrooms}</Text>
          </View>
          <View style={styles.detailDivider} />
          <View style={styles.detailItem}>
            <Icon name="resize-outline" size={16} color={colors.textSecondary} />
            <Text style={[styles.detailText, { color: colors.textSecondary }]}>
              {item.squareFeet.toLocaleString()}
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderFiltersModal = () => (
    <Modal
      visible={showFilters}
      animationType="slide"
      transparent={true}
      onRequestClose={() => setShowFilters(false)}
    >
      <View style={[styles.modalContainer, { backgroundColor: 'rgba(0,0,0,0.5)' }]}>
        <View style={[styles.modalContent, { backgroundColor: colors.cardBackground }]}>
          <View style={styles.modalHeader}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>Filters</Text>
            <TouchableOpacity onPress={() => setShowFilters(false)}>
              <Icon name="close" size={24} color={colors.text} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.filtersList} showsVerticalScrollIndicator={false}>
            {/* Price Range */}
            <View style={styles.filterSection}>
              <Text style={[styles.filterLabel, { color: colors.text }]}>Price Range</Text>
              <Text style={[styles.rangeText, { color: colors.textSecondary }]}>
                ${filters.priceRange.min.toLocaleString()} - ${filters.priceRange.max.toLocaleString()}
              </Text>
              <View style={styles.sliderContainer}>
                <Slider
                  style={styles.slider}
                  minimumValue={0}
                  maximumValue={2000000}
                  value={filters.priceRange.min}
                  onValueChange={(value) =>
                    setFilters({ ...filters, priceRange: { ...filters.priceRange, min: Math.round(value) } })
                  }
                  minimumTrackTintColor={colors.primary}
                  maximumTrackTintColor={colors.border}
                  thumbTintColor={colors.primary}
                />
                <Slider
                  style={styles.slider}
                  minimumValue={0}
                  maximumValue={2000000}
                  value={filters.priceRange.max}
                  onValueChange={(value) =>
                    setFilters({ ...filters, priceRange: { ...filters.priceRange, max: Math.round(value) } })
                  }
                  minimumTrackTintColor={colors.primary}
                  maximumTrackTintColor={colors.border}
                  thumbTintColor={colors.primary}
                />
              </View>
            </View>

            {/* Bedrooms */}
            <View style={styles.filterSection}>
              <Text style={[styles.filterLabel, { color: colors.text }]}>Bedrooms</Text>
              <View style={styles.numberButtonsContainer}>
                {[1, 2, 3, 4, 5].map(num => (
                  <TouchableOpacity
                    key={num}
                    style={[
                      styles.numberButton,
                      { 
                        backgroundColor: filters.bedrooms.min === num ? colors.primary : colors.chipBackground,
                        borderColor: filters.bedrooms.min === num ? colors.primary : colors.border,
                      }
                    ]}
                    onPress={() => setFilters({ ...filters, bedrooms: { ...filters.bedrooms, min: num } })}
                  >
                    <Text style={[
                      styles.numberButtonText,
                      { color: filters.bedrooms.min === num ? '#fff' : colors.text }
                    ]}>
                      {num}+
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Bathrooms */}
            <View style={styles.filterSection}>
              <Text style={[styles.filterLabel, { color: colors.text }]}>Bathrooms</Text>
              <View style={styles.numberButtonsContainer}>
                {[1, 2, 3, 4].map(num => (
                  <TouchableOpacity
                    key={num}
                    style={[
                      styles.numberButton,
                      { 
                        backgroundColor: filters.bathrooms.min === num ? colors.primary : colors.chipBackground,
                        borderColor: filters.bathrooms.min === num ? colors.primary : colors.border,
                      }
                    ]}
                    onPress={() => setFilters({ ...filters, bathrooms: { ...filters.bathrooms, min: num } })}
                  >
                    <Text style={[
                      styles.numberButtonText,
                      { color: filters.bathrooms.min === num ? '#fff' : colors.text }
                    ]}>
                      {num}+
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Apply Button */}
            <TouchableOpacity
              style={[styles.applyButton, { backgroundColor: colors.primary }]}
              onPress={() => {
                setShowFilters(false);
                handleSearch();
              }}
            >
              <Text style={styles.applyButtonText}>Apply Filters</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );

  return (
    <KeyboardAvoidingView 
      style={[styles.container, { backgroundColor: colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      {/* Search Header */}
      <View style={[styles.searchHeader, { backgroundColor: colors.background }]}>
        <View style={styles.searchBarContainer}>
          <View style={[styles.searchBar, { backgroundColor: colors.inputBackground }]}>
            <Icon name="search" size={20} color={colors.textSecondary} />
            <TextInput
              ref={searchInputRef}
              style={[styles.searchInput, { color: colors.text }]}
              placeholder="Search by location, address..."
              placeholderTextColor={colors.textSecondary}
              value={searchQuery}
              onChangeText={(text) => {
                setSearchQuery(text);
                setShowSuggestions(text.length > 2);
              }}
              onSubmitEditing={() => handleSearch()}
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
          </View>
          
          <TouchableOpacity
            style={[styles.filterButton, { backgroundColor: colors.chipBackground }]}
            onPress={() => setShowFilters(true)}
          >
            <Icon name="options-outline" size={24} color={colors.primary} />
          </TouchableOpacity>
        </View>

        {/* Quick Filters */}
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={styles.quickFiltersContainer}
        >
          {quickFilters.map(filter => (
            <TouchableOpacity
              key={filter.id}
              style={[
                styles.quickFilterChip,
                { 
                  backgroundColor: filter.active ? colors.primary : colors.chipBackground,
                  borderColor: filter.active ? colors.primary : colors.border,
                }
              ]}
              onPress={() => toggleQuickFilter(filter.id)}
            >
              <Text style={[
                styles.quickFilterText,
                { color: filter.active ? '#fff' : colors.text }
              ]}>
                {filter.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Search Suggestions */}
        {showSuggestions && suggestions.length > 0 && (
          <View style={[styles.suggestionsContainer, { backgroundColor: colors.cardBackground }]}>
            {suggestions.map((suggestion, index) => (
              <TouchableOpacity
                key={index}
                style={styles.suggestionItem}
                onPress={() => {
                  setSearchQuery(suggestion);
                  setShowSuggestions(false);
                  handleSearch(suggestion);
                }}
              >
                <Icon name="location-outline" size={16} color={colors.textSecondary} />
                <Text style={[styles.suggestionText, { color: colors.text }]}>{suggestion}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>

      {/* Results Count */}
      {searchResults.length > 0 && (
        <View style={[styles.resultsHeader, { backgroundColor: colors.background }]}>
          <Text style={[styles.resultsCount, { color: colors.text }]}>
            {searchResults.length} properties found
          </Text>
        </View>
      )}

      {/* Results List */}
      <FlatList
        data={searchResults}
        renderItem={renderPropertyItem}
        keyExtractor={(item, index) => item.id || `property-${index}`}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          !loading && (
            <View style={styles.emptyState}>
              <Icon name="search" size={64} color={colors.textSecondary} />
              <Text style={[styles.emptyStateText, { color: colors.textSecondary }]}>
                {searchQuery ? 'No properties found' : 'Start searching for your dream home'}
              </Text>
              {searchHistory.length > 0 && !searchQuery && (
                <View style={styles.recentSearches}>
                  <Text style={[styles.recentTitle, { color: colors.text }]}>Recent Searches</Text>
                  {searchHistory.slice(0, 3).map((search, index) => (
                    <TouchableOpacity
                      key={index}
                      style={styles.recentItem}
                      onPress={() => {
                        setSearchQuery(search);
                        handleSearch(search);
                      }}
                    >
                      <Icon name="time-outline" size={16} color={colors.textSecondary} />
                      <Text style={[styles.recentText, { color: colors.textSecondary }]}>{search}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
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

      {/* Modals */}
      {renderFiltersModal()}
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
  filterButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quickFiltersContainer: {
    marginBottom: 12,
  },
  quickFilterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
  },
  quickFilterText: {
    fontSize: 14,
    fontWeight: '500',
  },
  suggestionsContainer: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 110 : 80,
    left: 16,
    right: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
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
  resultsHeader: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  resultsCount: {
    fontSize: 16,
    fontWeight: '600',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 100,
  },
  propertyCard: {
    marginVertical: 8,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  propertyImage: {
    width: '100%',
    height: 200,
  },
  propertyInfo: {
    padding: 16,
  },
  propertyPrice: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  propertyAddress: {
    fontSize: 16,
    marginBottom: 2,
  },
  propertyCity: {
    fontSize: 14,
    marginBottom: 12,
  },
  propertyDetails: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  detailText: {
    marginLeft: 4,
    fontSize: 14,
  },
  detailDivider: {
    width: 1,
    height: 16,
    backgroundColor: 'rgba(0,0,0,0.1)',
    marginHorizontal: 8,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
  },
  emptyStateText: {
    marginTop: 16,
    fontSize: 16,
  },
  recentSearches: {
    marginTop: 32,
    width: '100%',
    paddingHorizontal: 16,
  },
  recentTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  recentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  recentText: {
    marginLeft: 8,
    fontSize: 14,
  },
  loadingFooter: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 20,
    paddingBottom: 40,
    maxHeight: screenHeight * 0.8,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
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
  rangeText: {
    fontSize: 14,
    marginBottom: 8,
    textAlign: 'center',
  },
  sliderContainer: {
    marginTop: 8,
  },
  slider: {
    width: '100%',
    height: 40,
  },
  numberButtonsContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  numberButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
  },
  numberButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  applyButton: {
    marginTop: 24,
    paddingVertical: 16,
    borderRadius: 25,
    alignItems: 'center',
  },
  applyButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default SearchScreen;