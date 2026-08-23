import { NextRequest, NextResponse } from 'next/server'

// ============================================
// GEMINI API KEY
// ============================================
const GEMINI_API_KEY = process.env.GOOGLE_API_KEY || process.env.Gemini_API_Key

// ============================================
// SIMPLE POST HANDLER
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

    if (!GEMINI_API_KEY) {
      console.error('❌ No API key found')
      return NextResponse.json({
        consensus: '⚠️ API key not configured.',
        consensus_score: 0,
        confidence: 0,
        error: 'missing_api_key',
      })
    }

    console.log('🔑 Using API Key prefix:', GEMINI_API_KEY.substring(0, 10) + '...')
    console.log('📝 Prompt:', prompt)

    // Try the simplest working model
    const modelId = 'gemini-pro'
    
    const requestBody = {
      contents: [
        {
          parts: [
            {
              text: prompt
            }
          ]
        }
      ],
      generationConfig: {
        temperature: 0.9,
        maxOutputTokens: 500,
      }
    }

    console.log('📤 Request body:', JSON.stringify(requestBody, null, 2))

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${modelId}:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      }
    )

    console.log('📊 Response status:', response.status)
    
    const data = await response.json()
    console.log('📊 Response data:', JSON.stringify(data, null, 2))

    if (!response.ok) {
      return NextResponse.json({
        consensus: `⚠️ API Error: ${data.error?.message || 'Unknown error'}`,
        consensus_score: 0,
        confidence: 0,
        error: 'api_error',
        debug: {
          status: response.status,
          error: data.error,
        }
      })
    }

    const aiResponse = data.candidates?.[0]?.content?.parts?.[0]?.text || 'No response'

    return NextResponse.json({
      success: true,
      consensus: aiResponse,
      consensus_score: 85,
      confidence: 80,
      model_used: modelId,
      tokens_used: data.usageMetadata?.totalTokenCount || 0,
      is_free: true,
    })

  } catch (error) {
    console.error('❌ API Error:', error)
    return NextResponse.json({
      consensus: `⚠️ Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
      consensus_score: 0,
      confidence: 0,
      error: 'api_error',
      debug: {
        error: error instanceof Error ? error.message : 'Unknown',
      }
    })
  }
}

// ============================================
// SIMPLE GET ENDPOINT
// ============================================
export async function GET() {
  const hasKey = !!process.env.GOOGLE_API_KEY || !!process.env.Gemini_API_Key
  
  if (!hasKey) {
    return NextResponse.json({
      has_api_key: false,
      message: 'No API key found. Please set GOOGLE_API_KEY or Gemini_API_Key.',
    })
  }

  // Simple test to see if API works
  try {
    const testResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models?key=${GEMINI_API_KEY}`,
      {
        method: 'GET',
      }
    )
    
    const testData = await testResponse.json()
    
    return NextResponse.json({
      has_api_key: true,
      key_prefix: GEMINI_API_KEY.substring(0, 10) + '...',
      api_status: testResponse.ok ? 'connected' : 'error',
      models_response: testData,
      note: testResponse.ok ? 'API is working. Check models list above.' : 'API error - check your key.',
    })
  } catch (error) {
    return NextResponse.json({
      has_api_key: true,
      key_prefix: GEMINI_API_KEY.substring(0, 10) + '...',
      api_status: 'error',
      error: error instanceof Error ? error.message : 'Unknown error',
      note: 'Failed to connect to Gemini API. Check your internet and API key.',
    })
  }
}
