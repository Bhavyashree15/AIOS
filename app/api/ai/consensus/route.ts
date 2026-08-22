import { NextRequest, NextResponse } from 'next/server'

// ============================================
// MODEL MAPPING - Gemini Models
// ============================================
const MODEL_MAP: Record<string, string> = {
  'gpt-5.4-mini': 'gemini-2.5-flash',
  'qwen-3.5-flash': 'gemini-2.5-flash',
  'ministral-3-8b': 'gemini-2.5-flash',
  'mistral-small-4': 'gemini-2.5-flash',
  'deepseek-chat': 'gemini-2.5-pro',
  'gemini-3-flash': 'gemini-2.5-flash',
  'gpt-4o-mini': 'gemini-2.5-flash',
  'claude-haiku-4.5': 'gemini-2.5-flash',
  'mistral-small': 'gemini-2.5-flash',
  'gpt-4.1': 'gemini-2.5-pro',
  'claude-sonnet-4.0': 'gemini-2.5-pro',
  'gpt-5.4': 'gemini-2.5-pro',
  'gemini-3-pro-preview': 'gemini-2.5-pro',
  'grok-3-mini': 'gemini-2.5-pro',
  'codestral': 'gemini-2.5-pro',
  'gpt-5.6-terra': 'gemini-2.5-pro',
  'grok-4.5': 'gemini-2.5-pro',
  'nova-premier-1.0': 'gemini-2.5-pro',
  'perplexity-sonar': 'gemini-2.5-pro',
  'gpt-5.6-luna': 'gemini-2.5-pro',
  'deepseek-reasoner': 'gemini-2.5-pro',
}

// ============================================
// GEMINI API KEY
// ============================================
const GEMINI_API_KEY = process.env.GOOGLE_API_KEY || 'AQ.Ab8RN6JJCByARllC4uNI-z959UCMSJXWatK8OHQAp4YFCk1viQ'

// ============================================
// WALLET
// ============================================
let walletBalance = 100.00

function calculateCost(modelId: string, tokens: number): number {
  // Gemini free tier is generous, but we still track usage
  const rates: Record<string, number> = {
    'gemini-2.5-flash': 0.0001,
    'gemini-2.5-pro': 0.0003,
  }
  const rate = rates[modelId] || 0.0001
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

    const modelId = MODEL_MAP[models[0]] || 'gemini-2.5-flash'

    // ============================================
    // CALL GEMINI API
    // ============================================
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${modelId}:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [{ text: prompt }]
            }
          ],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 100,  // Gemini free tier supports this
            topP: 0.95,
            topK: 40,
          }
        }),
      }
    )

    const data = await response.json()

    // ============================================
    // HANDLE API ERRORS
    // ============================================
    if (!response.ok) {
      console.error('Gemini API Error:', data)
      
      if (data.error?.message?.includes('quota') || data.error?.message?.includes('limit')) {
        return NextResponse.json({
          consensus: `⚠️ Free tier quota exceeded. Try again later or upgrade to paid tier.`,
          consensus_score: 0,
          confidence: 0,
          wallet_balance: walletBalance,
          error: 'quota_exceeded',
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
    const aiResponse = data.candidates?.[0]?.content?.parts?.[0]?.text || 'No response from AI'
    const tokensUsed = data.usageMetadata?.totalTokenCount || 0

    // ============================================
    // CALCULATE COST (Gemini is very cheap)
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
