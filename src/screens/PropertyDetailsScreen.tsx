import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useRoute, RouteProp } from '@react-navigation/native';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import { RootStackParamList } from '../navigation/AppNavigator';

type PropertyDetailsRouteProp = RouteProp<RootStackParamList, 'PropertyDetails'>;

const { width: screenWidth } = Dimensions.get('window');

const PropertyDetailsScreen = () => {
  const route = useRoute<PropertyDetailsRouteProp>();
  const { propertyId } = route.params;
  
  const property = useSelector((state: RootState) => 
    state.properties.properties.find(p => p.id === propertyId)
  );

  if (!property) {
    return (
      <View style={styles.container}>
        <Text>Property not found</Text>
      </View>
    );
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  return (
    <ScrollView style={styles.container}>
      <ScrollView 
        horizontal 
        pagingEnabled 
        showsHorizontalScrollIndicator={false}
        style={styles.imageContainer}
      >
        {property.images.map((image, index) => (
          <Image 
            key={index}
            source={{ uri: image }} 
            style={styles.image}
          />
        ))}
      </ScrollView>

      <View style={styles.content}>
        <View style={styles.priceSection}>
          <Text style={styles.price}>{formatPrice(property.price)}</Text>
          <TouchableOpacity style={styles.favoriteButton}>
            <Icon 
              name={property.isFavorite ? 'heart' : 'heart-outline'} 
              size={28} 
              color="#FF6B6B" 
            />
          </TouchableOpacity>
        </View>

        <Text style={styles.address}>{property.address}</Text>
        <Text style={styles.cityState}>{property.city}, {property.state} {property.zipCode}</Text>

        <View style={styles.details}>
          <View style={styles.detailItem}>
            <Icon name="bed-outline" size={24} color="#666" />
            <Text style={styles.detailValue}>{property.bedrooms}</Text>
            <Text style={styles.detailLabel}>Beds</Text>
          </View>
          <View style={styles.detailItem}>
            <Icon name="water-outline" size={24} color="#666" />
            <Text style={styles.detailValue}>{property.bathrooms}</Text>
            <Text style={styles.detailLabel}>Baths</Text>
          </View>
          <View style={styles.detailItem}>
            <Icon name="resize-outline" size={24} color="#666" />
            <Text style={styles.detailValue}>{property.squareFeet.toLocaleString()}</Text>
            <Text style={styles.detailLabel}>Sq Ft</Text>
          </View>
          <View style={styles.detailItem}>
            <Icon name="calendar-outline" size={24} color="#666" />
            <Text style={styles.detailValue}>{property.yearBuilt}</Text>
            <Text style={styles.detailLabel}>Built</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Description</Text>
          <Text style={styles.description}>{property.description}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Features</Text>
          {property.features.map((feature, index) => (
            <View key={index} style={styles.featureItem}>
              <Icon name="checkmark-circle" size={20} color="#4CCC93" />
              <Text style={styles.featureText}>{feature}</Text>
            </View>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Property Details</Text>
          <View style={styles.propertyDetail}>
            <Text style={styles.propertyDetailLabel}>MLS #</Text>
            <Text style={styles.propertyDetailValue}>{property.mlsNumber || 'N/A'}</Text>
          </View>
          <View style={styles.propertyDetail}>
            <Text style={styles.propertyDetailLabel}>Days on Market</Text>
            <Text style={styles.propertyDetailValue}>{property.daysOnMarket}</Text>
          </View>
          <View style={styles.propertyDetail}>
            <Text style={styles.propertyDetailLabel}>Lot Size</Text>
            <Text style={styles.propertyDetailValue}>{property.lotSize} acres</Text>
          </View>
        </View>
      </View>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.contactButton}>
          <Icon name="chatbubbles" size={20} color="#fff" />
          <Text style={styles.contactButtonText}>Contact Agent</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.scheduleButton}>
          <Icon name="calendar" size={20} color="#FF6B6B" />
          <Text style={styles.scheduleButtonText}>Schedule Tour</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  imageContainer: {
    height: 300,
  },
  image: {
    width: screenWidth,
    height: 300,
    resizeMode: 'cover',
  },
  content: {
    padding: 20,
  },
  priceSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  price: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#333',
  },
  favoriteButton: {
    padding: 8,
  },
  address: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  cityState: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
  },
  details: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 20,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#eee',
    marginBottom: 20,
  },
  detailItem: {
    alignItems: 'center',
  },
  detailValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 4,
  },
  detailLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  section: {
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  description: {
    fontSize: 16,
    color: '#666',
    lineHeight: 24,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  featureText: {
    fontSize: 16,
    color: '#666',
    marginLeft: 10,
  },
  propertyDetail: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  propertyDetailLabel: {
    fontSize: 16,
    color: '#666',
  },
  propertyDetailValue: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  footer: {
    flexDirection: 'row',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  contactButton: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#FF6B6B',
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  contactButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  scheduleButton: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#FF6B6B',
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scheduleButtonText: {
    color: '#FF6B6B',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});

export default PropertyDetailsScreen;