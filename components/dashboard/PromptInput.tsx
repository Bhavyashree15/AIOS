'use client'

import { useRef, useEffect } from 'react'
import { Send, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface PromptInputProps {
  value: string
  onChange: (value: string) => void
  onSubmit: () => void
  isLoading: boolean
  mode: string
}

export function PromptInput({ value, onChange, onSubmit, isLoading, mode }: PromptInputProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`
    }
  }, [value])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      onSubmit()
    }
  }

  return (
    <div className="relative">
      <textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={`Enter your prompt... (${mode === 'autopilot' ? 'Autopilot will route to the best model' : 'Multiple AI models will analyze your query'})`}
        className="w-full min-h-[100px] max-h-[200px] resize-none bg-black/20 border border-white/10 rounded-xl p-4 pr-24 text-white placeholder:text-muted-foreground focus:border-emerald-500/50 outline-none"
        disabled={isLoading}
      />
      <Button
        onClick={onSubmit}
        disabled={!value.trim() || isLoading}
        className="absolute bottom-4 right-4 px-4 py-2 rounded-lg bg-gradient-to-r from-emerald-500 to-cyan-500 text-white font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg transition-all"
      >
        {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
      </Button>
    </div>
  )
}
