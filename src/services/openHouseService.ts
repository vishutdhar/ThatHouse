import { supabase } from '../lib/supabase';

export interface OpenHouse {
  id?: string;
  propertyId: string;
  startTime: string;
  endTime: string;
  notes?: string;
}

export async function scheduleOpenHouse(openHouse: OpenHouse) {
  const { data, error } = await supabase
    .from('property_open_houses')
    .insert({
      property_id: openHouse.propertyId,
      start_time: openHouse.startTime,
      end_time: openHouse.endTime,
      notes: openHouse.notes
    })
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

export async function updateOpenHouse(id: string, updates: Partial<OpenHouse>) {
  const { data, error } = await supabase
    .from('property_open_houses')
    .update({
      start_time: updates.startTime,
      end_time: updates.endTime,
      notes: updates.notes
    })
    .eq('id', id)
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

export async function cancelOpenHouse(id: string) {
  const { error } = await supabase
    .from('property_open_houses')
    .delete()
    .eq('id', id);
  
  if (error) throw error;
  return { success: true };
}

export async function getUpcomingOpenHouses(propertyId?: string) {
  let query = supabase
    .from('property_open_houses')
    .select('*')
    .gte('start_time', new Date().toISOString())
    .order('start_time', { ascending: true });
  
  if (propertyId) {
    query = query.eq('property_id', propertyId);
  }
  
  const { data, error } = await query;
  
  if (error) throw error;
  return data;
}