'use client'

import { useState, useEffect, useRef } from 'react'
import { 
  Send, Loader2, Wallet, ChevronDown, ChevronUp, 
  Bot, Zap, Search, Code, Users, Plus, 
  Image, FolderOpen, Menu, Sparkles,
  MessageSquare, Settings 
} from 'lucide-react'

// ============================================
// 40+ MODELS DATABASE
// ============================================
const ALL_MODELS = {
  popular: [
    { id: 'gpt-5.4-mini', name: 'GPT-5.4 mini', icon: '🤖', likes: 0 },
    { id: 'qwen-3.5-flash', name: 'Qwen3.5 Flash', icon: '🐉', likes: 0 },
    { id: 'ministral-3-8b', name: 'Ministral 3 8B', icon: '🧠', likes: 0 },
    { id: 'mistral-small-4', name: 'Mistral Small 4', icon: '🌊', likes: 0 },
    { id: 'command-a', name: 'Command A', icon: '⚡', likes: 0 },
    { id: 'gpt-4.1', name: 'GPT-4.1', icon: '🤖', likes: 0 },
    { id: 'nova-pro', name: 'Nova Pro', icon: '✨', likes: 0 },
    { id: 'qwen-3.7-max', name: 'Qwen3.7 Max', icon: '🐉', likes: 0 },
  ],
  intelligence: [
    { id: 'mistral-small', name: 'Mistral Small', icon: '🌊', likes: 0 },
    { id: 'grok-3-mini', name: 'Grok 3 Mini', icon: '🦍', likes: 0 },
    { id: 'gpt-4o-mini', name: 'GPT-4o mini', icon: '🤖', likes: 0 },
    { id: 'claude-sonnet-4.0', name: 'Claude Sonnet 4.0', icon: '🎯', likes: 0 },
    { id: 'gemini-3-pro-preview', name: 'Gemini 3 Pro Preview', icon: '🧠', likes: 0 },
    { id: 'gemini-3-flash', name: 'Gemini 3 Flash', icon: '⚡', likes: 0 },
    { id: 'claude-haiku-4.5', name: 'Claude Haiku 4.5', icon: '🎯', likes: 0 },
    { id: 'kimi-k2.5', name: 'Kimi-k2.5', icon: '🔥', likes: 0 },
  ],
  latest: [
    { id: 'nova-micro', name: 'Nova Micro', icon: '✨', likes: 0 },
    { id: 'gpt-5.6-terra', name: 'GPT-5.6 Terra', icon: '🌍', likes: 0 },
    { id: 'grok-4.5', name: 'Grok 4.5', icon: '🦍', likes: 0 },
    { id: 'perplexity-sonar', name: 'Perplexity Sonar', icon: '🔍', likes: 0 },
    { id: 'deepseek-chat', name: 'DeepSeek Chat', icon: '🔮', likes: 0 },
    { id: 'qwen-flash', name: 'Qwen Flash', icon: '⚡', likes: 0 },
    { id: 'deepseek-reasoner', name: 'DeepSeek Reasoner', icon: '🧠', likes: 0 },
    { id: 'gpt-5-mini', name: 'GPT-5 mini', icon: '🤖', likes: 0 },
  ]
}

