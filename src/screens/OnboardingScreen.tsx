import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  FlatList,
  Dimensions,
} from 'react-native';
import { useDispatch } from 'react-redux';
import { completeOnboarding } from '../store/slices/uiSlice';
import Icon from 'react-native-vector-icons/Ionicons';
import { useTheme } from '../theme/ThemeContext';

const { width: screenWidth } = Dimensions.get('window');

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  icon: string;
}

const onboardingSteps: OnboardingStep[] = [
  {
    id: '1',
    title: 'Swipe to Discover',
    description: 'Swipe right to save properties you love, left to pass. It\'s that simple!',
    icon: 'hand-left-outline',
  },
  {
    id: '2',
    title: 'Smart Filters',
    description: 'Set your preferences for location, price, bedrooms, and more to find your perfect home.',
    icon: 'options-outline',
  },
  {
    id: '3',
    title: 'Map & Save',
    description: 'View properties on a map and keep track of your favorites in one place.',
    icon: 'map-outline',
  },
];

const OnboardingScreen = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const dispatch = useDispatch();
  const { colors } = useTheme();

  const handleComplete = () => {
    dispatch(completeOnboarding());
  };

  const renderStep = ({ item }: { item: OnboardingStep }) => (
    <View style={styles.stepContainer}>
      <View style={[styles.iconWrapper, { backgroundColor: colors.primaryLight }]}>
        <Icon name={item.icon} size={80} color={colors.primary} />
      </View>
      <Text style={[styles.stepTitle, { color: colors.text }]}>{item.title}</Text>
      <Text style={[styles.stepDescription, { color: colors.textSecondary }]}>{item.description}</Text>
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.content}>
        <FlatList
          data={onboardingSteps}
          renderItem={renderStep}
          keyExtractor={(item) => item.id}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onMomentumScrollEnd={(event) => {
            const index = Math.round(event.nativeEvent.contentOffset.x / screenWidth);
            setCurrentIndex(index);
          }}
        />
        
        <View style={styles.pagination}>
          {onboardingSteps.map((_, index) => (
            <View
              key={index}
              style={[
                styles.paginationDot,
                { backgroundColor: colors.border },
                currentIndex === index && [styles.paginationDotActive, { backgroundColor: colors.primary }],
              ]}
            />
          ))}
        </View>
        
        <TouchableOpacity style={styles.button} onPress={handleComplete}>
          <Text style={styles.buttonText}>
            {currentIndex === onboardingSteps.length - 1 ? "Let's Go!" : 'Skip'}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
  },
  stepContainer: {
    width: screenWidth,
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  iconWrapper: {
    width: 140,
    height: 140,
    borderRadius: 70,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepTitle: {
    fontSize: 26,
    fontWeight: 'bold',
    marginTop: 30,
    marginBottom: 16,
    textAlign: 'center',
  },
  stepDescription: {
    fontSize: 17,
    textAlign: 'center',
    lineHeight: 26,
    paddingHorizontal: 20,
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 30,
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 5,
  },
  paginationDotActive: {
    width: 20,
  },
  button: {
    backgroundColor: '#FF6B6B',
    marginHorizontal: 40,
    paddingVertical: 16,
    borderRadius: 25,
    alignItems: 'center',
    marginBottom: 40,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
});

export default OnboardingScreen;