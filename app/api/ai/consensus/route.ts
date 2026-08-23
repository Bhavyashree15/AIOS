import { NextRequest, NextResponse } from 'next/server'

// ============================================
// GEMINI API KEY - FROM ENVIRONMENT VARIABLE
// ============================================
// Get your key from: https://aistudio.google.com/app/apikey
// Key must start with "AIza"
// Supports both naming conventions
const GEMINI_API_KEY = process.env.GOOGLE_API_KEY || process.env.Gemini_API_Key

// ============================================
// DEBUG LOGGING (Remove after fixing)
// ============================================
console.log('🔍 Environment Variables Check:')
console.log('  - GOOGLE_API_KEY exists?', !!process.env.GOOGLE_API_KEY)
console.log('  - Gemini_API_Key exists?', !!process.env.Gemini_API_Key)
console.log('  - GEMINI_API_KEY value:', GEMINI_API_KEY ? GEMINI_API_KEY.substring(0, 10) + '...' : 'NOT FOUND')

if (!GEMINI_API_KEY) {
  console.warn('⚠️ GOOGLE_API_KEY or Gemini_API_Key environment variable is not set')
}

// ============================================
// MODEL MAPPING - Gemini 3 Models (Preview)
// ============================================
const MODEL_MAP: Record<string, string> = {
  // Free/Preview Models
  'gpt-5.4-mini': 'gemini-3-flash-preview',
  'qwen-3.5-flash': 'gemini-3-flash-preview',
  'ministral-3-8b': 'gemini-3-flash-preview',
  'mistral-small-4': 'gemini-3-flash-preview',
  'deepseek-chat': 'gemini-3-flash-preview',
  'gemini-3-flash': 'gemini-3-flash-preview',
  'gpt-4o-mini': 'gemini-3-flash-preview',
  'claude-haiku-4.5': 'gemini-3-flash-preview',
  'mistral-small': 'gemini-3-flash-preview',
  // Pro/Paid Models
  'gpt-4.1': 'gemini-3-pro-preview',
  'claude-sonnet-4.0': 'gemini-3-pro-preview',
  'gpt-5.4': 'gemini-3-pro-preview',
  'gemini-3-pro-preview': 'gemini-3-pro-preview',
  'grok-3-mini': 'gemini-3-pro-preview',
  'codestral': 'gemini-3-pro-preview',
  'gpt-5.6-terra': 'gemini-3-pro-preview',
  'grok-4.5': 'gemini-3-pro-preview',
  'nova-premier-1.0': 'gemini-3-pro-preview',
  'perplexity-sonar': 'gemini-3-pro-preview',
  'gpt-5.6-luna': 'gemini-3-pro-preview',
  'deepseek-reasoner': 'gemini-3-pro-preview',
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

    // Check if API key is configured
    if (!GEMINI_API_KEY) {
      console.error('❌ API key missing in POST request')
      return NextResponse.json({
        consensus: '⚠️ API key not configured. Please set GOOGLE_API_KEY or Gemini_API_Key environment variable.',
        consensus_score: 0,
        confidence: 0,
        error: 'missing_api_key',
      })
    }

    // Try Gemini 3 models first, then fallback
    const modelOptions = [
      { id: 'gemini-3-pro-preview', name: 'Gemini 3 Pro (Preview)' },
      { id: 'gemini-3-flash-preview', name: 'Gemini 3 Flash (Preview)' },
      { id: 'gemini-2.0-flash-exp', name: 'Gemini 2.0 Flash Exp' },
      { id: 'gemini-2.0-flash', name: 'Gemini 2.0 Flash' },
      { id: 'gemini-1.5-pro', name: 'Gemini 1.5 Pro' },
    ]
    
    let modelId = null
    let modelName = null
    let response = null
    let data = null
    let lastError = null

    // Try each model until one works
    for (const modelOption of modelOptions) {
      try {
        console.log(`🔄 Trying model: ${modelOption.id}`)
        
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelOption.id}:generateContent?key=${GEMINI_API_KEY}`
        
        const testResponse = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents: [
              {
                parts: [{ text: prompt || 'Say hello' }]
              }
            ],
            generationConfig: {
              temperature: 0.7,
              maxOutputTokens: 200,
            }
          }),
        })

        const testData = await testResponse.json()
        
        if (testResponse.ok && testData.candidates && testData.candidates.length > 0) {
          modelId = modelOption.id
          modelName = modelOption.name
          response = testResponse
          data = testData
          console.log(`✅ Success with model: ${modelOption.id}`)
          break
        } else {
          const errorMsg = testData.error?.message || 'Unknown error'
          console.log(`❌ Model ${modelOption.id} failed:`, errorMsg)
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
        console.log(`❌ Model ${modelOption.id} error:`, error)
        lastError = error instanceof Error ? error.message : 'Unknown error'
      }
    }

    // If no model worked, return error with details
    if (!modelId || !response || !data) {
      console.error('❌ All models failed. Last error:', lastError)
      return NextResponse.json({
        consensus: `⚠️ No Gemini models available. Error: ${lastError || 'All models failed'}`,
        consensus_score: 0,
        confidence: 0,
        error: 'model_not_found',
        debug: {
          key_prefix: GEMINI_API_KEY ? GEMINI_API_KEY.substring(0, 10) + '...' : null,
          last_error: lastError,
          models_tried: modelOptions.map(m => m.id)
        }
      })
    }

    console.log('🤖 Using Gemini Model:', modelId)

    // ============================================
    // GET THE AI RESPONSE
    // ============================================
    const aiResponse = data.candidates?.[0]?.content?.parts?.[0]?.text || 'No response from AI'
    const tokensUsed = data.usageMetadata?.totalTokenCount || 0

    console.log('✅ Success! Tokens used:', tokensUsed)
    console.log('📝 Response length:', aiResponse.length)

    return NextResponse.json({
      success: true,
      consensus: aiResponse,
      consensus_score: 85,
      confidence: 80,
      model_used: modelName,
      tokens_used: tokensUsed,
      is_free: true,
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
// GET ENDPOINT - For checking status
// ============================================
export async function GET() {
  const hasKey = !!process.env.GOOGLE_API_KEY || !!process.env.Gemini_API_Key
  
  if (!hasKey) {
    return NextResponse.json({
      has_api_key: false,
      error: 'No API key found',
      message: 'Please set GOOGLE_API_KEY or Gemini_API_Key environment variable',
      balance: 0,
      is_free: false,
    })
  }

  // Test Gemini 3 models first
  const modelsToTest = [
    'gemini-3-pro-preview',
    'gemini-3-flash-preview',
    'gemini-2.0-flash-exp',
    'gemini-2.0-flash',
    'gemini-1.5-pro',
  ]
  
  const availableModels: string[] = []
  const modelErrors: Record<string, string> = {}
  
  for (const model of modelsToTest) {
    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GEMINI_API_KEY}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents: [
              {
                parts: [{ text: 'Say hello' }]
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
      
      if (response.ok && data.candidates && data.candidates.length > 0) {
        availableModels.push(model)
      } else {
        modelErrors[model] = data.error?.message || 'Unknown error'
      }
    } catch (error) {
      modelErrors[model] = error instanceof Error ? error.message : 'Unknown error'
    }
  }
  
  return NextResponse.json({
    has_api_key: hasKey,
    available_models: availableModels,
    model_errors: modelErrors,
    balance: 100,
    is_free: true,
    key_prefix: GEMINI_API_KEY ? GEMINI_API_KEY.substring(0, 10) + '...' : null,
    note: availableModels.length === 0 ? 'No models available. Check your API key and ensure Gemini API is enabled.' : undefined
  })
}
