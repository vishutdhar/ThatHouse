import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  Linking,
  Platform,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useTheme } from '../../theme/ThemeContext';
import { Property } from '../../types';
import { openMapsWithDirections, calculateDistance } from '../../utils/locationUtils';

interface EnhancedPropertyPreviewProps {
  property: Property;
  onClose: () => void;
  onViewDetails: () => void;
  currentLocation?: { latitude: number; longitude: number };
}

const EnhancedPropertyPreview: React.FC<EnhancedPropertyPreviewProps> = ({
  property,
  onClose,
  onViewDetails,
  currentLocation,
}) => {
  const { colors } = useTheme();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Calculate distance from current location
  const getDistance = () => {
    if (!currentLocation) return null;
    const distance = calculateDistance(currentLocation, {
      latitude: property.latitude,
      longitude: property.longitude
    });
    return distance.toFixed(1);
  };

  const openDirections = () => {
    openMapsWithDirections(
      { latitude: property.latitude, longitude: property.longitude },
      property.address,
      currentLocation
    );
  };

  const distance = getDistance();

  const styles = StyleSheet.create({
    container: {
      position: 'absolute',
      bottom: 20,
      left: 20,
      right: 20,
      backgroundColor: colors.background,
      borderRadius: 16,
      shadowColor: colors.shadowColor,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.2,
      shadowRadius: 8,
      elevation: 5,
      maxHeight: 380,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: 16,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    headerInfo: {
      flex: 1,
    },
    price: {
      fontSize: 24,
      fontWeight: 'bold',
      color: colors.text,
    },
    address: {
      fontSize: 16,
      color: colors.textSecondary,
      marginTop: 4,
    },
    closeButton: {
      padding: 8,
      marginLeft: 12,
    },
    imageContainer: {
      height: 180,
      position: 'relative',
    },
    image: {
      width: '100%',
      height: '100%',
    },
    imageIndicator: {
      position: 'absolute',
      bottom: 10,
      left: 0,
      right: 0,
      flexDirection: 'row',
      justifyContent: 'center',
      gap: 6,
    },
    dot: {
      width: 6,
      height: 6,
      borderRadius: 3,
      backgroundColor: 'rgba(255, 255, 255, 0.5)',
    },
    activeDot: {
      backgroundColor: 'white',
    },
    streetViewBadge: {
      position: 'absolute',
      top: 10,
      left: 10,
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: 'rgba(0, 0, 0, 0.7)',
      paddingHorizontal: 10,
      paddingVertical: 6,
      borderRadius: 20,
    },
    streetViewText: {
      color: 'white',
      fontSize: 12,
      marginLeft: 6,
    },
    detailsContainer: {
      padding: 16,
    },
    detailsRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 12,
    },
    detailItem: {
      flex: 1,
      alignItems: 'center',
    },
    detailValue: {
      fontSize: 18,
      fontWeight: '600',
      color: colors.text,
    },
    detailLabel: {
      fontSize: 12,
      color: colors.textTertiary,
      marginTop: 2,
    },
    infoRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 8,
    },
    infoIcon: {
      marginRight: 8,
    },
    infoText: {
      fontSize: 14,
      color: colors.textSecondary,
    },
    actions: {
      flexDirection: 'row',
      padding: 16,
      borderTopWidth: 1,
      borderTopColor: colors.border,
      gap: 12,
    },
    actionButton: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 12,
      borderRadius: 8,
      backgroundColor: colors.backgroundSecondary,
      borderWidth: 1,
      borderColor: colors.border,
    },
    primaryActionButton: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
    },
    actionIcon: {
      marginRight: 8,
    },
    actionText: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.text,
    },
    primaryActionText: {
      color: colors.textInverse,
    },
  });

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerInfo}>
          <Text style={styles.price}>{formatPrice(property.price)}</Text>
          <Text style={styles.address}>{property.address}</Text>
        </View>
        <TouchableOpacity style={styles.closeButton} onPress={onClose}>
          <Icon name="close" size={24} color={colors.text} />
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={styles.imageContainer}
        onPress={() => {
          setCurrentImageIndex((prev) => (prev + 1) % property.images.length);
        }}
        activeOpacity={0.9}
      >
        <Image
          source={{ uri: property.images[currentImageIndex] }}
          style={styles.image}
          resizeMode="cover"
        />
        
        {property.images.length > 1 && (
          <View style={styles.imageIndicator}>
            {property.images.map((_, index) => (
              <View
                key={index}
                style={[styles.dot, index === currentImageIndex && styles.activeDot]}
              />
            ))}
          </View>
        )}

        <View style={styles.streetViewBadge}>
          <Icon name="eye-outline" size={16} color="white" />
          <Text style={styles.streetViewText}>Street View</Text>
        </View>
      </TouchableOpacity>

      <View style={styles.detailsContainer}>
        <View style={styles.detailsRow}>
          <View style={styles.detailItem}>
            <Text style={styles.detailValue}>{property.bedrooms}</Text>
            <Text style={styles.detailLabel}>Beds</Text>
          </View>
          <View style={styles.detailItem}>
            <Text style={styles.detailValue}>{property.bathrooms}</Text>
            <Text style={styles.detailLabel}>Baths</Text>
          </View>
          <View style={styles.detailItem}>
            <Text style={styles.detailValue}>
              {property.squareFeet.toLocaleString()}
            </Text>
            <Text style={styles.detailLabel}>Sq Ft</Text>
          </View>
          <View style={styles.detailItem}>
            <Text style={styles.detailValue}>{property.yearBuilt}</Text>
            <Text style={styles.detailLabel}>Built</Text>
          </View>
        </View>

        {distance && (
          <View style={styles.infoRow}>
            <Icon
              name="location-outline"
              size={16}
              color={colors.textSecondary}
              style={styles.infoIcon}
            />
            <Text style={styles.infoText}>{distance} miles away</Text>
          </View>
        )}

        <View style={styles.infoRow}>
          <Icon
            name="time-outline"
            size={16}
            color={colors.textSecondary}
            style={styles.infoIcon}
          />
          <Text style={styles.infoText}>
            {property.daysOnMarket} days on market
          </Text>
        </View>
      </View>

      <View style={styles.actions}>
        <TouchableOpacity style={styles.actionButton} onPress={openDirections}>
          <Icon
            name="navigate-outline"
            size={18}
            color={colors.text}
            style={styles.actionIcon}
          />
          <Text style={styles.actionText}>Directions</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, styles.primaryActionButton]}
          onPress={onViewDetails}
        >
          <Icon
            name="information-circle-outline"
            size={18}
            color={colors.textInverse}
            style={styles.actionIcon}
          />
          <Text style={[styles.actionText, styles.primaryActionText]}>
            View Details
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default EnhancedPropertyPreview;