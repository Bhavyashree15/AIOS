import { NextRequest, NextResponse } from 'next/server'

// ============================================
// GEMINI API KEY - FROM ENVIRONMENT VARIABLE
// ============================================
const GEMINI_API_KEY = process.env.GOOGLE_API_KEY || process.env.Gemini_API_Key

console.log('🔍 API Key exists?', !!GEMINI_API_KEY)

// ============================================
// MODEL MAPPING - Use only working models
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
// QUALITY OPTIMIZATION: Better system prompts
// ============================================
const enhancePrompt = (prompt: string): string => {
  // Detect the type of request
  const isCreative = /describe|create|write|story|imagine|design|picture|visualize|generate|make|develop|craft/.test(prompt.toLowerCase())
  const isDetailed = /detailed|comprehensive|in-depth|extensive|thorough|complete|full|rich|vivid|elaborate/.test(prompt.toLowerCase())
  const isLong = prompt.length > 30

  // For creative/detailed prompts - add quality boosters
  if (isCreative && (isDetailed || isLong)) {
    return `IMPORTANT: Provide a RICH, VIVID, and DETAILED response with:
- At least 200-300 words
- Sensory details (sight, sound, smell, touch, taste)
- Specific examples and concrete imagery
- Emotional depth and atmosphere
- Unique and creative elements
- Engaging storytelling or descriptive style

Write as if you're an award-winning author crafting immersive prose.

${prompt}`
  }

  // For creative prompts
  if (isCreative) {
    return `Provide a CREATIVE and ENGAGING response with:
- Rich descriptive language
- Specific details and examples
- An interesting perspective
- Vivid imagery

${prompt}`
  }

  // For analytical/educational prompts
  if (/explain|what|how|why|define|compare|analyze/.test(prompt.toLowerCase())) {
    return `Provide a COMPREHENSIVE and CLEAR response with:
- Well-structured explanation
- Specific examples
- Key details and nuance
- Practical insights

${prompt}`
  }

  // Default - enhance all prompts
  return `Provide a thorough, detailed, and valuable response to this query. Include specific examples, clear explanations, and thoughtful insights.

${prompt}`
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
        consensus: '⚠️ API key not configured.',
        consensus_score: 0,
        confidence: 0,
        error: 'missing_api_key',
      })
    }

    // Use working model: gemini-2.0-flash
    const modelId = 'gemini-2.0-flash'
    const modelName = 'Gemini 2.0 Flash'

    console.log('🤖 Using model:', modelId)

    // Enhance the prompt for better quality
    const enhancedPrompt = enhancePrompt(prompt)
    console.log('📝 Enhanced prompt length:', enhancedPrompt.length)

    // ============================================
    // OPTIMIZED API CALL WITH MAXIMUM QUALITY
    // ============================================
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
              parts: [{ text: enhancedPrompt }]
            }
          ],
          generationConfig: {
            temperature: 0.9,           // Higher = more creative
            maxOutputTokens: 800,       // Much longer responses
            topP: 0.95,
            topK: 40,
          }
        }),
      }
    )

    const data = await response.json()

    // ============================================
    // HANDLE ERRORS
    // ============================================
    if (!response.ok) {
      console.error('❌ API Error:', JSON.stringify(data, null, 2))
      
      // Try with gemini-2.0-flash-exp as fallback
      if (data.error?.message?.includes('not found') || data.error?.message?.includes('model')) {
        console.log('🔄 Trying fallback model...')
        
        const fallbackResponse = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${GEMINI_API_KEY}`,
          {
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
                maxOutputTokens: 800,
                topP: 0.95,
                topK: 40,
              }
            }),
          }
        )
        
        const fallbackData = await fallbackResponse.json()
        
        if (fallbackResponse.ok) {
          const aiResponse = fallbackData.candidates?.[0]?.content?.parts?.[0]?.text || 'No response'
          return NextResponse.json({
            success: true,
            consensus: aiResponse,
            consensus_score: 85,
            confidence: 80,
            model_used: 'Gemini 2.0 Flash Exp',
            tokens_used: fallbackData.usageMetadata?.totalTokenCount || 0,
            is_free: true,
          })
        }
      }
      
      return NextResponse.json({
        consensus: `⚠️ API Error: ${data.error?.message || 'Unknown error'}`,
        consensus_score: 0,
        confidence: 0,
        error: 'api_error',
      })
    }

    // ============================================
    // GET THE AI RESPONSE
    // ============================================
    const aiResponse = data.candidates?.[0]?.content?.parts?.[0]?.text || 'No response'
    const tokensUsed = data.usageMetadata?.totalTokenCount || 0

    console.log('✅ Success! Tokens used:', tokensUsed)
    console.log('📝 Response length:', aiResponse.length)
    console.log('📄 Response preview:', aiResponse.substring(0, 100) + '...')

    // Check if response seems too short
    const isShort = aiResponse.length < 100
    const qualityNote = isShort ? 'Response seems short. Try asking for more details.' : undefined

    return NextResponse.json({
      success: true,
      consensus: aiResponse,
      consensus_score: isShort ? 70 : 85,
      confidence: isShort ? 65 : 80,
      model_used: modelName,
      tokens_used: tokensUsed,
      is_free: true,
      note: qualityNote,
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
// GET ENDPOINT - Show available models
// ============================================
export async function GET() {
  const hasKey = !!process.env.GOOGLE_API_KEY || !!process.env.Gemini_API_Key
  
  // Test which models actually work
  const modelsToTest = [
    'gemini-2.0-flash',
    'gemini-2.0-flash-exp',
    'gemini-1.5-flash',
  ]
  
  const workingModels: string[] = []
  
  for (const model of modelsToTest) {
    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}?key=${GEMINI_API_KEY}`,
        { method: 'GET' }
      )
      if (response.ok) {
        workingModels.push(model)
      }
    } catch (error) {
      // Skip
    }
  }
  
  return NextResponse.json({
    has_api_key: hasKey,
    working_models: workingModels,
    current_model: 'gemini-2.0-flash',
    quality_settings: {
      temperature: 0.9,
      max_tokens: 800,
      prompt_enhancement: true,
    },
    is_free: true,
    note: workingModels.length > 0 ? 'Model available' : 'No models available - check API key',
  })
}
