import AsyncStorage from '@react-native-async-storage/async-storage';

export interface CachedMapData {
  region: {
    latitude: number;
    longitude: number;
    latitudeDelta: number;
    longitudeDelta: number;
  };
  properties: Array<{
    id: string;
    latitude: number;
    longitude: number;
    price: number;
    address: string;
  }>;
  timestamp: number;
}

export interface CachedMapTile {
  url: string;
  data: string; // base64 encoded image
  timestamp: number;
}

const CACHE_PREFIX = '@map_cache_';
const TILE_CACHE_PREFIX = '@tile_cache_';
const CACHE_EXPIRY = 7 * 24 * 60 * 60 * 1000; // 7 days
const MAX_CACHED_REGIONS = 10;
const MAX_CACHED_TILES = 100;

export const MapCacheManager = {
  // Cache region data
  async cacheRegion(regionKey: string, data: CachedMapData): Promise<void> {
    try {
      const cacheKey = `${CACHE_PREFIX}${regionKey}`;
      await AsyncStorage.setItem(cacheKey, JSON.stringify(data));

      // Manage cache size
      await this.cleanupOldRegions();
    } catch (error) {
      console.error('Error caching region:', error);
    }
  },

  // Retrieve cached region data
  async getCachedRegion(regionKey: string): Promise<CachedMapData | null> {
    try {
      const cacheKey = `${CACHE_PREFIX}${regionKey}`;
      const cachedData = await AsyncStorage.getItem(cacheKey);

      if (!cachedData) return null;

      const data: CachedMapData = JSON.parse(cachedData);

      // Check if cache is expired
      if (Date.now() - data.timestamp > CACHE_EXPIRY) {
        await AsyncStorage.removeItem(cacheKey);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error retrieving cached region:', error);
      return null;
    }
  },

  // Cache map tile image
  async cacheTile(tileKey: string, imageData: string): Promise<void> {
    try {
      const cacheKey = `${TILE_CACHE_PREFIX}${tileKey}`;
      const tileData: CachedMapTile = {
        url: tileKey,
        data: imageData,
        timestamp: Date.now(),
      };

      await AsyncStorage.setItem(cacheKey, JSON.stringify(tileData));

      // Manage cache size
      await this.cleanupOldTiles();
    } catch (error) {
      console.error('Error caching tile:', error);
    }
  },

  // Retrieve cached tile
  async getCachedTile(tileKey: string): Promise<string | null> {
    try {
      const cacheKey = `${TILE_CACHE_PREFIX}${tileKey}`;
      const cachedData = await AsyncStorage.getItem(cacheKey);

      if (!cachedData) return null;

      const tileData: CachedMapTile = JSON.parse(cachedData);

      // Check if cache is expired
      if (Date.now() - tileData.timestamp > CACHE_EXPIRY) {
        await AsyncStorage.removeItem(cacheKey);
        return null;
      }

      return tileData.data;
    } catch (error) {
      console.error('Error retrieving cached tile:', error);
      return null;
    }
  },

  // Get all cached regions
  async getAllCachedRegions(): Promise<string[]> {
    try {
      const allKeys = await AsyncStorage.getAllKeys();
      return allKeys
        .filter((key) => key.startsWith(CACHE_PREFIX))
        .map((key) => key.replace(CACHE_PREFIX, ''));
    } catch (error) {
      console.error('Error getting cached regions:', error);
      return [];
    }
  },

  // Clear specific region cache
  async clearRegionCache(regionKey: string): Promise<void> {
    try {
      const cacheKey = `${CACHE_PREFIX}${regionKey}`;
      await AsyncStorage.removeItem(cacheKey);
    } catch (error) {
      console.error('Error clearing region cache:', error);
    }
  },

  // Clear all map cache
  async clearAllCache(): Promise<void> {
    try {
      const allKeys = await AsyncStorage.getAllKeys();
      const mapKeys = allKeys.filter(
        (key) => key.startsWith(CACHE_PREFIX) || key.startsWith(TILE_CACHE_PREFIX)
      );

      await AsyncStorage.multiRemove(mapKeys);
    } catch (error) {
      console.error('Error clearing all cache:', error);
    }
  },

  // Clean up old regions
  async cleanupOldRegions(): Promise<void> {
    try {
      const allKeys = await AsyncStorage.getAllKeys();
      const regionKeys = allKeys.filter((key) => key.startsWith(CACHE_PREFIX));

      if (regionKeys.length <= MAX_CACHED_REGIONS) return;

      // Get all regions with timestamps
      const regions = await Promise.all(
        regionKeys.map(async (key) => {
          const data = await AsyncStorage.getItem(key);
          if (!data) return null;
          const parsed: CachedMapData = JSON.parse(data);
          return { key, timestamp: parsed.timestamp };
        })
      );

      // Sort by timestamp and remove oldest
      const validRegions = regions.filter((r) => r !== null) as Array<{
        key: string;
        timestamp: number;
      }>;
      validRegions.sort((a, b) => a.timestamp - b.timestamp);

      const toRemove = validRegions
        .slice(0, validRegions.length - MAX_CACHED_REGIONS)
        .map((r) => r.key);

      await AsyncStorage.multiRemove(toRemove);
    } catch (error) {
      console.error('Error cleaning up old regions:', error);
    }
  },

  // Clean up old tiles
  async cleanupOldTiles(): Promise<void> {
    try {
      const allKeys = await AsyncStorage.getAllKeys();
      const tileKeys = allKeys.filter((key) => key.startsWith(TILE_CACHE_PREFIX));

      if (tileKeys.length <= MAX_CACHED_TILES) return;

      // Get all tiles with timestamps
      const tiles = await Promise.all(
        tileKeys.map(async (key) => {
          const data = await AsyncStorage.getItem(key);
          if (!data) return null;
          const parsed: CachedMapTile = JSON.parse(data);
          return { key, timestamp: parsed.timestamp };
        })
      );

      // Sort by timestamp and remove oldest
      const validTiles = tiles.filter((t) => t !== null) as Array<{
        key: string;
        timestamp: number;
      }>;
      validTiles.sort((a, b) => a.timestamp - b.timestamp);

      const toRemove = validTiles
        .slice(0, validTiles.length - MAX_CACHED_TILES)
        .map((t) => t.key);

      await AsyncStorage.multiRemove(toRemove);
    } catch (error) {
      console.error('Error cleaning up old tiles:', error);
    }
  },

  // Get cache size
  async getCacheSize(): Promise<{ regions: number; tiles: number; totalSizeMB: number }> {
    try {
      const allKeys = await AsyncStorage.getAllKeys();
      const regionKeys = allKeys.filter((key) => key.startsWith(CACHE_PREFIX));
      const tileKeys = allKeys.filter((key) => key.startsWith(TILE_CACHE_PREFIX));

      let totalSize = 0;

      // Calculate approximate size
      const allData = await AsyncStorage.multiGet([...regionKeys, ...tileKeys]);
      allData.forEach(([_, value]) => {
        if (value) {
          totalSize += value.length * 2; // Approximate bytes (UTF-16)
        }
      });

      return {
        regions: regionKeys.length,
        tiles: tileKeys.length,
        totalSizeMB: totalSize / (1024 * 1024),
      };
    } catch (error) {
      console.error('Error getting cache size:', error);
      return { regions: 0, tiles: 0, totalSizeMB: 0 };
    }
  },
};

// Helper function to generate region key
export const generateRegionKey = (region: {
  latitude: number;
  longitude: number;
  latitudeDelta: number;
  longitudeDelta: number;
}): string => {
  return `${region.latitude.toFixed(3)}_${region.longitude.toFixed(3)}_${region.latitudeDelta.toFixed(3)}_${region.longitudeDelta.toFixed(3)}`;
};

// Helper function to generate tile key
export const generateTileKey = (x: number, y: number, zoom: number): string => {
  return `${zoom}_${x}_${y}`;
};