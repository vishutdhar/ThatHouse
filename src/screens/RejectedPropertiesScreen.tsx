import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  SafeAreaView,
  TouchableOpacity,
  Image,
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
import { Alert } from 'react-native';

type NavigationProp = StackNavigationProp<RootStackParamList, 'Main'>;

const RejectedPropertiesScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const dispatch = useDispatch();
  const { colors } = useTheme();
  const { properties } = useSelector((state: RootState) => state.properties);
  const { currentUser } = useSelector((state: RootState) => state.user);
  
  const rejectedProperties = properties.filter(
    property => currentUser?.rejectedProperties.includes(property.id)
  );

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  const renderProperty = ({ item }: { item: Property }) => (
    <TouchableOpacity
      style={styles.propertyCard}
      onPress={() => navigation.navigate('PropertyDetails', { propertyId: item.id })}
    >
      <Image 
        source={{ uri: item.images[0] || 'https://via.placeholder.com/150' }} 
        style={styles.propertyImage}
      />
      <View style={styles.propertyInfo}>
        <Text style={styles.price}>{formatPrice(item.price)}</Text>
        <Text style={styles.address}>{item.address}</Text>
        <Text style={styles.cityState}>{item.city}, {item.state}</Text>
        <View style={styles.details}>
          <Text style={styles.detailText}>{item.bedrooms} beds</Text>
          <Text style={styles.detailText}>•</Text>
          <Text style={styles.detailText}>{item.bathrooms} baths</Text>
          <Text style={styles.detailText}>•</Text>
          <Text style={styles.detailText}>{item.squareFeet.toLocaleString()} sqft</Text>
        </View>
      </View>
      <TouchableOpacity 
        style={styles.saveButton}
        onPress={async () => {
          try {
            // Update UI immediately for better UX
            dispatch(removeRejectedProperty(item.id));
            dispatch(addSavedProperty(item.id));
            
            // Then persist to database
            await dispatch(unrejectPropertyAsync(item.id) as any).unwrap();
            await dispatch(savePropertyAsync(item.id) as any).unwrap();
          } catch (error: any) {
            // Revert UI changes on error
            dispatch(addRejectedProperty(item.id));
            dispatch(removeSavedProperty(item.id));
            Alert.alert('Error', 'Failed to save property. Please try again.');
          }
        }}
      >
        <Icon name="heart-outline" size={24} color="#FF6B6B" />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  const styles = getStyles(colors);

  if (rejectedProperties.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Rejected Properties</Text>
        </View>
        <View style={styles.emptyContainer}>
          <Icon name="close-circle-outline" size={80} color={colors.textSecondary} />
          <Text style={styles.emptyTitle}>No rejected properties</Text>
          <Text style={styles.emptyText}>
            Properties you passed on will appear here
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Rejected Properties</Text>
        <Text style={styles.count}>{rejectedProperties.length} properties</Text>
      </View>
      <FlatList
        data={rejectedProperties}
        renderItem={renderProperty}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
      />
    </SafeAreaView>
  );
};

const getStyles = (colors: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    backgroundColor: colors.card,
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
  },
  count: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 4,
  },
  listContainer: {
    padding: 10,
  },
  propertyCard: {
    backgroundColor: colors.card,
    borderRadius: 12,
    marginBottom: 15,
    flexDirection: 'row',
    overflow: 'hidden',
    shadowColor: colors.shadow,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
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
    color: colors.text,
    marginBottom: 4,
  },
  address: {
    fontSize: 16,
    color: colors.text,
    marginBottom: 2,
  },
  cityState: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 8,
  },
  details: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailText: {
    fontSize: 12,
    color: colors.textSecondary,
    marginRight: 6,
  },
  saveButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    padding: 8,
    backgroundColor: colors.card,
    borderRadius: 20,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 3,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.text,
    marginTop: 20,
    marginBottom: 10,
  },
  emptyText: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
  },
});

export default RejectedPropertiesScreen;