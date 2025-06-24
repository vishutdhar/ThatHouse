import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Create Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Fetch properties from SimplyRETS
    const simplyRetsAuth = btoa('simplyrets:simplyrets')
    const response = await fetch('https://api.simplyrets.com/properties?limit=500', {
      headers: {
        'Authorization': `Basic ${simplyRetsAuth}`
      }
    })

    if (!response.ok) {
      throw new Error(`SimplyRETS API error: ${response.status}`)
    }

    const properties = await response.json()
    let updatedCount = 0

    // Process each property
    for (const property of properties) {
      const propertyId = `sr_${property.mlsId}`
      
      // Get current price from database
      const { data: currentProperty } = await supabaseClient
        .from('properties')
        .select('price')
        .eq('id', propertyId)
        .single()
      
      if (currentProperty && currentProperty.price !== property.listPrice) {
        // Update price - this will trigger the price tracking function
        const { error } = await supabaseClient
          .from('properties')
          .update({ price: property.listPrice })
          .eq('id', propertyId)
        
        if (!error) {
          updatedCount++
        }
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Synced ${properties.length} properties, updated ${updatedCount} prices` 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      },
    )
  }
})