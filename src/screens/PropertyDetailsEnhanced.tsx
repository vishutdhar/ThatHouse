import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Dimensions,
  FlatList,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Linking,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useRoute, RouteProp } from '@react-navigation/native';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../store';
import { RootStackParamList } from '../navigation/AppNavigator';
import { addSavedProperty, removeSavedProperty } from '../store/slices/userSlice';
import { useTheme } from '../theme/ThemeContext';

type PropertyDetailsRouteProp = RouteProp<RootStackParamList, 'PropertyDetails'>;

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

const PropertyDetailsEnhanced = () => {
  const route = useRoute<PropertyDetailsRouteProp>();
  const dispatch = useDispatch();
  const { propertyId } = route.params;
  const scrollViewRef = useRef<ScrollView>(null);
  const { colors } = useTheme();
  
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showGallery, setShowGallery] = useState(false);
  const [showCalculator, setShowCalculator] = useState(false);
  const [showContactForm, setShowContactForm] = useState(false);
  const [contactForm, setContactForm] = useState({
    name: '',
    email: '',
    phone: '',
    message: "I'm interested in this property. Please contact me with more information.",
  });
  
  // Calculator state
  const [loanAmount, setLoanAmount] = useState('');
  const [interestRate, setInterestRate] = useState('4.5');
  const [loanTerm, setLoanTerm] = useState('30');
  
  const property = useSelector((state: RootState) => 
    state.properties.properties.find(p => p.id === propertyId)
  );
  
  const currentUser = useSelector((state: RootState) => state.user.currentUser);
  const isSaved = currentUser?.savedProperties.includes(propertyId || '') || false;

  if (!property) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Text style={{ color: colors.text }}>Property not found</Text>
      </View>
    );
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  const calculateMonthlyPayment = () => {
    const principal = parseFloat(loanAmount) || property.price * 0.8; // Default to 80% of price
    const rate = parseFloat(interestRate) / 100 / 12;
    const term = parseFloat(loanTerm) * 12;
    
    if (principal && rate && term) {
      const payment = principal * (rate * Math.pow(1 + rate, term)) / (Math.pow(1 + rate, term) - 1);
      return Math.round(payment);
    }
    return 0;
  };

  const handleSaveToggle = () => {
    if (isSaved) {
      dispatch(removeSavedProperty(property.id));
    } else {
      dispatch(addSavedProperty(property.id));
    }
  };

  const handleContactSubmit = () => {
    // In a real app, this would send to backend
    Alert.alert(
      'Message Sent!',
      'An agent will contact you within 24 hours.',
      [{ text: 'OK', onPress: () => setShowContactForm(false) }]
    );
  };

  const openMaps = () => {
    const address = `${property.address}, ${property.city}, ${property.state} ${property.zipCode}`;
    const url = Platform.select({
      ios: `maps:0,0?q=${encodeURIComponent(address)}`,
      android: `geo:0,0?q=${encodeURIComponent(address)}`,
    });
    
    if (url) {
      Linking.openURL(url);
    }
  };

  const scrollToSection = (y: number) => {
    scrollViewRef.current?.scrollTo({ y, animated: true });
  };

  // Enhanced property features
  const propertyHighlights = [
    { icon: 'home', label: property.propertyType },
    { icon: 'calendar', label: `${property.daysOnMarket} days on market` },
    { icon: 'trending-up', label: property.status },
    { icon: 'map', label: `${property.lotSize} acres` },
  ];

  // Dynamic styles based on theme
  const dynamicStyles = StyleSheet.create({
    modalOverlay: {
      flex: 1,
      backgroundColor: colors.modalOverlay,
      justifyContent: 'flex-end',
    },
    modalBackground: {
      backgroundColor: colors.background,
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
    },
    input: {
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 8,
      paddingHorizontal: 15,
      paddingVertical: 12,
      fontSize: 16,
      backgroundColor: colors.inputBackground,
      color: colors.text,
    },
    sectionBackground: {
      backgroundColor: colors.surface,
      borderRadius: 12,
      padding: 15,
    },
    text: {
      color: colors.text,
    },
    textSecondary: {
      color: colors.textSecondary,
    },
    border: {
      borderColor: colors.border,
    },
  });

  return (
    <>
      <ScrollView ref={scrollViewRef} style={[styles.container, { backgroundColor: colors.background }]} showsVerticalScrollIndicator={false}>
        {/* Image Gallery */}
        <View style={styles.imageContainer}>
          <ScrollView 
            horizontal 
            pagingEnabled 
            showsHorizontalScrollIndicator={false}
            onScroll={(event) => {
              const index = Math.round(event.nativeEvent.contentOffset.x / screenWidth);
              setCurrentImageIndex(index);
            }}
            scrollEventThrottle={16}
          >
            {property.images.map((image, index) => (
              <TouchableOpacity key={index} onPress={() => setShowGallery(true)}>
                <Image source={{ uri: image }} style={styles.image} />
              </TouchableOpacity>
            ))}
          </ScrollView>
          
          {/* Image indicators */}
          <View style={styles.imageIndicators}>
            {property.images.map((_, index) => (
              <View 
                key={index} 
                style={[
                  styles.indicator, 
                  index === currentImageIndex && styles.activeIndicator
                ]} 
              />
            ))}
          </View>
          
          {/* Image count */}
          <View style={styles.imageCount}>
            <Icon name="camera" size={16} color="#fff" />
            <Text style={styles.imageCountText}>
              {currentImageIndex + 1} / {property.images.length}
            </Text>
          </View>
        </View>

        <View style={styles.content}>
          {/* Price and Save Button */}
          <View style={styles.priceSection}>
            <View>
              <Text style={[styles.price, dynamicStyles.text]}>{formatPrice(property.price)}</Text>
              <Text style={[styles.monthlyEstimate, dynamicStyles.textSecondary]}>
                Est. ${calculateMonthlyPayment()}/mo
              </Text>
            </View>
            <TouchableOpacity 
              style={[styles.saveButton, isSaved && styles.savedButton]} 
              onPress={handleSaveToggle}
            >
              <Icon 
                name={isSaved ? 'heart' : 'heart-outline'} 
                size={24} 
                color={isSaved ? '#fff' : '#FF6B6B'} 
              />
              <Text style={[styles.saveButtonText, isSaved && styles.savedButtonText]}>
                {isSaved ? 'Saved' : 'Save'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Address */}
          <TouchableOpacity onPress={openMaps}>
            <Text style={[styles.address, dynamicStyles.text]}>{property.address}</Text>
            <View style={styles.locationRow}>
              <Icon name="location" size={16} color={colors.textSecondary} />
              <Text style={[styles.cityState, dynamicStyles.textSecondary]}>
                {property.city}, {property.state} {property.zipCode}
              </Text>
            </View>
          </TouchableOpacity>

          {/* Property Highlights */}
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false} 
            style={styles.highlightsContainer}
          >
            {propertyHighlights.map((highlight, index) => (
              <View key={index} style={[styles.highlightCard, { backgroundColor: colors.surface }]}>
                <Icon name={highlight.icon as any} size={20} color="#FF6B6B" />
                <Text style={[styles.highlightText, dynamicStyles.text]}>{highlight.label}</Text>
              </View>
            ))}
          </ScrollView>

          {/* Quick Actions */}
          <View style={[styles.quickActions, { borderTopColor: colors.border, borderBottomColor: colors.border }]}>
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => scrollToSection(800)}
            >
              <Icon name="information-circle-outline" size={24} color={colors.text} />
              <Text style={[styles.actionText, dynamicStyles.textSecondary]}>Details</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => setShowCalculator(true)}
            >
              <Icon name="calculator-outline" size={24} color={colors.text} />
              <Text style={[styles.actionText, dynamicStyles.textSecondary]}>Calculator</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={openMaps}
            >
              <Icon name="map-outline" size={24} color={colors.text} />
              <Text style={[styles.actionText, dynamicStyles.textSecondary]}>Map</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => scrollToSection(1200)}
            >
              <Icon name="school-outline" size={24} color={colors.text} />
              <Text style={[styles.actionText, dynamicStyles.textSecondary]}>Schools</Text>
            </TouchableOpacity>
          </View>

          {/* Main Details */}
          <View style={[styles.details, dynamicStyles.sectionBackground]}>
            <View style={styles.detailItem}>
              <Icon name="bed-outline" size={24} color={colors.textSecondary} />
              <Text style={[styles.detailValue, dynamicStyles.text]}>{property.bedrooms}</Text>
              <Text style={[styles.detailLabel, dynamicStyles.textSecondary]}>Beds</Text>
            </View>
            <View style={styles.detailItem}>
              <Icon name="water-outline" size={24} color={colors.textSecondary} />
              <Text style={[styles.detailValue, dynamicStyles.text]}>{property.bathrooms}</Text>
              <Text style={[styles.detailLabel, dynamicStyles.textSecondary]}>Baths</Text>
            </View>
            <View style={styles.detailItem}>
              <Icon name="resize-outline" size={24} color={colors.textSecondary} />
              <Text style={[styles.detailValue, dynamicStyles.text]}>{property.squareFeet.toLocaleString()}</Text>
              <Text style={[styles.detailLabel, dynamicStyles.textSecondary]}>Sq Ft</Text>
            </View>
            <View style={styles.detailItem}>
              <Icon name="calendar-outline" size={24} color={colors.textSecondary} />
              <Text style={[styles.detailValue, dynamicStyles.text]}>{property.yearBuilt}</Text>
              <Text style={[styles.detailLabel, dynamicStyles.textSecondary]}>Built</Text>
            </View>
          </View>

          {/* Description */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, dynamicStyles.text]}>About this home</Text>
            <Text style={[styles.description, dynamicStyles.textSecondary]}>{property.description}</Text>
          </View>

          {/* Features */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, dynamicStyles.text]}>Features & Amenities</Text>
            <View style={styles.featuresGrid}>
              {property.features.map((feature, index) => (
                <View key={index} style={styles.featureItem}>
                  <Icon name="checkmark-circle" size={20} color="#4CCC93" />
                  <Text style={[styles.featureText, dynamicStyles.textSecondary]}>{feature}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Property Details */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, dynamicStyles.text]}>Property Details</Text>
            <View style={styles.propertyDetailsGrid}>
              <View style={[styles.propertyDetail, dynamicStyles.border]}>
                <Text style={[styles.propertyDetailLabel, dynamicStyles.textSecondary]}>Type</Text>
                <Text style={[styles.propertyDetailValue, dynamicStyles.text]}>{property.propertyType}</Text>
              </View>
              <View style={[styles.propertyDetail, dynamicStyles.border]}>
                <Text style={[styles.propertyDetailLabel, dynamicStyles.textSecondary]}>Status</Text>
                <Text style={[styles.propertyDetailValue, dynamicStyles.text]}>{property.status}</Text>
              </View>
              <View style={[styles.propertyDetail, dynamicStyles.border]}>
                <Text style={[styles.propertyDetailLabel, dynamicStyles.textSecondary]}>MLS #</Text>
                <Text style={[styles.propertyDetailValue, dynamicStyles.text]}>{property.mlsNumber}</Text>
              </View>
              <View style={[styles.propertyDetail, dynamicStyles.border]}>
                <Text style={[styles.propertyDetailLabel, dynamicStyles.textSecondary]}>Listed</Text>
                <Text style={[styles.propertyDetailValue, dynamicStyles.text]}>{property.daysOnMarket} days ago</Text>
              </View>
              <View style={[styles.propertyDetail, dynamicStyles.border]}>
                <Text style={[styles.propertyDetailLabel, dynamicStyles.textSecondary]}>Lot Size</Text>
                <Text style={[styles.propertyDetailValue, dynamicStyles.text]}>{property.lotSize} acres</Text>
              </View>
              <View style={[styles.propertyDetail, dynamicStyles.border]}>
                <Text style={[styles.propertyDetailLabel, dynamicStyles.textSecondary]}>HOA</Text>
                <Text style={[styles.propertyDetailValue, dynamicStyles.text]}>$0/mo</Text>
              </View>
            </View>
          </View>

          {/* Neighborhood */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, dynamicStyles.text]}>Neighborhood</Text>
            <View style={[styles.neighborhoodInfo, dynamicStyles.sectionBackground]}>
              <View style={styles.neighborhoodItem}>
                <Icon name="walk" size={20} color={colors.textSecondary} />
                <Text style={[styles.neighborhoodText, dynamicStyles.textSecondary]}>Walk Score: 85</Text>
              </View>
              <View style={styles.neighborhoodItem}>
                <Icon name="bicycle" size={20} color={colors.textSecondary} />
                <Text style={[styles.neighborhoodText, dynamicStyles.textSecondary]}>Bike Score: 72</Text>
              </View>
              <View style={styles.neighborhoodItem}>
                <Icon name="bus" size={20} color={colors.textSecondary} />
                <Text style={[styles.neighborhoodText, dynamicStyles.textSecondary]}>Transit Score: 65</Text>
              </View>
            </View>
          </View>

          {/* Schools */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, dynamicStyles.text]}>Nearby Schools</Text>
            <View style={[styles.schoolsList, dynamicStyles.sectionBackground]}>
              <View style={[styles.schoolItem, dynamicStyles.border]}>
                <View style={styles.schoolRating}>
                  <Text style={styles.schoolRatingText}>8</Text>
                </View>
                <View style={styles.schoolInfo}>
                  <Text style={[styles.schoolName, dynamicStyles.text]}>Lincoln Elementary</Text>
                  <Text style={[styles.schoolGrades, dynamicStyles.textSecondary]}>Grades K-5 • 0.5 mi</Text>
                </View>
              </View>
              <View style={[styles.schoolItem, dynamicStyles.border]}>
                <View style={styles.schoolRating}>
                  <Text style={styles.schoolRatingText}>7</Text>
                </View>
                <View style={styles.schoolInfo}>
                  <Text style={[styles.schoolName, dynamicStyles.text]}>Washington Middle School</Text>
                  <Text style={[styles.schoolGrades, dynamicStyles.textSecondary]}>Grades 6-8 • 1.2 mi</Text>
                </View>
              </View>
              <View style={[styles.schoolItem, dynamicStyles.border]}>
                <View style={[styles.schoolRating, styles.schoolRatingHigh]}>
                  <Text style={styles.schoolRatingText}>9</Text>
                </View>
                <View style={styles.schoolInfo}>
                  <Text style={[styles.schoolName, dynamicStyles.text]}>Roosevelt High School</Text>
                  <Text style={[styles.schoolGrades, dynamicStyles.textSecondary]}>Grades 9-12 • 2.0 mi</Text>
                </View>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Fixed Footer */}
      <View style={[styles.footer, { backgroundColor: colors.background, borderTopColor: colors.border }]}>
        <TouchableOpacity 
          style={styles.contactButton}
          onPress={() => setShowContactForm(true)}
        >
          <Icon name="chatbubbles" size={20} color="#fff" />
          <Text style={styles.contactButtonText}>Contact Agent</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.scheduleButton, { backgroundColor: colors.background }]}>
          <Icon name="calendar" size={20} color="#FF6B6B" />
          <Text style={styles.scheduleButtonText}>Schedule Tour</Text>
        </TouchableOpacity>
      </View>

      {/* Full Screen Gallery Modal */}
      <Modal visible={showGallery} transparent={true} animationType="fade">
        <View style={styles.galleryModal}>
          <TouchableOpacity 
            style={styles.closeButton} 
            onPress={() => setShowGallery(false)}
          >
            <Icon name="close" size={30} color="#fff" />
          </TouchableOpacity>
          <FlatList
            data={property.images}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            renderItem={({ item }) => (
              <Image source={{ uri: item }} style={styles.fullScreenImage} />
            )}
            keyExtractor={(_, index) => index.toString()}
          />
        </View>
      </Modal>

      {/* Mortgage Calculator Modal */}
      <Modal visible={showCalculator} transparent={true} animationType="slide">
        <View style={dynamicStyles.modalOverlay}>
          <View style={[styles.calculatorModal, dynamicStyles.modalBackground]}>
            <View style={[styles.modalHeader, dynamicStyles.border]}>
              <Text style={[styles.modalTitle, dynamicStyles.text]}>Mortgage Calculator</Text>
              <TouchableOpacity onPress={() => setShowCalculator(false)}>
                <Icon name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>
            
            <View style={styles.calculatorContent}>
              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, dynamicStyles.textSecondary]}>Home Price</Text>
                <Text style={[styles.priceDisplay, dynamicStyles.text]}>{formatPrice(property.price)}</Text>
              </View>
              
              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, dynamicStyles.textSecondary]}>Down Payment (20%)</Text>
                <Text style={[styles.priceDisplay, dynamicStyles.text]}>{formatPrice(property.price * 0.2)}</Text>
              </View>
              
              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, dynamicStyles.textSecondary]}>Loan Amount</Text>
                <TextInput
                  style={dynamicStyles.input}
                  value={loanAmount}
                  onChangeText={setLoanAmount}
                  placeholder={`${property.price * 0.8}`}
                  placeholderTextColor={colors.textSecondary}
                  keyboardType="numeric"
                />
              </View>
              
              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, dynamicStyles.textSecondary]}>Interest Rate (%)</Text>
                <TextInput
                  style={dynamicStyles.input}
                  value={interestRate}
                  onChangeText={setInterestRate}
                  placeholder="4.5"
                  placeholderTextColor={colors.textSecondary}
                  keyboardType="numeric"
                />
              </View>
              
              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, dynamicStyles.textSecondary]}>Loan Term (years)</Text>
                <TextInput
                  style={dynamicStyles.input}
                  value={loanTerm}
                  onChangeText={setLoanTerm}
                  placeholder="30"
                  placeholderTextColor={colors.textSecondary}
                  keyboardType="numeric"
                />
              </View>
              
              <View style={[styles.calculatorResult, { backgroundColor: colors.surface }]}>
                <Text style={[styles.resultLabel, dynamicStyles.textSecondary]}>Monthly Payment</Text>
                <Text style={styles.resultAmount}>${calculateMonthlyPayment()}</Text>
              </View>
            </View>
          </View>
        </View>
      </Modal>

      {/* Contact Form Modal */}
      <Modal visible={showContactForm} transparent={true} animationType="slide">
        <KeyboardAvoidingView 
          style={dynamicStyles.modalOverlay}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <View style={[styles.contactModal, dynamicStyles.modalBackground]}>
            <View style={[styles.modalHeader, dynamicStyles.border]}>
              <Text style={[styles.modalTitle, dynamicStyles.text]}>Contact Agent</Text>
              <TouchableOpacity onPress={() => setShowContactForm(false)}>
                <Icon name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.contactContent}>
              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, dynamicStyles.textSecondary]}>Name</Text>
                <TextInput
                  style={dynamicStyles.input}
                  value={contactForm.name}
                  onChangeText={(text) => setContactForm({...contactForm, name: text})}
                  placeholder="Your name"
                  placeholderTextColor={colors.textSecondary}
                />
              </View>
              
              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, dynamicStyles.textSecondary]}>Email</Text>
                <TextInput
                  style={dynamicStyles.input}
                  value={contactForm.email}
                  onChangeText={(text) => setContactForm({...contactForm, email: text})}
                  placeholder="your@email.com"
                  placeholderTextColor={colors.textSecondary}
                  keyboardType="email-address"
                />
              </View>
              
              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, dynamicStyles.textSecondary]}>Phone</Text>
                <TextInput
                  style={dynamicStyles.input}
                  value={contactForm.phone}
                  onChangeText={(text) => setContactForm({...contactForm, phone: text})}
                  placeholder="(555) 123-4567"
                  placeholderTextColor={colors.textSecondary}
                  keyboardType="phone-pad"
                />
              </View>
              
              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, dynamicStyles.textSecondary]}>Message</Text>
                <TextInput
                  style={[dynamicStyles.input, styles.textArea]}
                  value={contactForm.message}
                  onChangeText={(text) => setContactForm({...contactForm, message: text})}
                  placeholder="Your message"
                  placeholderTextColor={colors.textSecondary}
                  multiline
                  numberOfLines={4}
                />
              </View>
              
              <TouchableOpacity 
                style={styles.submitButton}
                onPress={handleContactSubmit}
              >
                <Text style={styles.submitButtonText}>Send Message</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  imageContainer: {
    height: 300,
    position: 'relative',
  },
  image: {
    width: screenWidth,
    height: 300,
    resizeMode: 'cover',
  },
  imageIndicators: {
    position: 'absolute',
    bottom: 20,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  indicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.5)',
    marginHorizontal: 4,
  },
  activeIndicator: {
    backgroundColor: '#fff',
  },
  imageCount: {
    position: 'absolute',
    top: 20,
    right: 20,
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  imageCountText: {
    color: '#fff',
    marginLeft: 6,
    fontSize: 14,
  },
  content: {
    padding: 20,
    paddingBottom: 100,
  },
  priceSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 15,
  },
  price: {
    fontSize: 32,
    fontWeight: 'bold',
  },
  monthlyEstimate: {
    fontSize: 16,
    marginTop: 4,
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#FF6B6B',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  savedButton: {
    backgroundColor: '#FF6B6B',
    borderColor: '#FF6B6B',
  },
  saveButtonText: {
    color: '#FF6B6B',
    marginLeft: 6,
    fontSize: 16,
    fontWeight: '600',
  },
  savedButtonText: {
    color: '#fff',
  },
  address: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 4,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  cityState: {
    fontSize: 16,
    marginLeft: 4,
  },
  highlightsContainer: {
    marginHorizontal: -20,
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  highlightCard: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    marginRight: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  highlightText: {
    marginLeft: 8,
    fontSize: 14,
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 20,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    marginBottom: 20,
  },
  actionButton: {
    alignItems: 'center',
  },
  actionText: {
    fontSize: 12,
    marginTop: 4,
  },
  details: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 20,
    borderRadius: 12,
    marginBottom: 25,
  },
  detailItem: {
    alignItems: 'center',
  },
  detailValue: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 4,
  },
  detailLabel: {
    fontSize: 12,
    marginTop: 2,
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
  },
  featuresGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '50%',
    marginBottom: 12,
  },
  featureText: {
    fontSize: 16,
    marginLeft: 10,
  },
  propertyDetailsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  propertyDetail: {
    width: '50%',
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  propertyDetailLabel: {
    fontSize: 14,
    marginBottom: 4,
  },
  propertyDetailValue: {
    fontSize: 16,
    fontWeight: '500',
  },
  neighborhoodInfo: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 20,
    borderRadius: 12,
  },
  neighborhoodItem: {
    alignItems: 'center',
  },
  neighborhoodText: {
    marginTop: 8,
    fontSize: 14,
  },
  schoolsList: {
    borderRadius: 12,
    padding: 15,
  },
  schoolItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  schoolRating: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FF9500',
    justifyContent: 'center',
    alignItems: 'center',
  },
  schoolRatingText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  schoolInfo: {
    marginLeft: 12,
    flex: 1,
  },
  schoolName: {
    fontSize: 16,
    fontWeight: '600',
  },
  schoolGrades: {
    fontSize: 14,
    marginTop: 2,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    padding: 20,
    borderTopWidth: 1,
  },
  contactButton: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#FF6B6B',
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  contactButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  scheduleButton: {
    flex: 1,
    flexDirection: 'row',
    borderWidth: 2,
    borderColor: '#FF6B6B',
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scheduleButtonText: {
    color: '#FF6B6B',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  galleryModal: {
    flex: 1,
    backgroundColor: '#000',
    justifyContent: 'center',
  },
  closeButton: {
    position: 'absolute',
    top: 50,
    right: 20,
    zIndex: 1,
    padding: 10,
  },
  fullScreenImage: {
    width: screenWidth,
    height: screenHeight,
    resizeMode: 'contain',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  calculatorModal: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 40,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  calculatorContent: {
    padding: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 16,
  },
  priceDisplay: {
    fontSize: 18,
    fontWeight: '600',
  },
  calculatorResult: {
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 20,
  },
  resultLabel: {
    fontSize: 16,
    marginBottom: 8,
  },
  resultAmount: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FF6B6B',
  },
  contactModal: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
  },
  contactContent: {
    padding: 20,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  submitButton: {
    backgroundColor: '#FF6B6B',
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  schoolRatingHigh: {
    backgroundColor: '#4CCC93',
  },
});

export default PropertyDetailsEnhanced;