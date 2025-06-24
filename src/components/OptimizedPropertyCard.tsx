import React, { useState, memo, useCallback } from 'react';
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
// import FastImage from 'react-native-fast-image'; // Uncomment when compatible with React 19

interface PropertyCardProps {
  property: Property;
  onPress?: () => void;
  style?: any;
  isSwipeActive?: boolean;
}

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

// Use FastImage if available, otherwise fallback to Image
const FastImage = null; // Will be available when react-native-fast-image supports React 19
const ImageComponent = FastImage || Image;

const OptimizedPropertyCard: React.FC<PropertyCardProps> = memo(
  ({ property, onPress, style, isSwipeActive = false }) => {
    const { colors } = useTheme();
    const [imageLoading, setImageLoading] = useState(true);
    const [imageError, setImageError] = useState(false);

    const formatPrice = useCallback((price: number) => {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(price);
    }, []);

    const isNewListing = property.daysOnMarket <= 7;
    const isPriceReduced = property.isPriceReduced || false;
    const hasOpenHouse = !!property.nextOpenHouse;

    const getPropertyTypeLabel = useCallback((type: PropertyType) => {
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
    }, []);

    const handlePress = useCallback(() => {
      if (onPress) {
        ReactNativeHapticFeedback.trigger('impactLight');
        onPress();
      }
    }, [onPress]);

    const handleImageLoadEnd = useCallback(() => {
      setImageLoading(false);
    }, []);

    const handleImageError = useCallback(() => {
      setImageError(true);
      setImageLoading(false);
    }, []);

    return (
      <TouchableOpacity
        style={[
          styles.card, 
          { backgroundColor: colors.cardBackground },
          style
        ]}
        onPress={handlePress}
        activeOpacity={0.95}
      >
        <ImageComponent
          source={{ uri: property.images[0] || 'https://via.placeholder.com/400x600' }}
          style={styles.image}
          onLoadEnd={handleImageLoadEnd}
          onError={handleImageError}
          resizeMode={'cover'}
        />

        {imageLoading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        )}

        {imageError && (
          <View style={styles.errorContainer}>
            <Icon name="image-outline" size={48} color={colors.textTertiary} />
            <Text style={[styles.errorText, { color: colors.textTertiary }]}>
              Image unavailable
            </Text>
          </View>
        )}

        {/* Optimized gradients - only render when needed */}
        <View style={styles.gradientContainer}>
          <GradientView
            colors={['rgba(0,0,0,0.6)', 'transparent']}
            style={styles.topGradient}
          />
          <GradientView
            colors={['transparent', 'rgba(0,0,0,0.8)']}
            style={styles.bottomGradient}
          />
        </View>

        <View style={styles.overlay}>
          <View style={styles.topInfo}>
            <View style={styles.badges}>
              {isNewListing && (
                <View style={[styles.badge, styles.newBadge]}>
                  <Icon name="sparkles" size={12} color="#fff" />
                  <Text style={styles.badgeText}>NEW</Text>
                </View>
              )}
              {isPriceReduced && property.previousPrice && (
                <View style={[styles.badge, styles.priceReducedBadge]}>
                  <Icon name="trending-down" size={12} color="#fff" />
                  <Text style={styles.badgeText}>
                    -{formatPrice(property.previousPrice - property.price)}
                  </Text>
                </View>
              )}
              {hasOpenHouse && (
                <View style={[styles.badge, styles.openHouseBadge]}>
                  <Icon name="home" size={12} color="#fff" />
                  <Text style={styles.badgeText}>OPEN HOUSE</Text>
                </View>
              )}
            </View>
            <View style={styles.priceContainer}>
              <View style={styles.daysTag}>
                <Icon name="time-outline" size={16} color="#fff" />
                <Text style={styles.daysText}>{property.daysOnMarket}d</Text>
              </View>
              <Text style={styles.price}>{formatPrice(property.price)}</Text>
            </View>
          </View>

          <View style={styles.bottomInfo}>
            <View style={styles.propertyType}>
              <Text style={styles.propertyTypeText}>
                {getPropertyTypeLabel(property.propertyType)}
              </Text>
            </View>

            <Text style={styles.address} numberOfLines={1}>
              {property.address}
            </Text>
            <Text style={styles.cityState}>
              {property.city}, {property.state}
            </Text>

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
                <Text style={styles.detailText}>
                  {property.squareFeet.toLocaleString()}
                </Text>
              </View>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  },
  (prevProps, nextProps) => {
    // Custom comparison to prevent unnecessary re-renders
    return (
      prevProps.property.id === nextProps.property.id &&
      prevProps.onPress === nextProps.onPress
    );
  }
);

OptimizedPropertyCard.displayName = 'OptimizedPropertyCard';

const styles = StyleSheet.create({
  card: {
    width: screenWidth - 40,
    height: screenHeight * 0.65, // Reduced height for better centering
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
  gradientContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    pointerEvents: 'none',
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
  priceContainer: {
    alignItems: 'flex-end',
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
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 15,
    marginBottom: 6,
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

export default OptimizedPropertyCard;