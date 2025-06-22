import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  Dimensions,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import ReactNativeHapticFeedback from 'react-native-haptic-feedback';
import { Property, PropertyType } from '../types';
import { useTheme } from '../theme/ThemeContext';
import GradientView from './GradientView';

interface PropertyCardProps {
  property: Property;
  onPress?: () => void;
  style?: any;
}

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

const PropertyCard: React.FC<PropertyCardProps> = ({ property, onPress, style }) => {
  const { colors } = useTheme();
  const [imageLoading, setImageLoading] = useState(true);
  const [imageError, setImageError] = useState(false);
  
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };
  
  const isNewListing = property.daysOnMarket <= 7;
  const isPriceReduced = Math.random() > 0.7; // Mock price reduction status
  const hasOpenHouse = Math.random() > 0.8; // Mock open house status

  const getPropertyTypeLabel = (type: PropertyType) => {
    switch (type) {
      case PropertyType.SINGLE_FAMILY:
        return 'Single Family';
      case PropertyType.CONDO:
        return 'Condo';
      case PropertyType.TOWNHOUSE:
        return 'Townhouse';
      case PropertyType.MULTI_FAMILY:
        return 'Multi Family';
      case PropertyType.LAND:
        return 'Land';
      case PropertyType.COMMERCIAL:
        return 'Commercial';
      default:
        return type;
    }
  };

  return (
    <TouchableOpacity 
      style={[styles.card, { backgroundColor: colors.cardBackground }, style]} 
      onPress={() => {
        if (onPress) {
          ReactNativeHapticFeedback.trigger('impactLight');
          onPress();
        }
      }}
      activeOpacity={0.95}
    >
      <Image 
        source={{ uri: property.images[0] || 'https://via.placeholder.com/400x600' }} 
        style={styles.image}
        onLoadStart={() => setImageLoading(true)}
        onLoadEnd={() => setImageLoading(false)}
        onError={() => {
          setImageError(true);
          setImageLoading(false);
        }}
      />
      
      {imageLoading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      )}
      
      {imageError && (
        <View style={styles.errorContainer}>
          <Icon name="image-outline" size={48} color={colors.textTertiary} />
          <Text style={[styles.errorText, { color: colors.textTertiary }]}>Image unavailable</Text>
        </View>
      )}
      
      {/* Top gradient for better text visibility */}
      <GradientView
        colors={['rgba(0,0,0,0.6)', 'transparent']}
        style={styles.topGradient}
      />
      
      {/* Bottom gradient for better text visibility */}
      <GradientView
        colors={['transparent', 'rgba(0,0,0,0.8)']}
        style={styles.bottomGradient}
      />
      
      <View style={styles.overlay}>
        <View style={styles.topInfo}>
          <View style={styles.badges}>
            {isNewListing && (
              <View style={[styles.badge, styles.newBadge]}>
                <Icon name="sparkles" size={12} color="#fff" />
                <Text style={styles.badgeText}>NEW</Text>
              </View>
            )}
            {isPriceReduced && (
              <View style={[styles.badge, styles.priceReducedBadge]}>
                <Icon name="trending-down" size={12} color="#fff" />
                <Text style={styles.badgeText}>REDUCED</Text>
              </View>
            )}
            {hasOpenHouse && (
              <View style={[styles.badge, styles.openHouseBadge]}>
                <Icon name="home" size={12} color="#fff" />
                <Text style={styles.badgeText}>OPEN HOUSE</Text>
              </View>
            )}
          </View>
          <View style={styles.priceTag}>
            <Text style={styles.price}>{formatPrice(property.price)}</Text>
          </View>
          <View style={styles.daysTag}>
            <Icon name="time-outline" size={16} color="#fff" />
            <Text style={styles.daysText}>{property.daysOnMarket}d</Text>
          </View>
        </View>
        
        <View style={styles.bottomInfo}>
          <View style={styles.propertyType}>
            <Text style={styles.propertyTypeText}>
              {getPropertyTypeLabel(property.propertyType)}
            </Text>
          </View>
          
          <Text style={styles.address}>{property.address}</Text>
          <Text style={styles.cityState}>{property.city}, {property.state}</Text>
          
          <View style={styles.details}>
            <View style={styles.detailItem}>
              <Icon name="bed-outline" size={18} color="#fff" />
              <Text style={styles.detailText}>{property.bedrooms}</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.detailItem}>
              <Icon name="water-outline" size={18} color="#fff" />
              <Text style={styles.detailText}>{property.bathrooms}</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.detailItem}>
              <Icon name="resize-outline" size={18} color="#fff" />
              <Text style={styles.detailText}>{property.squareFeet.toLocaleString()}</Text>
            </View>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    width: screenWidth - 20,
    height: screenHeight * 0.75,
    borderRadius: 24,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 10,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  loadingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
  },
  errorContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
  },
  errorText: {
    marginTop: 10,
    fontSize: 14,
  },
  topGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 150,
  },
  bottomGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 250,
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'space-between',
    padding: 20,
  },
  topInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  badges: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: 8,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 4,
  },
  newBadge: {
    backgroundColor: '#4CCC93',
  },
  priceReducedBadge: {
    backgroundColor: '#FF6B6B',
  },
  openHouseBadge: {
    backgroundColor: '#4B7BFF',
  },
  badgeText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  priceTag: {
    position: 'absolute',
    top: 20,
    right: 20,
  },
  price: {
    color: '#fff',
    fontSize: 28,
    fontWeight: 'bold',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  daysTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 15,
  },
  daysText: {
    color: '#fff',
    fontSize: 14,
    marginLeft: 4,
    fontWeight: '500',
  },
  bottomInfo: {
    backgroundColor: 'transparent',
  },
  address: {
    color: '#fff',
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 4,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  cityState: {
    color: '#fff',
    fontSize: 16,
    marginBottom: 12,
    opacity: 0.9,
  },
  details: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 15,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  detailText: {
    color: '#fff',
    fontSize: 14,
    marginLeft: 4,
    fontWeight: '500',
  },
  divider: {
    width: 1,
    height: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    marginHorizontal: 10,
  },
  propertyType: {
    backgroundColor: '#FF6B6B',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    alignSelf: 'flex-start',
    marginBottom: 10,
  },
  propertyTypeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
});

export default PropertyCard;