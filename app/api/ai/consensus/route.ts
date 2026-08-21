import { NextRequest, NextResponse } from 'next/server'

// ============================================
// MODEL MAPPING
// ============================================
const MODEL_MAP: Record<string, string> = {
  'gpt-5.4-mini': 'openai/gpt-4o-mini',
  'gpt-4.1': 'openai/gpt-4o',
  'qwen-3.5-flash': 'qwen/qwen-2.5-72b',
  'deepseek-chat': 'deepseek/deepseek-r1',
  'claude-sonnet-4.0': 'anthropic/claude-3.5-sonnet',
  'gemini-3-flash': 'google/gemini-1.5-flash',
  'mistral-small-4': 'mistralai/mistral-small-3.1-24b',
  'ministral-3-8b': 'mistralai/mistral-small-3.1-24b',
}

// ============================================
// WALLET
// ============================================
let walletBalance = 100.00

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

    const modelId = MODEL_MAP[models[0]] || models[0]
    const apiKey = process.env.OPENROUTER_API_KEY || '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'

    // ============================================
    // CALL OPENROUTER API
    // ============================================
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://github.com/Bhayashree15/AIOS',
        'X-Title': 'AIOS',
      },
      body: JSON.stringify({
        model: modelId,
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7,
        max_tokens: 500,
      }),
    })

    const data = await response.json()

    // ============================================
    // HANDLE API ERRORS
    // ============================================
    if (!response.ok) {
      console.error('API Error:', data.error)
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
    // RETURN REAL RESPONSE
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
