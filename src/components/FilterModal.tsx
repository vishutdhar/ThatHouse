import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  SafeAreaView,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../store';
import {
  setLocation,
  setPriceRange,
  setBedroomRange,
  setBathroomRange,
  togglePropertyType,
  resetFilters,
} from '../store/slices/filterSlice';
import { PropertyType } from '../types';
import { useTheme } from '../theme/ThemeContext';

interface FilterModalProps {
  visible: boolean;
  onClose: () => void;
}

const FilterModal: React.FC<FilterModalProps> = ({ visible, onClose }) => {
  const dispatch = useDispatch();
  const { colors } = useTheme();
  const filters = useSelector((state: RootState) => state.filter);

  // Local state for inputs
  const [city, setCity] = useState(filters.location.city);
  const [state, setState] = useState(filters.location.state);
  const [zipCode, setZipCode] = useState(filters.location.zipCode);
  const [radius, setRadius] = useState(filters.location.radius.toString());
  const [priceMin, setPriceMin] = useState(filters.priceRange.min.toString());
  const [priceMax, setPriceMax] = useState(filters.priceRange.max.toString());
  const [bedroomsMin, setBedroomsMin] = useState(filters.bedrooms.min.toString());
  const [bathroomsMin, setBathroomsMin] = useState(filters.bathrooms.min.toString());

  const propertyTypeOptions = [
    { type: PropertyType.SINGLE_FAMILY, label: 'House', icon: 'home' },
    { type: PropertyType.CONDO, label: 'Condo', icon: 'business' },
    { type: PropertyType.TOWNHOUSE, label: 'Townhouse', icon: 'home-outline' },
    { type: PropertyType.MULTI_FAMILY, label: 'Multi-Family', icon: 'git-network' },
  ];

  const popularCities = ['Nashville', 'Franklin', 'Brentwood', 'Murfreesboro', 'Hendersonville'];

  const handleApplyFilters = () => {
    // Update location
    dispatch(setLocation({
      city: city.trim(),
      state: state.trim(),
      zipCode: zipCode.trim(),
      radius: parseInt(radius, 10) || 10,
    }));

    // Update price range
    dispatch(setPriceRange({
      min: parseInt(priceMin, 10) || 0,
      max: parseInt(priceMax, 10) || 2000000,
    }));

    // Update bedrooms
    dispatch(setBedroomRange({
      min: parseInt(bedroomsMin, 10) || 0,
      max: null,
    }));

    // Update bathrooms
    dispatch(setBathroomRange({
      min: parseInt(bathroomsMin, 10) || 0,
      max: null,
    }));

    onClose();
  };

  const handleReset = () => {
    dispatch(resetFilters());
    setCity('Nashville');
    setState('TN');
    setZipCode('');
    setRadius('10');
    setPriceMin('0');
    setPriceMax('2000000');
    setBedroomsMin('0');
    setBathroomsMin('0');
  };

  const activeFiltersCount = () => {
    let count = 0;
    if (filters.priceRange.min > 0 || filters.priceRange.max < 2000000) count++;
    if (filters.bedrooms.min > 0) count++;
    if (filters.bathrooms.min > 0) count++;
    if (filters.propertyTypes.length > 0) count++;
    return count;
  };

  const styles = StyleSheet.create({
    modalOverlay: {
      flex: 1,
      backgroundColor: colors.modalOverlay,
    },
    modalContent: {
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
    },
    headerTitle: {
      fontSize: 20,
      fontWeight: 'bold',
      color: colors.text,
    },
    closeButton: {
      padding: 5,
    },
    scrollContent: {
      paddingBottom: 100,
    },
    section: {
      paddingHorizontal: 20,
      paddingVertical: 20,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: colors.text,
      marginBottom: 15,
    },
    inputRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 10,
    },
    inputLabel: {
      fontSize: 16,
      color: colors.textSecondary,
      width: 60,
    },
    input: {
      flex: 1,
      height: 40,
      borderWidth: 1,
      borderColor: colors.inputBorder,
      borderRadius: 8,
      paddingHorizontal: 12,
      fontSize: 16,
      color: colors.text,
      backgroundColor: colors.inputBackground,
      marginHorizontal: 10,
    },
    propertyTypes: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      marginTop: 10,
    },
    propertyTypeButton: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 15,
      paddingVertical: 10,
      borderRadius: 20,
      borderWidth: 1,
      borderColor: colors.border,
      marginRight: 10,
      marginBottom: 10,
    },
    propertyTypeButtonActive: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
    },
    propertyTypeIcon: {
      marginRight: 5,
    },
    propertyTypeText: {
      fontSize: 14,
      color: colors.text,
    },
    propertyTypeTextActive: {
      color: colors.textInverse,
    },
    bedroomBathroom: {
      flexDirection: 'row',
      justifyContent: 'space-between',
    },
    halfInput: {
      flex: 1,
    },
    footer: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      backgroundColor: colors.background,
      paddingHorizontal: 20,
      paddingVertical: 15,
      borderTopWidth: 1,
      borderTopColor: colors.border,
      flexDirection: 'row',
      justifyContent: 'space-between',
    },
    resetButton: {
      flex: 1,
      paddingVertical: 12,
      alignItems: 'center',
      marginRight: 10,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: colors.border,
    },
    resetButtonText: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.text,
    },
    applyButton: {
      flex: 2,
      backgroundColor: colors.primary,
      paddingVertical: 12,
      alignItems: 'center',
      borderRadius: 8,
      flexDirection: 'row',
      justifyContent: 'center',
    },
    applyButtonText: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.textInverse,
      marginRight: 5,
    },
    filterCount: {
      backgroundColor: colors.textInverse,
      paddingHorizontal: 8,
      paddingVertical: 2,
      borderRadius: 10,
      minWidth: 20,
      alignItems: 'center',
    },
    filterCountText: {
      fontSize: 12,
      fontWeight: 'bold',
      color: colors.primary,
    },
    citySuggestions: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      marginVertical: 10,
    },
    cityChip: {
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: colors.border,
      marginRight: 8,
      marginBottom: 8,
      backgroundColor: colors.cardBackground,
    },
    cityChipActive: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
    },
    cityChipText: {
      fontSize: 14,
      color: colors.text,
    },
    cityChipTextActive: {
      color: colors.textInverse,
    },
  });

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <SafeAreaView style={styles.modalContent}>
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Filters</Text>
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <Icon name="close" size={24} color={colors.text} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.scrollContent}>
            {/* Location */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Location</Text>
              <View style={styles.inputRow}>
                <Text style={styles.inputLabel}>City</Text>
                <TextInput
                  style={styles.input}
                  value={city}
                  onChangeText={setCity}
                  placeholder="Enter city"
                  placeholderTextColor={colors.textTertiary}
                />
              </View>
              <View style={styles.citySuggestions}>
                {popularCities.map((cityName) => (
                  <TouchableOpacity
                    key={cityName}
                    style={[
                      styles.cityChip,
                      city === cityName && styles.cityChipActive
                    ]}
                    onPress={() => setCity(cityName)}
                  >
                    <Text
                      style={[
                        styles.cityChipText,
                        city === cityName && styles.cityChipTextActive
                      ]}
                    >
                      {cityName}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
              <View style={styles.inputRow}>
                <Text style={styles.inputLabel}>State</Text>
                <TextInput
                  style={[styles.input, { width: 80 }]}
                  value={state}
                  onChangeText={setState}
                  placeholder="TN"
                  placeholderTextColor={colors.textTertiary}
                  maxLength={2}
                  autoCapitalize="characters"
                />
                <Text style={[styles.inputLabel, { marginLeft: 20 }]}>Radius</Text>
                <TextInput
                  style={[styles.input, { flex: 1 }]}
                  value={radius}
                  onChangeText={setRadius}
                  keyboardType="numeric"
                  placeholder="10"
                  placeholderTextColor={colors.textTertiary}
                />
                <Text style={[styles.inputLabel, { marginLeft: 5 }]}>miles</Text>
              </View>
            </View>

            {/* Price Range */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Price Range</Text>
              <View style={styles.inputRow}>
                <Text style={styles.inputLabel}>Min</Text>
                <TextInput
                  style={styles.input}
                  value={priceMin}
                  onChangeText={setPriceMin}
                  keyboardType="numeric"
                  placeholder="0"
                  placeholderTextColor={colors.textTertiary}
                />
                <Text style={styles.inputLabel}>Max</Text>
                <TextInput
                  style={styles.input}
                  value={priceMax}
                  onChangeText={setPriceMax}
                  keyboardType="numeric"
                  placeholder="No limit"
                  placeholderTextColor={colors.textTertiary}
                />
              </View>
            </View>

            {/* Property Type */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Property Type</Text>
              <View style={styles.propertyTypes}>
                {propertyTypeOptions.map((option) => {
                  const isActive = filters.propertyTypes.includes(option.type);
                  return (
                    <TouchableOpacity
                      key={option.type}
                      style={[
                        styles.propertyTypeButton,
                        isActive && styles.propertyTypeButtonActive,
                      ]}
                      onPress={() => dispatch(togglePropertyType(option.type))}
                    >
                      <Icon
                        name={option.icon as any}
                        size={18}
                        color={isActive ? colors.textInverse : colors.text}
                        style={styles.propertyTypeIcon}
                      />
                      <Text
                        style={[
                          styles.propertyTypeText,
                          isActive && styles.propertyTypeTextActive,
                        ]}
                      >
                        {option.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* Bedrooms & Bathrooms */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Bedrooms & Bathrooms</Text>
              <View style={styles.bedroomBathroom}>
                <View style={[styles.inputRow, styles.halfInput]}>
                  <Text style={styles.inputLabel}>Beds</Text>
                  <TextInput
                    style={styles.input}
                    value={bedroomsMin}
                    onChangeText={setBedroomsMin}
                    keyboardType="numeric"
                    placeholder="0+"
                    placeholderTextColor={colors.textTertiary}
                  />
                </View>
                <View style={[styles.inputRow, styles.halfInput]}>
                  <Text style={styles.inputLabel}>Baths</Text>
                  <TextInput
                    style={styles.input}
                    value={bathroomsMin}
                    onChangeText={setBathroomsMin}
                    keyboardType="numeric"
                    placeholder="0+"
                    placeholderTextColor={colors.textTertiary}
                  />
                </View>
              </View>
            </View>
          </ScrollView>

          <View style={styles.footer}>
            <TouchableOpacity style={styles.resetButton} onPress={handleReset}>
              <Text style={styles.resetButtonText}>Reset</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.applyButton} onPress={handleApplyFilters}>
              <Text style={styles.applyButtonText}>Apply Filters</Text>
              {activeFiltersCount() > 0 && (
                <View style={styles.filterCount}>
                  <Text style={styles.filterCountText}>{activeFiltersCount()}</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </View>
    </Modal>
  );
};

export default FilterModal;