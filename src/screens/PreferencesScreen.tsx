import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import Slider from '@react-native-community/slider';
import { RootState } from '../store';
import { updateUserPreferences } from '../store/slices/userSlice';
import { useTheme } from '../theme/ThemeContext';
import { PropertyType } from '../types';

const PreferencesScreen = () => {
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const { currentUser } = useSelector((state: RootState) => state.user);
  const { colors } = useTheme();

  const preferences = currentUser?.preferences || {
    minPrice: 0,
    maxPrice: 1000000,
    minBedrooms: 1,
    maxBedrooms: 5,
    minBathrooms: 1,
    maxBathrooms: 4,
    minSquareFeet: 500,
    maxSquareFeet: 5000,
    propertyTypes: [PropertyType.SINGLE_FAMILY],
    searchRadius: 10,
    locations: [],
  };

  const [minPrice, setMinPrice] = useState(preferences.minPrice || 0);
  const [maxPrice, setMaxPrice] = useState(preferences.maxPrice || 1000000);
  const [minBedrooms, setMinBedrooms] = useState(preferences.minBedrooms || 1);
  const [maxBedrooms, setMaxBedrooms] = useState(preferences.maxBedrooms || 5);
  const [minBathrooms, setMinBathrooms] = useState(preferences.minBathrooms || 1);
  const [maxBathrooms, setMaxBathrooms] = useState(preferences.maxBathrooms || 4);
  const [minSquareFeet, setMinSquareFeet] = useState(preferences.minSquareFeet || 500);
  const [maxSquareFeet, setMaxSquareFeet] = useState(preferences.maxSquareFeet || 5000);
  const [selectedPropertyTypes, setSelectedPropertyTypes] = useState<PropertyType[]>(
    preferences.propertyTypes || []
  );
  const [searchRadius, setSearchRadius] = useState(preferences.searchRadius || 10);

  const handleSave = () => {
    const updatedPreferences = {
      preferences: {
        minPrice,
        maxPrice,
        minBedrooms,
        maxBedrooms,
        minBathrooms,
        maxBathrooms,
        minSquareFeet,
        maxSquareFeet,
        propertyTypes: selectedPropertyTypes,
        searchRadius,
        locations: preferences.locations,
      }
    };

    dispatch(updateUserPreferences(updatedPreferences));
    Alert.alert('Success', 'Preferences updated successfully');
    navigation.goBack();
  };

  const togglePropertyType = (type: PropertyType) => {
    setSelectedPropertyTypes(prev => {
      if (prev.includes(type)) {
        return prev.filter(t => t !== type);
      }
      return [...prev, type];
    });
  };

  const formatPrice = (price: number) => {
    return `$${price.toLocaleString()}`;
  };

  const styles = createStyles(colors);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="chevron-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Search Preferences</Text>
        <TouchableOpacity onPress={handleSave}>
          <Text style={styles.saveButton}>Save</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Price Range</Text>
          
          <View style={styles.sliderContainer}>
            <View style={styles.sliderLabels}>
              <Text style={styles.sliderLabel}>{formatPrice(minPrice)}</Text>
              <Text style={styles.sliderLabel}>{formatPrice(maxPrice)}</Text>
            </View>
            <Text style={styles.sliderTitle}>Min Price</Text>
            <Slider
              style={styles.slider}
              minimumValue={0}
              maximumValue={2000000}
              step={10000}
              value={minPrice}
              onValueChange={setMinPrice}
              minimumTrackTintColor="#FF6B6B"
              maximumTrackTintColor={colors.border}
              thumbTintColor="#FF6B6B"
            />
            <Text style={styles.sliderTitle}>Max Price</Text>
            <Slider
              style={styles.slider}
              minimumValue={0}
              maximumValue={2000000}
              step={10000}
              value={maxPrice}
              onValueChange={setMaxPrice}
              minimumTrackTintColor="#FF6B6B"
              maximumTrackTintColor={colors.border}
              thumbTintColor="#FF6B6B"
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Bedrooms</Text>
          
          <View style={styles.sliderContainer}>
            <View style={styles.sliderLabels}>
              <Text style={styles.sliderLabel}>{minBedrooms}</Text>
              <Text style={styles.sliderLabel}>{maxBedrooms}+</Text>
            </View>
            <Slider
              style={styles.slider}
              minimumValue={1}
              maximumValue={10}
              step={1}
              value={minBedrooms}
              onValueChange={setMinBedrooms}
              minimumTrackTintColor="#FF6B6B"
              maximumTrackTintColor={colors.border}
              thumbTintColor="#FF6B6B"
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Bathrooms</Text>
          
          <View style={styles.sliderContainer}>
            <View style={styles.sliderLabels}>
              <Text style={styles.sliderLabel}>{minBathrooms}</Text>
              <Text style={styles.sliderLabel}>{maxBathrooms}+</Text>
            </View>
            <Slider
              style={styles.slider}
              minimumValue={1}
              maximumValue={8}
              step={0.5}
              value={minBathrooms}
              onValueChange={setMinBathrooms}
              minimumTrackTintColor="#FF6B6B"
              maximumTrackTintColor={colors.border}
              thumbTintColor="#FF6B6B"
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Square Feet</Text>
          
          <View style={styles.sliderContainer}>
            <View style={styles.sliderLabels}>
              <Text style={styles.sliderLabel}>{minSquareFeet} sq ft</Text>
              <Text style={styles.sliderLabel}>{maxSquareFeet}+ sq ft</Text>
            </View>
            <Text style={styles.sliderTitle}>Min Square Feet</Text>
            <Slider
              style={styles.slider}
              minimumValue={0}
              maximumValue={10000}
              step={100}
              value={minSquareFeet}
              onValueChange={setMinSquareFeet}
              minimumTrackTintColor="#FF6B6B"
              maximumTrackTintColor={colors.border}
              thumbTintColor="#FF6B6B"
            />
            <Text style={styles.sliderTitle}>Max Square Feet</Text>
            <Slider
              style={styles.slider}
              minimumValue={0}
              maximumValue={10000}
              step={100}
              value={maxSquareFeet}
              onValueChange={setMaxSquareFeet}
              minimumTrackTintColor="#FF6B6B"
              maximumTrackTintColor={colors.border}
              thumbTintColor="#FF6B6B"
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Property Types</Text>
          
          <View style={styles.propertyTypesContainer}>
            {Object.values(PropertyType).map((type) => (
              <TouchableOpacity
                key={type}
                style={[
                  styles.propertyTypeOption,
                  selectedPropertyTypes.includes(type) && styles.propertyTypeOptionActive
                ]}
                onPress={() => togglePropertyType(type)}
              >
                <Text style={[
                  styles.propertyTypeText,
                  selectedPropertyTypes.includes(type) && styles.propertyTypeTextActive
                ]}>
                  {type.replace(/_/g, ' ')}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Search Radius</Text>
          
          <View style={styles.sliderContainer}>
            <Text style={styles.radiusText}>{searchRadius} miles</Text>
            <Slider
              style={styles.slider}
              minimumValue={1}
              maximumValue={50}
              step={1}
              value={searchRadius}
              onValueChange={setSearchRadius}
              minimumTrackTintColor="#FF6B6B"
              maximumTrackTintColor={colors.border}
              thumbTintColor="#FF6B6B"
            />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const createStyles = (colors: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.card,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
  },
  saveButton: {
    fontSize: 16,
    color: '#FF6B6B',
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  section: {
    backgroundColor: colors.card,
    marginTop: 20,
    paddingVertical: 20,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 20,
  },
  sliderContainer: {
    marginBottom: 10,
  },
  sliderLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  sliderLabel: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  sliderTitle: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 10,
    marginBottom: 5,
  },
  slider: {
    width: '100%',
    height: 40,
  },
  radiusText: {
    fontSize: 16,
    color: colors.text,
    textAlign: 'center',
    marginBottom: 10,
  },
  propertyTypesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  propertyTypeOption: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.background,
  },
  propertyTypeOptionActive: {
    backgroundColor: '#FF6B6B',
    borderColor: '#FF6B6B',
  },
  propertyTypeText: {
    fontSize: 14,
    color: colors.text,
    textTransform: 'capitalize',
  },
  propertyTypeTextActive: {
    color: '#fff',
  },
});

export default PreferencesScreen;