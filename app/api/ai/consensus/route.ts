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
// MODEL MAPPING - Gemini Models (Updated with correct names)
// ============================================
const MODEL_MAP: Record<string, string> = {
  // Free Models (Gemini Flash)
  'gpt-5.4-mini': 'gemini-2.0-flash-exp',
  'qwen-3.5-flash': 'gemini-2.0-flash-exp',
  'ministral-3-8b': 'gemini-2.0-flash-exp',
  'mistral-small-4': 'gemini-2.0-flash-exp',
  'deepseek-chat': 'gemini-2.0-flash-exp',
  'gemini-3-flash': 'gemini-2.0-flash-exp',
  'gpt-4o-mini': 'gemini-2.0-flash-exp',
  'claude-haiku-4.5': 'gemini-2.0-flash-exp',
  'mistral-small': 'gemini-2.0-flash-exp',
  // Paid/Pro Models (Gemini Pro)
  'gpt-4.1': 'gemini-1.5-pro',
  'claude-sonnet-4.0': 'gemini-1.5-pro',
  'gpt-5.4': 'gemini-1.5-pro',
  'gemini-3-pro-preview': 'gemini-1.5-pro',
  'grok-3-mini': 'gemini-1.5-pro',
  'codestral': 'gemini-1.5-pro',
  'gpt-5.6-terra': 'gemini-1.5-pro',
  'grok-4.5': 'gemini-1.5-pro',
  'nova-premier-1.0': 'gemini-1.5-pro',
  'perplexity-sonar': 'gemini-1.5-pro',
  'gpt-5.6-luna': 'gemini-1.5-pro',
  'deepseek-reasoner': 'gemini-1.5-pro',
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

    // Try multiple model names if one fails
    const modelOptions = [
      'gemini-2.0-flash-exp',    // Latest flash model
      'gemini-2.0-flash',        // Regular flash
      'gemini-1.5-flash',        // Older flash
      'gemini-1.5-pro',          // Pro model
    ]
    
    let lastError = null
    let modelId = null
    let modelName = null
    let response = null
    let data = null

    // Try each model until one works
    for (const tryModel of modelOptions) {
      try {
        console.log(`🔄 Trying model: ${tryModel}`)
        
        const testResponse = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${tryModel}:generateContent?key=${GEMINI_API_KEY}`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              contents: [
                {
                  parts: [{ text: prompt || 'Hello' }]
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

        const testData = await testResponse.json()
        
        if (testResponse.ok) {
          modelId = tryModel
          modelName = tryModel
          response = testResponse
          data = testData
          console.log(`✅ Success with model: ${tryModel}`)
          break
        } else {
          console.log(`❌ Model ${tryModel} failed:`, testData.error?.message || 'Unknown error')
          lastError = testData.error?.message || 'Model not available'
        }
      } catch (error) {
        console.log(`❌ Model ${tryModel} error:`, error)
        lastError = error instanceof Error ? error.message : 'Unknown error'
      }
    }

    // If no model worked, return error
    if (!modelId || !response || !data) {
      console.error('❌ All models failed. Last error:', lastError)
      return NextResponse.json({
        consensus: `⚠️ No Gemini models available. Error: ${lastError || 'All models failed'}`,
        consensus_score: 0,
        confidence: 0,
        error: 'model_not_found',
      })
    }

    console.log('🤖 Using Gemini Model:', modelId)
    console.log('🔑 API Key:', GEMINI_API_KEY.substring(0, 10) + '...')

    // ============================================
    // HANDLE API ERRORS
    // ============================================
    if (!response.ok) {
      console.error('❌ Gemini API Error:', JSON.stringify(data, null, 2))
      
      // Check for quota/rate limit errors
      if (data.error?.message?.includes('quota') || data.error?.message?.includes('limit') || data.error?.message?.includes('exceeded')) {
        return NextResponse.json({
          consensus: `⚠️ Free tier quota exceeded. Try again later.`,
          consensus_score: 0,
          confidence: 0,
          error: 'quota_exceeded',
        })
      }
      
      // Check for API key errors
      if (data.error?.message?.includes('API key') || data.error?.message?.includes('authentication') || data.error?.message?.includes('credentials')) {
        return NextResponse.json({
          consensus: `⚠️ Invalid API key. Please check your Google API key. It must start with "AIza".`,
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
    })
  }
}

// ============================================
// GET ENDPOINT - For checking status
// ============================================
export async function GET() {
  // Check if API key is configured
  const hasKey = !!process.env.GOOGLE_API_KEY || !!process.env.Gemini_API_Key
  
  // Test which models are available
  const modelsToTest = [
    'gemini-2.0-flash-exp',
    'gemini-2.0-flash',
    'gemini-1.5-flash',
    'gemini-1.5-pro',
  ]
  
  const availableModels: string[] = []
  
  for (const model of modelsToTest) {
    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}?key=${GEMINI_API_KEY || ''}`,
        { method: 'GET' }
      )
      if (response.ok) {
        availableModels.push(model)
      }
    } catch (error) {
      // Model not available
    }
  }
  
  return NextResponse.json({
    has_api_key: hasKey,
    available_models: availableModels,
    balance: 100,
    is_free: true,
    note: availableModels.length === 0 ? 'No models available. Check your API key and permissions.' : undefined
  })
}
