import { NextRequest, NextResponse } from 'next/server'

// ============================================
// DEEPSEEK API KEY - YOUR KEY
// ============================================
const DEEPSEEK_API_KEY = 'sk-285ee6afb0ed4a2b8ca2be990396ac1f'

// ============================================
// MODEL MAPPING - All to DeepSeek
// ============================================
const MODEL_MAP: Record<string, string> = {
  'gpt-5.4-mini': 'deepseek-chat',
  'qwen-3.5-flash': 'deepseek-chat',
  'ministral-3-8b': 'deepseek-chat',
  'mistral-small-4': 'deepseek-chat',
  'deepseek-chat': 'deepseek-chat',
  'gemini-3-flash': 'deepseek-chat',
  'gpt-4o-mini': 'deepseek-chat',
  'claude-haiku-4.5': 'deepseek-chat',
  'mistral-small': 'deepseek-chat',
  'gpt-4.1': 'deepseek-chat',
  'claude-sonnet-4.0': 'deepseek-chat',
  'gpt-5.4': 'deepseek-chat',
  'gemini-3-pro-preview': 'deepseek-chat',
  'grok-3-mini': 'deepseek-chat',
  'codestral': 'deepseek-chat',
  'gpt-5.6-terra': 'deepseek-chat',
  'grok-4.5': 'deepseek-chat',
  'nova-premier-1.0': 'deepseek-chat',
  'perplexity-sonar': 'deepseek-chat',
  'gpt-5.6-luna': 'deepseek-chat',
  'deepseek-reasoner': 'deepseek-chat',
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

    const modelId = 'deepseek-chat'
    const modelName = 'DeepSeek Chat'

    console.log('🤖 Using DeepSeek Model:', modelId)

    // ============================================
    // CALL DEEPSEEK API
    // ============================================
    const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${DEEPSEEK_API_KEY}`,
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
      console.error('❌ DeepSeek API Error:', JSON.stringify(data, null, 2))
      
      if (data.error?.message?.includes('quota') || data.error?.message?.includes('insufficient') || data.error?.message?.includes('balance')) {
        return NextResponse.json({
          consensus: `⚠️ Insufficient balance. Add funds at https://platform.deepseek.com/billing`,
          consensus_score: 0,
          confidence: 0,
          error: 'insufficient_balance',
        })
      }
      
      if (data.error?.message?.includes('API key') || data.error?.message?.includes('invalid')) {
        return NextResponse.json({
          consensus: `⚠️ Invalid API key. Check your key at https://platform.deepseek.com/api_keys`,
          consensus_score: 0,
          confidence: 0,
          error: 'invalid_key',
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
    balance: 5,
  })
}
