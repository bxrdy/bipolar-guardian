
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
)

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get the authorization header
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'No authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Get user from token
    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: userError } = await supabase.auth.getUser(token)
    
    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: 'Invalid token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log(`Exporting data for user: ${user.id}`)

    // Export user profile data
    const { data: profile } = await supabase
      .from('user_profile')
      .select('*')
      .eq('id', user.id)
      .single()

    // Export sensor samples
    const { data: sensorSamples } = await supabase
      .from('sensor_samples')
      .select('*')
      .eq('user_id', user.id)

    // Export daily summaries
    const { data: dailySummaries } = await supabase
      .from('daily_summary')
      .select('*')
      .eq('user_id', user.id)

    // Compile all user data
    const userData = {
      exportDate: new Date().toISOString(),
      userId: user.id,
      profile: profile,
      sensorSamples: sensorSamples || [],
      dailySummaries: dailySummaries || [],
      authInfo: {
        email: user.email,
        createdAt: user.created_at,
        lastSignIn: user.last_sign_in_at
      }
    }

    // Return the data as downloadable JSON
    return new Response(
      JSON.stringify(userData, null, 2),
      {
        status: 200,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
          'Content-Disposition': `attachment; filename="user-data-${user.id}-${Date.now()}.json"`
        }
      }
    )

  } catch (error) {
    console.error('Error exporting user data:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
