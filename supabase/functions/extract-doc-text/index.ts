
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { sanitizeExtractedText } from '../_shared/sanitization.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { file_path } = await req.json();
    
    if (!file_path) {
      return new Response(
        JSON.stringify({ error: 'file_path is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get user ID from file path (assuming format: user_id/filename)
    const userId = file_path.split('/')[0];
    console.log('Processing document for user:', userId);

    // Get user's preferred vision model
    let preferredVisionModel = 'google/gemini-2.0-flash-exp:free'; // Default
    try {
      const { data: userProfile } = await supabase
        .from('user_profile')
        .select('vision_model')
        .eq('id', userId)
        .single();
      
      if (userProfile?.vision_model) {
        preferredVisionModel = userProfile.vision_model;
        console.log('Using user preferred vision model:', preferredVisionModel);
      } else {
        console.log('No vision model preference found, using default:', preferredVisionModel);
      }
    } catch (error) {
      console.warn('Could not fetch user vision model preference:', error);
      console.log('Using default vision model:', preferredVisionModel);
    }

    // Get the file from storage
    const { data: fileData, error: downloadError } = await supabase.storage
      .from('medical-docs')
      .download(file_path);

    if (downloadError) {
      console.error('Error downloading file:', downloadError);
      
      // Report error to bug_reports table
      await supabase.from('bug_reports').insert({
        error_message: `File download failed: ${downloadError.message}`,
        stack_trace: JSON.stringify(downloadError),
        url: `extract-doc-text/${file_path}`,
        user_agent: 'Edge Function',
        app_version: '1.0.0'
      });

      return new Response(
        JSON.stringify({ error: 'Failed to download file', details: downloadError.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Convert file to base64 for OpenRouter
    const fileBuffer = await fileData.arrayBuffer();
    const base64File = btoa(String.fromCharCode(...new Uint8Array(fileBuffer)));
    
    // Determine file type
    const fileExtension = file_path.split('.').pop()?.toLowerCase();
    const isImage = ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(fileExtension || '');
    const isPdf = fileExtension === 'pdf';

    let extractedText = '';
    
    // Check for OpenRouter API key
    const openRouterApiKey = Deno.env.get('OPENROUTER_API_KEY') || 'placeholder-key-not-set';
    
    if (openRouterApiKey === 'placeholder-key-not-set' || !openRouterApiKey.startsWith('sk-')) {
      console.warn('OpenRouter API key not configured properly');
      
      if (isImage) {
        extractedText = 'Text extraction unavailable - OpenRouter API key not configured. Please contact support to enable text extraction from images.';
      } else if (isPdf) {
        extractedText = 'PDF text extraction unavailable - OpenRouter API key not configured. Please contact support to enable advanced document processing.';
      } else {
        extractedText = 'Text extraction not supported for this file type.';
      }
    } else if (isImage) {
      try {
        // Use user's preferred vision model with timeout and retry logic
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout
        
        console.log('Attempting text extraction with preferred model:', preferredVisionModel);
        
        let openRouterResponse;
        let modelUsed = preferredVisionModel;
        
        try {
          // Try user's preferred vision model first
          openRouterResponse = await fetch('https://openrouter.ai/api/v1/chat/completions', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${openRouterApiKey}`,
              'Content-Type': 'application/json',
              'HTTP-Referer': 'https://your-app-domain.com',
              'X-Title': 'Medical Document Text Extractor',
            },
            body: JSON.stringify({
              model: preferredVisionModel,
              messages: [
                {
                  role: 'user',
                  content: [
                    {
                      type: 'text',
                      text: 'Please extract all text from this medical document image. Focus on medical information, dates, names, and important details. Return only the extracted text in a clean, readable format without additional commentary.'
                    },
                    {
                      type: 'image_url',
                      image_url: {
                        url: `data:image/${fileExtension};base64,${base64File}`
                      }
                    }
                  ]
                }
              ],
              max_tokens: 4000,
              temperature: 0.1
            }),
            signal: controller.signal
          });
        } catch (error) {
          console.log('Preferred vision model failed, trying fallback...');
          
          // Define fallback models (excluding the preferred one)
          const fallbackModels = [
            'google/gemini-2.0-flash-exp:free',
            'meta-llama/llama-3.2-90b-vision-instruct:free'
          ].filter(model => model !== preferredVisionModel);
          
          // Try fallback models
          for (const fallbackModel of fallbackModels) {
            try {
              console.log('Trying fallback vision model:', fallbackModel);
              openRouterResponse = await fetch('https://openrouter.ai/api/v1/chat/completions', {
                method: 'POST',
                headers: {
                  'Authorization': `Bearer ${openRouterApiKey}`,
                  'Content-Type': 'application/json',
                  'HTTP-Referer': 'https://your-app-domain.com',
                  'X-Title': 'Medical Document Text Extractor',
                },
                body: JSON.stringify({
                  model: fallbackModel,
                  messages: [
                    {
                      role: 'user',
                      content: [
                        {
                          type: 'text',
                          text: 'Please extract all text from this medical document image. Focus on medical information, dates, and important details. Return only the extracted text in a clean, readable format without additional commentary. Note: Personal identifying information will be filtered separately for privacy protection.'
                        },
                        {
                          type: 'image_url',
                          image_url: {
                            url: `data:image/${fileExtension};base64,${base64File}`
                          }
                        }
                      ]
                    }
                  ],
                  max_tokens: 4000,
                  temperature: 0.1
                }),
                signal: controller.signal
              });
              
              if (openRouterResponse.ok) {
                modelUsed = fallbackModel;
                console.log('Successfully used fallback vision model:', fallbackModel);
                break;
              }
            } catch (fallbackError) {
              console.error('Fallback vision model failed:', fallbackModel, fallbackError);
              continue;
            }
          }
        }

        clearTimeout(timeoutId);

        if (openRouterResponse && openRouterResponse.ok) {
          const result = await openRouterResponse.json();
          const rawExtractedText = result.choices[0]?.message?.content || 'No text could be extracted from this image.';
          
          // Sanitize extracted text before storage
          const sanitizationEnabled = Deno.env.get('ENABLE_PII_SANITIZATION') !== 'false';
          extractedText = sanitizationEnabled 
            ? sanitizeExtractedText(rawExtractedText)
            : rawExtractedText;
            
          console.log('Text extraction successful with model:', modelUsed);
          if (sanitizationEnabled) {
            console.log('Text sanitized for PII protection');
          }
        } else {
          const errorText = openRouterResponse ? await openRouterResponse.text() : 'No response received';
          console.error('All vision models failed:', errorText);
          
          // Report API error
          await supabase.from('bug_reports').insert({
            error_message: `Vision model extraction failed: ${openRouterResponse?.status || 'Unknown'}`,
            stack_trace: errorText,
            url: `extract-doc-text/${file_path}`,
            user_agent: 'Edge Function - Vision',
            app_version: '1.0.0'
          });
          
          extractedText = 'Failed to extract text from image due to API error. Please try again later.';
        }
      } catch (error) {
        console.error('Text extraction error:', error);
        
        // Report extraction error
        await supabase.from('bug_reports').insert({
          error_message: `Text extraction failed: ${error.message}`,
          stack_trace: error.stack || 'No stack trace available',
          url: `extract-doc-text/${file_path}`,
          user_agent: 'Edge Function - Extraction',
          app_version: '1.0.0'
        });
        
        if (error.name === 'AbortError') {
          extractedText = 'Text extraction timed out. Please try again with a smaller image.';
        } else {
          extractedText = 'Failed to extract text from image. Please try again later.';
        }
      }
    } else if (isPdf) {
      extractedText = 'PDF document uploaded - Advanced PDF text extraction will be available once OpenRouter integration is fully configured.';
    } else {
      extractedText = 'File uploaded successfully - Text extraction is only available for images (JPEG, PNG, GIF) at this time.';
    }

    // Use background task for database update
    const updateTask = async () => {
      try {
        const { error: updateError } = await supabase
          .from('medical_docs')
          .update({ extracted_text: extractedText })
          .eq('file_path', file_path);

        if (updateError) {
          console.error('Error updating extracted text:', updateError);
          await supabase.from('bug_reports').insert({
            error_message: `Database update failed: ${updateError.message}`,
            stack_trace: JSON.stringify(updateError),
            url: `extract-doc-text/${file_path}`,
            user_agent: 'Edge Function - DB Update',
            app_version: '1.0.0'
          });
        }
      } catch (error) {
        console.error('Background task error:', error);
      }
    };

    // Start background task
    EdgeRuntime.waitUntil(updateTask());

    return new Response(
      JSON.stringify({ 
        success: true, 
        extracted_text: extractedText,
        file_type: isImage ? 'image' : isPdf ? 'pdf' : 'unknown',
        api_key_configured: openRouterApiKey !== 'placeholder-key-not-set' && openRouterApiKey.startsWith('sk-')
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in extract-doc-text function:', error);
    
    // Report general error
    try {
      const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
      const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
      const supabase = createClient(supabaseUrl, supabaseServiceKey);
      
      await supabase.from('bug_reports').insert({
        error_message: `Extract doc text function error: ${error.message}`,
        stack_trace: error.stack || 'No stack trace available',
        url: 'extract-doc-text/general',
        user_agent: 'Edge Function - General',
        app_version: '1.0.0'
      });
    } catch (reportError) {
      console.error('Failed to report error:', reportError);
    }
    
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
