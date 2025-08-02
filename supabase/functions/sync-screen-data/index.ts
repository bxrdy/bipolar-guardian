
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface ScreenDataRecord {
  metric_type: string;
  metric_value: number;
  timestamp: string;
  user_id: string;
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    console.log('Starting screen usage data sync task...');

    // Get all users with profiles
    const { data: users, error: usersError } = await supabase
      .from('user_profile')
      .select('id');

    if (usersError) {
      console.error('Error fetching users:', usersError);
      throw usersError;
    }

    console.log(`Found ${users?.length || 0} users to sync screen usage data`);

    let totalSynced = 0;
    const failedUsers: string[] = [];

    for (const user of users || []) {
      try {
        // Simulate fetching screen usage data from platform APIs
        // In a real implementation, this would connect to UsageStatsManager/ScreenTime
        const screenRecords = await fetchScreenDataForUser(user.id);
        
        if (screenRecords.length > 0) {
          // Attempt to upsert records with retry logic
          let retryCount = 0;
          const maxRetries = 3;
          
          while (retryCount < maxRetries) {
            try {
              const { error: upsertError } = await supabase
                .from('sensor_samples')
                .upsert(
                  screenRecords,
                  { 
                    onConflict: 'user_id,timestamp,metric_type',
                    ignoreDuplicates: false 
                  }
                );

              if (upsertError) {
                throw upsertError;
              }
              
              totalSynced += screenRecords.length;
              console.log(`Synced ${screenRecords.length} screen usage records for user ${user.id}`);
              break;
              
            } catch (error) {
              retryCount++;
              console.error(`Attempt ${retryCount} failed for user ${user.id}:`, error);
              
              if (retryCount >= maxRetries) {
                failedUsers.push(user.id);
                console.error(`Failed to sync screen data for user ${user.id} after ${maxRetries} attempts`);
              } else {
                // Wait before retry (exponential backoff)
                await new Promise(resolve => setTimeout(resolve, Math.pow(2, retryCount) * 1000));
              }
            }
          }
        }
      } catch (userError) {
        console.error(`Error processing user ${user.id}:`, userError);
        failedUsers.push(user.id);
      }
    }

    console.log(`Screen usage data sync completed. Total records synced: ${totalSynced}`);
    
    if (failedUsers.length > 0) {
      console.log(`Failed to sync data for ${failedUsers.length} users: ${failedUsers.join(', ')}`);
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: `Synced screen usage data for ${(users?.length || 0) - failedUsers.length} users`,
        totalRecordsSynced: totalSynced,
        failedUsers: failedUsers,
        timestamp: new Date().toISOString()
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    );

  } catch (error) {
    console.error('Error in sync-screen-data function:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});

// Simulate fetching screen usage data from platform APIs
async function fetchScreenDataForUser(userId: string): Promise<ScreenDataRecord[]> {
  // This is a simulation - in a real app, you would:
  // 1. Check user's device permissions for usage stats
  // 2. Connect to UsageStatsManager (Android) or ScreenTime API (iOS)
  // 3. Fetch the past hour's screen unlock count and screen time
  
  console.log(`Fetching screen usage data for user: ${userId}`);
  
  // Get current time for hourly tracking
  const now = new Date();
  const timestamp = now.toISOString();
  
  // Simulate screen usage data for the past hour
  // In real implementation, this would be actual platform API calls
  const mockScreenRecords: ScreenDataRecord[] = [];
  
  // Generate mock screen unlock count (0-20 unlocks per hour)
  const unlockCount = Math.floor(Math.random() * 21);
  
  // Generate mock screen time in minutes (0-60 minutes per hour)
  const screenMinutes = Math.floor(Math.random() * 61);
  
  // Create separate records for each metric type
  mockScreenRecords.push({
    metric_type: 'screen_unlocks',
    metric_value: unlockCount,
    timestamp: timestamp,
    user_id: userId
  });

  mockScreenRecords.push({
    metric_type: 'screen_minutes',
    metric_value: screenMinutes,
    timestamp: timestamp,
    user_id: userId
  });
  
  console.log(`Generated ${mockScreenRecords.length} mock screen usage records for user ${userId}: ${unlockCount} unlocks, ${screenMinutes} minutes`);
  return mockScreenRecords;
}
