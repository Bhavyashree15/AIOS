import { NextRequest, NextResponse } from 'next/server'

// ============================================
// GEMINI API KEY - FROM ENVIRONMENT VARIABLE
// ============================================
const GEMINI_API_KEY = process.env.GOOGLE_API_KEY || process.env.Gemini_API_Key

console.log('🔍 API Key exists?', !!GEMINI_API_KEY)
console.log('🔍 API Key prefix:', GEMINI_API_KEY ? GEMINI_API_KEY.substring(0, 10) + '...' : 'NO KEY')

// ============================================
// LIST OF MODELS TO TRY (in order of preference)
// ============================================
const MODELS_TO_TRY = [
  'gemini-2.0-flash-exp',
  'gemini-2.0-flash',
  'gemini-1.5-flash',
  'gemini-1.5-pro',
  'gemini-pro',
  'gemini-1.0-pro',
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

    if (!GEMINI_API_KEY) {
      console.error('❌ No API key found')
      return NextResponse.json({
        consensus: '⚠️ API key not configured. Please set GOOGLE_API_KEY or Gemini_API_Key environment variable.',
        consensus_score: 0,
        confidence: 0,
        error: 'missing_api_key',
      })
    }

    // Enhanced prompt for better quality
    const enhancedPrompt = `Provide a detailed, creative, and comprehensive response. Be specific, use vivid imagery, and include interesting details.

User request: ${prompt}`

    let lastError = null
    let successResponse = null

    // Try each model until one works
    for (const modelId of MODELS_TO_TRY) {
      try {
        console.log(`🔄 Trying model: ${modelId}`)
        
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelId}:generateContent?key=${GEMINI_API_KEY}`
        
        const response = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents: [
              {
                parts: [{ text: enhancedPrompt }]
              }
            ],
            generationConfig: {
              temperature: 0.9,
              maxOutputTokens: 600,
              topP: 0.95,
              topK: 40,
            }
          }),
        })

        const data = await response.json()
        
        console.log(`📊 ${modelId} response status:`, response.status)
        console.log(`📊 ${modelId} response data:`, JSON.stringify(data).substring(0, 500))

        if (response.ok && data.candidates && data.candidates.length > 0) {
          const aiResponse = data.candidates[0].content.parts[0].text
          console.log(`✅ Success with model: ${modelId}`)
          console.log(`📝 Response length: ${aiResponse.length}`)
          
          return NextResponse.json({
            success: true,
            consensus: aiResponse,
            consensus_score: 85,
            confidence: 80,
            model_used: modelId,
            tokens_used: data.usageMetadata?.totalTokenCount || 0,
            is_free: true,
          })
        } else {
          const errorMsg = data.error?.message || 'Unknown error'
          console.log(`❌ ${modelId} failed:`, errorMsg)
          lastError = errorMsg
          
          // If it's a key error, stop trying
          if (errorMsg.includes('API key') || errorMsg.includes('authentication') || errorMsg.includes('permission')) {
            console.error('❌ API Key error, stopping attempts')
            return NextResponse.json({
              consensus: `⚠️ Invalid API key: ${errorMsg}`,
              consensus_score: 0,
              confidence: 0,
              error: 'invalid_key',
            })
          }
        }
      } catch (error) {
        console.log(`❌ ${modelId} error:`, error)
        lastError = error instanceof Error ? error.message : 'Unknown error'
      }
    }

    // If all models failed
    console.error('❌ All models failed. Last error:', lastError)
    return NextResponse.json({
      consensus: `⚠️ No available models. Error: ${lastError || 'All models failed'}`,
      consensus_score: 0,
      confidence: 0,
      error: 'model_not_found',
      debug: {
        models_tried: MODELS_TO_TRY,
        last_error: lastError,
      }
    })

  } catch (error) {
    console.error('❌ API Error:', error)
    return NextResponse.json({
      consensus: `⚠️ Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
      consensus_score: 0,
      confidence: 0,
      error: 'api_error',
    })
  }
}

// ============================================
// GET ENDPOINT - Debug available models
// ============================================
export async function GET() {
  const hasKey = !!process.env.GOOGLE_API_KEY || !!process.env.Gemini_API_Key
  
  if (!hasKey) {
    return NextResponse.json({
      has_api_key: false,
      error: 'No API key found',
      message: 'Please set GOOGLE_API_KEY or Gemini_API_Key environment variable',
    })
  }

  // Test each model to see which ones work
  const results: Record<string, any> = {}
  let workingModels: string[] = []

  for (const modelId of MODELS_TO_TRY) {
    try {
      console.log(`🔍 Testing model: ${modelId}`)
      
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
                parts: [{ text: 'Say "Hello" in one word' }]
              }
            ],
            generationConfig: {
              temperature: 0.7,
              maxOutputTokens: 10,
            }
          }),
        }
      )
      
      const data = await response.json()
      
      results[modelId] = {
        status: response.status,
        ok: response.ok,
        error: data.error?.message || null,
        has_candidates: !!(data.candidates && data.candidates.length > 0),
      }
      
      if (response.ok && data.candidates && data.candidates.length > 0) {
        workingModels.push(modelId)
        console.log(`✅ ${modelId} works!`)
      } else {
        console.log(`❌ ${modelId} failed:`, data.error?.message || 'Unknown')
      }
    } catch (error) {
      results[modelId] = {
        status: 'error',
        ok: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        has_candidates: false,
      }
      console.log(`❌ ${modelId} error:`, error)
    }
  }

  return NextResponse.json({
    has_api_key: hasKey,
    key_prefix: GEMINI_API_KEY ? GEMINI_API_KEY.substring(0, 10) + '...' : null,
    working_models: workingModels,
    all_results: results,
    note: workingModels.length === 0 ? 'No models available. Check your API key and ensure Gemini API is enabled in Google Cloud Console.' : undefined,
  })
}
