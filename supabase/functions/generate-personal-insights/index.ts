
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0';
import { sanitizeExtractedText, sanitizeMedicalData } from '../_shared/sanitization.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const authHeader = req.headers.get('Authorization')!;
    const token = authHeader.replace('Bearer ', '');
    const { data: { user } } = await supabaseClient.auth.getUser(token);

    if (!user) {
      throw new Error('Unauthorized');
    }

    console.log('Generating personal insights for user:', user.id);

    // Check if AI context is enabled for this user
    const { data: featureFlags } = await supabaseClient
      .from('feature_flags')
      .select('ai_context_enabled')
      .eq('user_id', user.id)
      .single();

    if (!featureFlags?.ai_context_enabled) {
      console.log('AI context not enabled for user');
      return new Response(JSON.stringify({ 
        success: false, 
        message: 'AI context feature not enabled' 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Gather medical documents
    const { data: medicalDocs } = await supabaseClient
      .from('medical_docs')
      .select('doc_type, extracted_text')
      .eq('user_id', user.id)
      .not('extracted_text', 'is', null);

    // Gather medications
    const { data: medications } = await supabaseClient
      .from('medications')
      .select('med_name, dosage, schedule')
      .eq('user_id', user.id);

    // Only proceed if we have medical data to analyze
    if ((!medicalDocs || medicalDocs.length === 0) && (!medications || medications.length === 0)) {
      console.log('No medical data to analyze');
      return new Response(JSON.stringify({ 
        success: false, 
        message: 'No medical data available for analysis' 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Prepare medical data for AI analysis with sanitization
    const sanitizationEnabled = Deno.env.get('ENABLE_PII_SANITIZATION') !== 'false';
    
    const medicalContext = {
      documents: medicalDocs?.map(doc => ({
        type: doc.doc_type,
        content: sanitizationEnabled 
          ? sanitizeExtractedText(doc.extracted_text?.substring(0, 2000) || '')
          : doc.extracted_text?.substring(0, 2000) // Limit content length
      })) || [],
      medications: medications?.map(med => ({
        name: med.med_name,
        dosage: med.dosage,
        schedule: med.schedule
      })) || []
    };
    
    // Sanitize medications if enabled
    const sanitizedMedicalContext = sanitizationEnabled 
      ? sanitizeMedicalData(medicalContext)
      : medicalContext;

    // Generate insights using OpenRouter API
    const openRouterApiKey = Deno.env.get('OPENROUTER_API_KEY');
    if (!openRouterApiKey) {
      throw new Error('OpenRouter API key not configured');
    }

    const baseMedicalPrompt = Deno.env.get('MEDICAL_INSIGHTS_PROMPT') || 
      `You are a medical analysis assistant. Analyze the provided health data and return structured insights in JSON format.`;
    
    const medicalAnalysisPrompt = `${baseMedicalPrompt}

Medical Documents: ${JSON.stringify(sanitizedMedicalContext.documents)}
Medications: ${JSON.stringify(sanitizedMedicalContext.medications)}

Return JSON in this exact format:
{
  "conditions": ["array of identified medical conditions or diagnoses"],
  "medications_summary": ["array of medication names and purposes"],
  "red_flags": ["array of crisis keywords or concerning patterns found"],
  "interaction_warnings": ["array of potential medication interactions or concerns"],
  "risk_factors": ["array of relevant risk factors identified"],
  "therapeutic_notes": ["array of relevant notes for therapeutic conversations"],
  "last_updated": "${new Date().toISOString()}"
}`;

    console.log('Calling OpenRouter API for medical analysis');
    
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openRouterApiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://kzfrnenyoquubjyojbvn.supabase.co',
        'X-Title': 'Bipolar Guardian - Medical Analysis'
      },
      body: JSON.stringify({
        model: 'google/gemini-2.0-flash-exp:free',
        messages: [
          {
            role: 'user',
            content: medicalAnalysisPrompt
          }
        ],
        temperature: 0.3,
        max_tokens: 1000
      })
    });

    if (!response.ok) {
      console.error('OpenRouter API error:', response.status, await response.text());
      throw new Error('Failed to generate medical insights');
    }

    const aiResponse = await response.json();
    const insightsContent = aiResponse.choices[0].message.content;
    
    console.log('Raw AI response:', insightsContent);

    // Parse the JSON response
    let medicalInsights;
    try {
      // Clean the response to extract JSON
      const jsonMatch = insightsContent.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        medicalInsights = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('No valid JSON found in response');
      }
    } catch (parseError) {
      console.error('Failed to parse AI response as JSON:', parseError);
      throw new Error('Invalid AI response format');
    }

    // Store the insights in the user profile
    const { error: updateError } = await supabaseClient
      .from('user_profile')
      .update({
        ai_medical_summary: medicalInsights,
        ai_insights_generated_at: new Date().toISOString()
      })
      .eq('id', user.id);

    if (updateError) {
      console.error('Error updating user profile:', updateError);
      throw new Error('Failed to store medical insights');
    }

    console.log('Successfully generated and stored medical insights');

    return new Response(JSON.stringify({ 
      success: true, 
      insights: medicalInsights,
      message: 'Medical insights generated successfully'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in generate-personal-insights:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
