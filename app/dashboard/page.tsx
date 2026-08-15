'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { PromptInput } from '@/components/dashboard/PromptInput'
import { ModelSelector } from '@/components/dashboard/ModelSelector'
import { ResponseDisplay } from '@/components/dashboard/ResponseDisplay'
import { Wallet } from '@/components/wallet/Wallet'
import { useAIQuery } from '@/hooks/useAIQuery'

export default function DashboardPage() {
  const [prompt, setPrompt] = useState('')
  const [selectedModels, setSelectedModels] = useState([
    'deepseek/deepseek-r1',
    'google/gemini-1.5-flash',
    'meta-llama/llama-3.3-70b-instruct'
  ])
  const [mode, setMode] = useState<'consensus' | 'autopilot'>('consensus')
  const { query, response, isLoading, error } = useAIQuery()

  const handleSubmit = async () => {
    if (!prompt.trim()) return
    await query({ prompt, mode, models: selectedModels })
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold gradient-text">Command Center</h1>
            <p className="text-muted-foreground mt-1">
              Ask once, multiple AIs think, one verified answer returns.
            </p>
          </div>
          <Wallet />
        </div>

        <Card className="glass border-white/10">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>New Query</span>
              <div className="flex gap-2">
                <button 
                  className={`px-3 py-1 rounded-lg text-sm ${mode === 'consensus' ? 'bg-emerald-500/20 text-emerald-400' : 'text-muted-foreground'}`}
                  onClick={() => setMode('consensus')}
                >
                  Consensus
                </button>
                <button 
                  className={`px-3 py-1 rounded-lg text-sm ${mode === 'autopilot' ? 'bg-emerald-500/20 text-emerald-400' : 'text-muted-foreground'}`}
                  onClick={() => setMode('autopilot')}
                >
                  Autopilot
                </button>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <PromptInput
              value={prompt}
              onChange={setPrompt}
              onSubmit={handleSubmit}
              isLoading={isLoading}
              mode={mode}
            />
            <div className="mt-4">
              <ModelSelector
                selected={selectedModels}
                onSelect={setSelectedModels}
              />
            </div>
          </CardContent>
        </Card>

        {response && (
          <Card className="glass border-white/10 animate-slide-up">
            <CardContent className="pt-6">
              <ResponseDisplay response={response} />
            </CardContent>
          </Card>
        )}

        {error && (
          <Card className="border-red-500/20 bg-red-500/10">
            <CardContent className="pt-6">
              <p className="text-red-400">{error.message}</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
