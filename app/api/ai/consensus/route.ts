import { NextRequest, NextResponse } from 'next/server'

// ============================================
// OPENROUTER API KEY
// ============================================
const OPENROUTER_API_KEY = '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'

// ============================================
// MODEL MAPPING - USING FALLBACK FREE MODELS
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
// FALLBACK FREE MODELS (Try in order)
// ============================================
const FALLBACK_MODELS = [
  'microsoft/phi-3.5-mini-128k-instruct:free',
  'meta-llama/llama-3.2-3b-instruct:free',
  'google/gemma-2-9b-it:free',
  'microsoft/phi-3-mini-128k-instruct:free',
]

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

    let aiResponse = null
    let lastError = null

    // Try each fallback model in order
    for (const modelId of FALLBACK_MODELS) {
      try {
        console.log('🤖 Trying Model:', modelId)

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

        if (response.ok) {
          aiResponse = data.choices?.[0]?.message?.content || 'No response from AI'
          const modelName = modelId.replace(':free', '').replace('/', ' ')

          console.log('✅ Success! Model:', modelId)

          return NextResponse.json({
            success: true,
            consensus: aiResponse,
            consensus_score: 85,
            confidence: 80,
            model_used: modelName + ' (Free)',
            is_free: true,
          })
        } else {
          console.error(`❌ Model ${modelId} failed:`, data.error?.message)
          lastError = data.error?.message
        }
      } catch (error) {
        console.error(`❌ Model ${modelId} error:`, error)
        lastError = error instanceof Error ? error.message : 'Unknown error'
      }
    }

    // If all models failed
    return NextResponse.json({
      consensus: `⚠️ No free models available. Error: ${lastError || 'All models failed'}`,
      consensus_score: 0,
      confidence: 0,
      error: 'all_models_failed',
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
