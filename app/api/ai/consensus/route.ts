import { NextRequest, NextResponse } from 'next/server'

// ============================================
// OPENROUTER API KEY - YOUR KEY (FREE MODELS)
// ============================================
const OPENROUTER_API_KEY = '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'

// ============================================
// MODEL MAPPING - USING FREE MODELS
// ============================================
const MODEL_MAP: Record<string, string> = {
  'gpt-5.4-mini': 'meta-llama/llama-3.2-3b-instruct:free',
  'qwen-3.5-flash': 'meta-llama/llama-3.2-3b-instruct:free',
  'ministral-3-8b': 'meta-llama/llama-3.2-3b-instruct:free',
  'mistral-small-4': 'meta-llama/llama-3.2-3b-instruct:free',
  'deepseek-chat': 'meta-llama/llama-3.2-3b-instruct:free',
  'gemini-3-flash': 'meta-llama/llama-3.2-3b-instruct:free',
  'gpt-4o-mini': 'meta-llama/llama-3.2-3b-instruct:free',
  'claude-haiku-4.5': 'meta-llama/llama-3.2-3b-instruct:free',
  'mistral-small': 'meta-llama/llama-3.2-3b-instruct:free',
  'gpt-4.1': 'meta-llama/llama-3.2-3b-instruct:free',
  'claude-sonnet-4.0': 'meta-llama/llama-3.2-3b-instruct:free',
  'gpt-5.4': 'meta-llama/llama-3.2-3b-instruct:free',
  'gemini-3-pro-preview': 'meta-llama/llama-3.2-3b-instruct:free',
  'grok-3-mini': 'meta-llama/llama-3.2-3b-instruct:free',
  'codestral': 'meta-llama/llama-3.2-3b-instruct:free',
  'gpt-5.6-terra': 'meta-llama/llama-3.2-3b-instruct:free',
  'grok-4.5': 'meta-llama/llama-3.2-3b-instruct:free',
  'nova-premier-1.0': 'meta-llama/llama-3.2-3b-instruct:free',
  'perplexity-sonar': 'meta-llama/llama-3.2-3b-instruct:free',
  'gpt-5.6-luna': 'meta-llama/llama-3.2-3b-instruct:free',
  'deepseek-reasoner': 'meta-llama/llama-3.2-3b-instruct:free',
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
    const modelId = 'meta-llama/llama-3.2-3b-instruct:free'
    const modelName = 'Llama 3.2 3B (Free)'

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
      
      return NextResponse.json({
        consensus: `⚠️ API Error: ${data.error?.message || 'Unknown error'}`,
        consensus_score: 0,
        confidence: 0,
      })
    }

    const aiResponse = data.choices?.[0]?.message?.content || 'No response from AI'

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
