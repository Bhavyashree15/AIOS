import { NextRequest, NextResponse } from 'next/server'

// ============================================
// OPENROUTER API KEY - THE ONE WITH $0.200
// ============================================
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY || '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'

// ============================================
// MODEL MAPPING - PAID MODELS
// ============================================
const MODEL_MAP: Record<string, string> = {
  'gpt-5.4-mini': 'openai/gpt-4o-mini',
  'qwen-3.5-flash': 'qwen/qwen-2.5-72b',
  'ministral-3-8b': 'mistralai/mistral-small-3.1-24b',
  'mistral-small-4': 'mistralai/mistral-small-3.1-24b',
  'deepseek-chat': 'deepseek/deepseek-r1',
  'gemini-3-flash': 'google/gemini-1.5-flash',
  'gpt-4o-mini': 'openai/gpt-4o-mini',
  'claude-haiku-4.5': 'anthropic/claude-3-haiku',
  'mistral-small': 'mistralai/mistral-small-3.1-24b',
  'gpt-4.1': 'openai/gpt-4o',
  'claude-sonnet-4.0': 'anthropic/claude-3.5-sonnet',
  'gpt-5.4': 'openai/gpt-4o',
  'gemini-3-pro-preview': 'google/gemini-1.5-pro',
  'grok-3-mini': 'x-ai/grok-2-1212',
  'codestral': 'mistralai/codestral-2501',
  'gpt-5.6-terra': 'openai/gpt-4o',
  'grok-4.5': 'x-ai/grok-2-1212',
  'nova-premier-1.0': 'openai/gpt-4o',
  'perplexity-sonar': 'perplexity/sonar-small-online',
  'gpt-5.6-luna': 'openai/gpt-4o',
  'deepseek-reasoner': 'deepseek/deepseek-r1',
}

// ============================================
// WALLET
// ============================================
let walletBalance = 0.20

function calculateCost(modelId: string, tokens: number): number {
  const rates: Record<string, number> = {
    'openai/gpt-4o': 0.005,
    'openai/gpt-4o-mini': 0.0005,
    'anthropic/claude-3.5-sonnet': 0.003,
    'anthropic/claude-3-haiku': 0.0008,
    'google/gemini-1.5-pro': 0.0025,
    'google/gemini-1.5-flash': 0.0005,
    'deepseek/deepseek-r1': 0.0015,
    'qwen/qwen-2.5-72b': 0.0008,
    'mistralai/mistral-small-3.1-24b': 0.001,
    'x-ai/grok-2-1212': 0.002,
    'mistralai/codestral-2501': 0.001,
    'perplexity/sonar-small-online': 0.0006,
  }
  const rate = rates[modelId] || 0.001
  return (tokens / 1000) * rate * 1.2
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

    const modelId = MODEL_MAP[models[0]] || 'openai/gpt-4o-mini'

    // ============================================
    // CALL OPENROUTER API WITH LOW TOKENS
    // ============================================
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://github.com/Bhayashree15/AIOS',
        'X-Title': 'AIOS',
      },
      body: JSON.stringify({
        model: modelId,
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7,
        max_tokens: 30,  // ← VERY LOW TO SAVE CREDITS
      }),
    })

    const data = await response.json()

    // ============================================
    // HANDLE API ERRORS
    // ============================================
    if (!response.ok) {
      console.error('OpenRouter API Error:', data)
      
      if (response.status === 402 || data.error?.message?.includes('credits') || data.error?.message?.includes('insufficient')) {
        return NextResponse.json({
          consensus: `⚠️ Insufficient credits. Please add funds at https://openrouter.ai/settings/creds`,
          consensus_score: 0,
          confidence: 0,
          wallet_balance: walletBalance,
          error: 'insufficient_credits',
        })
      }
      
      return NextResponse.json({
        consensus: `⚠️ API Error: ${data.error?.message || 'Unknown error'}`,
        consensus_score: 0,
        confidence: 0,
        wallet_balance: walletBalance,
      })
    }

    // ============================================
    // GET THE AI RESPONSE
    // ============================================
    const aiResponse = data.choices?.[0]?.message?.content || 'No response from AI'
    const tokensUsed = data.usage?.total_tokens || 0

    // ============================================
    // CALCULATE COST
    // ============================================
    const cost = calculateCost(modelId, tokensUsed)
    walletBalance = Math.round((walletBalance - cost) * 100) / 100
    if (walletBalance < 0) walletBalance = 0

    // ============================================
    // RETURN RESPONSE
    // ============================================
    return NextResponse.json({
      success: true,
      consensus: aiResponse,
      consensus_score: 85,
      confidence: 80,
      model_used: modelId,
      cost_inr: cost,
      tokens_used: tokensUsed,
      wallet_balance: walletBalance,
    })

  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json({
      consensus: `⚠️ Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
      consensus_score: 0,
      confidence: 0,
      wallet_balance: walletBalance,
    })
  }
}

export async function GET() {
  return NextResponse.json({
    balance: Math.round(walletBalance * 100) / 100,
  })
}
