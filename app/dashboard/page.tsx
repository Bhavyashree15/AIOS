'use client'

import { useState, useEffect, useRef } from 'react'
import { 
  Send, Loader2, Wallet, ChevronDown, 
  Bot, Zap, Search, Code, Users, Plus, 
  Image, FolderOpen, Menu, Sparkles,
  MessageSquare, Settings, X, 
  Globe, FileText, GitBranch
} from 'lucide-react'

// ============================================
// MODELS (Simplified for speed)
// ============================================
const ALL_MODELS = {
  popular: [
    { id: 'gpt-5.4-mini', name: 'GPT-5.4 mini', icon: '🤖', tier: 'free', cost: 0.0005 },
    { id: 'qwen-3.5-flash', name: 'Qwen3.5 Flash', icon: '🐉', tier: 'free', cost: 0.0008 },
    { id: 'ministral-3-8b', name: 'Ministral 3 8B', icon: '🧠', tier: 'free', cost: 0.001 },
    { id: 'mistral-small-4', name: 'Mistral Small 4', icon: '🌊', tier: 'free', cost: 0.001 },
    { id: 'gpt-4.1', name: 'GPT-4.1', icon: '🤖', tier: 'pro', cost: 0.005 },
    { id: 'claude-sonnet-4.0', name: 'Claude Sonnet 4.0', icon: '🎯', tier: 'pro', cost: 0.003 },
    { id: 'deepseek-chat', name: 'DeepSeek Chat', icon: '🔮', tier: 'free', cost: 0.0015 },
    { id: 'gemini-3-flash', name: 'Gemini 3 Flash', icon: '⚡', tier: 'free', cost: 0.0005 },
  ],
  intelligence: [
    { id: 'gpt-4o-mini', name: 'GPT-4o mini', icon: '🤖', tier: 'free', cost: 0.0005 },
    { id: 'claude-haiku-4.5', name: 'Claude Haiku 4.5', icon: '🎯', tier: 'free', cost: 0.0008 },
    { id: 'gpt-5.4', name: 'GPT-5.4', icon: '🤖', tier: 'pro', cost: 0.005 },
    { id: 'gemini-3-pro-preview', name: 'Gemini 3 Pro Preview', icon: '🧠', tier: 'pro', cost: 0.0025 },
  ],
  latest: [
    { id: 'perplexity-sonar', name: 'Perplexity Sonar', icon: '🔍', tier: 'pro', cost: 0.0006 },
    { id: 'gpt-5-mini', name: 'GPT-5 mini', icon: '🤖', tier: 'free', cost: 0.0005 },
    { id: 'deepseek-reasoner', name: 'DeepSeek Reasoner', icon: '🧠', tier: 'pro', cost: 0.0015 },
  ]
}

const getAllModels = () => {
  const all = [...ALL_MODELS.popular, ...ALL_MODELS.intelligence, ...ALL_MODELS.latest]
  return all.filter((model, index, self) => 
    index === self.findIndex(m => m.id === model.id)
  )
}

const QUICK_ACTIONS = [
  { icon: Image, label: 'Create an Image', prompt: 'Create a detailed description of a futuristic city' },
  { icon: GitBranch, label: 'Compare answers', prompt: 'Compare these concepts:' },
  { icon: Globe, label: 'Web Search', prompt: 'Search for the latest information about' },
  { icon: FileText, label: 'Create Document', prompt: 'Write a professional document about' },
]

