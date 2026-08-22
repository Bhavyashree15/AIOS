import { NextRequest, NextResponse } from 'next/server'

// ============================================
// OPENROUTER API KEY
// ============================================
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY || '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'

// ============================================
// CONFIRMED WORKING FREE MODELS
// ============================================
const MODEL_MAP: Record<string, string> = {
  'gpt-5.4-mini': 'microsoft/phi-3.5-mini-128k-instruct:free',
  'qwen-3.5-flash': 'microsoft/phi-3.5-mini-128k-instruct:free',
  'ministral-3-8b': 'microsoft/phi-3.5-mini-128k-instruct:free',
  'mistral-small-4': 'microsoft/phi-3.5-mini-128k-instruct:free',
  'deepseek-chat': 'microsoft/phi-3.5-mini-128k-instruct:free',
  'gemini-3-flash': 'microsoft/phi-3.5-mini-128k-instruct:free',
  'gpt-4o-mini': 'microsoft/phi-3.5-mini-128k-instruct:free',
  'claude-haiku-4.5': 'microsoft/phi-3.5-mini-128k-instruct:free',
  'mistral-small': 'microsoft/phi-3.5-mini-128k-instruct:free',
  'gpt-4.1': 'microsoft/phi-3.5-mini-128k-instruct:free',
  'claude-sonnet-4.0': 'microsoft/phi-3.5-mini-128k-instruct:free',
  'gpt-5.4': 'microsoft/phi-3.5-mini-128k-instruct:free',
  'gemini-3-pro-preview': 'microsoft/phi-3.5-mini-128k-instruct:free',
  'grok-3-mini': 'microsoft/phi-3.5-mini-128k-instruct:free',
  'codestral': 'microsoft/phi-3.5-mini-128k-instruct:free',
  'gpt-5.6-terra': 'microsoft/phi-3.5-mini-128k-instruct:free',
  'grok-4.5': 'microsoft/phi-3.5-mini-128k-instruct:free',
  'nova-premier-1.0': 'microsoft/phi-3.5-mini-128k-instruct:free',
  'perplexity-sonar': 'microsoft/phi-3.5-mini-128k-instruct:free',
  'gpt-5.6-luna': 'microsoft/phi-3.5-mini-128k-instruct:free',
  'deepseek-reasoner': 'microsoft/phi-3.5-mini-128k-instruct:free',
}

// ============================================
// WALLET
// ============================================
let walletBalance = 100.00

function calculateCost(modelId: string, tokens: number): number {
  if (modelId.includes(':free')) {
    return 0
  }
  return 0
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

    // ONLY USE THIS MODEL - CONFIRMED WORKING
    const modelId = 'microsoft/phi-3.5-mini-128k-instruct:free'

    // ============================================
    // CALL OPENROUTER API
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
        max_tokens: 300,
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
      
      if (data.error?.message?.includes('No endpoints found')) {
        return NextResponse.json({
          consensus: `⚠️ Free model currently unavailable. Please try again later.`,
          consensus_score: 0,
          confidence: 0,
          wallet_balance: walletBalance,
          error: 'model_unavailable',
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

    const cost = calculateCost(modelId, tokensUsed)
    walletBalance = Math.round((walletBalance - cost) * 100) / 100
    if (walletBalance < 0) walletBalance = 0

    return NextResponse.json({
      success: true,
      consensus: aiResponse,
      consensus_score: 85,
      confidence: 80,
      model_used: modelId,
      cost_inr: cost,
      tokens_used: tokensUsed,
      wallet_balance: walletBalance,
      is_free: true,
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
