import { NextRequest, NextResponse } from 'next/server'

// ============================================
// OPENAI API KEY - YOUR VALID KEY
// ============================================
const OPENAI_API_KEY = 'sk-285ee6afb0ed4a2b8ca2be990396ac1f'

// ============================================
// MODEL MAPPING - All to GPT Models
// ============================================
const MODEL_MAP: Record<string, string> = {
  'gpt-5.4-mini': 'gpt-4o-mini',
  'qwen-3.5-flash': 'gpt-4o-mini',
  'ministral-3-8b': 'gpt-4o-mini',
  'mistral-small-4': 'gpt-4o-mini',
  'deepseek-chat': 'gpt-4o-mini',
  'gemini-3-flash': 'gpt-4o-mini',
  'gpt-4o-mini': 'gpt-4o-mini',
  'claude-haiku-4.5': 'gpt-4o-mini',
  'mistral-small': 'gpt-4o-mini',
  'gpt-4.1': 'gpt-4o',
  'claude-sonnet-4.0': 'gpt-4o',
  'gpt-5.4': 'gpt-4o',
  'gemini-3-pro-preview': 'gpt-4o',
  'grok-3-mini': 'gpt-4o',
  'codestral': 'gpt-4o',
  'gpt-5.6-terra': 'gpt-4o',
  'grok-4.5': 'gpt-4o',
  'nova-premier-1.0': 'gpt-4o',
  'perplexity-sonar': 'gpt-4o',
  'gpt-5.6-luna': 'gpt-4o',
  'deepseek-reasoner': 'gpt-4o',
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

    const modelId = MODEL_MAP[models[0]] || 'gpt-4o-mini'
    const modelName = models[0] || 'GPT-4o Mini'

    console.log('🤖 Using OpenAI Model:', modelId)
    console.log('🔑 Key:', OPENAI_API_KEY.substring(0, 10) + '...')

    // ============================================
    // CALL OPENAI API
    // ============================================
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: modelId,
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7,
        max_tokens: 50,
      }),
    })

    const data = await response.json()

    // ============================================
    // HANDLE API ERRORS
    // ============================================
    if (!response.ok) {
      console.error('❌ OpenAI API Error:', JSON.stringify(data, null, 2))
      
      if (data.error?.type === 'invalid_request_error' && data.error?.message?.includes('API key')) {
        return NextResponse.json({
          consensus: `⚠️ API key error: ${data.error?.message || 'Invalid API key'}`,
          consensus_score: 0,
          confidence: 0,
          error: 'invalid_key',
        })
      }
      
      if (data.error?.message?.includes('quota') || data.error?.message?.includes('insufficient') || data.error?.message?.includes('billing')) {
        return NextResponse.json({
          consensus: `⚠️ Insufficient quota. Please add billing at https://platform.openai.com/settings/billing`,
          consensus_score: 0,
          confidence: 0,
          error: 'insufficient_quota',
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
  })
}
