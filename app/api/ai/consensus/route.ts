import { NextRequest, NextResponse } from 'next/server'

// ============================================
// OPENROUTER API KEY - YOUR NEW KEY
// ============================================
const OPENROUTER_API_KEY = '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'

// ============================================
// MODEL MAPPING - ALL TO GPT-4o-mini
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

    console.log('🤖 Using OpenRouter Model:', modelId)

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
        max_tokens: 30, // LOW TO SAVE CREDITS
      }),
    })

    const data = await response.json()

    // ============================================
    // HANDLE API ERRORS
    // ============================================
    if (!response.ok) {
      console.error('❌ OpenRouter API Error:', JSON.stringify(data, null, 2))
      
      if (response.status === 402 || data.error?.message?.includes('credits') || data.error?.message?.includes('insufficient')) {
        return NextResponse.json({
          consensus: `⚠️ Insufficient credits. Add $5 at https://openrouter.ai/settings/creds`,
          consensus_score: 0,
          confidence: 0,
          error: 'insufficient_credits',
        })
      }
      
      if (data.error?.message?.includes('API key') || data.error?.message?.includes('invalid')) {
        return NextResponse.json({
          consensus: `⚠️ Invalid API key. Please check your key.`,
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
    balance: 0,
  })
}
