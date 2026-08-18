import { NextRequest, NextResponse } from 'next/server'

// ============================================
// COMPLETE MODEL MAPPING (40+ Models)
// ============================================
const MODEL_MAP: Record<string, string> = {
  // OpenAI
  'gpt-5.4-mini': 'openai/gpt-4o-mini',
  'gpt-4.1': 'openai/gpt-4o',
  'gpt-4.1-nano': 'openai/gpt-4o-mini',
  'gpt-5.4': 'openai/gpt-4o',
  'gpt-5-mini': 'openai/gpt-4o-mini',
  'gpt-5': 'openai/gpt-4o',
  'gpt-4o-mini': 'openai/gpt-4o-mini',
  'gpt-5.6-terra': 'openai/gpt-4o',
  'gpt-5.6-luna': 'openai/gpt-4o',
  'gpt-5.4-nano': 'openai/gpt-4o-mini',
  
  // Qwen
  'qwen-3.5-flash': 'qwen/qwen-2.5-72b',
  'qwen-3.5': 'qwen/qwen-2.5-72b',
  'qwen-3.7-max': 'qwen/qwen-2.5-72b',
  'qwen-3.5-plus': 'qwen/qwen-2.5-72b',
  'qwen-flash': 'qwen/qwen-2.5-72b',
  'qwen-3-coder-flash': 'qwen/qwen-2.5-coder',
  
  // Mistral
  'ministral-3-8b': 'mistralai/mistral-small-3.1-24b',
  'ministral-3-3b': 'mistralai/mistral-small-3.1-24b',
  'mistral-small-4': 'mistralai/mistral-small-3.1-24b',
  'mistral-small': 'mistralai/mistral-small-3.1-24b',
  'mistral-large-3': 'mistralai/mistral-large-2',
  'codestral': 'mistralai/mistral-codestral',
  
  // Google
  'nova-pro': 'google/gemini-1.5-pro',
  'nova-lite': 'google/gemini-1.5-flash',
  'gemini-3-flash': 'google/gemini-1.5-flash',
  'gemini-3-pro-preview': 'google/gemini-1.5-pro',
  'gemini-3.5-flash-lite': 'google/gemini-2.0-flash-exp',
  'gemini-3.1-pro': 'google/gemini-1.5-pro',
  'nova-micro': 'google/gemini-1.5-flash',
  'nova-premier-1.0': 'google/gemini-1.5-pro',
  
  // Anthropic
  'claude-sonnet-4.0': 'anthropic/claude-3.5-sonnet',
  'claude-sonnet-4.6': 'anthropic/claude-3.5-sonnet',
  'claude-haiku-4.5': 'anthropic/claude-3-haiku',
  
  // Others
  'grok-3-mini': 'xai/grok-2',
  'grok-4.3': 'xai/grok-2',
  'grok-4.5': 'xai/grok-2',
  'deepseek-chat': 'deepseek/deepseek-r1',
  'deepseek-reasoner': 'deepseek/deepseek-r1',
  'perplexity-sonar': 'perplexity/llama-3-sonar-small',
  'command-a': 'cohere/command-a',
  'command-r7b': 'cohere/command-r-plus',
  'kimi-k3': 'moonshot/kimi-3',
  'kimi-k2.5': 'moonshot/kimi-2.5',
  'seed-2.0-lite': 'google/gemini-1.5-flash',
}

// ============================================
// COST RATES
// ============================================
const COST_RATES: Record<string, number> = {
  'openai/gpt-4o': 0.005,
  'openai/gpt-4o-mini': 0.0005,
  'anthropic/claude-3.5-sonnet': 0.003,
  'anthropic/claude-3-haiku': 0.0008,
  'google/gemini-1.5-pro': 0.0025,
  'google/gemini-1.5-flash': 0.0005,
  'google/gemini-2.0-flash-exp': 0.0004,
  'deepseek/deepseek-r1': 0.0015,
  'qwen/qwen-2.5-72b': 0.0008,
  'qwen/qwen-2.5-coder': 0.0007,
  'mistralai/mistral-small-3.1-24b': 0.001,
  'mistralai/mistral-large-2': 0.002,
  'mistralai/mistral-codestral': 0.001,
  'cohere/command-a': 0.0012,
  'cohere/command-r-plus': 0.001,
  'xai/grok-2': 0.002,
  'perplexity/llama-3-sonar-small': 0.0006,
  'moonshot/kimi-3': 0.001,
  'moonshot/kimi-2.5': 0.001,
}

