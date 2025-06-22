import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import Svg, { Defs, RadialGradient, Stop, Circle } from 'react-native-svg';
import { Property } from '../../types';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

interface HeatmapOverlayProps {
  properties: Property[];
  region: {
    latitude: number;
    longitude: number;
    latitudeDelta: number;
    longitudeDelta: number;
  };
}

const HeatmapOverlay: React.FC<HeatmapOverlayProps> = ({ properties, region }) => {
  // Convert lat/lng to screen coordinates
  const getScreenCoords = (lat: number, lng: number) => {
    const x = ((lng - region.longitude) / region.longitudeDelta + 0.5) * screenWidth;
    const y = ((region.latitude - lat) / region.latitudeDelta + 0.5) * screenHeight * 0.7;
    return { x, y };
  };

  // Group properties by proximity and calculate intensity
  const getHeatmapPoints = () => {
    const gridSize = 50; // pixels
    const grid: { [key: string]: { x: number; y: number; intensity: number; avgPrice: number } } = {};

    properties.forEach((property) => {
      const coords = getScreenCoords(property.latitude, property.longitude);
      const gridX = Math.floor(coords.x / gridSize);
      const gridY = Math.floor(coords.y / gridSize);
      const key = `${gridX},${gridY}`;

      if (!grid[key]) {
        grid[key] = {
          x: gridX * gridSize + gridSize / 2,
          y: gridY * gridSize + gridSize / 2,
          intensity: 0,
          avgPrice: 0,
        };
      }

      grid[key].intensity += 1;
      grid[key].avgPrice = (grid[key].avgPrice * (grid[key].intensity - 1) + property.price) / grid[key].intensity;
    });

    return Object.values(grid);
  };

  const heatmapPoints = getHeatmapPoints();
  const maxIntensity = Math.max(...heatmapPoints.map(p => p.intensity));

  return (
    <View style={StyleSheet.absoluteFillObject} pointerEvents="none">
      <Svg width={screenWidth} height={screenHeight * 0.7}>
        <Defs>
          <RadialGradient id="heatGradient">
            <Stop offset="0%" stopColor="#FF0000" stopOpacity="0.8" />
            <Stop offset="40%" stopColor="#FF6B6B" stopOpacity="0.6" />
            <Stop offset="60%" stopColor="#FFA500" stopOpacity="0.4" />
            <Stop offset="80%" stopColor="#FFFF00" stopOpacity="0.2" />
            <Stop offset="100%" stopColor="#00FF00" stopOpacity="0" />
          </RadialGradient>
        </Defs>
        
        {heatmapPoints.map((point, index) => {
          const radius = 30 + (point.intensity / maxIntensity) * 70;
          const opacity = 0.3 + (point.intensity / maxIntensity) * 0.4;
          
          return (
            <Circle
              key={index}
              cx={point.x}
              cy={point.y}
              r={radius}
              fill="url(#heatGradient)"
              opacity={opacity}
            />
          );
        })}
      </Svg>
    </View>
  );
};

export default HeatmapOverlay;