export default function DashboardPage() {
  const [prompt, setPrompt] = useState('')
  const [response, setResponse] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [selectedModels, setSelectedModels] = useState(['gpt-5.4-mini', 'qwen-3.5-flash'])
  const [mode, setMode] = useState('consensus')
  const [showModelPicker, setShowModelPicker] = useState(false)
  const [modelTab, setModelTab] = useState('popular')
  const [searchQuery, setSearchQuery] = useState('')
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [messages, setMessages] = useState<{role: 'user' | 'assistant', content: string}[]>([])
  const [walletBalance, setWalletBalance] = useState(100)
  const [chatHistory, setChatHistory] = useState<{id: number, title: string}[]>([])
  const [likedModels, setLikedModels] = useState<Record<string, boolean>>({})
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const fetchWallet = async () => {
    try {
      const res = await fetch('/api/wallet')
      const data = await res.json()
      setWalletBalance(data.balance)
    } catch (error) {
      console.error('Error fetching wallet:', error)
    }
  }

  useEffect(() => {
    fetchWallet()
  }, [])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleLike = (modelId: string) => {
    setLikedModels(prev => ({ ...prev, [modelId]: !prev[modelId] }))
  }

  const toggleModel = (id: string) => {
    if (selectedModels.includes(id)) {
      setSelectedModels(selectedModels.filter(m => m !== id))
    } else {
      setSelectedModels([...selectedModels, id])
    }
  }

  const getCurrentModels = () => {
    const models = ALL_MODELS[modelTab as keyof typeof ALL_MODELS] || []
    if (searchQuery) {
      return models.filter(m => m.name.toLowerCase().includes(searchQuery.toLowerCase()))
    }
    return models
  }

  const handleSubmit = async () => {
    if (!prompt.trim()) return
    
    setMessages(prev => [...prev, { role: 'user', content: prompt }])
    setIsLoading(true)
    
    try {
      const res = await fetch('/api/ai/consensus', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, models: selectedModels })
      })
      const data = await res.json()
      
      if (res.status === 402) {
        setMessages(prev => [...prev, { role: 'assistant', content: '⚠️ Insufficient balance! Please add funds.' }])
      } else {
        setResponse(data)
        setMessages(prev => [...prev, { role: 'assistant', content: data.consensus }])
        fetchWallet()
      }
    } catch (error) {
      setMessages(prev => [...prev, { role: 'assistant', content: '❌ Error: Please try again.' }])
    }
    setIsLoading(false)
    setPrompt('')
  }

  const createNewChat = () => {
    const newId = Date.now()
    setChatHistory(prev => [{ id: newId, title: 'New Chat' }, ...prev])
    setMessages([])
    setResponse(null)
  }

  const addFunds = async () => {
    if (typeof window !== 'undefined') {
      const amount = window.prompt('Enter amount to add (₹):', '100')
      if (amount) {
        const num = parseFloat(amount)
        if (num > 0) {
          await fetch('/api/wallet', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ amount: num, type: 'credit_topup', description: 'Manual top-up' })
          })
          fetchWallet()
        }
      }
    }
  }

  return (
    <div className="min-h-screen bg-[#0B0F17] text-white flex">
      
      {/* SIDEBAR */}
      <div className={`${sidebarOpen ? 'w-72' : 'w-16'} transition-all duration-300 border-r border-white/10 bg-black/20 backdrop-blur-xl flex flex-col h-screen sticky top-0`}>
        <div className="p-4">
          <button onClick={createNewChat} className="w-full bg-gradient-to-r from-emerald-500 to-cyan-500 text-white px-4 py-3 rounded-xl font-semibold flex items-center justify-center gap-2 hover:shadow-lg hover:shadow-emerald-500/20 transition-all">
            <Plus className="h-5 w-5" />
            {sidebarOpen && 'New Chat'}
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-3">
          <div className="space-y-1">
            <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl bg-emerald-500/10 text-emerald-400">
              <MessageSquare className="h-5 w-5" />
              {sidebarOpen && 'Chat'}
            </button>
            <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/5 text-gray-400 hover:text-white transition-all">
              <Image className="h-5 w-5" />
              {sidebarOpen && 'Image Studio'}
            </button>
            <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/5 text-gray-400 hover:text-white transition-all">
              <Users className="h-5 w-5" />
              {sidebarOpen && 'Experts'}
            </button>
            <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/5 text-gray-400 hover:text-white transition-all">
              <FolderOpen className="h-5 w-5" />
              {sidebarOpen && 'Projects'}
            </button>
          </div>

          {sidebarOpen && chatHistory.length > 0 && (
            <div className="mt-6">
              <div className="text-xs text-gray-500 uppercase tracking-wider mb-2">Recent Chats</div>
              <div className="space-y-1">
                {chatHistory.slice(0, 5).map(chat => (
                  <button key={chat.id} className="w-full text-left px-3 py-2 rounded-xl text-sm text-gray-400 hover:bg-white/5 hover:text-white transition-all truncate">
                    {chat.title}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="p-4 border-t border-white/5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-400 to-cyan-500 flex items-center justify-center text-xs font-bold">U</div>
              {sidebarOpen && (
                <div>
                  <div className="text-sm font-medium">User</div>
                  <div className="text-xs text-gray-500">Free Plan</div>
                </div>
              )}
            </div>
            <button className="text-gray-400 hover:text-white transition-colors">
              <Settings className="h-5 w-5" />
            </button>
          </div>

          {sidebarOpen && (
            <div className="mt-3 p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl">
              <div className="text-xs text-amber-400 font-medium">Free Plan</div>
              <div className="text-xs text-gray-400">0 / 10 messages used</div>
              <button className="mt-2 w-full text-xs bg-gradient-to-r from-amber-500 to-orange-500 text-white px-3 py-1.5 rounded-lg font-medium hover:shadow-lg transition-all">
                Upgrade Now
              </button>
            </div>
          )}
        </div>
      </div>

      {/* MAIN CHAT AREA */}
      <div className="flex-1 flex flex-col h-screen">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/5 bg-black/20 backdrop-blur-xl">
          <div className="flex items-center gap-3">
            <button onClick={() => setSidebarOpen(!sidebarOpen)} className="text-gray-400 hover:text-white transition-colors">
              <Menu className="h-5 w-5" />
            </button>
            <h1 className="text-lg font-semibold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">AIOS Chat</h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-full border border-white/5">
              <Wallet className="h-4 w-4 text-emerald-400" />
              <span className="text-emerald-400 font-mono font-semibold text-sm">₹{walletBalance.toFixed(2)}</span>
              <button onClick={addFunds} className="text-xs text-gray-400 hover:text-white transition-colors">
                <Plus className="h-3 w-3" />
              </button>
            </div>
            <button className="text-gray-400 hover:text-white transition-colors">
              <Settings className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-emerald-400 to-cyan-500 flex items-center justify-center text-4xl mb-6">🤖</div>
              <h2 className="text-2xl font-bold text-white">Hi User, how can I help you today?</h2>
              <div className="flex flex-wrap gap-3 mt-6 justify-center">
                {['Create an Image', 'Compare answers', 'Web Search', 'Create Document'].map((action, i) => (
                  <button key={i} className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-sm text-gray-300 hover:bg-white/10 hover:text-white transition-all">
                    {action}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] p-4 rounded-2xl ${msg.role === 'user' ? 'bg-gradient-to-r from-emerald-500 to-cyan-500 text-white' : 'bg-white/5 border border-white/10 text-gray-200'}`}>
                  <div className="whitespace-pre-wrap text-sm leading-relaxed">{msg.content}</div>
                </div>
              </div>
            ))
          )}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-white/5 border border-white/10 p-4 rounded-2xl">
                <div className="flex items-center gap-2">
                  <div className="typing-dot"></div>
                  <div className="typing-dot"></div>
                  <div className="typing-dot"></div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="border-t border-white/5 p-4 bg-black/20 backdrop-blur-xl">
          
          <button onClick={() => setShowModelPicker(!showModelPicker)} className="flex items-center gap-2 text-xs text-gray-400 hover:text-white transition-colors mb-3">
            <span className="flex items-center gap-1">
              {selectedModels.slice(0, 3).map(id => {
                const all = Object.values(ALL_MODELS).flat()
                const model = all.find(m => m.id === id)
                return model ? <span key={id}>{model.icon}</span> : null
              })}
              {selectedModels.length > 3 && <span>+{selectedModels.length - 3}</span>}
            </span>
            <span className="text-emerald-400 font-medium">Models selected</span>
            <ChevronDown className={`h-4 w-4 transition-transform ${showModelPicker ? 'rotate-180' : ''}`} />
          </button>

          {showModelPicker && (
            <div className="mb-3 p-4 bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl max-h-[400px] overflow-y-auto">
              <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                <input type="text" placeholder="Search models..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-gray-500 outline-none focus:border-emerald-500/50 transition-all" />
              </div>

              <div className="flex gap-1 mb-4 bg-white/5 rounded-xl p-1">
                {['popular', 'intelligence', 'latest'].map((tab) => (
                  <button key={tab} onClick={() => setModelTab(tab)} className={`flex-1 px-3 py-1.5 rounded-lg text-sm font-medium capitalize transition-all ${modelTab === tab ? 'bg-emerald-500/20 text-emerald-400' : 'text-gray-400 hover:text-white'}`}>{tab}</button>
                ))}
              </div>

              <button onClick={() => { setSelectedModels(['gpt-5.4-mini', 'qwen-3.5-flash', 'ministral-3-8b']); setShowModelPicker(false) }} className="w-full p-3 mb-3 bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/20 rounded-xl text-left hover:bg-amber-500/20 transition-all">
                <div className="font-semibold text-sm text-amber-400">✨ Auto Mode (Super Fiesta)</div>
                <div className="text-xs text-gray-400">picks the best model for your task</div>
              </button>

              <div className="text-xs text-gray-500 mb-2">or pick your own</div>

              <div className="grid grid-cols-2 gap-2">
                {getCurrentModels().map((model) => (
                  <button key={model.id} onClick={() => toggleModel(model.id)} className={`flex items-center gap-3 p-3 rounded-xl text-left transition-all ${selectedModels.includes(model.id) ? 'bg-emerald-500/10 border border-emerald-500/30' : 'bg-white/5 border border-transparent hover:bg-white/10'}`}>
                    <span className="text-xl">{model.icon}</span>
                    <div className="flex-1 min-w-0">
                      <div className={`text-sm font-medium truncate ${selectedModels.includes(model.id) ? 'text-emerald-400' : 'text-white'}`}>{model.name}</div>
                    </div>
                    <div className="flex items-center gap-1">
                      <button onClick={(e) => { e.stopPropagation(); handleLike(model.id) }} className={`text-sm transition-colors ${likedModels[model.id] ? 'text-red-400' : 'text-gray-500 hover:text-red-400'}`}>❤️</button>
                      {selectedModels.includes(model.id) && <div className="text-emerald-400 text-sm">✓</div>}
                    </div>
                  </button>
                ))}
              </div>

              <button onClick={() => setShowModelPicker(false)} className="w-full mt-4 bg-gradient-to-r from-emerald-500 to-cyan-500 text-white py-2.5 rounded-xl font-semibold text-sm hover:shadow-lg transition-all">Apply for this chat</button>
            </div>
          )}

          <div className="relative">
            <textarea 
              value={prompt} 
              onChange={(e) => setPrompt(e.target.value)} 
              placeholder="Ask me anything..." 
              className="w-full min-h-[60px] max-h-[200px] bg-white/5 border border-white/10 rounded-2xl p-4 pr-28 text-white placeholder:text-gray-500 outline-none focus:border-emerald-500/50 transition-all resize-none" 
              onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSubmit() } }} 
            />
            <div className="absolute right-3 bottom-3 flex items-center gap-2">
              <button className="p-2 text-gray-400 hover:text-white transition-colors rounded-lg hover:bg-white/10">
                <Sparkles className="h-5 w-5" />
              </button>
              <button 
                onClick={handleSubmit} 
                disabled={isLoading || !prompt.trim()} 
                className="bg-gradient-to-r from-emerald-500 to-cyan-500 text-white p-2.5 rounded-xl disabled:opacity-50 hover:shadow-lg hover:shadow-emerald-500/20 transition-all"
              >
                {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
              </button>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .typing-dot { 
          width: 8px; 
          height: 8px; 
          border-radius: 50%; 
          background: #10B981; 
          display: inline-block; 
          animation: typing 1.4s infinite both; 
          margin: 0 2px; 
        }
        .typing-dot:nth-child(2) { animation-delay: 0.2s; }
        .typing-dot:nth-child(3) { animation-delay: 0.4s; }
        @keyframes typing { 
          0%, 60%, 100% { transform: translateY(0); opacity: 0.3; } 
          30% { transform: translateY(-8px); opacity: 1; } 
        }
      `}</style>
    </div>
  )  // <-- This closes the return
}      // <-- This closes the function
