import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  Image,
} from 'react-native';
import { useSelector } from 'react-redux';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import Icon from 'react-native-vector-icons/Ionicons';
import { RootState } from '../store';
import { Property } from '../types';
import { RootStackParamList } from '../navigation/AppNavigator';
import { useTheme } from '../theme/ThemeContext';

type NavigationProp = StackNavigationProp<RootStackParamList, 'PropertyComparison'>;
type RouteProps = RouteProp<RootStackParamList, 'PropertyComparison'>;

const PropertyComparisonScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RouteProps>();
  const { propertyIds } = route.params;
  const { properties } = useSelector((state: RootState) => state.properties);
  const { colors } = useTheme();
  
  const comparedProperties = properties.filter(p => propertyIds.includes(p.id));

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  const renderPropertyColumn = (property: Property, index: number) => (
    <View key={property.id} style={[styles.propertyColumn, index > 0 && styles.propertyColumnBorder]}>
      <TouchableOpacity
        onPress={() => navigation.navigate('PropertyDetails', { propertyId: property.id })}
      >
        <Image source={{ uri: property.images[0] }} style={styles.propertyImage} />
      </TouchableOpacity>
      
      <View style={styles.propertyHeader}>
        <Text style={[styles.price, { color: colors.text }]}>{formatPrice(property.price)}</Text>
        <Text style={[styles.address, { color: colors.textSecondary }]} numberOfLines={2}>
          {property.address}
        </Text>
        <Text style={[styles.cityState, { color: colors.textSecondary }]}>
          {property.city}, {property.state}
        </Text>
      </View>
    </View>
  );

  const renderComparisonRow = (label: string, getValue: (p: Property) => string | number) => (
    <View style={[styles.comparisonRow, { borderBottomColor: colors.border }]}>
      <Text style={[styles.rowLabel, { color: colors.text }]}>{label}</Text>
      <View style={styles.rowValues}>
        {comparedProperties.map((property, index) => (
          <View
            key={property.id}
            style={[styles.valueCell, index > 0 && styles.valueCellBorder]}
          >
            <Text style={[styles.valueText, { color: colors.text }]}>
              {getValue(property)}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.backgroundSecondary }]}>
      <View style={[styles.header, { backgroundColor: colors.cardBackground }]}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Compare Properties</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={[styles.propertiesHeader, { backgroundColor: colors.cardBackground }]}>
          {comparedProperties.map((property, index) => renderPropertyColumn(property, index))}
        </View>

        <View style={[styles.comparisonContainer, { backgroundColor: colors.cardBackground }]}>
          {renderComparisonRow('Price', p => formatPrice(p.price))}
          {renderComparisonRow('Bedrooms', p => p.bedrooms)}
          {renderComparisonRow('Bathrooms', p => p.bathrooms)}
          {renderComparisonRow('Square Feet', p => p.squareFeet.toLocaleString())}
          {renderComparisonRow('Property Type', p => p.propertyType.replace('_', ' '))}
          {renderComparisonRow('Year Built', p => p.yearBuilt)}
          {renderComparisonRow('Days on Market', p => p.daysOnMarket)}
          {renderComparisonRow('Lot Size', p => `${p.lotSize.toLocaleString()} sqft`)}
          {renderComparisonRow('Status', p => p.status)}
        </View>

        <View style={styles.featuresSection}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Features</Text>
          {comparedProperties.map((property, index) => (
            <View
              key={property.id}
              style={[
                styles.featuresColumn,
                { backgroundColor: colors.cardBackground },
                index > 0 && { marginLeft: 10 }
              ]}
            >
              {property.features.map((feature, idx) => (
                <View key={idx} style={styles.featureItem}>
                  <Icon name="checkmark-circle" size={16} color={colors.primary} />
                  <Text style={[styles.featureText, { color: colors.text }]}>{feature}</Text>
                </View>
              ))}
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
  },
  propertiesHeader: {
    flexDirection: 'row',
    paddingVertical: 20,
  },
  propertyColumn: {
    flex: 1,
    paddingHorizontal: 15,
  },
  propertyColumnBorder: {
    borderLeftWidth: 1,
    borderLeftColor: '#E0E0E0',
  },
  propertyImage: {
    width: '100%',
    height: 120,
    borderRadius: 8,
    marginBottom: 10,
  },
  propertyHeader: {
    alignItems: 'center',
  },
  price: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  address: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 2,
  },
  cityState: {
    fontSize: 12,
    textAlign: 'center',
  },
  comparisonContainer: {
    marginTop: 10,
  },
  comparisonRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    paddingVertical: 15,
  },
  rowLabel: {
    flex: 0.4,
    fontSize: 14,
    fontWeight: '500',
    paddingLeft: 20,
  },
  rowValues: {
    flex: 0.6,
    flexDirection: 'row',
  },
  valueCell: {
    flex: 1,
    alignItems: 'center',
  },
  valueCellBorder: {
    borderLeftWidth: 1,
    borderLeftColor: '#E0E0E0',
  },
  valueText: {
    fontSize: 14,
  },
  featuresSection: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 15,
  },
  featuresColumn: {
    flex: 1,
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  featureText: {
    fontSize: 14,
    marginLeft: 8,
  },
});

export default PropertyComparisonScreen;