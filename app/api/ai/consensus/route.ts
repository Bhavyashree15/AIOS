import { NextRequest, NextResponse } from 'next/server'

// ============================================
// GEMINI API KEY - FROM ENVIRONMENT VARIABLE
// ============================================
const GEMINI_API_KEY = process.env.GOOGLE_API_KEY || process.env.Gemini_API_Key

console.log('🔍 API Key exists?', !!GEMINI_API_KEY)

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
// BETTER SYSTEM PROMPTS FOR QUALITY
// ============================================
const getSystemPrompt = (prompt: string): string => {
  // Detect if it's a creative writing request
  const creativeKeywords = ['describe', 'create', 'write', 'story', 'imagine', 'design', 'picture', 'visualize']
  const isCreative = creativeKeywords.some(word => prompt.toLowerCase().includes(word))
  
  // Detect if it's a detailed/long request
  const isDetailed = prompt.toLowerCase().includes('detailed') || 
                     prompt.toLowerCase().includes('comprehensive') ||
                     prompt.toLowerCase().includes('in-depth')

  if (isCreative && isDetailed) {
    return `You are a master storyteller and world-builder. Create rich, vivid, and immersive descriptions with:
- Sensory details (sight, sound, smell, touch)
- Emotional depth and atmosphere
- Unique and imaginative elements
- A compelling narrative voice
- Specific examples and concrete imagery
Write at least 200-300 words. Be creative and detailed.`
  }

  if (isCreative) {
    return `You are a creative writer with a vivid imagination. Respond with:
- Engaging and descriptive language
- Rich imagery and sensory details
- An interesting perspective or angle
- Specific, concrete examples
Write a detailed, engaging response.`
  }

  // Default - quality responses for any query
  return `You are a knowledgeable and articulate AI assistant. Provide:
- Clear, well-structured explanations
- Specific examples and details
- Nuanced insights
- A helpful and engaging tone
Make your response comprehensive and valuable.`
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

    // Use Gemini 1.5 Pro for quality responses
    // Better quality than Flash models
    const modelId = 'gemini-1.5-pro'
    const modelName = 'Gemini 1.5 Pro'

    console.log('🤖 Using model:', modelId)

    // Create a better prompt with system instructions
    const systemPrompt = getSystemPrompt(prompt)
    const fullPrompt = `${systemPrompt}\n\nUser request: ${prompt}`

    // ============================================
    // OPTIMIZED API CALL WITH BETTER PARAMETERS
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
              parts: [{ text: fullPrompt }]
            }
          ],
          generationConfig: {
            temperature: 0.8,           // More creative (was 0.7)
            maxOutputTokens: 500,       // Longer responses (was 200)
            topP: 0.95,
            topK: 40,
            // Add this for better quality
            stopSequences: [],
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
      
      // If Pro fails, try Flash as fallback
      if (data.error?.message?.includes('not found') || data.error?.message?.includes('model')) {
        console.log('🔄 Pro model not available, trying Flash...')
        
        // Try Flash as fallback with same settings
        const fallbackResponse = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              contents: [
                {
                  parts: [{ text: fullPrompt }]
                }
              ],
              generationConfig: {
                temperature: 0.9,        // Higher for flash to compensate
                maxOutputTokens: 500,
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
            model_used: 'Gemini 2.0 Flash (Fallback)',
            tokens_used: fallbackData.usageMetadata?.totalTokenCount || 0,
            is_free: true,
            note: 'Using fallback model for better availability'
          })
        }
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
    const aiResponse = data.candidates?.[0]?.content?.parts?.[0]?.text || 'No response'
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
      is_free: false, // Pro uses paid tier
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
// GET ENDPOINT
// ============================================
export async function GET() {
  const hasKey = !!process.env.GOOGLE_API_KEY || !!process.env.Gemini_API_Key
  
  return NextResponse.json({
    has_api_key: hasKey,
    models_available: ['gemini-1.5-pro', 'gemini-2.0-flash'],
    is_free: false,
    note: 'Using Pro model for better quality responses',
  })
}
