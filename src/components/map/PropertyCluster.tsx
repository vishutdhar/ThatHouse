import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../../theme/ThemeContext';

interface PropertyClusterProps {
  count: number;
  averagePrice: number;
}

const PropertyCluster: React.FC<PropertyClusterProps> = ({ count, averagePrice }) => {
  const { colors } = useTheme();

  const getClusterSize = (count: number) => {
    if (count < 5) return 40;
    if (count < 10) return 50;
    if (count < 20) return 60;
    return 70;
  };

  const clusterSize = getClusterSize(count);

  const styles = StyleSheet.create({
    container: {
      width: clusterSize,
      height: clusterSize,
      borderRadius: clusterSize / 2,
      backgroundColor: colors.primary,
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 3,
      borderColor: colors.background,
      shadowColor: colors.shadowColor,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.2,
      shadowRadius: 4,
      elevation: 5,
    },
    count: {
      fontSize: 16,
      fontWeight: 'bold',
      color: colors.textInverse,
    },
    price: {
      fontSize: 10,
      color: colors.textInverse,
      opacity: 0.9,
    },
  });

  const formatPrice = (price: number) => {
    if (price >= 1000000) {
      return `$${(price / 1000000).toFixed(1)}M`;
    }
    return `$${(price / 1000).toFixed(0)}K`;
  };

  return (
    <View style={styles.container}>
      <Text style={styles.count}>{count}</Text>
      <Text style={styles.price}>{formatPrice(averagePrice)}</Text>
    </View>
  );
};

export default PropertyCluster;