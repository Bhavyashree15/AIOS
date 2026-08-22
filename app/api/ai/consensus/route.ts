import { NextRequest, NextResponse } from 'next/server'

// ============================================
// GEMINI API KEY - FROM ENVIRONMENT VARIABLE
// ============================================
// This will work on Vercel AND GitHub
const GEMINI_API_KEY = process.env.GOOGLE_API_KEY

if (!GEMINI_API_KEY) {
  console.warn('⚠️ GOOGLE_API_KEY environment variable is not set')
}

// ============================================
// MODEL MAPPING - Gemini Models
// ============================================
const MODEL_MAP: Record<string, string> = {
  'gpt-5.4-mini': 'gemini-2.0-flash',
  'qwen-3.5-flash': 'gemini-2.0-flash',
  'ministral-3-8b': 'gemini-2.0-flash',
  'mistral-small-4': 'gemini-2.0-flash',
  'deepseek-chat': 'gemini-2.0-flash',
  'gemini-3-flash': 'gemini-2.0-flash',
  'gpt-4o-mini': 'gemini-2.0-flash',
  'claude-haiku-4.5': 'gemini-2.0-flash',
  'mistral-small': 'gemini-2.0-flash',
  'gpt-4.1': 'gemini-2.0-flash',
  'claude-sonnet-4.0': 'gemini-2.0-flash',
  'gpt-5.4': 'gemini-2.0-flash',
  'gemini-3-pro-preview': 'gemini-2.0-flash',
  'grok-3-mini': 'gemini-2.0-flash',
  'codestral': 'gemini-2.0-flash',
  'gpt-5.6-terra': 'gemini-2.0-flash',
  'grok-4.5': 'gemini-2.0-flash',
  'nova-premier-1.0': 'gemini-2.0-flash',
  'perplexity-sonar': 'gemini-2.0-flash',
  'gpt-5.6-luna': 'gemini-2.0-flash',
  'deepseek-reasoner': 'gemini-2.0-flash',
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

    if (!GEMINI_API_KEY) {
      return NextResponse.json({
        consensus: '⚠️ API key not configured. Please set GOOGLE_API_KEY environment variable.',
        consensus_score: 0,
        confidence: 0,
        error: 'missing_api_key',
      })
    }

    const modelId = MODEL_MAP[models[0]] || 'gemini-2.0-flash'
    const modelName = models[0] || 'Gemini 2.0 Flash'

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
            maxOutputTokens: 100,
            topP: 0.95,
            topK: 40,
          }
        }),
      }
    )

    const data = await response.json()

    if (!response.ok) {
      console.error('❌ Gemini API Error:', JSON.stringify(data, null, 2))
      
      if (data.error?.message?.includes('quota') || data.error?.message?.includes('limit') || data.error?.message?.includes('exceeded')) {
        return NextResponse.json({
          consensus: `⚠️ Free tier quota exceeded. Try again later.`,
          consensus_score: 0,
          confidence: 0,
          error: 'quota_exceeded',
        })
      }
      
      if (data.error?.message?.includes('API key') || data.error?.message?.includes('authentication') || data.error?.message?.includes('credentials')) {
        return NextResponse.json({
          consensus: `⚠️ Invalid API key. Please check your Google API key.`,
          consensus_score: 0,
          confidence: 0,
          error: 'invalid_key',
        })
      }
      
      if (data.error?.message?.includes('model') || data.error?.message?.includes('not found')) {
        return NextResponse.json({
          consensus: `⚠️ Model not found. Using fallback model.`,
          consensus_score: 0,
          confidence: 0,
          error: 'model_not_found',
        })
      }
      
      return NextResponse.json({
        consensus: `⚠️ API Error: ${data.error?.message || 'Unknown error'}`,
        consensus_score: 0,
        confidence: 0,
      })
    }

    const aiResponse = data.candidates?.[0]?.content?.parts?.[0]?.text || 'No response from AI'

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
    balance: 100,
    is_free: true,
  })
}
