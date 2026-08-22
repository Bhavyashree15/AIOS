import { NextRequest, NextResponse } from 'next/server'

// ============================================
// OPENROUTER API KEY - YOUR KEY (NO CREDITS NEEDED FOR FREE MODELS)
// ============================================
const OPENROUTER_API_KEY = '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'

// ============================================
// MODEL MAPPING - ALL USING FREE MODELS
// ============================================
const MODEL_MAP: Record<string, string> = {
  'gpt-5.4-mini': 'google/gemma-3-27b-it:free',
  'qwen-3.5-flash': 'google/gemma-3-27b-it:free',
  'ministral-3-8b': 'google/gemma-3-27b-it:free',
  'mistral-small-4': 'google/gemma-3-27b-it:free',
  'deepseek-chat': 'google/gemma-3-27b-it:free',
  'gemini-3-flash': 'google/gemma-3-27b-it:free',
  'gpt-4o-mini': 'google/gemma-3-27b-it:free',
  'claude-haiku-4.5': 'google/gemma-3-27b-it:free',
  'mistral-small': 'google/gemma-3-27b-it:free',
  'gpt-4.1': 'google/gemma-3-27b-it:free',
  'claude-sonnet-4.0': 'google/gemma-3-27b-it:free',
  'gpt-5.4': 'google/gemma-3-27b-it:free',
  'gemini-3-pro-preview': 'google/gemma-3-27b-it:free',
  'grok-3-mini': 'google/gemma-3-27b-it:free',
  'codestral': 'google/gemma-3-27b-it:free',
  'gpt-5.6-terra': 'google/gemma-3-27b-it:free',
  'grok-4.5': 'google/gemma-3-27b-it:free',
  'nova-premier-1.0': 'google/gemma-3-27b-it:free',
  'perplexity-sonar': 'google/gemma-3-27b-it:free',
  'gpt-5.6-luna': 'google/gemma-3-27b-it:free',
  'deepseek-reasoner': 'google/gemma-3-27b-it:free',
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

    // USING FREE MODEL - NO CREDITS NEEDED!
    const modelId = 'google/gemma-3-27b-it:free'
    const modelName = 'Gemma 3 27B (Free)'

    console.log('🤖 Using Free Model:', modelId)

    // ============================================
    // CALL OPENROUTER API WITH FREE MODEL
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
      
      if (response.status === 402 || data.error?.message?.includes('credits') || data.error?.message?.includes('insufficient')) {
        return NextResponse.json({
          consensus: `⚠️ This free model may have daily limits. Try again later or use a different free model.`,
          consensus_score: 0,
          confidence: 0,
          error: 'free_model_limit',
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
    const tokensUsed = data.usage?.total_tokens || 0

    console.log('✅ Success! Tokens used:', tokensUsed)

    return NextResponse.json({
      success: true,
      consensus: aiResponse,
      consensus_score: 85,
      confidence: 80,
      model_used: modelName,
      tokens_used: tokensUsed,
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
