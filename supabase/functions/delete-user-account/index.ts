
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { Resend } from 'npm:resend@2.0.0'
import { getSecureCORSHeaders } from '../_shared/cors.ts'
import { handleSecureError } from '../_shared/errorHandler.ts'
import { validateSecurity, createSecureResponse } from '../_shared/securityHeaders.ts'
import { checkRateLimit } from '../_shared/rateLimiter.ts'

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
)

const resend = new Resend(Deno.env.get('RESEND_API_KEY'))

Deno.serve(async (req) => {
  try {
    // Generate secure CORS headers
    const corsHeaders = getSecureCORSHeaders(req);
    
    // Handle CORS preflight requests
    if (req.method === 'OPTIONS') {
      return createSecureResponse(null, { headers: corsHeaders });
    }

    // Validate security (CSRF, origin, method)
    const securityCheck = validateSecurity(req, {
      requireCSRF: true,
      requireOrigin: true,
      allowedMethods: ['POST', 'DELETE']
    });
    
    if (!securityCheck.valid) {
      return handleSecureError(
        new Error(securityCheck.error || 'Security validation failed'),
        { operation: 'delete_account_security' },
        'delete-user-account',
        corsHeaders
      );
    }

    // Apply rate limiting (CRITICAL level - very strict)
    const rateLimitCheck = checkRateLimit(req, 'delete-user-account', 'CRITICAL', corsHeaders);
    if (!rateLimitCheck.allowed) {
      return rateLimitCheck.response!;
    }

    // Get the authorization header
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return handleSecureError(
        new Error('Authentication required'),
        { operation: 'delete_account_auth' },
        'delete-user-account',
        corsHeaders
      );
    }

    // Get user from token
    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: userError } = await supabase.auth.getUser(token)
    
    if (userError || !user) {
      return handleSecureError(
        new Error('Invalid authentication token'),
        { operation: 'delete_account_auth' },
        'delete-user-account',
        corsHeaders
      );
    }

    console.log(`Deleting account for user: ${user.id}`)

    // Get user email before deletion
    const userEmail = user.email

    // Delete user data in order (respecting foreign key constraints)
    
    // Delete sensor samples
    const { error: sensorError } = await supabase
      .from('sensor_samples')
      .delete()
      .eq('user_id', user.id)

    if (sensorError) {
      console.error('Error deleting sensor samples:', sensorError)
    }

    // Delete daily summaries
    const { error: summaryError } = await supabase
      .from('daily_summary')
      .delete()
      .eq('user_id', user.id)

    if (summaryError) {
      console.error('Error deleting daily summaries:', summaryError)
    }

    // Delete baseline metrics
    const { error: baselineError } = await supabase
      .from('baseline_metrics')
      .delete()
      .eq('user_id', user.id)

    if (baselineError) {
      console.error('Error deleting baseline metrics:', baselineError)
    }

    // Delete alert settings
    const { error: alertError } = await supabase
      .from('alert_settings')
      .delete()
      .eq('user_id', user.id)

    if (alertError) {
      console.error('Error deleting alert settings:', alertError)
    }

    // Delete user profile
    const { error: profileError } = await supabase
      .from('user_profile')
      .delete()
      .eq('id', user.id)

    if (profileError) {
      console.error('Error deleting user profile:', profileError)
    }

    // Send confirmation email if RESEND_API_KEY is available
    if (resend && userEmail) {
      try {
        await resend.emails.send({
          from: 'MoodTracker <noreply@yourdomain.com>',
          to: [userEmail],
          subject: 'Account Deletion Confirmation',
          html: `
            <h2>Your Account Has Been Deleted</h2>
            <p>This email confirms that your MoodTracker account and all associated data have been permanently deleted as requested.</p>
            <p>If you did not request this deletion, please contact our support team immediately.</p>
            <p>Thank you for using MoodTracker.</p>
          `,
        })
        console.log('Deletion confirmation email sent to:', userEmail)
      } catch (emailError) {
        console.error('Error sending confirmation email:', emailError)
        // Continue with account deletion even if email fails
      }
    }

    // Finally, delete the auth user
    const { error: deleteUserError } = await supabase.auth.admin.deleteUser(user.id)

    if (deleteUserError) {
      return handleSecureError(
        deleteUserError,
        { userId: user.id, operation: 'delete_account_final' },
        'delete-user-account',
        corsHeaders
      );
    }

    console.log(`Successfully deleted account for user: ${user.id}`)

    return createSecureResponse(
      JSON.stringify({ message: 'Account successfully deleted' }),
      { 
        headers: { 
          ...corsHeaders, 
          ...rateLimitCheck.headers,
          'Content-Type': 'application/json' 
        } 
      }
    );

  } catch (error) {
    return handleSecureError(
      error,
      { operation: 'delete_account_general' },
      'delete-user-account',
      corsHeaders
    );
  }
})
