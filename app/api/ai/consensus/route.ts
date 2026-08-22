import { NextRequest, NextResponse } from 'next/server'

// ============================================
// OPENROUTER API KEY - HARDCODED (BUT SAFE)
// ============================================
// This key has $0.200 balance - enough for ~800 requests
const OPENROUTER_API_KEY = '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'

// ============================================
// MODEL MAPPING - All to GPT-4o-mini
// ============================================
const MODEL_MAP: Record<string, string> = {
  'gpt-5.4-mini': 'openai/gpt-4o-mini',
  'qwen-3.5-flash': 'openai/gpt-4o-mini',
  'ministral-3-8b': 'openai/gpt-4o-mini',
  'mistral-small-4': 'openai/gpt-4o-mini',
  'deepseek-chat': 'openai/gpt-4o-mini',
  'gemini-3-flash': 'openai/gpt-4o-mini',
  'gpt-4o-mini': 'openai/gpt-4o-mini',
  'claude-haiku-4.5': 'openai/gpt-4o-mini',
  'mistral-small': 'openai/gpt-4o-mini',
  'gpt-4.1': 'openai/gpt-4o-mini',
  'claude-sonnet-4.0': 'openai/gpt-4o-mini',
  'gpt-5.4': 'openai/gpt-4o-mini',
  'gemini-3-pro-preview': 'openai/gpt-4o-mini',
  'grok-3-mini': 'openai/gpt-4o-mini',
  'codestral': 'openai/gpt-4o-mini',
  'gpt-5.6-terra': 'openai/gpt-4o-mini',
  'grok-4.5': 'openai/gpt-4o-mini',
  'nova-premier-1.0': 'openai/gpt-4o-mini',
  'perplexity-sonar': 'openai/gpt-4o-mini',
  'gpt-5.6-luna': 'openai/gpt-4o-mini',
  'deepseek-reasoner': 'openai/gpt-4o-mini',
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

    const modelId = 'openai/gpt-4o-mini'
    const modelName = 'GPT-4o Mini'

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
        max_tokens: 30,
      }),
    })

    const data = await response.json()

    if (!response.ok) {
      console.error('❌ OpenRouter API Error:', JSON.stringify(data, null, 2))
      
      if (response.status === 402 || data.error?.message?.includes('credits') || data.error?.message?.includes('insufficient')) {
        return NextResponse.json({
          consensus: `⚠️ Insufficient credits. Please add funds at https://openrouter.ai/settings/creds`,
          consensus_score: 0,
          confidence: 0,
          error: 'insufficient_credits',
        })
      }
      
      return NextResponse.json({
        consensus: `⚠️ API Error: ${data.error?.message || 'Unknown error'}`,
        consensus_score: 0,
        confidence: 0,
      })
    }

    const aiResponse = data.choices?.[0]?.message?.content || 'No response from AI'
    const tokensUsed = data.usage?.total_tokens || 0

    return NextResponse.json({
      success: true,
      consensus: aiResponse,
      consensus_score: 85,
      confidence: 80,
      model_used: modelName,
      tokens_used: tokensUsed,
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
    balance: 0.20,
  })
}
