import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Starting scheduled baseline updates...');

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Call the recalculate-baseline function to process all users who need updates
    const { data, error } = await supabase.functions.invoke('recalculate-baseline', {
      body: {} // No specific user_id means process all users that need updates
    });

    if (error) {
      console.error('Error in scheduled baseline updates:', error);
      throw error;
    }

    console.log('Scheduled baseline updates completed:', data);

    return new Response(
      JSON.stringify({ 
        message: 'Scheduled baseline updates completed successfully',
        result: data
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in scheduled baseline updates:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});