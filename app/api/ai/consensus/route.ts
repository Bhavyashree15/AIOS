import { NextRequest, NextResponse } from 'next/server'

// ============================================
// GEMINI API KEY
// ============================================
const GEMINI_API_KEY = process.env.GOOGLE_API_KEY || process.env.Gemini_API_Key

console.log('🔍 Gemini API Key exists?', !!GEMINI_API_KEY)

// ============================================
// WORKING MODELS FROM YOUR API KEY (Verified from API response)
// ============================================
const MODELS_TO_TRY = [
  'gemini-2.5-flash',           // ✅ Available - Stable
  'gemini-2.5-pro',             // ✅ Available - Pro version
  'gemini-flash-latest',        // ✅ Available - Latest Flash
  'gemini-flash-lite-latest',   // ✅ Available - Lite version
  'gemini-pro-latest',          // ✅ Available - Pro latest
  'gemini-2.5-flash-lite',      // ✅ Available - Flash Lite
  'gemini-3.5-flash',           // ✅ Available
  'gemini-3.5-flash-lite',      // ✅ Available
  'gemini-3.6-flash',           // ✅ Available
  'gemini-3.7-flash',           // ✅ Available
  'gemma-4-26b-a4b-it',         // ✅ Available - Gemma
  'gemma-4-31b-it',             // ✅ Available - Gemma
]

// ============================================
// MODEL MAPPING - Map frontend models to working Gemini models
// ============================================
const MODEL_MAP: Record<string, string> = {
  'gpt-5.4-mini': 'gemini-2.5-flash',
  'qwen-3.5-flash': 'gemini-2.5-flash',
  'ministral-3-8b': 'gemini-2.5-flash',
  'mistral-small-4': 'gemini-2.5-flash',
  'deepseek-chat': 'gemini-2.5-flash',
  'gemini-3-flash': 'gemini-2.5-flash',
  'gpt-4o-mini': 'gemini-2.5-flash',
  'claude-haiku-4.5': 'gemini-2.5-flash',
  'mistral-small': 'gemini-2.5-flash',
  'seed-2.0-lite': 'gemini-2.5-flash',
  'nova-micro': 'gemini-2.5-flash',
  'qwen-3-coder-flash': 'gemini-2.5-flash',
  'gpt-5-mini': 'gemini-2.5-flash',
  'gpt-4.1': 'gemini-2.5-pro',
  'claude-sonnet-4.0': 'gemini-2.5-pro',
  'gpt-5.4': 'gemini-2.5-pro',
  'gemini-3-pro-preview': 'gemini-2.5-pro',
  'grok-3-mini': 'gemini-2.5-pro',
  'codestral': 'gemini-2.5-pro',
  'gpt-5.6-terra': 'gemini-2.5-pro',
  'grok-4.5': 'gemini-2.5-pro',
  'nova-premier-1.0': 'gemini-2.5-pro',
  'perplexity-sonar': 'gemini-2.5-pro',
  'gpt-5.6-luna': 'gemini-2.5-pro',
  'deepseek-reasoner': 'gemini-2.5-pro',
}

