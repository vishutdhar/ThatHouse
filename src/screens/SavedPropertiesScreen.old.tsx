import React, { useState, useRef, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  SafeAreaView,
  TouchableOpacity,
  Image,
  TextInput,
  ScrollView,
  Alert,
  Modal,
  Dimensions,
  Animated,
  Platform,
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import Icon from 'react-native-vector-icons/Ionicons';
import MaterialIcon from 'react-native-vector-icons/MaterialIcons';
import { SwipeListView } from 'react-native-swipe-list-view';
import Share from 'react-native-share';
import LottieView from 'lottie-react-native';
import { RootState } from '../store';
import { Property, PropertyType } from '../types';
import { RootStackParamList } from '../navigation/AppNavigator';
import { useTheme } from '../theme/ThemeContext';
import EmptyState from '../components/EmptyState';
import { removeSavedProperty, addSavedProperty } from '../store/slices/userSlice';
import { 
  addPropertyNote, 
  removePropertyNote, 
  setPropertyCollection, 
  removePropertyFromCollection 
} from '../store/slices/propertiesSlice';
import { triggerHaptic } from '../utils/haptics';

type NavigationProp = StackNavigationProp<RootStackParamList>;

const { width: screenWidth } = Dimensions.get('window');

interface SavedProperty extends Property {
  notes?: string;
  savedDate?: string;
  collection?: string;
}

interface Collection {
  id: string;
  name: string;
  color: string;
  count: number;
}

const defaultCollections: Collection[] = [
  { id: 'favorites', name: 'Favorites', color: '#FF6B6B', count: 0 },
  { id: 'considering', name: 'Considering', color: '#4ECDC4', count: 0 },
  { id: 'scheduled', name: 'Scheduled Viewing', color: '#45B7D1', count: 0 },
];

const priceRanges = [
  { label: 'Under $300K', min: 0, max: 300000 },
  { label: '$300K-$500K', min: 300000, max: 500000 },
  { label: '$500K-$750K', min: 500000, max: 750000 },
  { label: '$750K+', min: 750000, max: Infinity },
];

const bedroomOptions = [
  { label: '1+', value: 1 },
  { label: '2+', value: 2 },
  { label: '3+', value: 3 },
  { label: '4+', value: 4 },
];

const SavedPropertiesScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const dispatch = useDispatch();
  const { properties, propertyNotes, propertyCollections } = useSelector((state: RootState) => state.properties);
  const { currentUser } = useSelector((state: RootState) => state.user);
  const { colors } = useTheme();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'price' | 'newest' | 'savedDate'>('savedDate');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [selectedPriceRange, setSelectedPriceRange] = useState<typeof priceRanges[0] | null>(null);
  const [selectedBedrooms, setSelectedBedrooms] = useState<number | null>(null);
  const [selectedPropertyType, setSelectedPropertyType] = useState<PropertyType | null>(null);
  const [compareMode, setCompareMode] = useState(false);
  const [selectedForCompare, setSelectedForCompare] = useState<string[]>([]);
  const [showNotesModal, setShowNotesModal] = useState(false);
  const [selectedPropertyForNotes, setSelectedPropertyForNotes] = useState<string | null>(null);
  const [tempNote, setTempNote] = useState('');
  const [showSortModal, setShowSortModal] = useState(false);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [showCollectionModal, setShowCollectionModal] = useState(false);
  const [selectedPropertyForCollection, setSelectedPropertyForCollection] = useState<string | null>(null);
  const [undoProperty, setUndoProperty] = useState<string | null>(null);
  const undoTimeout = useRef<NodeJS.Timeout>();
  const fadeAnim = useRef(new Animated.Value(1)).current;

  const savedProperties = useMemo(() => {
    let filtered = properties.filter(
      property => currentUser?.savedProperties.includes(property.id)
    );

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(property =>
        property.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
        property.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
        property.state.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply price range filter
    if (selectedPriceRange) {
      filtered = filtered.filter(property =>
        property.price >= selectedPriceRange.min &&
        property.price <= selectedPriceRange.max
      );
    }

    // Apply bedrooms filter
    if (selectedBedrooms) {
      filtered = filtered.filter(property =>
        property.bedrooms >= selectedBedrooms
      );
    }

    // Apply property type filter
    if (selectedPropertyType) {
      filtered = filtered.filter(property =>
        property.propertyType === selectedPropertyType
      );
    }

    // Sort properties
    filtered.sort((a, b) => {
      let comparison = 0;
      switch (sortBy) {
        case 'price':
          comparison = a.price - b.price;
          break;
        case 'newest':
          comparison = a.daysOnMarket - b.daysOnMarket;
          break;
        case 'savedDate':
          // For demo purposes, using index as saved date proxy
          const aIndex = currentUser?.savedProperties.indexOf(a.id) || 0;
          const bIndex = currentUser?.savedProperties.indexOf(b.id) || 0;
          comparison = aIndex - bIndex;
          break;
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });

    return filtered;
  }, [properties, currentUser?.savedProperties, searchQuery, selectedPriceRange, selectedBedrooms, selectedPropertyType, sortBy, sortOrder]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  const handleRemoveProperty = useCallback((propertyId: string) => {
    triggerHaptic('light');
    
    // Store the property before removing it for undo functionality
    const propertyToRemove = properties.find(p => p.id === propertyId);
    if (propertyToRemove) {
      setUndoProperty(propertyId);
      dispatch(removeSavedProperty(propertyId));
      
      // Show undo option for 5 seconds
      if (undoTimeout.current) {
        clearTimeout(undoTimeout.current);
      }
      undoTimeout.current = setTimeout(() => {
        setUndoProperty(null);
      }, 5000);
    }
  }, [dispatch, properties]);

  const handleUndo = useCallback(() => {
    if (undoProperty) {
      triggerHaptic('light');
      dispatch(addSavedProperty(undoProperty));
      clearTimeout(undoTimeout.current);
      setUndoProperty(null);
    }
  }, [undoProperty, dispatch]);

  const handleShare = useCallback(async (property: Property) => {
    triggerHaptic('light');
    const shareOptions = {
      title: 'Check out this property',
      message: `${property.address}, ${property.city}, ${property.state}\n${formatPrice(property.price)}\n${property.bedrooms} beds, ${property.bathrooms} baths\n\nView more details in the That House app!`,
      url: property.images[0],
    };

    try {
      await Share.open(shareOptions);
    } catch (error) {
      console.log('Error sharing:', error);
    }
  }, []);

  const handleLongPress = useCallback((property: Property) => {
    triggerHaptic('medium');
    Alert.alert(
      'Quick Actions',
      `${property.address}`,
      [
        {
          text: 'Add Note',
          onPress: () => {
            setSelectedPropertyForNotes(property.id);
            setTempNote(propertyNotes[property.id] || '');
            setShowNotesModal(true);
          },
        },
        {
          text: 'Add to Collection',
          onPress: () => {
            setSelectedPropertyForCollection(property.id);
            setShowCollectionModal(true);
          },
        },
        {
          text: 'Share',
          onPress: () => handleShare(property),
        },
        {
          text: 'Compare',
          onPress: () => {
            setCompareMode(true);
            setSelectedForCompare([property.id]);
          },
        },
        {
          text: 'Remove from Saved',
          onPress: () => handleRemoveProperty(property.id),
          style: 'destructive',
        },
        {
          text: 'Cancel',
          style: 'cancel',
        },
      ]
    );
  }, [handleShare, handleRemoveProperty]);

  const toggleCompareSelection = useCallback((propertyId: string) => {
    if (selectedForCompare.includes(propertyId)) {
      setSelectedForCompare(prev => prev.filter(id => id !== propertyId));
    } else if (selectedForCompare.length < 3) {
      setSelectedForCompare(prev => [...prev, propertyId]);
    } else {
      Alert.alert('Compare Limit', 'You can compare up to 3 properties at a time.');
    }
  }, [selectedForCompare]);

  const renderHiddenItem = ({ item }: { item: Property }) => (
    <View style={styles.rowBack}>
      <TouchableOpacity
        style={[styles.backRightBtn, styles.backRightBtnLeft]}
        onPress={() => handleShare(item)}
      >
        <Icon name="share-outline" size={25} color="white" />
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.backRightBtn, styles.backRightBtnRight]}
        onPress={() => handleRemoveProperty(item.id)}
      >
        <Icon name="trash-outline" size={25} color="white" />
      </TouchableOpacity>
    </View>
  );

  const renderProperty = ({ item }: { item: Property }) => {
    const isSelected = selectedForCompare.includes(item.id);
    const collection = propertyCollections[item.id];
    const propertyNote = propertyNotes[item.id];

    return (
      <Animated.View style={{ opacity: undoProperty === item.id ? fadeAnim : 1 }}>
        <TouchableOpacity
          style={[
            styles.propertyCard,
            { 
              backgroundColor: colors.cardBackground,
              shadowColor: colors.shadowColor,
              borderWidth: isSelected ? 2 : 0,
              borderColor: colors.primary,
            }
          ]}
          onPress={() => {
            if (compareMode) {
              toggleCompareSelection(item.id);
            } else {
              navigation.navigate('PropertyDetails', { propertyId: item.id });
            }
          }}
          onLongPress={() => handleLongPress(item)}
          activeOpacity={0.9}
        >
          {compareMode && (
            <View style={styles.compareCheckbox}>
              <Icon 
                name={isSelected ? 'checkbox' : 'square-outline'} 
                size={24} 
                color={colors.primary} 
              />
            </View>
          )}
          
          <Image 
            source={{ uri: item.images[0] || 'https://via.placeholder.com/150' }} 
            style={styles.propertyImage}
          />
          
          <View style={styles.propertyInfo}>
            <Text style={[styles.price, { color: colors.text }]}>{formatPrice(item.price)}</Text>
            <Text style={[styles.address, { color: colors.text }]}>{item.address}</Text>
            <Text style={[styles.cityState, { color: colors.textSecondary }]}>{item.city}, {item.state}</Text>
            <View style={styles.details}>
              <Text style={[styles.detailText, { color: colors.textSecondary }]}>{item.bedrooms} beds</Text>
              <Text style={[styles.detailText, { color: colors.textSecondary }]}>•</Text>
              <Text style={[styles.detailText, { color: colors.textSecondary }]}>{item.bathrooms} baths</Text>
              <Text style={[styles.detailText, { color: colors.textSecondary }]}>•</Text>
              <Text style={[styles.detailText, { color: colors.textSecondary }]}>{item.squareFeet.toLocaleString()} sqft</Text>
            </View>
            
            {propertyNote && (
              <View style={[styles.noteIndicator, { backgroundColor: colors.primary + '20' }]}>
                <Icon name="document-text" size={12} color={colors.primary} />
                <Text style={[styles.noteText, { color: colors.primary }]}>Note added</Text>
              </View>
            )}
          </View>
          
          <TouchableOpacity 
            style={styles.heartButton}
            onPress={() => handleRemoveProperty(item.id)}
          >
            <Icon name="heart" size={24} color="#FF6B6B" />
          </TouchableOpacity>
          
          {collection && (
            <View 
              style={[
                styles.collectionBadge,
                { backgroundColor: defaultCollections.find(c => c.id === collection)?.color || colors.primary }
              ]}
            >
              <Text style={styles.collectionBadgeText}>
                {defaultCollections.find(c => c.id === collection)?.name}
              </Text>
            </View>
          )}
        </TouchableOpacity>
      </Animated.View>
    );
  };

  const renderFilterChip = (label: string, isSelected: boolean, onPress: () => void) => (
    <TouchableOpacity
      style={[
        styles.filterChip,
        {
          backgroundColor: isSelected ? colors.primary : colors.cardBackground,
          borderColor: isSelected ? colors.primary : colors.border,
        }
      ]}
      onPress={onPress}
    >
      <Text
        style={[
          styles.filterChipText,
          { color: isSelected ? 'white' : colors.text }
        ]}
      >
        {label}
      </Text>
      {isSelected && (
        <Icon name="close-circle" size={16} color="white" style={{ marginLeft: 4 }} />
      )}
    </TouchableOpacity>
  );

  const renderHeader = () => (
    <>
      <View style={[styles.header, { 
        backgroundColor: colors.cardBackground,
        borderBottomColor: colors.border
      }]}>
        <View style={styles.headerTop}>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Saved Properties</Text>
          <View style={styles.headerActions}>
            <TouchableOpacity 
              style={styles.headerButton}
              onPress={() => setShowSortModal(true)}
            >
              <Icon name="swap-vertical" size={24} color={colors.text} />
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.headerButton}
              onPress={() => setCompareMode(!compareMode)}
            >
              <MaterialIcon 
                name="compare-arrows" 
                size={24} 
                color={compareMode ? colors.primary : colors.text} 
              />
            </TouchableOpacity>
          </View>
        </View>
        <Text style={[styles.count, { color: colors.textSecondary }]}>
          {savedProperties.length} properties
          {selectedForCompare.length > 0 && ` • ${selectedForCompare.length} selected`}
        </Text>
      </View>

      <View style={[styles.searchContainer, { backgroundColor: colors.backgroundSecondary }]}>
        <View style={[styles.searchBar, { backgroundColor: colors.cardBackground }]}>
          <Icon name="search" size={20} color={colors.textSecondary} />
          <TextInput
            style={[styles.searchInput, { color: colors.text }]}
            placeholder="Search saved properties..."
            placeholderTextColor={colors.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Icon name="close-circle" size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={[styles.filterContainer, { backgroundColor: colors.backgroundSecondary }]}
        contentContainerStyle={styles.filterContent}
      >
        {renderFilterChip(
          'Filters',
          !!(selectedPriceRange || selectedBedrooms || selectedPropertyType),
          () => setShowFilterModal(true)
        )}
        {priceRanges.map(range => 
          renderFilterChip(
            range.label,
            selectedPriceRange?.label === range.label,
            () => setSelectedPriceRange(selectedPriceRange?.label === range.label ? null : range)
          )
        )}
        {bedroomOptions.map(option => 
          renderFilterChip(
            `${option.label} Beds`,
            selectedBedrooms === option.value,
            () => setSelectedBedrooms(selectedBedrooms === option.value ? null : option.value)
          )
        )}
      </ScrollView>
    </>
  );

  if (savedProperties.length === 0 && !searchQuery && !selectedPriceRange && !selectedBedrooms && !selectedPropertyType) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.backgroundSecondary }]}>
        {renderHeader()}
        <EmptyState
          icon="heart-outline"
          title="No saved properties yet"
          description="Swipe right on properties you love to save them here"
          actionText="Start Browsing"
          onAction={() => navigation.navigate('Main', { screen: 'Swipe' } as any)}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.backgroundSecondary }]}>
      {renderHeader()}
      
      {compareMode && selectedForCompare.length >= 2 && (
        <TouchableOpacity
          style={[styles.compareButton, { backgroundColor: colors.primary }]}
          onPress={() => {
            navigation.navigate('PropertyComparison', { propertyIds: selectedForCompare });
          }}
        >
          <Text style={styles.compareButtonText}>Compare Selected ({selectedForCompare.length})</Text>
        </TouchableOpacity>
      )}

      <SwipeListView
        data={savedProperties}
        renderItem={renderProperty}
        renderHiddenItem={renderHiddenItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        rightOpenValue={-150}
        disableRightSwipe
        stopRightSwipe={-150}
        onRowOpen={(rowKey) => triggerHaptic('light')}
      />

      {undoProperty && (
        <TouchableOpacity
          style={[styles.undoContainer, { backgroundColor: colors.cardBackground }]}
          onPress={handleUndo}
        >
          <Text style={[styles.undoText, { color: colors.text }]}>Property removed</Text>
          <Text style={[styles.undoButton, { color: colors.primary }]}>UNDO</Text>
        </TouchableOpacity>
      )}

      {/* Sort Modal */}
      <Modal
        visible={showSortModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowSortModal(false)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay} 
          activeOpacity={1} 
          onPress={() => setShowSortModal(false)}
        >
          <View style={[styles.modalContent, { backgroundColor: colors.cardBackground }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>Sort By</Text>
            
            <TouchableOpacity
              style={styles.sortOption}
              onPress={() => {
                setSortBy('price');
                setSortOrder('asc');
                setShowSortModal(false);
              }}
            >
              <Text style={[styles.sortOptionText, { color: colors.text }]}>Price: Low to High</Text>
              {sortBy === 'price' && sortOrder === 'asc' && (
                <Icon name="checkmark" size={20} color={colors.primary} />
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.sortOption}
              onPress={() => {
                setSortBy('price');
                setSortOrder('desc');
                setShowSortModal(false);
              }}
            >
              <Text style={[styles.sortOptionText, { color: colors.text }]}>Price: High to Low</Text>
              {sortBy === 'price' && sortOrder === 'desc' && (
                <Icon name="checkmark" size={20} color={colors.primary} />
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.sortOption}
              onPress={() => {
                setSortBy('newest');
                setSortOrder('asc');
                setShowSortModal(false);
              }}
            >
              <Text style={[styles.sortOptionText, { color: colors.text }]}>Newest First</Text>
              {sortBy === 'newest' && sortOrder === 'asc' && (
                <Icon name="checkmark" size={20} color={colors.primary} />
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.sortOption}
              onPress={() => {
                setSortBy('savedDate');
                setSortOrder('desc');
                setShowSortModal(false);
              }}
            >
              <Text style={[styles.sortOptionText, { color: colors.text }]}>Recently Saved</Text>
              {sortBy === 'savedDate' && sortOrder === 'desc' && (
                <Icon name="checkmark" size={20} color={colors.primary} />
              )}
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Notes Modal */}
      <Modal
        visible={showNotesModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowNotesModal(false)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay} 
          activeOpacity={1} 
          onPress={() => setShowNotesModal(false)}
        >
          <View style={[styles.modalContent, { backgroundColor: colors.cardBackground }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>Add Note</Text>
            
            <TextInput
              style={[styles.notesInput, { 
                backgroundColor: colors.backgroundSecondary,
                color: colors.text,
                borderColor: colors.border
              }]}
              placeholder="Enter your notes about this property..."
              placeholderTextColor={colors.textSecondary}
              multiline
              numberOfLines={4}
              value={tempNote}
              onChangeText={setTempNote}
            />
            
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: colors.backgroundSecondary }]}
                onPress={() => {
                  setShowNotesModal(false);
                  setTempNote('');
                  setSelectedPropertyForNotes(null);
                }}
              >
                <Text style={[styles.modalButtonText, { color: colors.text }]}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: colors.primary }]}
                onPress={() => {
                  if (selectedPropertyForNotes && tempNote.trim()) {
                    dispatch(addPropertyNote({ 
                      propertyId: selectedPropertyForNotes, 
                      note: tempNote.trim() 
                    }));
                  }
                  setShowNotesModal(false);
                  setTempNote('');
                  setSelectedPropertyForNotes(null);
                  Alert.alert('Note Saved', 'Your note has been saved successfully.');
                }}
              >
                <Text style={[styles.modalButtonText, { color: 'white' }]}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Filter Modal */}
      <Modal
        visible={showFilterModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowFilterModal(false)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay} 
          activeOpacity={1} 
          onPress={() => setShowFilterModal(false)}
        >
          <View style={[styles.modalContent, { backgroundColor: colors.cardBackground }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>Filter Saved Properties</Text>
            
            {/* Property Type Filter */}
            <Text style={[styles.filterSectionTitle, { color: colors.text }]}>Property Type</Text>
            <View style={styles.filterOptions}>
              <TouchableOpacity
                style={[
                  styles.filterOption,
                  selectedPropertyType === null && styles.filterOptionActive
                ]}
                onPress={() => {
                  setSelectedPropertyType(null);
                  triggerHaptic('light');
                }}
              >
                <Text style={[
                  styles.filterOptionText,
                  { color: selectedPropertyType === null ? colors.primary : colors.text }
                ]}>All Types</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.filterOption,
                  selectedPropertyType === PropertyType.SINGLE_FAMILY && styles.filterOptionActive
                ]}
                onPress={() => {
                  setSelectedPropertyType(PropertyType.SINGLE_FAMILY);
                  triggerHaptic('light');
                }}
              >
                <Text style={[
                  styles.filterOptionText,
                  { color: selectedPropertyType === PropertyType.SINGLE_FAMILY ? colors.primary : colors.text }
                ]}>House</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.filterOption,
                  selectedPropertyType === PropertyType.CONDO && styles.filterOptionActive
                ]}
                onPress={() => {
                  setSelectedPropertyType(PropertyType.CONDO);
                  triggerHaptic('light');
                }}
              >
                <Text style={[
                  styles.filterOptionText,
                  { color: selectedPropertyType === PropertyType.CONDO ? colors.primary : colors.text }
                ]}>Condo</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.filterOption,
                  selectedPropertyType === PropertyType.TOWNHOUSE && styles.filterOptionActive
                ]}
                onPress={() => {
                  setSelectedPropertyType(PropertyType.TOWNHOUSE);
                  triggerHaptic('light');
                }}
              >
                <Text style={[
                  styles.filterOptionText,
                  { color: selectedPropertyType === PropertyType.TOWNHOUSE ? colors.primary : colors.text }
                ]}>Townhouse</Text>
              </TouchableOpacity>
            </View>

            {/* Apply and Clear Buttons */}
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: colors.backgroundSecondary }]}
                onPress={() => {
                  setSelectedPriceRange(null);
                  setSelectedBedrooms(null);
                  setSelectedPropertyType(null);
                  triggerHaptic('light');
                }}
              >
                <Text style={[styles.modalButtonText, { color: colors.text }]}>Clear All</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: colors.primary }]}
                onPress={() => {
                  setShowFilterModal(false);
                  triggerHaptic('light');
                }}
              >
                <Text style={[styles.modalButtonText, { color: 'white' }]}>Apply</Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Collection Modal */}
      <Modal
        visible={showCollectionModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowCollectionModal(false)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay} 
          activeOpacity={1} 
          onPress={() => setShowCollectionModal(false)}
        >
          <View style={[styles.modalContent, { backgroundColor: colors.cardBackground }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>Add to Collection</Text>
            
            {defaultCollections.map((collection) => {
              const isSelected = selectedPropertyForCollection && 
                propertyCollections[selectedPropertyForCollection] === collection.id;
              return (
                <TouchableOpacity
                  key={collection.id}
                  style={[
                    styles.collectionOption,
                    { borderColor: colors.border }
                  ]}
                  onPress={() => {
                    if (selectedPropertyForCollection) {
                      if (isSelected) {
                        dispatch(removePropertyFromCollection(selectedPropertyForCollection));
                      } else {
                        dispatch(setPropertyCollection({ 
                          propertyId: selectedPropertyForCollection, 
                          collectionId: collection.id 
                        }));
                      }
                      triggerHaptic('light');
                      setShowCollectionModal(false);
                      setSelectedPropertyForCollection(null);
                    }
                  }}
                >
                  <View style={[
                    styles.collectionColorDot,
                    { backgroundColor: collection.color }
                  ]} />
                  <Text style={[styles.collectionOptionText, { color: colors.text }]}>
                    {collection.name}
                  </Text>
                  {isSelected && (
                    <Icon name="checkmark" size={20} color={colors.primary} style={{ marginLeft: 'auto' }} />
                  )}
                </TouchableOpacity>
              );
            })}
            
            <TouchableOpacity
              style={[styles.modalButton, { backgroundColor: colors.primary, marginTop: 20 }]}
              onPress={() => {
                setShowCollectionModal(false);
                setSelectedPropertyForCollection(null);
              }}
            >
              <Text style={[styles.modalButtonText, { color: 'white' }]}>Done</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  headerActions: {
    flexDirection: 'row',
    gap: 15,
  },
  headerButton: {
    padding: 5,
  },
  count: {
    fontSize: 14,
    marginTop: 4,
  },
  searchContainer: {
    padding: 15,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 25,
    gap: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
  },
  filterContainer: {
    paddingVertical: 10,
  },
  filterContent: {
    paddingHorizontal: 15,
    gap: 10,
    flexDirection: 'row',
  },
  filterChip: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  filterChipText: {
    fontSize: 14,
    fontWeight: '500',
  },
  listContainer: {
    padding: 10,
  },
  propertyCard: {
    borderRadius: 12,
    marginBottom: 15,
    flexDirection: 'row',
    overflow: 'hidden',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  compareCheckbox: {
    position: 'absolute',
    top: 10,
    left: 10,
    zIndex: 1,
    backgroundColor: 'white',
    borderRadius: 4,
    padding: 2,
  },
  propertyImage: {
    width: 120,
    height: 120,
  },
  propertyInfo: {
    flex: 1,
    padding: 15,
  },
  price: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  address: {
    fontSize: 16,
    marginBottom: 2,
  },
  cityState: {
    fontSize: 14,
    marginBottom: 8,
  },
  details: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailText: {
    fontSize: 12,
    marginRight: 6,
  },
  heartButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    padding: 8,
  },
  collectionBadge: {
    position: 'absolute',
    bottom: 10,
    right: 10,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  collectionBadgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '500',
  },
  noteIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
    gap: 4,
  },
  noteText: {
    fontSize: 12,
    fontWeight: '500',
  },
  rowBack: {
    alignItems: 'center',
    backgroundColor: '#DDD',
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingLeft: 15,
    marginBottom: 15,
    borderRadius: 12,
  },
  backRightBtn: {
    alignItems: 'center',
    bottom: 0,
    justifyContent: 'center',
    position: 'absolute',
    top: 0,
    width: 75,
  },
  backRightBtnLeft: {
    backgroundColor: '#4ECDC4',
    right: 75,
  },
  backRightBtnRight: {
    backgroundColor: '#FF6B6B',
    right: 0,
    borderTopRightRadius: 12,
    borderBottomRightRadius: 12,
  },
  compareButton: {
    margin: 15,
    padding: 15,
    borderRadius: 25,
    alignItems: 'center',
  },
  compareButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  undoContainer: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    padding: 15,
    borderRadius: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  undoText: {
    fontSize: 16,
  },
  undoButton: {
    fontSize: 16,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    paddingBottom: 40,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 20,
  },
  sortOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E0E0E0',
  },
  sortOptionText: {
    fontSize: 16,
  },
  notesInput: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 15,
    fontSize: 16,
    textAlignVertical: 'top',
    minHeight: 100,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 20,
  },
  modalButton: {
    flex: 1,
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  modalButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  filterSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 15,
    marginTop: 10,
  },
  filterOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 20,
  },
  filterOption: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    backgroundColor: 'transparent',
  },
  filterOptionActive: {
    borderColor: '#FF6B6B',
    backgroundColor: '#FF6B6B20',
  },
  filterOptionText: {
    fontSize: 14,
    fontWeight: '500',
  },
  collectionOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  collectionColorDot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    marginRight: 15,
  },
  collectionOptionText: {
    fontSize: 16,
  },
});

export default SavedPropertiesScreen;