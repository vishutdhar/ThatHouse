import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useTheme } from '../../theme/ThemeContext';
import { MapCacheManager } from '../../utils/mapCache';

interface OfflineMapSettingsProps {
  onClose: () => void;
}

const OfflineMapSettings: React.FC<OfflineMapSettingsProps> = ({ onClose }) => {
  const { colors } = useTheme();
  const [cachedRegions, setCachedRegions] = useState<string[]>([]);
  const [cacheSize, setCacheSize] = useState({ regions: 0, tiles: 0, totalSizeMB: 0 });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadCacheInfo();
  }, []);

  const loadCacheInfo = async () => {
    setIsLoading(true);
    try {
      const regions = await MapCacheManager.getAllCachedRegions();
      const size = await MapCacheManager.getCacheSize();
      setCachedRegions(regions);
      setCacheSize(size);
    } catch (error) {
      console.error('Error loading cache info:', error);
    }
    setIsLoading(false);
  };

  const handleClearAllCache = () => {
    Alert.alert(
      'Clear All Offline Maps',
      'Are you sure you want to delete all offline map data?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: async () => {
            await MapCacheManager.clearAllCache();
            await loadCacheInfo();
            Alert.alert('Success', 'All offline map data has been cleared');
          },
        },
      ]
    );
  };

  const handleClearRegion = (regionKey: string) => {
    Alert.alert(
      'Delete Region',
      'Delete this offline region?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            await MapCacheManager.clearRegionCache(regionKey);
            await loadCacheInfo();
          },
        },
      ]
    );
  };

  const formatRegionName = (regionKey: string) => {
    const parts = regionKey.split('_');
    if (parts.length >= 4) {
      const lat = parseFloat(parts[0]).toFixed(2);
      const lng = parseFloat(parts[1]).toFixed(2);
      return `Area near ${lat}, ${lng}`;
    }
    return regionKey;
  };

  const styles = StyleSheet.create({
    container: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    modal: {
      width: '90%',
      maxWidth: 400,
      maxHeight: '80%',
      backgroundColor: colors.background,
      borderRadius: 16,
      shadowColor: colors.shadowColor,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 10,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: 20,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    title: {
      fontSize: 20,
      fontWeight: 'bold',
      color: colors.text,
    },
    closeButton: {
      padding: 4,
    },
    content: {
      flex: 1,
    },
    sizeInfo: {
      padding: 20,
      backgroundColor: colors.backgroundSecondary,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    sizeRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 8,
    },
    sizeLabel: {
      fontSize: 14,
      color: colors.textSecondary,
    },
    sizeValue: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.text,
    },
    totalSize: {
      marginTop: 8,
      paddingTop: 8,
      borderTopWidth: 1,
      borderTopColor: colors.border,
    },
    regionsList: {
      flex: 1,
    },
    regionsContent: {
      padding: 20,
    },
    sectionTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.text,
      marginBottom: 12,
    },
    regionItem: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    regionName: {
      flex: 1,
      fontSize: 14,
      color: colors.text,
    },
    deleteButton: {
      padding: 8,
    },
    emptyText: {
      fontSize: 14,
      color: colors.textTertiary,
      textAlign: 'center',
      marginTop: 20,
    },
    footer: {
      padding: 20,
      borderTopWidth: 1,
      borderTopColor: colors.border,
    },
    clearAllButton: {
      backgroundColor: colors.error,
      paddingVertical: 12,
      borderRadius: 8,
      alignItems: 'center',
    },
    clearAllText: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.textInverse,
    },
    infoText: {
      fontSize: 12,
      color: colors.textTertiary,
      textAlign: 'center',
      marginTop: 12,
    },
  });

  return (
    <View style={styles.container}>
      <View style={styles.modal}>
        <View style={styles.header}>
          <Text style={styles.title}>Offline Maps</Text>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Icon name="close" size={24} color={colors.text} />
          </TouchableOpacity>
        </View>

        <View style={styles.content}>
          <View style={styles.sizeInfo}>
            <View style={styles.sizeRow}>
              <Text style={styles.sizeLabel}>Cached Regions:</Text>
              <Text style={styles.sizeValue}>{cacheSize.regions}</Text>
            </View>
            <View style={styles.sizeRow}>
              <Text style={styles.sizeLabel}>Map Tiles:</Text>
              <Text style={styles.sizeValue}>{cacheSize.tiles}</Text>
            </View>
            <View style={[styles.sizeRow, styles.totalSize]}>
              <Text style={[styles.sizeLabel, { fontWeight: '600' }]}>
                Total Size:
              </Text>
              <Text style={[styles.sizeValue, { color: colors.primary }]}>
                {cacheSize.totalSizeMB.toFixed(1)} MB
              </Text>
            </View>
          </View>

          <ScrollView style={styles.regionsList}>
            <View style={styles.regionsContent}>
              <Text style={styles.sectionTitle}>Cached Regions</Text>
              {cachedRegions.length === 0 ? (
                <Text style={styles.emptyText}>
                  No offline regions saved yet
                </Text>
              ) : (
                cachedRegions.map((region) => (
                  <View key={region} style={styles.regionItem}>
                    <Text style={styles.regionName}>
                      {formatRegionName(region)}
                    </Text>
                    <TouchableOpacity
                      style={styles.deleteButton}
                      onPress={() => handleClearRegion(region)}
                    >
                      <Icon
                        name="trash-outline"
                        size={20}
                        color={colors.error}
                      />
                    </TouchableOpacity>
                  </View>
                ))
              )}
            </View>
          </ScrollView>
        </View>

        <View style={styles.footer}>
          {cachedRegions.length > 0 && (
            <TouchableOpacity
              style={styles.clearAllButton}
              onPress={handleClearAllCache}
            >
              <Text style={styles.clearAllText}>Clear All Offline Data</Text>
            </TouchableOpacity>
          )}
          <Text style={styles.infoText}>
            Map regions you visit are automatically cached for offline use
          </Text>
        </View>
      </View>
    </View>
  );
};

export default OfflineMapSettings;