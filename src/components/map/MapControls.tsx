import React from 'react';
import {
  View,
  TouchableOpacity,
  Text,
  StyleSheet,
  ScrollView,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useTheme } from '../../theme/ThemeContext';

export type MapStyle = 'standard' | 'satellite' | 'terrain';
export type ViewMode = 'map' | 'heatmap' | 'boundaries';

interface MapControlsProps {
  mapStyle: MapStyle;
  onMapStyleChange: (style: MapStyle) => void;
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  showAmenities: boolean;
  onToggleAmenities: () => void;
  showSchoolDistricts: boolean;
  onToggleSchoolDistricts: () => void;
  showNeighborhoods: boolean;
  onToggleNeighborhoods: () => void;
  onZoomToLocation: () => void;
  onZoomToFit: () => void;
  onToggleOrientation: () => void;
  isNorthUp: boolean;
  showDrawingTools: boolean;
  onToggleDrawingTools: () => void;
  showCommuteTime: boolean;
  onToggleCommuteTime: () => void;
}

const MapControls: React.FC<MapControlsProps> = ({
  mapStyle,
  onMapStyleChange,
  viewMode,
  onViewModeChange,
  showAmenities,
  onToggleAmenities,
  showSchoolDistricts,
  onToggleSchoolDistricts,
  showNeighborhoods,
  onToggleNeighborhoods,
  onZoomToLocation,
  onZoomToFit,
  onToggleOrientation,
  isNorthUp,
  showDrawingTools,
  onToggleDrawingTools,
  showCommuteTime,
  onToggleCommuteTime,
}) => {
  const { colors } = useTheme();

  const styles = StyleSheet.create({
    container: {
      position: 'absolute',
      top: 10,
      right: 10,
      backgroundColor: colors.background,
      borderRadius: 12,
      padding: 8,
      shadowColor: colors.shadowColor,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
      maxWidth: 300,
    },
    section: {
      marginBottom: 12,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
      paddingBottom: 12,
    },
    sectionTitle: {
      fontSize: 12,
      fontWeight: '600',
      color: colors.textSecondary,
      marginBottom: 8,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },
    controlRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
    },
    controlButton: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 20,
      backgroundColor: colors.backgroundSecondary,
      borderWidth: 1,
      borderColor: colors.border,
    },
    controlButtonActive: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
    },
    controlButtonText: {
      fontSize: 12,
      marginLeft: 6,
      color: colors.text,
    },
    controlButtonTextActive: {
      color: colors.textInverse,
    },
    zoomControls: {
      flexDirection: 'row',
      gap: 8,
      marginBottom: 8,
    },
    iconButton: {
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: colors.backgroundSecondary,
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 1,
      borderColor: colors.border,
    },
    iconButtonActive: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
    },
  });

  const renderToggleButton = (
    label: string,
    icon: string,
    isActive: boolean,
    onPress: () => void
  ) => (
    <TouchableOpacity
      style={[styles.controlButton, isActive && styles.controlButtonActive]}
      onPress={onPress}
    >
      <Icon
        name={icon}
        size={16}
        color={isActive ? colors.textInverse : colors.text}
      />
      <Text
        style={[
          styles.controlButtonText,
          isActive && styles.controlButtonTextActive,
        ]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Zoom Controls */}
      <View style={styles.section}>
        <View style={styles.zoomControls}>
          <TouchableOpacity style={styles.iconButton} onPress={onZoomToLocation}>
            <Icon name="locate" size={20} color={colors.text} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconButton} onPress={onZoomToFit}>
            <Icon name="scan-outline" size={20} color={colors.text} />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.iconButton, !isNorthUp && styles.iconButtonActive]}
            onPress={onToggleOrientation}
          >
            <Icon
              name="compass-outline"
              size={20}
              color={!isNorthUp ? colors.textInverse : colors.text}
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* Map Style */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Map Style</Text>
        <View style={styles.controlRow}>
          {renderToggleButton(
            'Standard',
            'map-outline',
            mapStyle === 'standard',
            () => onMapStyleChange('standard')
          )}
          {renderToggleButton(
            'Satellite',
            'globe-outline',
            mapStyle === 'satellite',
            () => onMapStyleChange('satellite')
          )}
          {renderToggleButton(
            'Terrain',
            'trail-sign-outline',
            mapStyle === 'terrain',
            () => onMapStyleChange('terrain')
          )}
        </View>
      </View>

      {/* View Mode */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>View Mode</Text>
        <View style={styles.controlRow}>
          {renderToggleButton(
            'Map',
            'map',
            viewMode === 'map',
            () => onViewModeChange('map')
          )}
          {renderToggleButton(
            'Heatmap',
            'flame-outline',
            viewMode === 'heatmap',
            () => onViewModeChange('heatmap')
          )}
          {renderToggleButton(
            'Boundaries',
            'shapes-outline',
            viewMode === 'boundaries',
            () => onViewModeChange('boundaries')
          )}
        </View>
      </View>

      {/* Overlays */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Overlays</Text>
        <View style={styles.controlRow}>
          {renderToggleButton(
            'Schools',
            'school-outline',
            showSchoolDistricts,
            onToggleSchoolDistricts
          )}
          {renderToggleButton(
            'Neighborhoods',
            'home-outline',
            showNeighborhoods,
            onToggleNeighborhoods
          )}
          {renderToggleButton(
            'Amenities',
            'location-outline',
            showAmenities,
            onToggleAmenities
          )}
        </View>
      </View>

      {/* Tools */}
      <View style={[styles.section, { borderBottomWidth: 0 }]}>
        <Text style={styles.sectionTitle}>Tools</Text>
        <View style={styles.controlRow}>
          {renderToggleButton(
            'Commute',
            'car-outline',
            showCommuteTime,
            onToggleCommuteTime
          )}
          {renderToggleButton(
            'Draw Area',
            'create-outline',
            showDrawingTools,
            onToggleDrawingTools
          )}
        </View>
      </View>
    </View>
  );
};

export default MapControls;