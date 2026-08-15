'use client'

interface ModelSelectorProps {
  selected: string[]
  onSelect: (models: string[]) => void
}

const AVAILABLE_MODELS = [
  { id: 'deepseek/deepseek-r1', name: 'DeepSeek-R1', icon: '🧠' },
  { id: 'google/gemini-1.5-flash', name: 'Gemini 1.5', icon: '🤖' },
  { id: 'meta-llama/llama-3.3-70b-instruct', name: 'Llama 3.3', icon: '📚' },
  { id: 'anthropic/claude-3.5-sonnet', name: 'Claude 3.5', icon: '🎯' },
  { id: 'openai/gpt-4o', name: 'GPT-4o', icon: '⭐' },
  { id: 'qwen/qwen-2.5-72b', name: 'Qwen 2.5', icon: '🔮' },
  { id: 'perplexity/sonar', name: 'Perplexity Sonar', icon: '🔍' },
]

export function ModelSelector({ selected, onSelect }: ModelSelectorProps) {
  const toggleModel = (id: string) => {
    if (selected.includes(id)) {
      onSelect(selected.filter(m => m !== id))
    } else {
      onSelect([...selected, id])
    }
  }

  return (
    <div className="flex flex-wrap gap-2">
      <span className="text-xs text-muted-foreground font-medium mr-1">Models:</span>
      {AVAILABLE_MODELS.map(model => (
        <button
          key={model.id}
          onClick={() => toggleModel(model.id)}
          className={`px-3 py-1.5 rounded-full text-xs transition-all ${
            selected.includes(model.id)
              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
              : 'bg-white/5 text-muted-foreground border border-white/10 hover:bg-white/10'
          }`}
        >
          <span className="mr-1">{model.icon}</span>
          {model.name}
        </button>
      ))}
    </div>
  )
}