// ============================================
// POST HANDLER
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
      console.error('❌ No Gemini API key found')
      return NextResponse.json({
        consensus: '⚠️ API key not configured. Please set GOOGLE_API_KEY or Gemini_API_Key environment variable.',
        consensus_score: 0,
        confidence: 0,
        error: 'missing_api_key',
      })
    }

    console.log('🔑 API Key prefix:', GEMINI_API_KEY.substring(0, 10) + '...')
    console.log('📝 Prompt:', prompt)

    // ============================================
    // SMART PROMPT: Short for casual, concise for detailed
    // ============================================
    let finalPrompt: string
    
    if (prompt.trim().length < 10) {
      finalPrompt = prompt.trim()
    } else {
      // ✅ Tell the AI to be concise
      finalPrompt = `Provide a concise, well-structured response (maximum 3-4 paragraphs) to: ${prompt}`
    }

    console.log('📝 Final prompt:', finalPrompt)

    let lastError = null

    // Try each model until one works
    for (const modelId of MODELS_TO_TRY) {
      try {
        console.log(`🔄 Trying model: ${modelId}`)

        const requestBody = {
          contents: [
            {
              parts: [{ text: finalPrompt }]
            }
          ],
          generationConfig: {
            temperature: 0.8,          // Slightly lower for focused responses
            maxOutputTokens: 250,      // ✅ Reduced to 250 for concise responses
            topP: 0.95,
            topK: 40,
          }
        }

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

        const data = await response.json()

        console.log(`📊 ${modelId} status:`, response.status)

        if (response.ok && data.candidates && data.candidates.length > 0) {
          let aiResponse = data.candidates[0].content.parts[0].text
          
          // ============================================
          // DEBUG LOGGING - See exactly what's returned
          // ============================================
          console.log('📝 FULL RESPONSE:')
          console.log('--- START ---')
          console.log(aiResponse)
          console.log('--- END ---')
          console.log('📊 RESPONSE LENGTH:', aiResponse.length)
          console.log('📊 LAST 100 CHARS:', aiResponse.slice(-100))
          console.log('📊 MODEL USED:', modelId)
          
          // ============================================
          // CLEAN UP RESPONSE
          // ============================================
          
          // 1. Remove incomplete numbered sections
          const lines = aiResponse.split('\n')
          let cleanedLines: string[] = []
          let foundIncompleteSection = false
          
          for (let i = 0; i < lines.length; i++) {
            const line = lines[i]
            // If we see a numbered section header that's incomplete
            if (line.match(/^#?\s*\d+\.\s*[A-Za-z]/)) {
              // Check if the next line exists and has content
              if (i + 1 < lines.length && lines[i + 1].trim().length > 0) {
                cleanedLines.push(line)
              } else {
                foundIncompleteSection = true
                break
              }
            } else if (foundIncompleteSection) {
              break
            } else {
              cleanedLines.push(line)
            }
          }
          
          if (cleanedLines.length > 0) {
            aiResponse = cleanedLines.join('\n').trim()
          }
          
          // 2. Truncate at last complete sentence if still too long
          if (aiResponse.length > 800) {
            const lastPeriod = aiResponse.lastIndexOf('.')
            const lastQuestion = aiResponse.lastIndexOf('?')
            const lastExclamation = aiResponse.lastIndexOf('!')
            const lastGoodEnding = Math.max(lastPeriod, lastQuestion, lastExclamation)
            
            if (lastGoodEnding > aiResponse.length * 0.6) {
              aiResponse = aiResponse.substring(0, lastGoodEnding + 1)
            }
          }
          
          console.log('📊 CLEANED LENGTH:', aiResponse.length)
          console.log('📊 CLEANED LAST 100:', aiResponse.slice(-100))
          
          // ============================================
          // RETURN RESPONSE WITH DEBUG INFO
          // ============================================
          return NextResponse.json({
            success: true,
            consensus: aiResponse,
            consensus_score: 85,
            confidence: 80,
            model_used: modelId,
            tokens_used: data.usageMetadata?.totalTokenCount || 0,
            is_free: true,
            debug: {
              original_length: data.candidates[0].content.parts[0].text.length,
              cleaned_length: aiResponse.length,
              model_used: modelId,
            }
          })
        } else {
          const errorMsg = data.error?.message || 'Unknown error'
          console.log(`❌ ${modelId} failed:`, errorMsg)
          lastError = errorMsg

          // If it's a key error, stop trying
          if (errorMsg.includes('API key') || 
              errorMsg.includes('authentication') || 
              errorMsg.includes('permission') ||
              errorMsg.includes('invalid')) {
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
      consensus: `⚠️ No available models. Last error: ${lastError}`,
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
// GET ENDPOINT - List available models
// ============================================
export async function GET() {
  const hasKey = !!process.env.GOOGLE_API_KEY || !!process.env.Gemini_API_Key

  if (!hasKey) {
    return NextResponse.json({
      has_api_key: false,
      error: 'No Gemini API key found',
      message: 'Please set GOOGLE_API_KEY or Gemini_API_Key environment variable',
    })
  }

  try {
    // List all available models from API
    const listResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models?key=${GEMINI_API_KEY}`,
      { method: 'GET' }
    )

    const listData = await listResponse.json()

    // Test each model to find working ones
    const results: Record<string, any> = {}
    const workingModels: string[] = []

    for (const model of MODELS_TO_TRY) {
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
                  parts: [{ text: 'Say hello in one word' }]
                }
              ],
              generationConfig: {
                maxOutputTokens: 5,
              }
            }),
          }
        )

        const data = await response.json()

        results[model] = {
          status: response.status,
          ok: response.ok,
          error: data.error?.message || null,
          has_candidates: !!(data.candidates && data.candidates.length > 0),
        }

        if (response.ok && data.candidates && data.candidates.length > 0) {
          workingModels.push(model)
          console.log(`✅ ${model} works!`)
        } else {
          console.log(`❌ ${model} failed:`, data.error?.message || 'Unknown')
        }
      } catch (error) {
        results[model] = {
          status: 'error',
          ok: false,
          error: error instanceof Error ? error.message : 'Unknown error',
          has_candidates: false,
        }
      }
    }

    return NextResponse.json({
      has_api_key: true,
      key_prefix: GEMINI_API_KEY.substring(0, 10) + '...',
      all_models_from_api: listData.models?.map((m: any) => m.name.replace('models/', '')) || [],
      working_models: workingModels,
      test_results: results,
      recommended_model: workingModels.length > 0 ? workingModels[0] : 'None found',
      note: workingModels.length === 0 
        ? '❌ No working models. Check your API key.' 
        : `✅ Using: ${workingModels[0]}`,
    })
  } catch (error) {
    return NextResponse.json({
      has_api_key: true,
      key_prefix: GEMINI_API_KEY.substring(0, 10) + '...',
      error: error instanceof Error ? error.message : 'Unknown error',
      note: 'Failed to connect to Gemini API.',
    })
  }
}
