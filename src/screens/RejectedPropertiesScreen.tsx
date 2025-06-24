import React from 'react';
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
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import Icon from 'react-native-vector-icons/Ionicons';
import { RootState } from '../store';
import { Property } from '../types';
import { RootStackParamList } from '../navigation/AppNavigator';
import { 
  addSavedProperty, 
  removeRejectedProperty,
  addRejectedProperty,
  removeSavedProperty,
  savePropertyAsync,
  unrejectPropertyAsync 
} from '../store/slices/userSlice';
import { useTheme } from '../theme/ThemeContext';

type NavigationProp = StackNavigationProp<RootStackParamList, 'Main'>;

const { width: screenWidth } = Dimensions.get('window');
const CARD_WIDTH = (screenWidth - 48) / 2; // 2 columns with padding

const RejectedPropertiesScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const dispatch = useDispatch();
  const { colors } = useTheme();
  const { properties } = useSelector((state: RootState) => state.properties);
  const { rejectedProperties } = useSelector((state: RootState) => state.user);
  
  const rejectedPropertiesList = properties.filter(
    property => rejectedProperties.includes(property.id)
  );

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  const handleMoveToSaved = async (propertyId: string) => {
    try {
      // Update UI immediately for better UX
      dispatch(removeRejectedProperty(propertyId));
      dispatch(addSavedProperty(propertyId));
      
      // Then persist to database
      await dispatch(unrejectPropertyAsync(propertyId) as any).unwrap();
      await dispatch(savePropertyAsync(propertyId) as any).unwrap();
    } catch (error: any) {
      // Revert UI changes on error
      dispatch(addRejectedProperty(propertyId));
      dispatch(removeSavedProperty(propertyId));
      Alert.alert('Error', 'Failed to save property. Please try again.');
    }
  };

  const renderPropertyCard = ({ item }: { item: Property }) => {
    return (
      <TouchableOpacity
        style={[styles.card, { backgroundColor: colors.cardBackground }]}
        onPress={() => navigation.navigate('PropertyDetails', { propertyId: item.id })}
        activeOpacity={0.9}
      >
        <View style={styles.imageContainer}>
          <Image source={{ uri: item.images[0] }} style={styles.image} />
          
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => handleMoveToSaved(item.id)}
          >
            <Icon name="add-circle" size={20} color="#4CAF50" />
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
      <Icon name="close-circle-outline" size={64} color={colors.textSecondary} />
      <Text style={[styles.emptyTitle, { color: colors.text }]}>
        No rejected properties
      </Text>
      <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
        Properties you reject will appear here
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.background }]}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>
          Rejected Properties
        </Text>
        <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>
          {rejectedPropertiesList.length} {rejectedPropertiesList.length === 1 ? 'property' : 'properties'}
        </Text>
      </View>

      {/* Properties Grid */}
      <FlatList
        data={rejectedPropertiesList}
        renderItem={renderPropertyCard}
        keyExtractor={(item) => item.id}
        numColumns={2}
        columnWrapperStyle={styles.row}
        contentContainerStyle={[
          styles.listContent,
          rejectedPropertiesList.length === 0 && styles.emptyContent
        ]}
        ListEmptyComponent={renderEmptyState}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
  },
  headerSubtitle: {
    fontSize: 14,
    marginTop: 4,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  emptyContent: {
    flex: 1,
    justifyContent: 'center',
  },
  row: {
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  card: {
    width: CARD_WIDTH,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  imageContainer: {
    position: 'relative',
    height: CARD_WIDTH * 1.2,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  actionButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  info: {
    padding: 12,
  },
  price: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
  },
  address: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 2,
  },
  city: {
    fontSize: 12,
    marginBottom: 8,
  },
  details: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailText: {
    fontSize: 12,
    marginLeft: 4,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
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
    lineHeight: 22,
  },
});

export default RejectedPropertiesScreen;