
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface StepDataRecord {
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

    console.log('Starting step data sync task...');

    // Get all users with profiles
    const { data: users, error: usersError } = await supabase
      .from('user_profile')
      .select('id');

    if (usersError) {
      console.error('Error fetching users:', usersError);
      throw usersError;
    }

    console.log(`Found ${users?.length || 0} users to sync step data`);

    let totalSynced = 0;
    const failedUsers: string[] = [];

    for (const user of users || []) {
      try {
        // Simulate fetching step data from health APIs
        // In a real implementation, this would connect to HealthKit/Google Fit
        const stepRecords = await fetchStepDataForUser(user.id);
        
        if (stepRecords.length > 0) {
          // Attempt to upsert records with retry logic
          let retryCount = 0;
          const maxRetries = 3;
          
          while (retryCount < maxRetries) {
            try {
              const { error: upsertError } = await supabase
                .from('sensor_samples')
                .upsert(
                  stepRecords,
                  { 
                    onConflict: 'user_id,timestamp,metric_type',
                    ignoreDuplicates: false 
                  }
                );

              if (upsertError) {
                throw upsertError;
              }
              
              totalSynced += stepRecords.length;
              console.log(`Synced ${stepRecords.length} step records for user ${user.id}`);
              break;
              
            } catch (error) {
              retryCount++;
              console.error(`Attempt ${retryCount} failed for user ${user.id}:`, error);
              
              if (retryCount >= maxRetries) {
                failedUsers.push(user.id);
                console.error(`Failed to sync step data for user ${user.id} after ${maxRetries} attempts`);
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

    console.log(`Step data sync completed. Total records synced: ${totalSynced}`);
    
    if (failedUsers.length > 0) {
      console.log(`Failed to sync data for ${failedUsers.length} users: ${failedUsers.join(', ')}`);
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: `Synced step data for ${(users?.length || 0) - failedUsers.length} users`,
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
    console.error('Error in sync-step-data function:', error);
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

// Simulate fetching step data from health APIs
async function fetchStepDataForUser(userId: string): Promise<StepDataRecord[]> {
  // This is a simulation - in a real app, you would:
  // 1. Check user's health permissions
  // 2. Connect to HealthKit (iOS) or Google Fit (Android)
  // 3. Fetch today's cumulative step count
  
  console.log(`Fetching step data for user: ${userId}`);
  
  // Get today's date at midnight for consistent daily tracking
  const today = new Date();
  today.setHours(23, 59, 59, 999); // End of day timestamp
  
  // Simulate step data for today
  // In real implementation, this would be actual health API calls
  const mockStepRecords: StepDataRecord[] = [];
  
  // Generate a mock step record for today (90% chance of having step data)
  if (Math.random() > 0.1) {
    const dailySteps = Math.floor(Math.random() * 8000) + 2000; // Random steps between 2,000-10,000
    
    mockStepRecords.push({
      metric_type: 'steps',
      metric_value: dailySteps,
      timestamp: today.toISOString(),
      user_id: userId
    });
  }
  
  console.log(`Generated ${mockStepRecords.length} mock step records for user ${userId}`);
  return mockStepRecords;
}
