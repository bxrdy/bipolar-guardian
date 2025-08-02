
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
    console.log('Risk notification function triggered');

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get the webhook payload (triggered by database change)
    const payload = await req.json();
    console.log('Received payload:', payload);

    // Check if this is an INSERT operation with amber or red risk level
    if (payload.type === 'INSERT' && payload.record) {
      const { risk_level, user_id } = payload.record;
      
      if (risk_level === 'amber' || risk_level === 'red') {
        console.log(`Checking alert settings for user ${user_id} with ${risk_level} risk level`);
        
        // Check if notifications are snoozed for this user
        const { data: alertSettings } = await supabase
          .from('alert_settings')
          .select('alert_snooze_until')
          .eq('user_id', user_id)
          .single();

        const now = new Date();
        
        // Check if alerts are currently snoozed
        if (alertSettings?.alert_snooze_until) {
          const snoozeUntil = new Date(alertSettings.alert_snooze_until);
          
          if (now < snoozeUntil) {
            console.log(`Notifications snoozed for user ${user_id} until ${snoozeUntil}`);
            return new Response(
              JSON.stringify({ 
                message: 'Notification skipped - alerts are snoozed',
                user_id,
                snoozed_until: snoozeUntil
              }),
              { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
          } else {
            // Snooze period has expired, reset the field to NULL
            console.log(`Snooze period expired for user ${user_id}, resetting snooze setting`);
            await supabase
              .from('alert_settings')
              .update({ 
                alert_snooze_until: null,
                updated_at: now.toISOString()
              })
              .eq('user_id', user_id);
          }
        }
        
        // Proceed with sending notification
        console.log(`Sending ${risk_level} risk notification to user ${user_id}`);
        
        // Here you would integrate with your push notification service
        // For now, we'll log the notification that would be sent
        const notificationMessage = 'Heads‑up — your patterns suggest elevated risk today. Tap for tips.';
        
        console.log(`Push notification would be sent: ${notificationMessage}`);
        
        // In a real implementation, you'd call your push notification service here
        // Examples: Firebase Cloud Messaging, OneSignal, Expo Push, etc.
        // await sendPushNotification(user_id, notificationMessage);
        
        return new Response(
          JSON.stringify({ 
            success: true, 
            message: `Risk notification sent for ${risk_level} level`,
            user_id,
            notification: notificationMessage
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    return new Response(
      JSON.stringify({ message: 'No notification needed' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in risk notification function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
