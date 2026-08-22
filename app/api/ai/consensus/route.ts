import { NextRequest, NextResponse } from 'next/server'

// ============================================
// MODEL MAPPING - OpenRouter Free Models
// ============================================
const MODEL_MAP: Record<string, string> = {
  // All models mapped to free OpenRouter models
  'gpt-5.4-mini': 'google/gemma-2-9b-it:free',  // ✅ Correct: :free
  'qwen-3.5-flash': 'google/gemma-2-9b-it:free',
  'ministral-3-8b': 'google/gemma-2-9b-it:free',
  'mistral-small-4': 'google/gemma-2-9b-it:free',
  'deepseek-chat': 'deepseek/deepseek-r1:free',  // ✅ Correct
  'gemini-3-flash': 'google/gemini-2.0-flash-lite-001:free',  // ✅ Correct
  'gpt-4o-mini': 'google/gemma-2-9b-it:free',
  'claude-haiku-4.5': 'google/gemma-2-9b-it:free',
  'mistral-small': 'google/gemma-2-9b-it:free',
  'gpt-4.1': 'deepseek/deepseek-r1:free',
  'claude-sonnet-4.0': 'deepseek/deepseek-r1:free',
  'gpt-5.4': 'deepseek/deepseek-r1:free',
  'gemini-3-pro-preview': 'deepseek/deepseek-r1:free',
  'grok-3-mini': 'deepseek/deepseek-r1:free',
  'codestral': 'deepseek/deepseek-r1:free',
  'gpt-5.6-terra': 'deepseek/deepseek-r1:free',
  'grok-4.5': 'deepseek/deepseek-r1:free',
  'nova-premier-1.0': 'deepseek/deepseek-r1:free',
  'perplexity-sonar': 'deepseek/deepseek-r1:free',
  'gpt-5.6-luna': 'deepseek/deepseek-r1:free',
  'deepseek-reasoner': 'deepseek/deepseek-r1:free',
}

// ============================================
// OPENROUTER API KEY
// ============================================
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY || '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'

// ============================================
// WALLET
// ============================================
let walletBalance = 100.00

function calculateCost(modelId: string, tokens: number): number {
  // Free models cost nothing
  if (modelId.includes(':free')) {
    return 0
  }
  const rates: Record<string, number> = {
    'openai/gpt-4o': 0.005,
    'anthropic/claude-3.5-sonnet': 0.003,
    'google/gemini-1.5-pro': 0.0025,
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

    const modelId = MODEL_MAP[models[0]] || 'google/gemma-2-9b-it:free'

    // ============================================
    // CALL OPENROUTER API WITH FREE MODELS
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
        max_tokens: 200,
      }),
    })

    const data = await response.json()

    // ============================================
    // HANDLE API ERRORS
    // ============================================
    if (!response.ok) {
      console.error('OpenRouter API Error:', data)
      
      if (data.error?.code === 401 || data.error?.message?.includes('authentication') || data.error?.message?.includes('invalid credentials')) {
        return NextResponse.json({
          consensus: `⚠️ Authentication error. Please check your OpenRouter API key.`,
          consensus_score: 0,
          confidence: 0,
          wallet_balance: walletBalance,
          error: 'auth_error',
        })
      }
      
      if (response.status === 402 || data.error?.message?.includes('credits') || data.error?.message?.includes('insufficient')) {
        return NextResponse.json({
          consensus: `⚠️ Insufficient credits. Please use a free model or add funds at https://openrouter.ai/settings/creds`,
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
    // CALCULATE COST (Free models cost $0)
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
      is_free: modelId.includes(':free'),
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
