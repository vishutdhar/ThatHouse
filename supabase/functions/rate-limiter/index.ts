import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Simple in-memory rate limiter
const rateLimitMap = new Map<string, { count: number; resetTime: number }>()

const RATE_LIMIT = 100 // requests per window
const WINDOW_MS = 60 * 1000 // 1 minute

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    )

    // Get user from JWT
    const { data: { user } } = await supabaseClient.auth.getUser()
    const identifier = user?.id || req.headers.get('x-forwarded-for') || 'anonymous'

    // Check rate limit
    const now = Date.now()
    const userLimit = rateLimitMap.get(identifier)

    if (userLimit) {
      if (now < userLimit.resetTime) {
        if (userLimit.count >= RATE_LIMIT) {
          return new Response(
            JSON.stringify({ error: 'Rate limit exceeded' }),
            {
              status: 429,
              headers: {
                ...corsHeaders,
                'Content-Type': 'application/json',
                'X-RateLimit-Limit': RATE_LIMIT.toString(),
                'X-RateLimit-Remaining': '0',
                'X-RateLimit-Reset': userLimit.resetTime.toString(),
              },
            }
          )
        }
        userLimit.count++
      } else {
        // Reset window
        userLimit.count = 1
        userLimit.resetTime = now + WINDOW_MS
      }
    } else {
      // First request
      rateLimitMap.set(identifier, {
        count: 1,
        resetTime: now + WINDOW_MS,
      })
    }

    // Clean up old entries periodically
    if (rateLimitMap.size > 1000) {
      for (const [key, value] of rateLimitMap.entries()) {
        if (now > value.resetTime) {
          rateLimitMap.delete(key)
        }
      }
    }

    return new Response(
      JSON.stringify({ success: true }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
          'X-RateLimit-Limit': RATE_LIMIT.toString(),
          'X-RateLimit-Remaining': (RATE_LIMIT - (rateLimitMap.get(identifier)?.count || 0)).toString(),
        },
      }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  }
})