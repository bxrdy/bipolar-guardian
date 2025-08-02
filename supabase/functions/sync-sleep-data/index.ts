
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface SleepDataRecord {
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

    console.log('Starting sleep data sync task...');

    // Get all users with profiles
    const { data: users, error: usersError } = await supabase
      .from('user_profile')
      .select('id');

    if (usersError) {
      console.error('Error fetching users:', usersError);
      throw usersError;
    }

    console.log(`Found ${users?.length || 0} users to sync`);

    let totalSynced = 0;
    const failedUsers: string[] = [];

    for (const user of users || []) {
      try {
        // Simulate fetching sleep data from health APIs
        // In a real implementation, this would connect to HealthKit/Google Fit
        const sleepRecords = await fetchSleepDataForUser(user.id);
        
        if (sleepRecords.length > 0) {
          // Attempt to upsert records with retry logic
          let retryCount = 0;
          const maxRetries = 3;
          
          while (retryCount < maxRetries) {
            try {
              const { error: upsertError } = await supabase
                .from('sensor_samples')
                .upsert(
                  sleepRecords,
                  { 
                    onConflict: 'user_id,timestamp,metric_type',
                    ignoreDuplicates: false 
                  }
                );

              if (upsertError) {
                throw upsertError;
              }
              
              totalSynced += sleepRecords.length;
              console.log(`Synced ${sleepRecords.length} sleep records for user ${user.id}`);
              break;
              
            } catch (error) {
              retryCount++;
              console.error(`Attempt ${retryCount} failed for user ${user.id}:`, error);
              
              if (retryCount >= maxRetries) {
                failedUsers.push(user.id);
                console.error(`Failed to sync sleep data for user ${user.id} after ${maxRetries} attempts`);
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

    console.log(`Sleep data sync completed. Total records synced: ${totalSynced}`);
    
    if (failedUsers.length > 0) {
      console.log(`Failed to sync data for ${failedUsers.length} users: ${failedUsers.join(', ')}`);
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: `Synced sleep data for ${(users?.length || 0) - failedUsers.length} users`,
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
    console.error('Error in sync-sleep-data function:', error);
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

// Simulate fetching sleep data from health APIs
async function fetchSleepDataForUser(userId: string): Promise<SleepDataRecord[]> {
  // This is a simulation - in a real app, you would:
  // 1. Check user's health permissions
  // 2. Connect to HealthKit (iOS) or Google Fit (Android)
  // 3. Fetch actual sleep data for the past 24 hours
  
  console.log(`Fetching sleep data for user: ${userId}`);
  
  // Calculate 24 hours ago
  const twentyFourHoursAgo = new Date();
  twentyFourHoursAgo.setHours(twentyFourHoursAgo.getHours() - 24);
  
  // Simulate sleep records for the past 24 hours
  // In real implementation, this would be actual health API calls
  const mockSleepRecords: SleepDataRecord[] = [];
  
  // Generate a mock sleep record (simulating one sleep session)
  if (Math.random() > 0.3) { // 70% chance of having sleep data
    const sleepEndTime = new Date();
    sleepEndTime.setHours(sleepEndTime.getHours() - Math.floor(Math.random() * 12)); // Random time in last 12 hours
    
    const sleepDuration = 6 + Math.random() * 4; // Random sleep between 6-10 hours
    
    mockSleepRecords.push({
      metric_type: 'sleep_hours',
      metric_value: Math.round(sleepDuration * 100) / 100, // Round to 2 decimal places
      timestamp: sleepEndTime.toISOString(),
      user_id: userId
    });
  }
  
  console.log(`Generated ${mockSleepRecords.length} mock sleep records for user ${userId}`);
  return mockSleepRecords;
}
