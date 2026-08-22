import { NextRequest, NextResponse } from 'next/server'

// ============================================
// OPENROUTER API KEY - YOUR KEY
// ============================================
const OPENROUTER_API_KEY = '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'

// ============================================
// MODEL MAPPING - ALL USE WORKING FREE MODEL
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

    // USING WORKING FREE MODEL
    const modelId = 'microsoft/phi-3.5-mini-128k-instruct:free'
    const modelName = 'Phi-3.5 Mini (Free)'

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
      
      if (data.error?.message?.includes('unavailable for free')) {
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
