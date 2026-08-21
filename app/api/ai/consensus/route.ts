import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const { prompt, models } = await req.json()
    
    console.log('📨 Received prompt:', prompt)
    console.log('📦 Models:', models)

    if (!prompt) {
      return NextResponse.json({ 
        consensus: '⚠️ Please enter a prompt.',
        consensus_score: 0,
        confidence: 0,
        cost_inr: 0,
        wallet_balance: 100,
      })
    }

    // Use the first model or default
    const selectedModel = models && models.length > 0 ? models[0] : 'gpt-5.4-mini'
    
    // Map to OpenRouter model ID
    const modelMap: Record<string, string> = {
      'gpt-5.4-mini': 'openai/gpt-4o-mini',
      'gpt-4.1': 'openai/gpt-4o',
      'qwen-3.5-flash': 'qwen/qwen-2.5-72b',
      'deepseek-chat': 'deepseek/deepseek-r1',
      'claude-sonnet-4.0': 'anthropic/claude-3.5-sonnet',
      'gemini-3-flash': 'google/gemini-1.5-flash',
    }
    
    const modelId = modelMap[selectedModel] || 'openai/gpt-4o-mini'
    
    // YOUR API KEY - MAKE SURE THIS IS CORRECT
    const apiKey = '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'
    
    console.log('🤖 Using model:', modelId)
    console.log('🔑 API Key exists:', !!apiKey)

    // ============================================
    // CALL OPENROUTER API
    // ============================================
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://github.com/Bhayashree15/AIOS',
        'X-Title': 'AIOS',
      },
      body: JSON.stringify({
        model: modelId,
        messages: [
          { 
            role: 'system', 
            content: 'You are a helpful, detailed, and accurate AI assistant. Provide thorough responses.'
          },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 800,
      }),
    })

    const data = await response.json()
    console.log('📡 API Response status:', response.status)
    console.log('📡 API Response data:', JSON.stringify(data).slice(0, 500))

    // Check for errors
    if (!response.ok) {
      console.error('❌ API Error:', data.error)
      return NextResponse.json({
        consensus: `⚠️ API Error: ${data.error?.message || 'Unknown error'}`,
        consensus_score: 0,
        confidence: 0,
        cost_inr: 0,
        wallet_balance: 100,
      })
    }

    // Get the actual AI response
    const aiResponse = data.choices?.[0]?.message?.content || 'No response from AI'
    const tokensUsed = data.usage?.total_tokens || 0
    
    console.log('✅ AI Response length:', aiResponse.length)
    console.log('✅ AI Response preview:', aiResponse.slice(0, 100))

    // Return the REAL response
    return NextResponse.json({
      consensus: aiResponse,
      consensus_score: 88,
      confidence: 82,
      cost_inr: 0.01,
      tokens_used: tokensUsed,
      wallet_balance: 99.99,
      total_models: 1,
      model_used: modelId,
    })

  } catch (error) {
    console.error('🔥 Server Error:', error)
    return NextResponse.json({
      consensus: `⚠️ Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
      consensus_score: 0,
      confidence: 0,
      cost_inr: 0,
      wallet_balance: 100,
    })
  }
}

export async function GET() {
  return NextResponse.json({
    balance: 100,
  })
}
