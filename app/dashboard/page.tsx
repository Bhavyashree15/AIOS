'use client'

import { useState, useEffect, useRef } from 'react'
import { 
  Send, Loader2, Wallet, ChevronDown, 
  Bot, Zap, Search, Code, Users, Plus, 
  Image, FolderOpen, Menu, Sparkles,
  MessageSquare, Settings, X, 
  Globe, FileText, GitBranch, Copy, Check,
  Star, Crown, TrendingUp, Clock
} from 'lucide-react'

// ============================================
// COMPLETE MODEL DATABASE WITH PRICING
// ============================================
const ALL_MODELS = {
  popular: [
    { id: 'gpt-5.4-mini', name: 'GPT-5.4 mini', icon: '🤖', tier: 'free', cost: 0.0005 },
    { id: 'qwen-3.5-flash', name: 'Qwen3.5 Flash', icon: '🐉', tier: 'free', cost: 0.0008 },
    { id: 'ministral-3-8b', name: 'Ministral 3 8B', icon: '🧠', tier: 'free', cost: 0.001 },
    { id: 'mistral-small-4', name: 'Mistral Small 4', icon: '🌊', tier: 'free', cost: 0.001 },
    { id: 'command-a', name: 'Command A', icon: '⚡', tier: 'pro', cost: 0.0012 },
    { id: 'gpt-4.1', name: 'GPT-4.1', icon: '🤖', tier: 'pro', cost: 0.005 },
    { id: 'nova-pro', name: 'Nova Pro', icon: '✨', tier: 'pro', cost: 0.0025 },
    { id: 'qwen-3.7-max', name: 'Qwen3.7 Max', icon: '🐉', tier: 'pro', cost: 0.0008 },
    { id: 'nova-lite', name: 'Nova Lite', icon: '✨', tier: 'free', cost: 0.0005 },
    { id: 'kimi-k3', name: 'Kimi K3', icon: '🔥', tier: 'pro', cost: 0.001 },
  ],
  intelligence: [
    { id: 'mistral-small', name: 'Mistral Small', icon: '🌊', tier: 'free', cost: 0.001 },
    { id: 'grok-3-mini', name: 'Grok 3 Mini', icon: '🦍', tier: 'pro', cost: 0.002 },
    { id: 'gpt-4o-mini', name: 'GPT-4o mini', icon: '🤖', tier: 'free', cost: 0.0005 },
    { id: 'gpt-4.1-nano', name: 'GPT-4.1 nano', icon: '🤖', tier: 'free', cost: 0.0005 },
    { id: 'codestral', name: 'Codestral', icon: '💻', tier: 'pro', cost: 0.001 },
    { id: 'claude-sonnet-4.0', name: 'Claude Sonnet 4.0', icon: '🎯', tier: 'pro', cost: 0.003 },
    { id: 'seed-2.0-lite', name: 'Seed 2.0 Lite', icon: '🌱', tier: 'free', cost: 0.0004 },
    { id: 'gemini-3-pro-preview', name: 'Gemini 3 Pro Preview', icon: '🧠', tier: 'pro', cost: 0.0025 },
    { id: 'gemini-3-flash', name: 'Gemini 3 Flash', icon: '⚡', tier: 'free', cost: 0.0005 },
    { id: 'claude-sonnet-4.6', name: 'Claude Sonnet 4.6', icon: '🎯', tier: 'pro', cost: 0.003 },
    { id: 'gpt-5.4', name: 'GPT-5.4', icon: '🤖', tier: 'pro', cost: 0.005 },
    { id: 'kimi-k2.5', name: 'Kimi-k2.5', icon: '🔥', tier: 'pro', cost: 0.001 },
  ],
  latest: [
    { id: 'nova-micro', name: 'Nova Micro', icon: '✨', tier: 'free', cost: 0.0005 },
    { id: 'gpt-5.6-terra', name: 'GPT-5.6 Terra', icon: '🌍', tier: 'pro', cost: 0.005 },
    { id: 'grok-4.5', name: 'Grok 4.5', icon: '🦍', tier: 'pro', cost: 0.002 },
    { id: 'nova-premier-1.0', name: 'Nova Premier 1.0', icon: '✨', tier: 'pro', cost: 0.0025 },
    { id: 'perplexity-sonar', name: 'Perplexity Sonar', icon: '🔍', tier: 'pro', cost: 0.0006 },
    { id: 'gpt-5.6-luna', name: 'GPT-5.6 Luna', icon: '🌙', tier: 'pro', cost: 0.005 },
    { id: 'qwen-3-coder-flash', name: 'Qwen 3 Coder Flash', icon: '💻', tier: 'free', cost: 0.0007 },
    { id: 'claude-haiku-4.5', name: 'Claude Haiku 4.5', icon: '🎯', tier: 'free', cost: 0.0008 },
    { id: 'deepseek-chat', name: 'DeepSeek Chat', icon: '🔮', tier: 'free', cost: 0.0015 },
    { id: 'gpt-5.4-nano', name: 'GPT-5.4 nano', icon: '🤖', tier: 'free', cost: 0.0005 },
    { id: 'qwen-flash', name: 'Qwen Flash', icon: '⚡', tier: 'free', cost: 0.0008 },
    { id: 'deepseek-reasoner', name: 'DeepSeek Reasoner', icon: '🧠', tier: 'pro', cost: 0.0015 },
    { id: 'gpt-5-mini', name: 'GPT-5 mini', icon: '🤖', tier: 'free', cost: 0.0005 },
    { id: 'gpt-5', name: 'GPT-5', icon: '🤖', tier: 'pro', cost: 0.005 },
  ]
}

