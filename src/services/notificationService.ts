import { supabase } from '../lib/supabase';
import AsyncStorage from '@react-native-async-storage/async-storage';

export async function checkPriceDropsForSavedProperties() {
  const userId = await AsyncStorage.getItem('userId');
  if (!userId) return;

  // Get user's saved properties that had price drops
  const { data: priceDrops } = await supabase
    .from('saved_properties')
    .select(`
      property_id,
      properties!inner (
        id,
        address,
        price,
        previous_price,
        is_price_reduced
      )
    `)
    .eq('user_id', userId)
    .eq('properties.is_price_reduced', true);

  if (priceDrops && priceDrops.length > 0) {
    // Return properties with price drops
    return priceDrops.map(item => ({
      propertyId: item.property_id,
      address: item.properties.address,
      currentPrice: item.properties.price,
      previousPrice: item.properties.previous_price,
      savings: item.properties.previous_price - item.properties.price
    }));
  }

  return [];
}