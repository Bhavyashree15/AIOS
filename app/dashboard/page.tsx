'use client'

import { useState } from 'react'

export default function DashboardPage() {
  const [prompt, setPrompt] = useState('')
  const [response, setResponse] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async () => {
    if (!prompt.trim()) return
    
    setIsLoading(true)
    try {
      const res = await fetch('/api/ai/consensus', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          prompt, 
          models: ['deepseek/deepseek-r1', 'google/gemini-1.5-flash', 'meta-llama/llama-3.3-70b-instruct'] 
        })
      })
      const data = await res.json()
      setResponse(data)
    } catch (error) {
      console.error('Error:', error)
      alert('Failed to get response. Please try again.')
    }
    setIsLoading(false)
  }

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: '#0B0F17', 
      padding: '24px',
      color: 'white',
      fontFamily: 'sans-serif'
    }}>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <div>
            <h1 style={{ 
              fontSize: '32px', 
              fontWeight: 'bold',
              background: 'linear-gradient(135deg, #10B981, #06B6D4, #8B5CF6)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>
              🚀 Command Center
            </h1>
            <p style={{ color: '#94a3b8', marginTop: '4px' }}>
              Ask once, multiple AIs think, one verified answer returns.
            </p>
          </div>
          <div style={{ 
            background: 'rgba(255,255,255,0.05)', 
            padding: '8px 16px', 
            borderRadius: '100px',
            border: '1px solid rgba(255,255,255,0.1)'
          }}>
            <span style={{ color: '#10B981', fontFamily: 'monospace', fontWeight: 'bold' }}>₹100.00</span>
          </div>
        </div>

        {/* Input Area */}
        <div style={{ 
          background: 'rgba(255,255,255,0.04)', 
          borderRadius: '16px', 
          padding: '24px',
          border: '1px solid rgba(255,255,255,0.08)',
          marginBottom: '24px'
        }}>
          <h2 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '16px' }}>New Query</h2>
          
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Ask anything... e.g., 'Explain quantum computing in simple terms'"
            style={{
              width: '100%',
              minHeight: '100px',
              background: 'rgba(0,0,0,0.3)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '12px',
              padding: '16px',
              color: 'white',
              fontSize: '16px',
              outline: 'none',
              resize: 'none',
              fontFamily: 'sans-serif'
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                handleSubmit()
              }
            }}
          />
          
          <button
            onClick={handleSubmit}
            disabled={isLoading || !prompt.trim()}
            style={{
              marginTop: '16px',
              background: 'linear-gradient(135deg, #10B981, #06B6D4)',
              color: 'white',
              border: 'none',
              padding: '12px 24px',
              borderRadius: '12px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: 'pointer',
              opacity: isLoading || !prompt.trim() ? 0.5 : 1,
              transition: 'all 0.3s ease'
            }}
          >
            {isLoading ? '⏳ Thinking...' : '📤 Send Query'}
          </button>
        </div>

        {/* Response */}
        {response && (
          <div style={{ 
            background: 'rgba(255,255,255,0.04)', 
            borderRadius: '16px', 
            padding: '24px',
            border: '1px solid rgba(255,255,255,0.08)',
            animation: 'fadeIn 0.5s ease'
          }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '24px', marginBottom: '16px' }}>
              <div>
                <div style={{ fontSize: '14px', color: '#94a3b8' }}>Consensus Score</div>
                <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#10B981' }}>
                  {response.consensus_score}%
                </div>
              </div>
              <div>
                <div style={{ fontSize: '14px', color: '#94a3b8' }}>Confidence</div>
                <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#06B6D4' }}>
                  {response.confidence}%
                </div>
              </div>
              <div style={{ marginLeft: 'auto' }}>
                <div style={{ fontSize: '14px', color: '#94a3b8' }}>Cost</div>
                <div style={{ fontSize: '20px', fontFamily: 'monospace', color: '#10B981' }}>
                  ₹{response.cost_inr?.toFixed(4) || '0.0000'}
                </div>
              </div>
            </div>
            
            <div style={{ 
              height: '6px', 
              background: 'rgba(255,255,255,0.06)', 
              borderRadius: '4px', 
              overflow: 'hidden',
              marginBottom: '16px'
            }}>
              <div style={{ 
                height: '100%', 
                width: `${response.consensus_score}%`,
                background: 'linear-gradient(90deg, #10B981, #06B6D4)',
                borderRadius: '4px',
                transition: 'width 1s ease'
              }} />
            </div>
            
            <div style={{ 
              background: 'rgba(0,0,0,0.3)', 
              borderRadius: '12px', 
              padding: '16px',
              border: '1px solid rgba(255,255,255,0.05)',
              whiteSpace: 'pre-wrap',
              lineHeight: '1.8',
              fontSize: '15px'
            }}>
              {response.consensus}
            </div>
          </div>
        )}
      </div>
      
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  )
}
