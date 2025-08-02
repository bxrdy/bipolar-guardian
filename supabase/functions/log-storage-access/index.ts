import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { handleSecureError, logDetailedError } from '../_shared/errorHandler.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface LogStorageAccessRequest {
  file_path: string;
  operation_type: 'upload' | 'download' | 'delete' | 'view' | 'url_generated';
  success?: boolean;
  error_message?: string;
  file_size?: number;
  mime_type?: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Get user from auth header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return handleSecureError(
        new Error('Missing authorization header'),
        { operation: 'storage_log_auth' },
        'log-storage-access',
        corsHeaders
      );
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(token);

    if (authError || !user) {
      return handleSecureError(
        new Error('Unauthorized'),
        { operation: 'storage_log_auth' },
        'log-storage-access',
        corsHeaders
      );
    }

    // Parse request body
    const requestBody: LogStorageAccessRequest = await req.json();
    
    // Validate required fields
    if (!requestBody.file_path || !requestBody.operation_type) {
      return handleSecureError(
        new Error('Invalid request data'),
        { userId: user.id, operation: 'validate_storage_log' },
        'log-storage-access',
        corsHeaders
      );
    }

    // Validate operation type
    const validOperations = ['upload', 'download', 'delete', 'view', 'url_generated'];
    if (!validOperations.includes(requestBody.operation_type)) {
      return handleSecureError(
        new Error('Invalid operation type'),
        { userId: user.id, operation: 'validate_storage_log' },
        'log-storage-access',
        corsHeaders
      );
    }

    // Extract IP address and user agent from request
    const forwardedFor = req.headers.get('x-forwarded-for');
    const realIP = req.headers.get('x-real-ip');
    const ipAddress = forwardedFor?.split(',')[0] || realIP || 'unknown';
    const userAgent = req.headers.get('user-agent') || 'unknown';

    console.log('Logging storage access:', {
      userId: user.id,
      filePath: requestBody.file_path,
      operation: requestBody.operation_type,
      success: requestBody.success ?? true
    });

    // Call the logging function
    const { data: logResult, error: logError } = await supabaseClient
      .rpc('log_storage_access', {
        p_user_id: user.id,
        p_file_path: requestBody.file_path,
        p_operation_type: requestBody.operation_type,
        p_ip_address: ipAddress,
        p_user_agent: userAgent,
        p_success: requestBody.success ?? true,
        p_error_message: requestBody.error_message || null,
        p_file_size: requestBody.file_size || null,
        p_mime_type: requestBody.mime_type || null
      });

    if (logError) {
      return handleSecureError(
        logError,
        { userId: user.id, operation: 'database_log', filePath: requestBody.file_path },
        'log-storage-access',
        corsHeaders
      );
    }

    console.log('Storage access logged successfully:', logResult);

    return new Response(
      JSON.stringify({ 
        success: true,
        log_id: logResult,
        message: 'Storage access logged successfully'
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    return handleSecureError(
      error,
      { operation: 'log_storage_access_general' },
      'log-storage-access',
      corsHeaders
    );
  }
});