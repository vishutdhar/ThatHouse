import { supabase } from '../lib/supabase';
import { fetchPropertiesFromSimplyRETS } from './simplyRetsService';

export async function syncPropertyPrices() {
  try {
    console.log('Starting price sync...');
    
    // Fetch latest properties from SimplyRETS
    const simplyRetsProperties = await fetchPropertiesFromSimplyRETS({
      limit: 500, // Adjust based on your needs
      cities: ['Houston']
    });
    
    // For each property, check if price has changed
    for (const srProperty of simplyRetsProperties) {
      const propertyId = `sr_${srProperty.mlsId}`;
      
      // Get current price from our database
      const { data: currentProperty } = await supabase
        .from('properties')
        .select('price')
        .eq('id', propertyId)
        .single();
      
      if (currentProperty && currentProperty.price !== srProperty.listPrice) {
        // Update the price - this will trigger our database function
        const { error } = await supabase
          .from('properties')
          .update({ price: srProperty.listPrice })
          .eq('id', propertyId);
        
        if (error) {
          console.error(`Failed to update price for ${propertyId}:`, error);
        } else {
          console.log(`Updated price for ${propertyId}: ${currentProperty.price} -> ${srProperty.listPrice}`);
        }
      }
    }
    
    console.log('Price sync completed');
    return { success: true };
  } catch (error) {
    console.error('Price sync failed:', error);
    return { success: false, error };
  }
}