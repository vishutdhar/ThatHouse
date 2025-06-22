import React, { useState } from 'react';
import {
  View,
  TouchableOpacity,
  Text,
  StyleSheet,
  PanResponder,
  Dimensions,
} from 'react-native';
import Svg, { Path, Circle } from 'react-native-svg';
import Icon from 'react-native-vector-icons/Ionicons';
import { useTheme } from '../../theme/ThemeContext';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

interface Point {
  x: number;
  y: number;
}

interface DrawingToolsProps {
  onAreaComplete: (points: Point[]) => void;
  onClear: () => void;
}

const DrawingTools: React.FC<DrawingToolsProps> = ({ onAreaComplete, onClear }) => {
  const { colors } = useTheme();
  const [isDrawing, setIsDrawing] = useState(false);
  const [points, setPoints] = useState<Point[]>([]);
  const [currentPath, setCurrentPath] = useState('');

  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => isDrawing,
    onMoveShouldSetPanResponder: () => isDrawing,
    
    onPanResponderGrant: (evt) => {
      if (!isDrawing) return;
      
      const { locationX, locationY } = evt.nativeEvent;
      const newPoints = [{ x: locationX, y: locationY }];
      setPoints(newPoints);
      setCurrentPath(`M${locationX},${locationY}`);
    },
    
    onPanResponderMove: (evt) => {
      if (!isDrawing) return;
      
      const { locationX, locationY } = evt.nativeEvent;
      const newPoint = { x: locationX, y: locationY };
      const updatedPoints = [...points, newPoint];
      
      setPoints(updatedPoints);
      
      // Update SVG path
      const pathData = updatedPoints.reduce((path, point, index) => {
        if (index === 0) return `M${point.x},${point.y}`;
        return `${path} L${point.x},${point.y}`;
      }, '');
      
      setCurrentPath(pathData);
    },
    
    onPanResponderRelease: () => {
      if (!isDrawing || points.length < 3) return;
      
      // Close the path
      if (points.length > 0) {
        setCurrentPath(`${currentPath} Z`);
        onAreaComplete(points);
        setIsDrawing(false);
      }
    },
  });

  const startDrawing = () => {
    setIsDrawing(true);
    setPoints([]);
    setCurrentPath('');
  };

  const clearDrawing = () => {
    setPoints([]);
    setCurrentPath('');
    setIsDrawing(false);
    onClear();
  };

  const styles = StyleSheet.create({
    container: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
    },
    svgContainer: {
      ...StyleSheet.absoluteFillObject,
    },
    toolbar: {
      position: 'absolute',
      bottom: 170,
      left: 20,
      right: 20,
      flexDirection: 'row',
      backgroundColor: colors.background,
      borderRadius: 12,
      padding: 12,
      shadowColor: colors.shadowColor,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
      justifyContent: 'space-around',
    },
    toolButton: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 20,
      backgroundColor: colors.backgroundSecondary,
    },
    toolButtonActive: {
      backgroundColor: colors.primary,
    },
    toolButtonText: {
      marginLeft: 8,
      fontSize: 14,
      color: colors.text,
    },
    toolButtonTextActive: {
      color: colors.textInverse,
    },
    instruction: {
      position: 'absolute',
      top: 100,
      left: 20,
      right: 20,
      backgroundColor: colors.background,
      padding: 12,
      borderRadius: 8,
      shadowColor: colors.shadowColor,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    instructionText: {
      fontSize: 14,
      color: colors.text,
      textAlign: 'center',
    },
  });

  return (
    <View style={styles.container} pointerEvents={isDrawing ? 'auto' : 'box-none'}>
      <View
        style={styles.svgContainer}
        {...(isDrawing ? panResponder.panHandlers : {})}
      >
        <Svg width={screenWidth} height={screenHeight}>
          {currentPath !== '' && (
            <>
              <Path
                d={currentPath}
                stroke={colors.primary}
                strokeWidth={3}
                fill="rgba(255, 107, 107, 0.2)"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              {points.map((point, index) => (
                <Circle
                  key={index}
                  cx={point.x}
                  cy={point.y}
                  r={5}
                  fill={colors.primary}
                />
              ))}
            </>
          )}
        </Svg>
      </View>

      {isDrawing && (
        <View style={styles.instruction}>
          <Text style={styles.instructionText}>
            Draw an area on the map to search within
          </Text>
        </View>
      )}

      <View style={styles.toolbar}>
        <TouchableOpacity
          style={[styles.toolButton, isDrawing && styles.toolButtonActive]}
          onPress={startDrawing}
        >
          <Icon
            name="create-outline"
            size={20}
            color={isDrawing ? colors.textInverse : colors.text}
          />
          <Text
            style={[
              styles.toolButtonText,
              isDrawing && styles.toolButtonTextActive,
            ]}
          >
            Draw Area
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.toolButton}
          onPress={clearDrawing}
          disabled={!currentPath}
        >
          <Icon
            name="trash-outline"
            size={20}
            color={!currentPath ? colors.textTertiary : colors.text}
          />
          <Text
            style={[
              styles.toolButtonText,
              { color: !currentPath ? colors.textTertiary : colors.text },
            ]}
          >
            Clear
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default DrawingTools;