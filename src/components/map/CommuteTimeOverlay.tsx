import React, { useState } from 'react';
import {
  View,
  TouchableOpacity,
  Text,
  StyleSheet,
  TextInput,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useTheme } from '../../theme/ThemeContext';
import { geocodeAddress } from '../../utils/geocodingUtils';

interface CommuteTimeOverlayProps {
  origin: { latitude: number; longitude: number } | null;
  onSetOrigin: (address: string) => void;
  onClose: () => void;
}

const CommuteTimeOverlay: React.FC<CommuteTimeOverlayProps> = ({
  origin,
  onSetOrigin,
  onClose,
}) => {
  const { colors } = useTheme();
  const [address, setAddress] = useState('');
  const [transportMode, setTransportMode] = useState<'driving' | 'transit' | 'walking'>('driving');
  const [timeOfDay, setTimeOfDay] = useState<'morning' | 'evening'>('morning');
  const [isCalculating, setIsCalculating] = useState(false);

  const styles = StyleSheet.create({
    container: {
      position: 'absolute',
      top: 100,
      left: 20,
      right: 20,
      backgroundColor: colors.background,
      borderRadius: 12,
      padding: 16,
      shadowColor: colors.shadowColor,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 5,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 16,
    },
    title: {
      fontSize: 18,
      fontWeight: 'bold',
      color: colors.text,
    },
    closeButton: {
      padding: 4,
    },
    inputContainer: {
      marginBottom: 16,
    },
    label: {
      fontSize: 14,
      color: colors.textSecondary,
      marginBottom: 8,
    },
    input: {
      backgroundColor: colors.backgroundSecondary,
      borderRadius: 8,
      padding: 12,
      fontSize: 16,
      color: colors.text,
      borderWidth: 1,
      borderColor: colors.border,
    },
    optionsContainer: {
      marginBottom: 16,
    },
    optionRow: {
      flexDirection: 'row',
      gap: 8,
      marginTop: 8,
    },
    optionButton: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 10,
      paddingHorizontal: 12,
      borderRadius: 8,
      backgroundColor: colors.backgroundSecondary,
      borderWidth: 1,
      borderColor: colors.border,
    },
    optionButtonActive: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
    },
    optionIcon: {
      marginRight: 6,
    },
    optionText: {
      fontSize: 14,
      color: colors.text,
    },
    optionTextActive: {
      color: colors.textInverse,
    },
    calculateButton: {
      backgroundColor: colors.primary,
      paddingVertical: 14,
      borderRadius: 8,
      alignItems: 'center',
    },
    calculateButtonText: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.textInverse,
    },
    legend: {
      marginTop: 16,
      paddingTop: 16,
      borderTopWidth: 1,
      borderTopColor: colors.border,
    },
    legendTitle: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.text,
      marginBottom: 8,
    },
    legendItem: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 6,
    },
    legendColor: {
      width: 20,
      height: 20,
      borderRadius: 4,
      marginRight: 8,
    },
    legendText: {
      fontSize: 12,
      color: colors.textSecondary,
    },
  });

  const handleCalculate = async () => {
    if (address.trim()) {
      setIsCalculating(true);
      const geocodeResult = await geocodeAddress(address);
      setIsCalculating(false);
      
      if (geocodeResult) {
        onSetOrigin(geocodeResult.formatted_address);
      }
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Commute Time Analysis</Text>
        <TouchableOpacity style={styles.closeButton} onPress={onClose}>
          <Icon name="close" size={24} color={colors.text} />
        </TouchableOpacity>
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Starting Address</Text>
        <TextInput
          style={styles.input}
          value={address}
          onChangeText={setAddress}
          placeholder="Enter work address..."
          placeholderTextColor={colors.textTertiary}
        />
      </View>

      <View style={styles.optionsContainer}>
        <Text style={styles.label}>Transport Mode</Text>
        <View style={styles.optionRow}>
          <TouchableOpacity
            style={[
              styles.optionButton,
              transportMode === 'driving' && styles.optionButtonActive,
            ]}
            onPress={() => setTransportMode('driving')}
          >
            <Icon
              name="car-outline"
              size={18}
              color={transportMode === 'driving' ? colors.textInverse : colors.text}
              style={styles.optionIcon}
            />
            <Text
              style={[
                styles.optionText,
                transportMode === 'driving' && styles.optionTextActive,
              ]}
            >
              Driving
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.optionButton,
              transportMode === 'transit' && styles.optionButtonActive,
            ]}
            onPress={() => setTransportMode('transit')}
          >
            <Icon
              name="train-outline"
              size={18}
              color={transportMode === 'transit' ? colors.textInverse : colors.text}
              style={styles.optionIcon}
            />
            <Text
              style={[
                styles.optionText,
                transportMode === 'transit' && styles.optionTextActive,
              ]}
            >
              Transit
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.optionButton,
              transportMode === 'walking' && styles.optionButtonActive,
            ]}
            onPress={() => setTransportMode('walking')}
          >
            <Icon
              name="walk-outline"
              size={18}
              color={transportMode === 'walking' ? colors.textInverse : colors.text}
              style={styles.optionIcon}
            />
            <Text
              style={[
                styles.optionText,
                transportMode === 'walking' && styles.optionTextActive,
              ]}
            >
              Walking
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.optionsContainer}>
        <Text style={styles.label}>Time of Day</Text>
        <View style={styles.optionRow}>
          <TouchableOpacity
            style={[
              styles.optionButton,
              timeOfDay === 'morning' && styles.optionButtonActive,
            ]}
            onPress={() => setTimeOfDay('morning')}
          >
            <Icon
              name="sunny-outline"
              size={18}
              color={timeOfDay === 'morning' ? colors.textInverse : colors.text}
              style={styles.optionIcon}
            />
            <Text
              style={[
                styles.optionText,
                timeOfDay === 'morning' && styles.optionTextActive,
              ]}
            >
              Morning (8 AM)
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.optionButton,
              timeOfDay === 'evening' && styles.optionButtonActive,
            ]}
            onPress={() => setTimeOfDay('evening')}
          >
            <Icon
              name="moon-outline"
              size={18}
              color={timeOfDay === 'evening' ? colors.textInverse : colors.text}
              style={styles.optionIcon}
            />
            <Text
              style={[
                styles.optionText,
                timeOfDay === 'evening' && styles.optionTextActive,
              ]}
            >
              Evening (6 PM)
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <TouchableOpacity
        style={[styles.calculateButton, (isCalculating || !address.trim()) && { opacity: 0.6 }]}
        onPress={handleCalculate}
        disabled={!address.trim() || isCalculating}
      >
        {isCalculating ? (
          <ActivityIndicator color={colors.textInverse} />
        ) : (
          <Text style={styles.calculateButtonText}>Calculate Commute Times</Text>
        )}
      </TouchableOpacity>

      <View style={styles.legend}>
        <Text style={styles.legendTitle}>Commute Time Zones</Text>
        <View style={styles.legendItem}>
          <View style={[styles.legendColor, { backgroundColor: '#4CAF50' }]} />
          <Text style={styles.legendText}>0-15 minutes</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendColor, { backgroundColor: '#FFC107' }]} />
          <Text style={styles.legendText}>15-30 minutes</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendColor, { backgroundColor: '#FF9800' }]} />
          <Text style={styles.legendText}>30-45 minutes</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendColor, { backgroundColor: '#F44336' }]} />
          <Text style={styles.legendText}>45+ minutes</Text>
        </View>
      </View>
    </View>
  );
};

export default CommuteTimeOverlay;