import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { content, type } = await req.json();
    
    if (!content) {
      return new Response(
        JSON.stringify({ error: 'Content is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      console.error('LOVABLE_API_KEY is not configured');
      return new Response(
        JSON.stringify({ error: 'AI service not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Analyzing content:', content.substring(0, 100) + '...');

    const systemPrompt = `You are an expert fact-checker and misinformation analyst. Your task is to analyze content for truthfulness and potential misinformation.

Analyze the provided content and return a JSON response with the following structure:
{
  "isTrue": boolean (true if the content is factually accurate, false if it contains misinformation),
  "trustScore": number (0-100, representing overall credibility),
  "title": string (a brief title summarizing what was analyzed),
  "summary": string (2-3 sentences explaining your verdict),
  "breakdown": {
    "factualAccuracy": number (0-100),
    "sourceReliability": number (0-100),
    "languageNeutrality": number (0-100),
    "crossReference": number (0-100)
  },
  "redFlags": array of strings (list any concerning issues found, empty if none),
  "claims": array of objects with { "text": string, "status": "verified" | "false" | "unverified", "explanation": string },
  "sources": array of objects with { "name": string, "url": string } (reputable sources that support or refute the claims)
}

Be thorough but concise. If you cannot verify something, mark it as unverified. Only mark as "false" if you have strong evidence against it.`;

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `Please analyze the following ${type === 'url' ? 'URL content' : 'text'} for misinformation:\n\n${content}` }
        ],
        response_format: { type: 'json_object' },
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        console.error('Rate limited');
        return new Response(
          JSON.stringify({ error: 'Rate limit exceeded. Please try again later.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      if (response.status === 402) {
        console.error('Payment required');
        return new Response(
          JSON.stringify({ error: 'AI credits exhausted. Please add credits to continue.' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      const errorText = await response.text();
      console.error('AI gateway error:', response.status, errorText);
      return new Response(
        JSON.stringify({ error: 'AI analysis failed' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const data = await response.json();
    const analysisText = data.choices?.[0]?.message?.content;
    
    if (!analysisText) {
      console.error('No content in AI response');
      return new Response(
        JSON.stringify({ error: 'Failed to get analysis from AI' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('AI response received:', analysisText.substring(0, 200));

    // Parse the JSON response from AI
    let analysis;
    try {
      analysis = JSON.parse(analysisText);
    } catch (parseError) {
      console.error('Failed to parse AI response as JSON:', parseError);
      // Try to extract JSON from the response
      const jsonMatch = analysisText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        analysis = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('Could not parse AI response');
      }
    }

    // Normalize the response structure
    const result = {
      isTrue: analysis.isTrue ?? (analysis.trustScore >= 70),
      trustScore: Math.min(100, Math.max(0, analysis.trustScore || 50)),
      title: analysis.title || 'Content Analysis',
      summary: analysis.summary || 'Analysis complete.',
      breakdown: {
        factualAccuracy: analysis.breakdown?.factualAccuracy || 50,
        sourceReliability: analysis.breakdown?.sourceReliability || 50,
        languageNeutrality: analysis.breakdown?.languageNeutrality || 50,
        crossReference: analysis.breakdown?.crossReference || 50,
      },
      redFlags: Array.isArray(analysis.redFlags) ? analysis.redFlags : [],
      claims: Array.isArray(analysis.claims) ? analysis.claims : [],
      sources: Array.isArray(analysis.sources) ? analysis.sources : [
        { name: 'Reuters Fact Check', url: 'https://www.reuters.com/fact-check' },
        { name: 'Snopes', url: 'https://www.snopes.com' },
      ],
    };

    console.log('Analysis complete. Trust score:', result.trustScore, 'Is true:', result.isTrue);

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in analyze-content function:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error occurred' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
