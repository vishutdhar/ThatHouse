import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  SafeAreaView,
  TouchableOpacity,
  Image,
  Dimensions,
  Alert,
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigation, useRoute } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import Icon from 'react-native-vector-icons/Ionicons';
import { RootState } from '../store';
import { Property } from '../types';
import { RootStackParamList } from '../navigation/AppNavigator';
import { useTheme } from '../theme/ThemeContext';
import { removeSavedProperty, addSavedProperty, removeRejectedProperty } from '../store/slices/userSlice';

type NavigationProp = StackNavigationProp<RootStackParamList>;

const { width: screenWidth } = Dimensions.get('window');
const CARD_WIDTH = (screenWidth - 48) / 2; // 2 columns with padding

const SavedPropertiesScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute();
  const dispatch = useDispatch();
  const { colors } = useTheme();
  
  const { properties } = useSelector((state: RootState) => state.properties);
  const { savedProperties, priorityProperties, rejectedProperties } = useSelector((state: RootState) => state.user);
  
  const [sortBy, setSortBy] = useState<'recent' | 'price'>('recent');
  const [showRejected, setShowRejected] = useState((route.params as any)?.showRejected || false);

  const savedPropertiesList = useMemo(() => {
    const saved = properties.filter(property => 
      showRejected ? rejectedProperties.includes(property.id) : savedProperties.includes(property.id)
    );
    
    // Sort properties
    switch (sortBy) {
      case 'price':
        return [...saved].sort((a, b) => b.price - a.price);
      case 'recent':
      default:
        // Most recently saved first (reverse order of savedProperties array)
        return [...saved].sort((a, b) => {
          const aIndex = savedProperties.indexOf(a.id);
          const bIndex = savedProperties.indexOf(b.id);
          return bIndex - aIndex;
        });
    }
  }, [properties, savedProperties, rejectedProperties, priorityProperties, sortBy, showRejected]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  const handleRemoveProperty = (propertyId: string) => {
    if (showRejected) {
      // If viewing rejected, move back to saved
      dispatch(removeRejectedProperty(propertyId));
      dispatch(addSavedProperty(propertyId));
    } else {
      // If viewing saved, remove from saved
      Alert.alert(
        'Remove Property',
        'Are you sure you want to remove this property from your saved list?',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Remove',
            style: 'destructive',
            onPress: () => dispatch(removeSavedProperty(propertyId)),
          },
        ]
      );
    }
  };

  const renderPropertyCard = ({ item }: { item: Property }) => {
    const isPriority = priorityProperties.includes(item.id);
    
    return (
      <TouchableOpacity
        style={[styles.card, { backgroundColor: colors.cardBackground }]}
        onPress={() => navigation.navigate('PropertyDetails', { propertyId: item.id })}
        activeOpacity={0.9}
      >
        <View style={styles.imageContainer}>
          <Image source={{ uri: item.images[0] }} style={styles.image} />
          
          {isPriority && (
            <View style={styles.priorityBadge}>
              <Icon name="star" size={16} color="#fff" />
            </View>
          )}
          
          <TouchableOpacity
            style={styles.heartButton}
            onPress={() => handleRemoveProperty(item.id)}
          >
            <Icon name={showRejected ? "add-circle" : "heart"} size={20} color={showRejected ? "#4CCC93" : "#FF6B6B"} />
          </TouchableOpacity>
        </View>
        
        <View style={styles.info}>
          <Text style={[styles.price, { color: colors.primary }]}>
            {formatPrice(item.price)}
          </Text>
          <Text style={[styles.address, { color: colors.text }]} numberOfLines={1}>
            {item.address}
          </Text>
          <Text style={[styles.city, { color: colors.textSecondary }]}>
            {item.city}, {item.state}
          </Text>
          <View style={styles.details}>
            <View style={styles.detailItem}>
              <Icon name="bed-outline" size={14} color={colors.textSecondary} />
              <Text style={[styles.detailText, { color: colors.textSecondary }]}>
                {item.bedrooms}
              </Text>
            </View>
            <View style={styles.detailItem}>
              <Icon name="water-outline" size={14} color={colors.textSecondary} />
              <Text style={[styles.detailText, { color: colors.textSecondary }]}>
                {item.bathrooms}
              </Text>
            </View>
            <View style={styles.detailItem}>
              <Icon name="resize-outline" size={14} color={colors.textSecondary} />
              <Text style={[styles.detailText, { color: colors.textSecondary }]}>
                {item.squareFeet.toLocaleString()}
              </Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Icon name={showRejected ? "close-circle-outline" : "heart-outline"} size={64} color={colors.textSecondary} />
      <Text style={[styles.emptyTitle, { color: colors.text }]}>
        {showRejected ? 'No rejected properties' : 'No saved properties yet'}
      </Text>
      <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
        {showRejected ? 'Properties you reject will appear here' : 'Start swiping to find your dream home'}
      </Text>
      {!showRejected && (
        <TouchableOpacity
          style={[styles.emptyButton, { backgroundColor: colors.primary }]}
          onPress={() => navigation.navigate('Main', { screen: 'Swipe' })}
        >
          <Text style={styles.emptyButtonText}>Start Swiping</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.background }]}>
        <View>
          <Text style={[styles.headerTitle, { color: colors.text }]}>
            {showRejected ? 'Rejected Properties' : 'Saved Properties'}
          </Text>
          <View style={styles.headerSubtitleRow}>
            <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>
              {savedPropertiesList.length} {savedPropertiesList.length === 1 ? 'property' : 'properties'}
              {!showRejected && priorityProperties.length > 0 && ` • ${priorityProperties.length} starred`}
            </Text>
            
            <View style={styles.buttonsContainer}>
              {/* Rejected Toggle */}
              <TouchableOpacity
                style={[styles.sortButton, { 
                  backgroundColor: showRejected ? colors.primary : colors.chipBackground 
                }]}
                onPress={() => setShowRejected(!showRejected)}
              >
                <Icon 
                  name="close" 
                  size={16} 
                  color={showRejected ? '#fff' : colors.primary} 
                />
                <Text style={[styles.sortText, { color: showRejected ? '#fff' : colors.primary }]}>
                  Rejected
                </Text>
              </TouchableOpacity>
              
              {/* Sort Button */}
              {savedPropertiesList.length > 0 && !showRejected && (
                <TouchableOpacity
                  style={[styles.sortButton, { backgroundColor: colors.chipBackground }]}
                  onPress={() => {
                    const options = ['recent', 'price'];
                    const currentIndex = options.indexOf(sortBy);
                    const nextIndex = (currentIndex + 1) % options.length;
                    setSortBy(options[nextIndex] as any);
                  }}
                >
                  <Icon name="swap-vertical" size={16} color={colors.primary} />
                  <Text style={[styles.sortText, { color: colors.primary }]}>
                    {sortBy === 'recent' && 'Recent'}
                    {sortBy === 'price' && 'Price'}
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>
      </View>

      {/* Property Grid */}
      <FlatList
        data={savedPropertiesList}
        renderItem={renderPropertyCard}
        keyExtractor={(item, index) => item.id || `property-${index}`}
        numColumns={2}
        columnWrapperStyle={styles.row}
        contentContainerStyle={[
          styles.listContent,
          savedPropertiesList.length === 0 && styles.emptyContent
        ]}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={renderEmptyState}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    paddingTop: 8,
  },
  headerSubtitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  headerSubtitle: {
    fontSize: 14,
    marginTop: 2,
  },
  buttonsContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  sortButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 4,
  },
  sortText: {
    fontSize: 13,
    fontWeight: '500',
  },
  rejectedButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 4,
    minWidth: 40,
    justifyContent: 'center',
  },
  rejectedButtonText: {
    fontSize: 13,
    fontWeight: '600',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 100,
  },
  emptyContent: {
    flex: 1,
  },
  row: {
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  card: {
    width: CARD_WIDTH,
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  imageContainer: {
    position: 'relative',
  },
  image: {
    width: '100%',
    height: CARD_WIDTH * 0.8,
  },
  priorityBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: '#4B7BFF',
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  heartButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(255,255,255,0.9)',
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  info: {
    padding: 12,
  },
  price: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  address: {
    fontSize: 14,
    marginBottom: 1,
  },
  city: {
    fontSize: 12,
    marginBottom: 8,
  },
  details: {
    flexDirection: 'row',
    gap: 12,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  detailText: {
    fontSize: 12,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24,
  },
  emptyButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
  },
  emptyButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default SavedPropertiesScreen;