export default function DashboardPage() {
  const [prompt, setPrompt] = useState('')
  const [response, setResponse] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [selectedModels, setSelectedModels] = useState(['gpt-5.4-mini'])
  const [showModelPicker, setShowModelPicker] = useState(false)
  const [modelTab, setModelTab] = useState('popular')
  const [searchQuery, setSearchQuery] = useState('')
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [messages, setMessages] = useState<{role: 'user' | 'assistant', content: string}[]>([])
  const [walletBalance, setWalletBalance] = useState(100)
  const [chatHistory, setChatHistory] = useState<{id: string, title: string}[]>([])
  const [currentChatId, setCurrentChatId] = useState<string | null>(null)
  const [activePage, setActivePage] = useState('chat')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const fetchWallet = async () => {
    try {
      const res = await fetch('/api/ai/consensus')
      const data = await res.json()
      setWalletBalance(data.balance || 100)
    } catch (error) {}
  }

  useEffect(() => {
    fetchWallet()
    const saved = localStorage.getItem('aios_chat_history')
    if (saved) {
      try { setChatHistory(JSON.parse(saved)) } catch (e) {}
    }
  }, [])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const createNewChat = () => {
    const newId = Date.now().toString()
    const updated = [{ id: newId, title: 'New Chat' }, ...chatHistory]
    setChatHistory(updated)
    setCurrentChatId(newId)
    setMessages([])
    setResponse(null)
    setPrompt('')
    localStorage.setItem('aios_chat_history', JSON.stringify(updated))
  }

  const toggleModel = (id: string) => {
    if (selectedModels.includes(id)) {
      setSelectedModels([])
    } else {
      setSelectedModels([id])
    }
  }

  const getCurrentModels = () => {
    let models = modelTab === 'all' ? getAllModels() : ALL_MODELS[modelTab as keyof typeof ALL_MODELS] || []
    if (searchQuery) {
      models = models.filter(m => m.name.toLowerCase().includes(searchQuery.toLowerCase()))
    }
    return models
  }

  const handleSubmit = async () => {
    if (!prompt.trim() || selectedModels.length === 0) return
    
    if (walletBalance < 0.01) {
      setMessages(prev => [...prev, { role: 'assistant', content: '⚠️ Insufficient balance. Please add funds.' }])
      return
    }

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
        setMessages(prev => [...prev, { role: 'assistant', content: `⚠️ ${data.error}` }])
      } else if (data.error) {
        setMessages(prev => [...prev, { role: 'assistant', content: `⚠️ ${data.error}` }])
      } else if (data.consensus) {
        setResponse(data)
        setMessages(prev => [...prev, { role: 'assistant', content: data.consensus }])
        setWalletBalance(data.wallet_balance || 100)
      } else {
        setMessages(prev => [...prev, { role: 'assistant', content: '⚠️ No response. Try again.' }])
      }
    } catch (error) {
      setMessages(prev => [...prev, { role: 'assistant', content: '❌ Error. Please try again.' }])
    }
    setIsLoading(false)
    setPrompt('')
  }

  const addFunds = () => {
    if (typeof window !== 'undefined') {
      const amount = window.prompt('Enter amount to add (₹):', '100')
      if (amount) {
        const num = parseFloat(amount)
        if (num > 0) {
          setWalletBalance(prev => prev + num)
          alert(`₹${num} added! New balance: ₹${walletBalance + num}`)
        }
      }
    }
  }

  const handleQuickAction = (actionPrompt: string) => {
    setPrompt(actionPrompt)
    setTimeout(() => handleSubmit(), 300)
  }

  const navItems = [
    { id: 'chat', icon: MessageSquare, label: 'Chat' },
    { id: 'image', icon: Image, label: 'Image Studio' },
    { id: 'experts', icon: Users, label: 'Experts' },
    { id: 'projects', icon: FolderOpen, label: 'Projects' },
  ]

  return (
    // ===== FIX: Use h-screen and overflow-hidden =====
    <div className="h-screen bg-[#0B0F17] text-white flex overflow-hidden">
      
      {/* ========== SIDEBAR ========== */}
      <div className={`${sidebarOpen ? 'w-72' : 'w-20'} transition-all duration-300 border-r border-white/10 bg-black/30 backdrop-blur-xl flex flex-col h-full flex-shrink-0 overflow-hidden`}>
        
        <div className="flex items-center gap-3 p-4 border-b border-white/5 flex-shrink-0">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-cyan-500 flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-emerald-500/20">AI</div>
          {sidebarOpen && (
            <div>
              <div className="font-bold text-xl bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">AIOS</div>
              <div className="text-[10px] text-gray-500 tracking-wider">OPERATING SYSTEM</div>
            </div>
          )}
        </div>

        <div className="p-4 flex-shrink-0">
          <button onClick={createNewChat} className="w-full bg-gradient-to-r from-emerald-500 to-cyan-500 text-white px-4 py-3 rounded-xl font-semibold flex items-center justify-center gap-2 hover:shadow-lg hover:shadow-emerald-500/20 transition-all text-sm">
            <Plus className="h-5 w-5" />
            {sidebarOpen && 'New Chat'}
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-3">
          {navItems.map((item) => (
            <button key={item.id} onClick={() => { setActivePage(item.id); if (item.id !== 'chat') setMessages([{ role: 'assistant', content: `📌 ${item.label} coming soon!` }]) }} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all text-sm ${activePage === item.id ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}>
              <item.icon className="h-5 w-5" />
              {sidebarOpen && item.label}
            </button>
          ))}
          {sidebarOpen && chatHistory.length > 0 && (
            <div className="mt-6">
              <div className="text-[10px] text-gray-500 uppercase tracking-wider mb-2 px-2">Recent Chats</div>
              {chatHistory.slice(0, 10).map(chat => (
                <button key={chat.id} onClick={() => { setCurrentChatId(chat.id); setMessages([]); setResponse(null); }} className={`w-full text-left px-3 py-2 rounded-xl text-sm transition-all truncate flex items-center gap-2 ${currentChatId === chat.id ? 'bg-emerald-500/10 text-emerald-400' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}>
                  <MessageSquare className="h-3 w-3 flex-shrink-0" />
                  <span className="truncate">{chat.title}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="p-4 border-t border-white/5 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-emerald-400 to-cyan-500 flex items-center justify-center text-xs font-bold shadow-lg shadow-emerald-500/20">U</div>
              {sidebarOpen && <div><div className="text-sm font-medium">User</div><div className="text-[10px] text-gray-500">Free Plan</div></div>}
            </div>
            <button className="text-gray-400 hover:text-white"><Settings className="h-5 w-5" /></button>
          </div>
          {sidebarOpen && (
            <div className="mt-3 p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl">
              <div className="text-[10px] text-amber-400 font-medium uppercase">Free Plan</div>
              <div className="text-xs text-gray-400 mt-1">0 / 10 messages used</div>
              <button className="mt-2 w-full text-xs bg-gradient-to-r from-amber-500 to-orange-500 text-white px-3 py-1.5 rounded-lg font-medium hover:shadow-lg">Upgrade Now</button>
            </div>
          )}
        </div>
      </div>

      {/* ========== MAIN CHAT AREA ========== */}
      <div className="flex-1 flex flex-col h-full min-w-0 overflow-hidden">
        
        {/* Header - Fixed at top */}
        <div className="flex items-center justify-between px-6 py-3 border-b border-white/5 bg-black/20 backdrop-blur-xl flex-shrink-0">
          <div className="flex items-center gap-4 min-w-0">
            <button onClick={() => setSidebarOpen(!sidebarOpen)} className="text-gray-400 hover:text-white flex-shrink-0">
              <Menu className="h-5 w-5" />
            </button>
            <h1 className="text-lg font-semibold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent truncate">
              {activePage === 'chat' ? 'AIOS Chat' : activePage.charAt(0).toUpperCase() + activePage.slice(1)}
            </h1>
            {response && (
              <div className="flex items-center gap-2 text-xs flex-shrink-0">
                <span className="px-2 py-0.5 rounded-full bg-white/5 text-emerald-400">Score: {response.consensus_score}%</span>
                <span className="text-gray-500">|</span>
                <span className="text-cyan-400">{response.total_models || 0} models</span>
                <span className="text-gray-500">|</span>
                <span className="text-emerald-400">₹{response.cost_inr?.toFixed(4) || '0.00'}</span>
              </div>
            )}
          </div>
          <div className="flex items-center gap-4 flex-shrink-0">
            <div className="flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-full border border-white/5">
              <Wallet className="h-4 w-4 text-emerald-400" />
              <span className="text-emerald-400 font-mono font-semibold text-sm">₹{walletBalance.toFixed(2)}</span>
              <button onClick={addFunds} className="text-xs text-gray-400 hover:text-white"><Plus className="h-3 w-3" /></button>
            </div>
            <button className="text-gray-400 hover:text-white"><Settings className="h-5 w-5" /></button>
          </div>
        </div>

        {/* Messages - Scrollable middle section */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-0">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-emerald-400 to-cyan-500 flex items-center justify-center text-3xl font-bold text-white shadow-2xl shadow-emerald-500/20 mb-6">AI</div>
              <h2 className="text-2xl font-bold text-white">Hi User, how can I help you today?</h2>
              <p className="text-gray-400 text-sm mt-2">Ask me anything, and I'll get answers from AI models</p>
              <div className="flex flex-wrap gap-3 mt-6 justify-center">
                {QUICK_ACTIONS.map((action, i) => (
                  <button key={i} onClick={() => handleQuickAction(action.prompt)} className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-sm text-gray-300 hover:bg-white/10 hover:text-white transition-all">
                    <action.icon className="h-4 w-4" />
                    {action.label}
                  </button>
                ))}
              </div>
              <div className="mt-8 flex items-center gap-6 text-xs text-gray-500">
                <span className="flex items-center gap-1"><Bot className="h-3 w-3" /> {selectedModels.length} model selected</span>
                <span className="flex items-center gap-1"><Wallet className="h-3 w-3" /> ₹{walletBalance.toFixed(2)} balance</span>
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
                  <span className="text-sm text-gray-400 ml-2">Getting response...</span>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input - Fixed at bottom */}
        <div className="border-t border-white/5 p-3 bg-black/20 backdrop-blur-xl flex-shrink-0">
          
          <button onClick={() => setShowModelPicker(!showModelPicker)} className="flex items-center gap-2 text-xs text-gray-400 hover:text-white transition-colors mb-2">
            {selectedModels.map(id => {
              const model = getAllModels().find(m => m.id === id)
              return model ? <span key={id} className="text-base">{model.icon}</span> : null
            })}
            <span className="text-emerald-400 font-medium text-xs">
              {selectedModels.length === 0 ? 'No model selected' : getAllModels().find(m => m.id === selectedModels[0])?.name || 'Select model'}
            </span>
            <ChevronDown className={`h-3 w-3 transition-transform ${showModelPicker ? 'rotate-180' : ''}`} />
          </button>

          {showModelPicker && (
            <div className="mb-2 p-3 bg-[#1a1f2e] border border-white/10 rounded-2xl max-h-[350px] overflow-y-auto">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-semibold text-white">Choose a model</h3>
                <button onClick={() => setShowModelPicker(false)} className="text-gray-400 hover:text-white"><X className="h-4 w-4" /></button>
              </div>
              <p className="text-xs text-gray-500 mb-2">Select one AI model for your task</p>
              <div className="relative mb-2">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                <input type="text" placeholder="Search models..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2 text-sm text-white placeholder-gray-500 outline-none focus:border-emerald-500/50" />
              </div>
              <div className="flex gap-1 mb-2 bg-white/5 rounded-xl p-1 flex-wrap">
                {['popular', 'intelligence', 'latest', 'all'].map((tab) => (
                  <button key={tab} onClick={() => setModelTab(tab)} className={`flex-1 px-2 py-1 rounded-lg text-xs font-medium capitalize ${modelTab === tab ? 'bg-emerald-500/20 text-emerald-400' : 'text-gray-400 hover:text-white'}`}>
                    {tab === 'all' ? 'All' : tab}
                  </button>
                ))}
              </div>
              <button onClick={() => { setSelectedModels(['gpt-5.4-mini']); setShowModelPicker(false) }} className="w-full p-2 mb-2 bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/20 rounded-xl text-left hover:bg-amber-500/20">
                <div className="font-semibold text-xs text-amber-400">✨ Auto Mode</div>
                <div className="text-[10px] text-gray-400">picks the best model for your task</div>
              </button>
              <div className="text-[10px] text-gray-500 mb-2">or pick your own</div>
              <div className="grid grid-cols-2 gap-1.5">
                {getCurrentModels().map((model) => (
                  <button key={model.id} onClick={() => toggleModel(model.id)} className={`flex items-center gap-1.5 p-1.5 rounded-xl text-left text-xs w-full ${selectedModels.includes(model.id) ? 'bg-emerald-500/10 border border-emerald-500/30' : 'bg-white/5 border border-transparent hover:bg-white/10'}`}>
                    <span className="text-base">{model.icon}</span>
                    <div className="flex-1 min-w-0">
                      <span className={`truncate block ${selectedModels.includes(model.id) ? 'text-emerald-400' : 'text-white'}`}>{model.name}</span>
                      <span className={`text-[9px] ${model.tier === 'pro' ? 'text-amber-400' : 'text-emerald-400'}`}>{model.tier === 'pro' ? '⭐ Pro' : 'Free'}</span>
                    </div>
                    {selectedModels.includes(model.id) && <span className="text-emerald-400 text-xs">✓</span>}
                  </button>
                ))}
              </div>
              <button onClick={() => setShowModelPicker(false)} className="w-full mt-2 bg-gradient-to-r from-emerald-500 to-cyan-500 text-white py-1.5 rounded-xl font-semibold text-xs hover:shadow-lg">Apply</button>
            </div>
          )}

          {/* Text Input - FIXED */}
          <div className="relative">
            <textarea 
              value={prompt} 
              onChange={(e) => setPrompt(e.target.value)} 
              placeholder="Ask me anything..." 
              className="w-full min-h-[48px] max-h-[100px] bg-white/5 border border-white/10 rounded-2xl p-3 pr-24 text-white placeholder:text-gray-500 outline-none focus:border-emerald-500/50 resize-none text-sm" 
              onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSubmit() } }} 
              rows={1}
            />
            <div className="absolute right-2 bottom-2 flex items-center gap-1.5">
              <button className="p-1.5 text-gray-400 hover:text-white rounded-lg hover:bg-white/10">
                <Sparkles className="h-4 w-4" />
              </button>
              <button 
                onClick={handleSubmit} 
                disabled={isLoading || !prompt.trim() || selectedModels.length === 0} 
                className="bg-gradient-to-r from-emerald-500 to-cyan-500 text-white p-2 rounded-xl disabled:opacity-50 hover:shadow-lg"
              >
                {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              </button>
            </div>
          </div>
          {selectedModels.length === 0 && (
            <p className="text-[10px] text-amber-400 mt-1">⚠️ Please select a model</p>
          )}
        </div>
      </div>

      <style>{`
        .typing-dot { width: 6px; height: 6px; border-radius: 50%; background: #10B981; display: inline-block; animation: typing 1.4s infinite both; margin: 0 2px; }
        .typing-dot:nth-child(2) { animation-delay: 0.2s; }
        .typing-dot:nth-child(3) { animation-delay: 0.4s; }
        @keyframes typing { 0%, 60%, 100% { transform: translateY(0); opacity: 0.3; } 30% { transform: translateY(-6px); opacity: 1; } }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #1E293B; border-radius: 4px; }
      `}</style>
    </div>
  )
}
