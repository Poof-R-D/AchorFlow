
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

    const { description, moduleType } = await req.json();

    const systemPrompt = `You are an expert Solana blockchain developer. Generate a detailed module specification for a visual Solana program builder.

Based on the user's description, create a JSON response with the following structure:
{
  "name": "Module Name",
  "type": "instruction|account|validator|processor",
  "description": "Detailed description",
  "inputs": [
    {"id": "unique_id", "name": "input_name", "type": "data|accounts|signature"}
  ],
  "outputs": [
    {"id": "unique_id", "name": "output_name", "type": "data|accounts|result"}
  ],
  "parameters": [
    {"name": "param_name", "type": "string|number|boolean", "description": "param description", "required": true}
  ],
  "code": "// Rust/Anchor code implementation",
  "documentation": "Usage instructions and examples"
}

Guidelines:
- Choose appropriate input/output types based on Solana program patterns
- Include realistic parameters that would be needed
- Generate actual Rust/Anchor code that demonstrates the functionality
- Make the module name concise but descriptive
- Ensure the type matches the functionality (instruction for actions, account for data structures, etc.)`;

    const userPrompt = `Create a Solana program module with this description: "${description}"
    ${moduleType ? `Preferred type: ${moduleType}` : ''}
    
    Focus on practical Solana/Anchor patterns and ensure the module is well-structured for a visual programming interface.`;

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
          { role: 'user', content: userPrompt }
        ],
        max_tokens: 1500,
        temperature: 0.3,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`OpenAI API error: ${errorData.error?.message || 'Unknown error'}`);
    }

    const data = await response.json();
    const aiResponse = data.choices[0].message.content;

    // Try to parse JSON from the response
    let moduleSpec;
    try {
      // Extract JSON from response if it's wrapped in code blocks
      const jsonMatch = aiResponse.match(/```json\n([\s\S]*?)\n```/) || aiResponse.match(/```\n([\s\S]*?)\n```/);
      const jsonString = jsonMatch ? jsonMatch[1] : aiResponse;
      moduleSpec = JSON.parse(jsonString);
    } catch (parseError) {
      // Fallback: create a basic module structure
      moduleSpec = {
        name: "AI Generated Module",
        type: moduleType || "instruction",
        description: description,
        inputs: [
          { id: crypto.randomUUID(), name: "accounts", type: "accounts" },
          { id: crypto.randomUUID(), name: "data", type: "data" }
        ],
        outputs: [
          { id: crypto.randomUUID(), name: "result", type: "result" }
        ],
        parameters: [],
        code: aiResponse,
        documentation: "Generated module based on: " + description
      };
    }

    return new Response(JSON.stringify({ 
      moduleSpec,
      rawResponse: aiResponse,
      usage: data.usage 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in generate-module function:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      details: 'Failed to generate module specification'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
