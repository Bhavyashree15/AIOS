'use client'

import { useState } from 'react'
import { Copy, Check, ChevronDown, ChevronUp } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { toast } from 'react-hot-toast'

interface ResponseDisplayProps {
  response: {
    consensus: string
    consensus_score: number
    confidence: number
    individual_responses?: Array<{
      model: string
      response: string
      cost: number
    }>
    cost_inr: number
    execution_time_ms: number
  }
}

export function ResponseDisplay({ response }: ResponseDisplayProps) {
  const [copied, setCopied] = useState(false)
  const [showDetails, setShowDetails] = useState(false)

  const handleCopy = () => {
    navigator.clipboard.writeText(response.consensus)
    setCopied(true)
    toast.success('Copied to clipboard!')
    setTimeout(() => setCopied(false), 2000)
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-emerald-400'
    if (score >= 50) return 'text-amber-400'
    return 'text-red-400'
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-6 flex-wrap">
        <div>
          <div className="text-sm text-muted-foreground">Consensus Score</div>
          <div className={`text-3xl font-bold ${getScoreColor(response.consensus_score)}`}>
            {response.consensus_score}%
          </div>
        </div>
        <div>
          <div className="text-sm text-muted-foreground">Confidence</div>
          <div className="text-2xl font-bold text-cyan-400">{response.confidence}%</div>
        </div>
        <div className="ml-auto text-right">
          <div className="text-sm text-muted-foreground">Cost</div>
          <div className="text-lg font-mono text-emerald-400">₹{response.cost_inr.toFixed(4)}</div>
        </div>
      </div>

      <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
        <div 
          className="h-full bg-gradient-to-r from-emerald-400 to-cyan-400 rounded-full transition-all duration-1000"
          style={{ width: `${response.consensus_score}%` }}
        />
      </div>

      <div className="p-4 rounded-xl bg-white/5 border border-white/10">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400 flex-shrink-0">
            <Check className="h-4 w-4" />
          </div>
          <div className="flex-1">
            <div className="text-sm whitespace-pre-wrap leading-relaxed">
              {response.consensus}
            </div>
          </div>
          <Button
            onClick={handleCopy}
            variant="ghost"
            size="sm"
            className="flex-shrink-0"
          >
            {copied ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      {response.individual_responses && (
        <button
          onClick={() => setShowDetails(!showDetails)}
          className="text-sm text-muted-foreground hover:text-white transition-colors flex items-center gap-1"
        >
          {showDetails ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          {showDetails ? 'Hide' : 'Show'} individual model outputs
        </button>
      )}

      {showDetails && response.individual_responses && (
        <div className="space-y-2 mt-2">
          {response.individual_responses.map((r, i) => {
            const colors = ['border-emerald-500/20', 'border-cyan-500/20', 'border-purple-500/20', 'border-orange-500/20']
            return (
              <div key={i} className={`p-3 rounded-lg bg-white/5 border ${colors[i % colors.length]}`}>
                <div className="flex items-center justify-between text-xs">
                  <span className="font-mono font-semibold text-cyan-400">{r.model.split('/').pop()}</span>
                  <span className="text-muted-foreground">₹{r.cost.toFixed(4)}</span>
                </div>
                <p className="text-sm text-muted-foreground mt-1">{r.response.slice(0, 150)}...</p>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
