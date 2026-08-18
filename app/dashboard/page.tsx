'use client'

import { useState, useEffect, useRef } from 'react'
import { 
  Send, Loader2, Wallet, ChevronDown, 
  Bot, Zap, Search, Code, Users, Plus, 
  Image, FolderOpen, Menu, Sparkles,
  MessageSquare, Settings, X, 
  Globe, FileText, GitBranch, Trash2
} from 'lucide-react'

// ============================================
// MODELS DATABASE
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

const STORAGE_KEY = 'aios_chats'

const getStoredChats = (): ChatType[] => {
  if (typeof window === 'undefined') return []
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    return stored ? JSON.parse(stored) : []
  } catch {
    return []
  }
}

const saveChats = (chats: ChatType[]) => {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(chats))
  } catch (e) {}
}

type ChatType = {
  id: string
  title: string
  messages: { role: 'user' | 'assistant', content: string }[]
  timestamp: string
  model?: string
}

export default function DashboardPage() {
  const [prompt, setPrompt] = useState('')
  const [response, setResponse] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [selectedModels, setSelectedModels] = useState(['gpt-5.4-mini'])
  const [showModelPicker, setShowModelPicker] = useState(false)
  const [modelTab, setModelTab] = useState('popular')
  const [searchQuery, setSearchQuery] = useState('')
  const [sidebarOpen, setSidebarOpen] = useState(false) // ← HIDDEN BY DEFAULT
  const [walletBalance, setWalletBalance] = useState(100)
  const [activePage, setActivePage] = useState('chat')
  const [chats, setChats] = useState<ChatType[]>([])
  const [currentChatId, setCurrentChatId] = useState<string | null>(null)
  const [messages, setMessages] = useState<{role: 'user' | 'assistant', content: string}[]>([])
  
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const stored = getStoredChats()
    if (stored.length > 0) {
      setChats(stored)
      const mostRecent = stored[0]
      setCurrentChatId(mostRecent.id)
      setMessages(mostRecent.messages || [])
    } else {
      createNewChat()
    }
  }, [])

  useEffect(() => {
    if (chats.length > 0) {
      saveChats(chats)
    }
  }, [chats])

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' })
    }
  }, [messages])

  const createNewChat = () => {
    const newId = Date.now().toString()
    const newChat: ChatType = {
      id: newId,
      title: 'New Chat',
      messages: [],
      timestamp: new Date().toISOString(),
      model: selectedModels[0],
    }
    setChats(prev => [newChat, ...prev])
    setCurrentChatId(newId)
    setMessages([])
    setResponse(null)
    setPrompt('')
    setSidebarOpen(false) // Close sidebar after new chat
  }

  const loadChat = (chatId: string) => {
    const chat = chats.find(c => c.id === chatId)
    if (chat) {
      setCurrentChatId(chatId)
      setMessages(chat.messages || [])
      setResponse(null)
      setPrompt('')
      setSidebarOpen(false) // Close sidebar after loading chat
    }
  }

  const deleteChat = (chatId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    const updated = chats.filter(c => c.id !== chatId)
    setChats(updated)
    if (currentChatId === chatId) {
      if (updated.length > 0) {
        loadChat(updated[0].id)
      } else {
        createNewChat()
      }
    }
  }

  const updateChatMessages = (chatId: string, newMessages: {role: 'user' | 'assistant', content: string}[]) => {
    setChats(prev => prev.map(c => {
      if (c.id === chatId) {
        let title = c.title
        if (newMessages.length === 1 && newMessages[0].role === 'user') {
          title = newMessages[0].content.slice(0, 30) + (newMessages[0].content.length > 30 ? '...' : '')
        }
        return { ...c, messages: newMessages, title }
      }
      return c
    }))
  }

  const fetchWallet = async () => {
    try {
      const res = await fetch('/api/ai/consensus')
      const data = await res.json()
      setWalletBalance(data.balance || 100)
    } catch (error) {}
  }

  useEffect(() => {
    fetchWallet()
  }, [])

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

    const userMsg = { role: 'user' as const, content: prompt }
    const updatedMessages = [...messages, userMsg]
    setMessages(updatedMessages)
    
    if (currentChatId) {
      updateChatMessages(currentChatId, updatedMessages)
    }
    
    setIsLoading(true)
    setPrompt('')

    try {
      const res = await fetch('/api/ai/consensus', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, models: selectedModels })
      })
      const data = await res.json()
      
      let assistantMsg: {role: 'assistant', content: string}
      
      if (res.status === 402) {
        assistantMsg = { role: 'assistant', content: `⚠️ ${data.error}` }
      } else if (data.error) {
        assistantMsg = { role: 'assistant', content: `⚠️ ${data.error}` }
      } else if (data.consensus) {
        setResponse(data)
        assistantMsg = { role: 'assistant', content: data.consensus }
        setWalletBalance(data.wallet_balance || 100)
      } else {
        assistantMsg = { role: 'assistant', content: '⚠️ No response. Try again.' }
      }
      
      const finalMessages = [...updatedMessages, assistantMsg]
      setMessages(finalMessages)
      
      if (currentChatId) {
        updateChatMessages(currentChatId, finalMessages)
      }
    } catch (error) {
      const errorMsg = { role: 'assistant' as const, content: '❌ Error. Please try again.' }
      const finalMessages = [...updatedMessages, errorMsg]
      setMessages(finalMessages)
      if (currentChatId) {
        updateChatMessages(currentChatId, finalMessages)
      }
    }
    setIsLoading(false)
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

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-emerald-400'
    if (score >= 60) return 'text-amber-400'
    return 'text-red-400'
  }

  return (
    <div className="flex h-screen bg-[#0B0F17] text-white overflow-hidden">
      
      {/* ===== OVERLAY - Close sidebar when clicking outside ===== */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ===== SIDEBAR - Hidden by default, slides in ===== */}
      <div className={`fixed left-0 top-0 h-full z-50 transition-all duration-300 ${sidebarOpen ? 'w-64' : '-translate-x-full'} bg-[#0B0F17] border-r border-white/10 flex flex-col overflow-hidden`}>
        
        <div className="flex items-center justify-between p-4 border-b border-white/5 flex-shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-400 to-cyan-500 flex items-center justify-center text-white font-bold text-sm">AI</div>
            <div>
              <div className="font-bold text-sm bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">AIOS</div>
              <div className="text-[8px] text-gray-500 tracking-wider">OS</div>
            </div>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="text-gray-400 hover:text-white">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="p-3 flex-shrink-0">
          <button onClick={createNewChat} className="w-full bg-gradient-to-r from-emerald-500 to-cyan-500 text-white px-3 py-2 rounded-lg font-semibold flex items-center justify-center gap-2 hover:shadow-lg hover:shadow-emerald-500/20 transition-all text-xs">
            <Plus className="h-4 w-4" />
            New Chat
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-2">
          {navItems.map((item) => (
            <button key={item.id} onClick={() => { setActivePage(item.id); if (item.id !== 'chat') setMessages([{ role: 'assistant', content: `📌 ${item.label} coming soon!` }]); setSidebarOpen(false) }} className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg transition-all text-sm ${activePage === item.id ? 'bg-emerald-500/10 text-emerald-400' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}>
              <item.icon className="h-4 w-4" />
              {item.label}
            </button>
          ))}
          
          {chats.length > 0 && (
            <div className="mt-4">
              <div className="text-[9px] text-gray-500 uppercase tracking-wider mb-2 px-2">Recent</div>
              <div className="space-y-0.5">
                {chats.slice(0, 10).map(chat => (
                  <div key={chat.id} className="group relative flex items-center">
                    <button onClick={() => loadChat(chat.id)} className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all truncate flex items-center gap-2 ${currentChatId === chat.id ? 'bg-emerald-500/10 text-emerald-400' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}>
                      <MessageSquare className="h-3.5 w-3.5 flex-shrink-0" />
                      <span className="truncate">{chat.title}</span>
                    </button>
                    <button onClick={(e) => deleteChat(chat.id, e)} className="absolute right-2 opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded hover:bg-red-500/20 text-gray-500 hover:text-red-400">
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="p-4 border-t border-white/5 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-400 to-cyan-500 flex items-center justify-center text-[8px] font-bold">U</div>
              <div><div className="text-sm font-medium">User</div><div className="text-[9px] text-gray-500">Free Plan</div></div>
            </div>
            <button className="text-gray-400 hover:text-white"><Settings className="h-4 w-4" /></button>
          </div>
          <div className="mt-2 p-2 bg-amber-500/10 border border-amber-500/20 rounded-lg">
            <div className="text-[8px] text-amber-400 font-medium uppercase">Free Plan</div>
            <div className="text-[10px] text-gray-400">0 / 10 messages used</div>
            <button className="mt-1 w-full text-[9px] bg-gradient-to-r from-amber-500 to-orange-500 text-white py-1 rounded-lg font-medium">Upgrade Now</button>
          </div>
        </div>
      </div>

      {/* ===== MAIN CHAT AREA ===== */}
      <div className="flex-1 flex flex-col h-full min-w-0">
        
        {/* Header - with hamburger menu */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-white/5 bg-black/20 backdrop-blur-xl flex-shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <button onClick={() => setSidebarOpen(true)} className="text-gray-400 hover:text-white">
              <Menu className="h-5 w-5" />
            </button>
            <h1 className="text-sm font-semibold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent truncate">
              {currentChatId ? chats.find(c => c.id === currentChatId)?.title || 'New Chat' : 'AIOS Chat'}
            </h1>
            {response && (
              <div className="flex items-center gap-1.5 text-[9px]">
                <span className={`px-1.5 py-0.5 rounded-full ${getScoreColor(response.consensus_score || 0)} bg-white/5`}>
                  {response.consensus_score || 0}%
                </span>
                <span className="text-gray-500">|</span>
                <span className="text-cyan-400">{response.total_models || 0}</span>
                <span className="text-gray-500">|</span>
                <span className="text-emerald-400">₹{(response.cost_inr || 0).toFixed(4)}</span>
              </div>
            )}
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 bg-white/5 px-2 py-1.5 rounded-full border border-white/5">
              <Wallet className="h-3.5 w-3.5 text-emerald-400" />
              <span className="text-emerald-400 font-mono font-semibold text-[10px]">₹{walletBalance.toFixed(2)}</span>
              <button onClick={addFunds} className="text-[8px] text-gray-400 hover:text-white"><Plus className="h-2.5 w-2.5" /></button>
            </div>
            <button className="text-gray-400 hover:text-white"><Settings className="h-4 w-4" /></button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-0">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center max-w-2xl mx-auto">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-400 to-cyan-500 flex items-center justify-center text-2xl font-bold text-white shadow-2xl shadow-emerald-500/20 mb-4">AI</div>
              <h2 className="text-xl font-bold text-white">Hi User, how can I help you today?</h2>
              <p className="text-gray-400 text-xs mt-1">Ask me anything, and I'll get answers from AI models</p>
              <div className="flex flex-wrap gap-2 mt-4 justify-center">
                {QUICK_ACTIONS.map((action, i) => (
                  <button key={i} onClick={() => handleQuickAction(action.prompt)} className="flex items-center gap-1.5 px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-xs text-gray-300 hover:bg-white/10 hover:text-white transition-all">
                    <action.icon className="h-3.5 w-3.5" />
                    {action.label}
                  </button>
                ))}
              </div>
              <div className="mt-6 flex items-center gap-4 text-[10px] text-gray-500">
                <span className="flex items-center gap-1"><Bot className="h-3 w-3" /> {selectedModels.length} model</span>
                <span className="flex items-center gap-1"><Wallet className="h-3 w-3" /> ₹{walletBalance.toFixed(2)}</span>
              </div>
            </div>
          ) : (
            messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] p-3 rounded-2xl text-sm ${msg.role === 'user' ? 'bg-gradient-to-r from-emerald-500 to-cyan-500 text-white' : 'bg-white/5 border border-white/10 text-gray-200'}`}>
                  <div className="whitespace-pre-wrap leading-relaxed">{msg.content}</div>
                </div>
              </div>
            ))
          )}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-white/5 border border-white/10 p-3 rounded-2xl">
                <div className="flex items-center gap-2">
                  <div className="typing-dot"></div>
                  <div className="typing-dot"></div>
                  <div className="typing-dot"></div>
                  <span className="text-xs text-gray-400 ml-2">Getting response...</span>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="border-t border-white/5 p-3 bg-black/20 backdrop-blur-xl flex-shrink-0">
          
          <button onClick={() => setShowModelPicker(!showModelPicker)} className="flex items-center gap-1.5 text-[9px] text-gray-400 hover:text-white transition-colors mb-1.5">
            {selectedModels.map(id => {
              const model = getAllModels().find(m => m.id === id)
              return model ? <span key={id} className="text-sm">{model.icon}</span> : null
            })}
            <span className="text-emerald-400 font-medium text-[9px]">
              {selectedModels.length === 0 ? 'No model' : getAllModels().find(m => m.id === selectedModels[0])?.name || 'Select'}
            </span>
            <ChevronDown className={`h-2.5 w-2.5 transition-transform ${showModelPicker ? 'rotate-180' : ''}`} />
          </button>

          {showModelPicker && (
            <div className="mb-2 p-2 bg-[#1a1f2e] border border-white/10 rounded-xl max-h-[280px] overflow-y-auto">
              <div className="flex items-center justify-between mb-1.5">
                <h3 className="text-xs font-semibold text-white">Choose a model</h3>
                <button onClick={() => setShowModelPicker(false)} className="text-gray-400 hover:text-white"><X className="h-3 w-3" /></button>
              </div>
              <p className="text-[9px] text-gray-500 mb-1">Select one AI model for your task</p>
              <div className="relative mb-1">
                <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3 w-3 text-gray-500" />
                <input type="text" placeholder="Search..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-lg pl-7 pr-2 py-1 text-xs text-white placeholder-gray-500 outline-none focus:border-emerald-500/50" />
              </div>
              <div className="flex gap-0.5 mb-1 bg-white/5 rounded-lg p-0.5 flex-wrap">
                {['popular', 'intelligence', 'latest', 'all'].map((tab) => (
                  <button key={tab} onClick={() => setModelTab(tab)} className={`flex-1 px-1 py-0.5 rounded-lg text-[8px] font-medium capitalize ${modelTab === tab ? 'bg-emerald-500/20 text-emerald-400' : 'text-gray-400 hover:text-white'}`}>
                    {tab === 'all' ? 'All' : tab}
                  </button>
                ))}
              </div>
              <button onClick={() => { setSelectedModels(['gpt-5.4-mini']); setShowModelPicker(false) }} className="w-full p-1 mb-1 bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/20 rounded-lg text-left hover:bg-amber-500/20">
                <div className="font-semibold text-[9px] text-amber-400">✨ Auto Mode</div>
                <div className="text-[8px] text-gray-400">picks the best model</div>
              </button>
              <div className="text-[8px] text-gray-500 mb-0.5">or pick your own</div>
              <div className="grid grid-cols-2 gap-0.5">
                {getCurrentModels().map((model) => (
                  <button key={model.id} onClick={() => toggleModel(model.id)} className={`flex items-center gap-0.5 p-1 rounded-lg text-left text-[9px] w-full ${selectedModels.includes(model.id) ? 'bg-emerald-500/10 border border-emerald-500/30' : 'bg-white/5 border border-transparent hover:bg-white/10'}`}>
                    <span className="text-sm">{model.icon}</span>
                    <div className="flex-1 min-w-0">
                      <span className={`truncate block ${selectedModels.includes(model.id) ? 'text-emerald-400' : 'text-white'}`}>{model.name}</span>
                      <span className={`text-[7px] ${model.tier === 'pro' ? 'text-amber-400' : 'text-emerald-400'}`}>{model.tier === 'pro' ? '⭐ Pro' : 'Free'}</span>
                    </div>
                    {selectedModels.includes(model.id) && <span className="text-emerald-400 text-[8px]">✓</span>}
                  </button>
                ))}
              </div>
              <button onClick={() => setShowModelPicker(false)} className="w-full mt-1 bg-gradient-to-r from-emerald-500 to-cyan-500 text-white py-1 rounded-lg font-semibold text-[9px] hover:shadow-lg">Apply</button>
            </div>
          )}

          <div className="relative">
            <textarea 
              value={prompt} 
              onChange={(e) => setPrompt(e.target.value)} 
              placeholder="Ask me anything..." 
              className="w-full min-h-[40px] max-h-[80px] bg-white/5 border border-white/10 rounded-lg p-2 pr-16 text-white placeholder:text-gray-500 outline-none focus:border-emerald-500/50 resize-none text-xs" 
              onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSubmit() } }} 
              rows={1}
            />
            <div className="absolute right-1.5 bottom-1.5 flex items-center gap-1">
              <button className="p-1 text-gray-400 hover:text-white rounded-lg hover:bg-white/10">
                <Sparkles className="h-3 w-3" />
              </button>
              <button 
                onClick={handleSubmit} 
                disabled={isLoading || !prompt.trim() || selectedModels.length === 0} 
                className="bg-gradient-to-r from-emerald-500 to-cyan-500 text-white p-1.5 rounded-lg disabled:opacity-50 hover:shadow-lg"
              >
                {isLoading ? <Loader2 className="h-3 w-3 animate-spin" /> : <Send className="h-3 w-3" />}
              </button>
            </div>
          </div>
          {selectedModels.length === 0 && (
            <p className="text-[8px] text-amber-400 mt-0.5">⚠️ Select a model</p>
          )}
        </div>
      </div>

      <style>{`
        .typing-dot { width: 4px; height: 4px; border-radius: 50%; background: #10B981; display: inline-block; animation: typing 1.4s infinite both; margin: 0 1px; }
        .typing-dot:nth-child(2) { animation-delay: 0.2s; }
        .typing-dot:nth-child(3) { animation-delay: 0.4s; }
        @keyframes typing { 0%, 60%, 100% { transform: translateY(0); opacity: 0.3; } 30% { transform: translateY(-4px); opacity: 1; } }
        ::-webkit-scrollbar { width: 2px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #1E293B; border-radius: 2px; }
      `}</style>
    </div>
  )
            }
