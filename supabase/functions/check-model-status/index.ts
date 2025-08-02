import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { getSecureCORSHeaders } from '../_shared/cors.ts';
import { handleSecureError } from '../_shared/errorHandler.ts';
import { validateSecurity, createSecureResponse } from '../_shared/securityHeaders.ts';
import { checkRateLimit } from '../_shared/rateLimiter.ts';
import { validateRequestBody, MODEL_STATUS_SCHEMA } from '../_shared/inputValidator.ts';

serve(async (req) => {
  try {
    // Generate secure CORS headers
    const corsHeaders = getSecureCORSHeaders(req);
    
    if (req.method === 'OPTIONS') {
      return createSecureResponse(null, { headers: corsHeaders });
    }

    // Validate security (low requirements for status check)
    const securityCheck = validateSecurity(req, {
      requireCSRF: false,
      requireOrigin: true,
      allowedMethods: ['POST', 'GET']
    });
    
    console.log('Security validation result:', { 
      valid: securityCheck.valid, 
      error: securityCheck.error,
      origin: req.headers.get('origin'),
      referer: req.headers.get('referer')
    });
    
    if (!securityCheck.valid) {
      console.log('Security validation failed:', securityCheck.error);
      return handleSecureError(
        new Error(securityCheck.error || 'Security validation failed'),
        { 
          operation: 'model_status_security',
          origin: req.headers.get('origin'),
          referer: req.headers.get('referer')
        },
        'check-model-status',
        corsHeaders
      );
    }

    // Apply rate limiting (LOW level for status checks)
    const rateLimitCheck = checkRateLimit(req, 'check-model-status', 'LOW', corsHeaders);
    if (!rateLimitCheck.allowed) {
      return rateLimitCheck.response!;
    }

    // Validate and sanitize request body
    console.log('Validating request body for check-model-status...');
    const validation = await validateRequestBody(req.clone(), MODEL_STATUS_SCHEMA);
    console.log('Validation result:', { valid: validation.valid, errors: validation.errors, hasData: !!validation.sanitizedData });
    
    if (!validation.valid) {
      console.log('Request validation failed:', validation.errors);
      return handleSecureError(
        new Error(`Invalid request: ${validation.errors.join(', ')}`),
        { operation: 'validate_model_status_input' },
        'check-model-status',
        corsHeaders
      );
    }

    const { models } = validation.sanitizedData!;
    console.log('Models to check:', models);
    
    const openRouterApiKey = Deno.env.get('OPENROUTER_API_KEY');
    console.log('OpenRouter API key check:', openRouterApiKey ? `Found key starting with: ${openRouterApiKey.substring(0, 10)}...` : 'No API key found');
    
    if (!openRouterApiKey || (!openRouterApiKey.startsWith('sk-or-v1-') && !openRouterApiKey.startsWith('sk-'))) {
      console.log('API key validation failed:', { 
        hasKey: !!openRouterApiKey,
        startsWithSk: openRouterApiKey?.startsWith('sk-'),
        startsWithSkOrV1: openRouterApiKey?.startsWith('sk-or-v1-')
      });
      
      return createSecureResponse(
        JSON.stringify({ 
          error: 'AI service configuration not available',
          statuses: models.reduce((acc: any, model: string) => {
            acc[model] = { status: 'unavailable', reason: 'OpenRouter API key not configured or invalid format' };
            return acc;
          }, {})
        }),
        {
          headers: { 
            ...corsHeaders, 
            ...rateLimitCheck.headers,
            'Content-Type': 'application/json' 
          }
        }
      );
    }

    const statuses: Record<string, { status: 'available' | 'rate-limited' | 'unavailable', reason?: string }> = {};

    // First, test API key validity with a simple request to OpenRouter
    console.log('Testing OpenRouter API key validity...');
    try {
      const testResponse = await fetch('https://openrouter.ai/api/v1/models', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${openRouterApiKey}`,
          'HTTP-Referer': 'https://kzfrnenyoquubjyojbvn.supabase.co',
        }
      });
      
      if (!testResponse.ok) {
        const errorText = await testResponse.text();
        console.log(`API key test failed: ${testResponse.status} - ${errorText}`);
        
        // If API key is invalid, mark all models as unavailable with specific reason
        const apiKeyError = `API key invalid (${testResponse.status})`;
        models.forEach(model => {
          statuses[model] = { status: 'unavailable', reason: apiKeyError };
        });
        
        return createSecureResponse(
          JSON.stringify({ statuses }),
          {
            headers: { 
              ...corsHeaders, 
              ...rateLimitCheck.headers,
              'Content-Type': 'application/json' 
            }
          }
        );
      }
      
      console.log('API key is valid, proceeding with model tests...');
    } catch (error) {
      console.log('API key test network error:', error);
      const networkError = 'Network error connecting to OpenRouter';
      models.forEach(model => {
        statuses[model] = { status: 'unavailable', reason: networkError };
      });
      
      return createSecureResponse(
        JSON.stringify({ statuses }),
        {
          headers: { 
            ...corsHeaders, 
            ...rateLimitCheck.headers,
            'Content-Type': 'application/json' 
          }
        }
      );
    }

    // Test each model with a simple request
    for (const model of models) {
      try {
        console.log(`Testing model: ${model}`);
        
        const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${openRouterApiKey}`,
            'Content-Type': 'application/json',
            'HTTP-Referer': 'https://kzfrnenyoquubjyojbvn.supabase.co',
            'X-Title': 'Model Status Check',
          },
          body: JSON.stringify({
            model: model,
            messages: [{ role: 'user', content: 'Test' }],
            max_tokens: 1,
            temperature: 0
          }),
        });

        console.log(`Model ${model} response status: ${response.status}`);

        if (response.ok) {
          console.log(`Model ${model} is available`);
          statuses[model] = { status: 'available' };
        } else {
          const errorText = await response.text();
          console.log(`Model ${model} error response: ${errorText}`);
          
          let errorData;
          try {
            errorData = JSON.parse(errorText);
          } catch {
            console.log(`Model ${model} error response is not JSON`);
            statuses[model] = { 
              status: 'unavailable', 
              reason: `HTTP ${response.status}: ${errorText.slice(0, 100)}` 
            };
            continue;
          }
          
          if (response.status === 429 || errorData.error?.message?.includes('rate-limited')) {
            console.log(`Model ${model} is rate limited`);
            statuses[model] = { 
              status: 'rate-limited', 
              reason: 'Temporarily rate-limited upstream' 
            };
          } else if (errorData.error?.message?.includes('data policy')) {
            console.log(`Model ${model} has data policy restrictions`);
            statuses[model] = { 
              status: 'unavailable', 
              reason: 'Data policy restrictions' 
            };
          } else {
            const errorMessage = errorData.error?.message || errorData.message || 'Unknown error';
            console.log(`Model ${model} error: ${errorMessage}`);
            
            // Provide more specific error reasons
            let reason = errorMessage;
            if (response.status === 400) {
              reason = `Bad request: ${errorMessage}`;
            } else if (response.status === 401) {
              reason = `Unauthorized: Check API key`;
            } else if (response.status === 403) {
              reason = `Forbidden: ${errorMessage}`;
            } else if (response.status === 404) {
              reason = `Model not found: ${model}`;
            } else if (response.status === 500) {
              reason = `Server error: ${errorMessage}`;
            } else {
              reason = `HTTP ${response.status}: ${errorMessage}`;
            }
            
            statuses[model] = { 
              status: 'unavailable', 
              reason: reason
            };
          }
        }
      } catch (error) {
        console.log(`Model ${model} network error:`, error);
        statuses[model] = { 
          status: 'unavailable', 
          reason: 'Network error or timeout' 
        };
      }
    }

    return createSecureResponse(
      JSON.stringify({ statuses }),
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
      { operation: 'model_status_check_general' },
      'check-model-status',
      corsHeaders
    );
  }
});