import { NextRequest, NextResponse } from 'next/server'

// ============================================
// OPENROUTER API KEY
// ============================================
const OPENROUTER_API_KEY = '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'

// ============================================
// MODEL MAPPING
// ============================================
const MODEL_MAP: Record<string, string> = {
  'gpt-5.4-mini': 'google/gemma-2-9b-it:free',
  'qwen-3.5-flash': 'google/gemma-2-9b-it:free',
  'ministral-3-8b': 'google/gemma-2-9b-it:free',
  'mistral-small-4': 'google/gemma-2-9b-it:free',
  'deepseek-chat': 'google/gemma-2-9b-it:free',
  'gemini-3-flash': 'google/gemma-2-9b-it:free',
  'gpt-4o-mini': 'google/gemma-2-9b-it:free',
  'claude-haiku-4.5': 'google/gemma-2-9b-it:free',
  'mistral-small': 'google/gemma-2-9b-it:free',
  'gpt-4.1': 'google/gemma-2-9b-it:free',
  'claude-sonnet-4.0': 'google/gemma-2-9b-it:free',
  'gpt-5.4': 'google/gemma-2-9b-it:free',
  'gemini-3-pro-preview': 'google/gemma-2-9b-it:free',
  'grok-3-mini': 'google/gemma-2-9b-it:free',
  'codestral': 'google/gemma-2-9b-it:free',
  'gpt-5.6-terra': 'google/gemma-2-9b-it:free',
  'grok-4.5': 'google/gemma-2-9b-it:free',
  'nova-premier-1.0': 'google/gemma-2-9b-it:free',
  'perplexity-sonar': 'google/gemma-2-9b-it:free',
  'gpt-5.6-luna': 'google/gemma-2-9b-it:free',
  'deepseek-reasoner': 'google/gemma-2-9b-it:free',
}

// ============================================
// MAIN API HANDLER
// ============================================
export async function POST(req: NextRequest) {
  try {
    const { prompt, models } = await req.json()

    if (!prompt) {
      return NextResponse.json({ 
        consensus: 'Please enter a prompt.',
        consensus_score: 0,
        confidence: 0,
      })
    }

    if (!models || models.length === 0) {
      return NextResponse.json(
        { error: 'Please select at least one model.' },
        { status: 400 }
      )
    }

    // USING FREE MODEL
    const modelId = 'google/gemma-2-9b-it:free'
    const modelName = 'Gemma 2 9B (Free)'

    console.log('🤖 Using Free Model:', modelId)

    // ============================================
    // CALL OPENROUTER API
    // ============================================
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://github.com/Bhavyashree15/AIOS',
        'X-Title': 'AIOS',
      },
      body: JSON.stringify({
        model: modelId,
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7,
        max_tokens: 200,
      }),
    })

    const data = await response.json()

    // ============================================
    // HANDLE API ERRORS
    // ============================================
    if (!response.ok) {
      console.error('❌ OpenRouter API Error:', JSON.stringify(data, null, 2))
      
      if (data.error?.message?.includes('credits') || data.error?.message?.includes('insufficient')) {
        return NextResponse.json({
          consensus: `⚠️ Free model daily limit reached. Try again later.`,
          consensus_score: 0,
          confidence: 0,
          error: 'free_model_limit',
        })
      }
      
      if (data.error?.message?.includes('No endpoints found')) {
        return NextResponse.json({
          consensus: `⚠️ This free model is currently unavailable. Try again later.`,
          consensus_score: 0,
          confidence: 0,
          error: 'model_unavailable',
        })
      }
      
      return NextResponse.json({
        consensus: `⚠️ API Error: ${data.error?.message || 'Unknown error'}`,
        consensus_score: 0,
        confidence: 0,
      })
    }

    // ============================================
    // GET THE AI RESPONSE
    // ============================================
    const aiResponse = data.choices?.[0]?.message?.content || 'No response from AI'

    console.log('✅ Success! Response length:', aiResponse.length)

    return NextResponse.json({
      success: true,
      consensus: aiResponse,
      consensus_score: 85,
      confidence: 80,
      model_used: modelName,
      is_free: true,
    })

  } catch (error) {
    console.error('❌ API Error:', error)
    return NextResponse.json({
      consensus: `⚠️ Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
      consensus_score: 0,
      confidence: 0,
    })
  }
}

export async function GET() {
  return NextResponse.json({
    balance: 0,
    is_free: true,
  })
}