function calculateCost(modelId: string, tokens: number): number {
  const rate = COST_RATES[modelId] || 0.001
  return (tokens / 1000) * rate * 1.2 // 20% markup
}

// ============================================
// WALLET STATE
// ============================================
let walletBalance = 100.00
let transactions: any[] = []

// ============================================
// MAIN API HANDLER
// ============================================
export async function POST(req: NextRequest) {
  try {
    const { prompt, models } = await req.json()
    
    // Validation
    if (!prompt) {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 })
    }
    if (!models || models.length === 0) {
      return NextResponse.json(
        { error: 'Please select at least one model.' },
        { status: 400 }
      )
    }

    const modelIds = models.map((id: string) => MODEL_MAP[id] || id)
    const startTime = Date.now()
    
    // ============================================
    // QUERY ALL MODELS IN PARALLEL
    // ============================================
    const responses = await Promise.all(
      modelIds.map(async (modelId: string) => {
        try {
          const modelStartTime = Date.now()
          
          const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY || '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'}`,
              'Content-Type': 'application/json',
              'HTTP-Referer': 'https://github.com/Bhayashree15/AIOS',
              'X-Title': 'AIOS',
            },
            body: JSON.stringify({
              model: modelId,
              messages: [{ role: 'user', content: prompt }],
              temperature: 0.7,
              max_tokens: 800,
            }),
          })

          const data = await res.json()
          const tokens = data.usage?.total_tokens || 0
          const latency = Date.now() - modelStartTime
          
          if (!res.ok) {
            return {
              model: modelId,
              response: `⚠️ ${data.error?.message || `HTTP ${res.status}`}`,
              tokens: 0,
              cost: 0,
              status: 'error',
              latency,
            }
          }

          return {
            model: modelId,
            response: data.choices?.[0]?.message?.content || 'No response',
            tokens,
            cost: calculateCost(modelId, tokens),
            status: 'success',
            latency,
          }
        } catch (err) {
          return {
            model: modelId,
            response: `⚠️ ${err instanceof Error ? err.message : 'Unknown error'}`,
            tokens: 0,
            cost: 0,
            status: 'error',
            latency: 0,
          }
        }
      })
    )

    // ============================================
    // CALCULATE COSTS & CHECK WALLET
    // ============================================
    const totalCost = responses.reduce((sum, r) => sum + r.cost, 0) * 1.2
    const totalTokens = responses.reduce((sum, r) => sum + r.tokens, 0)
    const avgLatency = responses.reduce((sum, r) => sum + r.latency, 0) / responses.length

    if (walletBalance < totalCost) {
      return NextResponse.json(
        { 
          error: 'Insufficient balance. Please add funds.',
          balance: walletBalance,
          required: totalCost,
        },
        { status: 402 }
      )
    }

    // Deduct from wallet
    walletBalance -= totalCost
    transactions.push({
      id: Date.now().toString(),
      amount: totalCost,
      type: 'usage_deduction',
      description: `AI Query: "${prompt.slice(0, 50)}..."`,
      timestamp: new Date().toISOString(),
    })

    // ============================================
    // FILTER SUCCESSFUL RESPONSES
    // ============================================
    const successfulResponses = responses.filter(r => r.status === 'success' && r.response)
    const failedResponses = responses.filter(r => r.status === 'error')

    // ============================================
    // GENERATE CONSENSUS RESPONSE
    // ============================================
    let consensus: string
    let score: number
    let confidence: number
    let agreements: string[] = []
    let disagreements: string[] = []

    if (successfulResponses.length === 0) {
      consensus = '⚠️ All models failed to respond. Please try again with different models.'
      score = 0
      confidence = 0
    } else if (successfulResponses.length === 1) {
      consensus = successfulResponses[0].response
      score = 70
      confidence = 60
    } else {
      // ============================================
      // AI-POWERED CONSENSUS SYNTHESIS
      // ============================================
      const synthesisPrompt = `
You are a consensus synthesis AI. Analyze these responses from multiple AI models and synthesize a single, accurate, comprehensive response.

Original Question: "${prompt}"

Responses from ${successfulResponses.length} AI models:
${successfulResponses.map((r, i) => `Model ${i+1} (${r.model.split('/').pop()}):\n${r.response}\n`).join('\n')}

Task:
1. Synthesize a single, accurate, comprehensive response
2. Identify key points where models agree
3. Identify any contradictions or disagreements
4. Rate the overall quality score (0-100)
5. Rate confidence level (0-100)

Format your response EXACTLY like this:
SYNTHESIS: Your synthesized response here
SCORE: 85
CONFIDENCE: 78
AGREEMENTS: Points where models agreed
DISAGREEMENTS: Points where models differed
`

      try {
        const synthesisRes = await fetch('https://openrouter.ai/api/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY || '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'}`,
            'Content-Type': 'application/json',
            'HTTP-Referer': 'https://github.com/Bhayashree15/AIOS',
            'X-Title': 'AIOS',
          },
          body: JSON.stringify({
            model: 'openai/gpt-4o-mini',
            messages: [{ role: 'user', content: synthesisPrompt }],
            temperature: 0.3,
            max_tokens: 1000,
          }),
        })

        const synthesisData = await synthesisRes.json()
        const synthesisText = synthesisData.choices?.[0]?.message?.content || ''
        
        // Parse response
        const synthesisMatch = synthesisText.match(/SYNTHESIS:\s*([\s\S]*?)(?=SCORE:|$)/i)
        const scoreMatch = synthesisText.match(/SCORE:\s*(\d+)/i)
        const confidenceMatch = synthesisText.match(/CONFIDENCE:\s*(\d+)/i)
        const agreementsMatch = synthesisText.match(/AGREEMENTS:\s*([\s\S]*?)(?=DISAGREEMENTS:|$)/i)
        const disagreementsMatch = synthesisText.match(/DISAGREEMENTS:\s*([\s\S]*?)$/i)

        consensus = synthesisMatch ? synthesisMatch[1].trim() : synthesisText
        score = scoreMatch ? Math.min(100, parseInt(scoreMatch[1])) : 75
        confidence = confidenceMatch ? Math.min(100, parseInt(confidenceMatch[1])) : 70
        agreements = agreementsMatch ? agreementsMatch[1].split('\n').filter(s => s.trim()) : []
        disagreements = disagreementsMatch ? disagreementsMatch[1].split('\n').filter(s => s.trim()) : []
      } catch (synthesisError) {
        // Fallback: simple combination
        consensus = successfulResponses.map(r => r.response).join('\n\n---\n\n')
        score = 70
        confidence = 65
      }
    }

    // ============================================
    // BUILD RESPONSE
    // ============================================
    return NextResponse.json({
      success: true,
      consensus,
      consensus_score: Math.round(score),
      confidence: Math.round(confidence),
      agreements,
      disagreements,
      individual_responses: responses,
      successful_models: successfulResponses.length,
      failed_models: failedResponses.length,
      models_attempted: models.length,
      cost_inr: totalCost,
      tokens_used: totalTokens,
      execution_time_ms: avgLatency,
      wallet_balance: walletBalance,
      total_models: successfulResponses.length,
      timestamp: new Date().toISOString(),
    })

  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json(
      { 
        error: 'Failed to process query. Please try again.',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

// ============================================
// WALLET GET ENDPOINT
// ============================================
export async function GET() {
  return NextResponse.json({
    balance: walletBalance,
    transactions: transactions.slice(0, 20),
    total_spent: transactions
      .filter(t => t.type === 'usage_deduction')
      .reduce((sum, t) => sum + t.amount, 0),
  })
}