const getAllModels = () => {
  const all = [...ALL_MODELS.popular, ...ALL_MODELS.intelligence, ...ALL_MODELS.latest]
  return all.filter((model, index, self) => 
    index === self.findIndex(m => m.id === model.id)
  )
}

// Quick actions
const QUICK_ACTIONS = [
  { icon: Image, label: 'Create an Image', prompt: 'Create a detailed description of a futuristic city with neon lights' },
  { icon: GitBranch, label: 'Compare answers', prompt: 'Compare these concepts and give me a detailed comparison:' },
  { icon: Globe, label: 'Web Search', prompt: 'Search for the latest information about' },
  { icon: FileText, label: 'Create Document', prompt: 'Write a professional document about' },
]

export default function DashboardPage() {
  // ============================================
  // STATE
  // ============================================
  const [prompt, setPrompt] = useState('')
  const [response, setResponse] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)
  // FIX: ONLY ONE model selected by default (GPT-5.4 mini)
  const [selectedModels, setSelectedModels] = useState(['gpt-5.4-mini'])
  const [showModelPicker, setShowModelPicker] = useState(false)
  const [modelTab, setModelTab] = useState('popular')
  const [searchQuery, setSearchQuery] = useState('')
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [messages, setMessages] = useState<{role: 'user' | 'assistant', content: string}[]>([])
  const [walletBalance, setWalletBalance] = useState(100)
  // FIX: Chat history with unique IDs
  const [chatHistory, setChatHistory] = useState<{id: string, title: string, messages: any[], timestamp: string}[]>([])
  const [currentChatId, setCurrentChatId] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const [activePage, setActivePage] = useState('chat')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // ============================================
  // FETCH WALLET
  // ============================================
  const fetchWallet = async () => {
    try {
      const res = await fetch('/api/ai/consensus')
      const data = await res.json()
      setWalletBalance(data.balance || 100)
    } catch (error) {
      console.error('Error fetching wallet:', error)
    }
  }

  useEffect(() => {
    fetchWallet()
    // Load chat history from localStorage
    const saved = localStorage.getItem('aios_chat_history')
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        setChatHistory(parsed)
      } catch (e) {}
    }
  }, [])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // ============================================
  // SAVE CHAT HISTORY
  // ============================================
  const saveChatHistory = (history: any[]) => {
    setChatHistory(history)
    localStorage.setItem('aios_chat_history', JSON.stringify(history))
  }

  // ============================================
  // NEW CHAT - CLEARS EVERYTHING
  // ============================================
  const createNewChat = () => {
    const newId = Date.now().toString()
    const newChat = {
      id: newId,
      title: 'New Chat',
      messages: [],
      timestamp: new Date().toISOString()
    }
    setChatHistory(prev => [newChat, ...prev])
    setCurrentChatId(newId)
    setMessages([])
    setResponse(null)
    setPrompt('')
    setActivePage('chat')
    // Save to localStorage
    const updated = [newChat, ...chatHistory]
    localStorage.setItem('aios_chat_history', JSON.stringify(updated))
  }

  // ============================================
  // LOAD CHAT
  // ============================================
  const loadChat = (chatId: string) => {
    const chat = chatHistory.find(c => c.id === chatId)
    if (chat) {
      setCurrentChatId(chatId)
      setMessages(chat.messages || [])
      setResponse(null)
      setActivePage('chat')
    }
  }

  // ============================================
  // MODEL FUNCTIONS
  // ============================================
  const toggleModel = (id: string) => {
    // FIX: Only allow ONE model selection
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

  // ============================================
  // SUBMIT QUERY - WITH WALLET DEDUCTION
  // ============================================
  const handleSubmit = async () => {
    if (!prompt.trim()) return
    
    // Check wallet balance before sending
    if (walletBalance < 0.01) {
      setMessages(prev => [...prev, { role: 'assistant', content: '⚠️ Insufficient balance. Please add funds to continue.' }])
      return
    }

    const userMessage = { role: 'user' as const, content: prompt }
    setMessages(prev => [...prev, userMessage])
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
        // Update wallet balance from API response
        setWalletBalance(data.wallet_balance || 100)
      } else {
        setMessages(prev => [...prev, { role: 'assistant', content: '⚠️ No response. Please try again.' }])
      }
    } catch (error) {
      setMessages(prev => [...prev, { role: 'assistant', content: '❌ Error: Please try again.' }])
    }
    setIsLoading(false)
    setPrompt('')
  }

  // ============================================
  // ADD FUNDS
  // ============================================
  const addFunds = async () => {
    if (typeof window !== 'undefined') {
      const amount = window.prompt('Enter amount to add (₹):', '100')
      if (amount) {
        const num = parseFloat(amount)
        if (num > 0) {
          setWalletBalance(prev => prev + num)
          alert(`₹${num} added successfully! New balance: ₹${walletBalance + num}`)
        }
      }
    }
  }

  // ============================================
  // QUICK ACTION
  // ============================================
  const handleQuickAction = (actionPrompt: string) => {
    setPrompt(actionPrompt)
    setTimeout(() => handleSubmit(), 300)
  }

  // ============================================
  // SIDEBAR NAVIGATION
  // ============================================
  const navItems = [
    { id: 'chat', icon: MessageSquare, label: 'Chat' },
    { id: 'image', icon: Image, label: 'Image Studio' },
    { id: 'experts', icon: Users, label: 'Experts' },
    { id: 'projects', icon: FolderOpen, label: 'Projects' },
  ]

  const handleNavClick = (id: string) => {
    setActivePage(id)
    if (id === 'chat') return
    setMessages([{ role: 'assistant', content: `📌 ${id.charAt(0).toUpperCase() + id.slice(1)} coming soon! This feature is under development.` }])
  }

  // ============================================
  // UI HELPERS
  // ============================================
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-emerald-400'
    if (score >= 60) return 'text-amber-400'
    return 'text-red-400'
  }

  const getModelCost = (id: string) => {
    const all = getAllModels()
    const model = all.find(m => m.id === id)
    return model ? model.cost : 0
  }

  // ============================================
  // RENDER
  // ============================================
  return (
    <div className="min-h-screen bg-[#0B0F17] text-white flex">
      
      {/* ========== SIDEBAR ========== */}
      <div className={`${sidebarOpen ? 'w-72' : 'w-20'} transition-all duration-300 border-r border-white/10 bg-black/30 backdrop-blur-xl flex flex-col h-screen sticky top-0`}>
        
        {/* Logo */}
        <div className="flex items-center gap-3 p-4 border-b border-white/5">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-cyan-500 flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-emerald-500/20">
            AI
          </div>
          {sidebarOpen && (
            <div>
              <div className="font-bold text-xl bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">AIOS</div>
              <div className="text-[10px] text-gray-500 tracking-wider">OPERATING SYSTEM</div>
            </div>
          )}
        </div>

        {/* New Chat Button */}
        <div className="p-4">
          <button 
            onClick={createNewChat} 
            className="w-full bg-gradient-to-r from-emerald-500 to-cyan-500 text-white px-4 py-3 rounded-xl font-semibold flex items-center justify-center gap-2 hover:shadow-lg hover:shadow-emerald-500/20 transition-all text-sm"
          >
            <Plus className="h-5 w-5" />
            {sidebarOpen && 'New Chat'}
          </button>
        </div>

        {/* Navigation */}
        <div className="flex-1 overflow-y-auto px-3">
          <div className="space-y-1">
            {navItems.map((item) => (
              <button 
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all text-sm ${
                  activePage === item.id 
                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                    : 'text-gray-400 hover:bg-white/5 hover:text-white'
                }`}
              >
                <item.icon className="h-5 w-5" />
                {sidebarOpen && item.label}
              </button>
            ))}
          </div>

          {/* Chat History */}
          {sidebarOpen && chatHistory.length > 0 && (
            <div className="mt-6">
              <div className="text-[10px] text-gray-500 uppercase tracking-wider mb-2 px-2">Recent Chats</div>
              <div className="space-y-1">
                {chatHistory.slice(0, 10).map(chat => (
                  <button 
                    key={chat.id} 
                    onClick={() => loadChat(chat.id)}
                    className={`w-full text-left px-3 py-2 rounded-xl text-sm transition-all truncate flex items-center gap-2 ${
                      currentChatId === chat.id 
                        ? 'bg-emerald-500/10 text-emerald-400' 
                        : 'text-gray-400 hover:bg-white/5 hover:text-white'
                    }`}
                  >
                    <MessageSquare className="h-3 w-3 flex-shrink-0" />
                    <span className="truncate">{chat.title}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* User Profile */}
        <div className="p-4 border-t border-white/5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-emerald-400 to-cyan-500 flex items-center justify-center text-xs font-bold shadow-lg shadow-emerald-500/20">
                U
              </div>
              {sidebarOpen && (
                <div>
                  <div className="text-sm font-medium">User</div>
                  <div className="text-[10px] text-gray-500">Free Plan</div>
                </div>
              )}
            </div>
            <button className="text-gray-400 hover:text-white transition-colors">
              <Settings className="h-5 w-5" />
            </button>
          </div>

          {sidebarOpen && (
            <div className="mt-3 p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl">
              <div className="text-[10px] text-amber-400 font-medium uppercase tracking-wider">Free Plan</div>
              <div className="text-xs text-gray-400 mt-1">0 / 10 messages used</div>
              <button className="mt-2 w-full text-xs bg-gradient-to-r from-amber-500 to-orange-500 text-white px-3 py-1.5 rounded-lg font-medium hover:shadow-lg transition-all">
                Upgrade Now
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ========== MAIN CHAT AREA ========== */}
      <div className="flex-1 flex flex-col h-screen">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/5 bg-black/20 backdrop-blur-xl">
          <div className="flex items-center gap-4">
            <button onClick={() => setSidebarOpen(!sidebarOpen)} className="text-gray-400 hover:text-white transition-colors">
              <Menu className="h-5 w-5" />
            </button>
            <h1 className="text-lg font-semibold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
              {activePage === 'chat' ? 'AIOS Chat' : activePage.charAt(0).toUpperCase() + activePage.slice(1)}
            </h1>
            {response && (
              <div className="flex items-center gap-2 text-xs">
                <span className={`px-2 py-1 rounded-full ${getScoreColor(response.consensus_score)} bg-white/5`}>
                  Score: {response.consensus_score}%
                </span>
                <span className="text-gray-500">|</span>
                <span className="text-cyan-400">{response.total_models || selectedModels.length} models</span>
                <span className="text-gray-500">|</span>
                <span className="text-emerald-400">₹{response.cost_inr?.toFixed(4) || '0.00'}</span>
              </div>
            )}
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
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-emerald-400 to-cyan-500 flex items-center justify-center text-3xl font-bold text-white shadow-2xl shadow-emerald-500/20 mb-6">
                AI
              </div>
              <h2 className="text-2xl font-bold text-white">Hi User, how can I help you today?</h2>
              <p className="text-gray-400 text-sm mt-2">Ask me anything, and I'll get answers from AI models</p>
              <div className="flex flex-wrap gap-3 mt-6 justify-center">
                {QUICK_ACTIONS.map((action, i) => (
                  <button 
                    key={i} 
                    onClick={() => handleQuickAction(action.prompt)}
                    className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-sm text-gray-300 hover:bg-white/10 hover:text-white transition-all"
                  >
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
                <div className={`max-w-[80%] p-4 rounded-2xl ${
                  msg.role === 'user' 
                    ? 'bg-gradient-to-r from-emerald-500 to-cyan-500 text-white' 
                    : 'bg-white/5 border border-white/10 text-gray-200'
                }`}>
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

        {/* ========== INPUT AREA ========== */}
        <div className="border-t border-white/5 p-4 bg-black/20 backdrop-blur-xl">
          
          {/* Model Selector - Shows selected model name */}
          <button 
            onClick={() => setShowModelPicker(!showModelPicker)} 
            className="flex items-center gap-2 text-xs text-gray-400 hover:text-white transition-colors mb-3"
          >
            <span className="flex items-center gap-1">
              {selectedModels.map(id => {
                const all = getAllModels()
                const model = all.find(m => m.id === id)
                return model ? <span key={id}>{model.icon}</span> : null
              })}
            </span>
            <span className="text-emerald-400 font-medium">
              {selectedModels.length === 0 ? 'No model selected' : 
                getAllModels().find(m => m.id === selectedModels[0])?.name || 'Select model'}
            </span>
            {selectedModels.length > 0 && (
              <span className="text-[10px] text-gray-500">
                (₹{getModelCost(selectedModels[0])?.toFixed(4) || '0.0000'}/query)
              </span>
            )}
            <ChevronDown className={`h-4 w-4 transition-transform ${showModelPicker ? 'rotate-180' : ''}`} />
          </button>

          {/* Model Picker */}
          {showModelPicker && (
            <div className="mb-3 p-4 bg-[#1a1f2e] border border-white/10 rounded-2xl max-h-[500px] overflow-y-auto">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-white">Choose a model</h3>
                <button onClick={() => setShowModelPicker(false)} className="text-gray-400 hover:text-white">
                  <X className="h-4 w-4" />
                </button>
              </div>
              <p className="text-xs text-gray-500 mb-3">Select one AI model for your task</p>

              <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                <input 
                  type="text" 
                  placeholder="Search models..." 
                  value={searchQuery} 
                  onChange={(e) => setSearchQuery(e.target.value)} 
                  className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-gray-500 outline-none focus:border-emerald-500/50 transition-all" 
                />
              </div>

              <div className="flex gap-1 mb-4 bg-white/5 rounded-xl p-1 flex-wrap">
                {['popular', 'intelligence', 'latest', 'all'].map((tab) => (
                  <button 
                    key={tab} 
                    onClick={() => setModelTab(tab)} 
                    className={`flex-1 px-3 py-1.5 rounded-lg text-sm font-medium capitalize transition-all ${
                      modelTab === tab ? 'bg-emerald-500/20 text-emerald-400' : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    {tab === 'all' ? 'All Models' : tab}
                  </button>
                ))}
              </div>

              <button 
                onClick={() => { 
                  setSelectedModels(['gpt-5.4-mini']); 
                  setShowModelPicker(false) 
                }} 
                className="w-full p-3 mb-3 bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/20 rounded-xl text-left hover:bg-amber-500/20 transition-all"
              >
                <div className="font-semibold text-sm text-amber-400">✨ Auto Mode (Super Fiesta)</div>
                <div className="text-xs text-gray-400">picks the best model for your task</div>
              </button>

              <div className="text-xs text-gray-500 mb-2">or pick your own</div>

              <div className="grid grid-cols-2 gap-2">
                {getCurrentModels().map((model) => (
                  <button
                    key={model.id}
                    onClick={() => toggleModel(model.id)}
                    className={`flex items-center gap-2 p-2 rounded-xl text-left transition-all text-sm w-full ${
                      selectedModels.includes(model.id)
                        ? 'bg-emerald-500/10 border border-emerald-500/30'
                        : 'bg-white/5 border border-transparent hover:bg-white/10'
                    }`}
                  >
                    <span className="text-lg flex-shrink-0">{model.icon}</span>
                    <div className="flex-1 min-w-0">
                      <span className={`truncate block ${selectedModels.includes(model.id) ? 'text-emerald-400' : 'text-white'}`}>
                        {model.name}
                      </span>
                      <span className={`text-[10px] ${model.tier === 'pro' ? 'text-amber-400' : 'text-emerald-400'}`}>
                        {model.tier === 'pro' ? '⭐ Pro' : 'Free'} · ₹{model.cost.toFixed(4)}/query
                      </span>
                    </div>
                    {selectedModels.includes(model.id) && (
                      <span className="ml-auto text-emerald-400 flex-shrink-0">✓</span>
                    )}
                  </button>
                ))}
              </div>

              <div className="text-xs text-gray-500 mt-3">
                {getCurrentModels().length} models available
              </div>

              <button 
                onClick={() => setShowModelPicker(false)} 
                className="w-full mt-4 bg-gradient-to-r from-emerald-500 to-cyan-500 text-white py-2.5 rounded-xl font-semibold text-sm hover:shadow-lg transition-all"
              >
                Apply for this chat
              </button>
            </div>
          )}

          {/* Text Input */}
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
                disabled={isLoading || !prompt.trim() || selectedModels.length === 0} 
                className="bg-gradient-to-r from-emerald-500 to-cyan-500 text-white p-2.5 rounded-xl disabled:opacity-50 hover:shadow-lg hover:shadow-emerald-500/20 transition-all"
              >
                {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
              </button>
            </div>
          </div>
          {selectedModels.length === 0 && (
            <p className="text-xs text-amber-400 mt-2">⚠️ Please select a model to continue</p>
          )}
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
  )
          }
