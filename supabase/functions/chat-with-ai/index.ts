
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    const { message, context, programData } = await req.json();

    const systemPrompt = `You are an expert Solana blockchain developer and AI assistant specializing in Anchor framework development. You help users build Solana programs through a visual interface.

Context: ${context || 'User is building a Solana program'}

Current Program Data: ${JSON.stringify(programData, null, 2)}

Your role:
1. Provide clear, actionable guidance for Solana/Anchor development
2. Help create and configure program modules (instructions, accounts, validators)
3. Explain program architecture and data flow
4. Suggest best practices and optimizations
5. Generate Rust/Anchor code when requested
6. Help with security considerations and common pitfalls

When creating modules, provide:
- Clear module names and descriptions
- Appropriate input/output configurations
- Rust/Anchor code snippets
- Usage examples and best practices

Be concise but thorough. Focus on practical, implementable solutions.`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4.1-2025-04-14',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: message }
        ],
        max_tokens: 1000,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`OpenAI API error: ${errorData.error?.message || 'Unknown error'}`);
    }

    const data = await response.json();
    const aiResponse = data.choices[0].message.content;

    return new Response(JSON.stringify({ 
      response: aiResponse,
      usage: data.usage 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in chat-with-ai function:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      details: 'Make sure your OpenAI API key is properly configured in Supabase secrets'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
