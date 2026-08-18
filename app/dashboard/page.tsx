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
  const [sidebarOpen, setSidebarOpen] = useState(false)
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
    setSidebarOpen(false)
  }

  const loadChat = (chatId: string) => {
    const chat = chats.find(c => c.id === chatId)
    if (chat) {
      setCurrentChatId(chatId)
      setMessages(chat.messages || [])
      setResponse(null)
      setPrompt('')
      setSidebarOpen(false)
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
    if (score >= 80) return 'text-emerald-600'
    if (score >= 60) return 'text-amber-600'
    return 'text-red-600'
  }

  return (
    <div className="flex h-screen bg-[#ECE5DD] text-gray-800 overflow-hidden">
      
      {/* ===== OVERLAY ===== */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/30 z-40"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ===== SIDEBAR - WhatsApp Style ===== */}
      <div className={`fixed left-0 top-0 h-full z-50 transition-all duration-300 ${sidebarOpen ? 'w-72' : '-translate-x-full'} bg-white border-r border-gray-200 flex flex-col overflow-hidden shadow-xl`}>
        
        <div className="flex items-center justify-between p-4 border-b border-gray-200 flex-shrink-0 bg-[#075E54] text-white">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-white font-bold text-sm">AI</div>
            <div>
              <div className="font-bold text-sm">AIOS</div>
              <div className="text-[8px] text-white/70">OS</div>
            </div>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="text-white/80 hover:text-white">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="p-3 flex-shrink-0 bg-[#f0f0f0]">
          <button onClick={createNewChat} className="w-full bg-[#25D366] text-white px-3 py-2 rounded-lg font-semibold flex items-center justify-center gap-2 hover:shadow-lg transition-all text-sm">
            <Plus className="h-4 w-4" />
            New Chat
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-2 bg-white">
          {navItems.map((item) => (
            <button key={item.id} onClick={() => { setActivePage(item.id); if (item.id !== 'chat') setMessages([{ role: 'assistant', content: `📌 ${item.label} coming soon!` }]); setSidebarOpen(false) }} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all text-sm ${activePage === item.id ? 'bg-[#E8F5E9] text-[#075E54]' : 'text-gray-700 hover:bg-gray-100'}`}>
              <item.icon className="h-4 w-4" />
              {item.label}
            </button>
          ))}
          
          {chats.length > 0 && (
            <div className="mt-4">
              <div className="text-[10px] text-gray-500 uppercase tracking-wider mb-2 px-2">Recent</div>
              <div className="space-y-0.5">
                {chats.slice(0, 10).map(chat => (
                  <div key={chat.id} className="group relative flex items-center">
                    <button onClick={() => loadChat(chat.id)} className={`w-full text-left px-3 py-2.5 rounded-lg text-sm transition-all truncate flex items-center gap-2 ${currentChatId === chat.id ? 'bg-[#E8F5E9] text-[#075E54]' : 'text-gray-700 hover:bg-gray-100'}`}>
                      <MessageSquare className="h-3.5 w-3.5 flex-shrink-0 text-gray-400" />
                      <span className="truncate">{chat.title}</span>
                    </button>
                    <button onClick={(e) => deleteChat(chat.id, e)} className="absolute right-2 opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded hover:bg-red-50 text-gray-400 hover:text-red-500">
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="p-4 border-t border-gray-200 flex-shrink-0 bg-[#f0f0f0]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-[#075E54] flex items-center justify-center text-white text-[10px] font-bold">U</div>
              <div><div className="text-sm font-medium text-gray-800">User</div><div className="text-[10px] text-gray-500">Free Plan</div></div>
            </div>
            <button className="text-gray-400 hover:text-gray-600"><Settings className="h-4 w-4" /></button>
          </div>
          <div className="mt-2 p-2.5 bg-[#FEF3C7] border border-[#F59E0B]/30 rounded-lg">
            <div className="text-[10px] text-amber-600 font-medium uppercase">Free Plan</div>
            <div className="text-xs text-gray-600">0 / 10 messages used</div>
            <button className="mt-1.5 w-full text-xs bg-[#25D366] text-white py-1.5 rounded-lg font-medium hover:shadow-lg transition-all">Upgrade Now</button>
          </div>
        </div>
      </div>

      {/* ===== MAIN CHAT AREA ===== */}
      <div className="flex-1 flex flex-col h-full min-w-0 bg-[#ECE5DD]">
        
        {/* Header - WhatsApp Style */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 bg-white flex-shrink-0 shadow-sm">
          <div className="flex items-center gap-3 min-w-0">
            <button onClick={() => setSidebarOpen(true)} className="text-gray-600 hover:text-gray-800">
              <Menu className="h-5 w-5" />
            </button>
            <h1 className="text-sm font-semibold text-gray-800 truncate">
              {currentChatId ? chats.find(c => c.id === currentChatId)?.title || 'New Chat' : 'AIOS Chat'}
            </h1>
            {response && (
              <div className="flex items-center gap-1.5 text-[10px]">
                <span className={`px-1.5 py-0.5 rounded-full ${getScoreColor(response.consensus_score || 0)} bg-white/5`}>
                  {response.consensus_score || 0}%
                </span>
                <span className="text-gray-400">|</span>
                <span className="text-cyan-600">{response.total_models || 0}</span>
                <span className="text-gray-400">|</span>
                <span className="text-emerald-600">₹{(response.cost_inr || 0).toFixed(4)}</span>
              </div>
            )}
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 bg-gray-100 px-2.5 py-1.5 rounded-full border border-gray-200">
              <Wallet className="h-3.5 w-3.5 text-emerald-600" />
              <span className="text-emerald-600 font-mono font-semibold text-xs">₹{walletBalance.toFixed(2)}</span>
              <button onClick={addFunds} className="text-gray-400 hover:text-gray-600"><Plus className="h-2.5 w-2.5" /></button>
            </div>
            <button className="text-gray-400 hover:text-gray-600"><Settings className="h-4 w-4" /></button>
          </div>
        </div>

        {/* Messages - WhatsApp Style Chat Background */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2 min-h-0 bg-[#ECE5DD]">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center max-w-2xl mx-auto">
              <div className="w-16 h-16 rounded-full bg-[#25D366] flex items-center justify-center text-3xl font-bold text-white shadow-lg mb-4">AI</div>
              <h2 className="text-xl font-semibold text-gray-800">Hi User, how can I help you today?</h2>
              <p className="text-gray-500 text-sm mt-1">Ask me anything, and I'll get answers from AI models</p>
              <div className="flex flex-wrap gap-2 mt-4 justify-center">
                {QUICK_ACTIONS.map((action, i) => (
                  <button key={i} onClick={() => handleQuickAction(action.prompt)} className="flex items-center gap-1.5 px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-700 hover:bg-gray-50 transition-all shadow-sm">
                    <action.icon className="h-3.5 w-3.5" />
                    {action.label}
                  </button>
                ))}
              </div>
              <div className="mt-6 flex items-center gap-4 text-xs text-gray-500">
                <span className="flex items-center gap-1"><Bot className="h-3 w-3" /> {selectedModels.length} model</span>
                <span className="flex items-center gap-1"><Wallet className="h-3 w-3" /> ₹{walletBalance.toFixed(2)}</span>
              </div>
            </div>
          ) : (
            messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[75%] p-3 rounded-2xl text-sm shadow-sm ${
                  msg.role === 'user' 
                    ? 'bg-[#DCF8C6] text-gray-800 rounded-br-none' 
                    : 'bg-white text-gray-800 rounded-bl-none'
                }`}>
                  <div className="whitespace-pre-wrap leading-relaxed">{msg.content}</div>
                </div>
              </div>
            ))
          )}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-white p-3 rounded-2xl rounded-bl-none shadow-sm">
                <div className="flex items-center gap-2">
                  <div className="typing-dot"></div>
                  <div className="typing-dot"></div>
                  <div className="typing-dot"></div>
                  <span className="text-xs text-gray-500 ml-2">Getting response...</span>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input - WhatsApp Style */}
        <div className="border-t border-gray-200 p-3 bg-[#f0f0f0] flex-shrink-0">
          
          <button onClick={() => setShowModelPicker(!showModelPicker)} className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-700 transition-colors mb-1.5">
            {selectedModels.map(id => {
              const model = getAllModels().find(m => m.id === id)
              return model ? <span key={id} className="text-sm">{model.icon}</span> : null
            })}
            <span className="text-emerald-600 font-medium text-xs">
              {selectedModels.length === 0 ? 'No model' : getAllModels().find(m => m.id === selectedModels[0])?.name || 'Select'}
            </span>
            <ChevronDown className={`h-3 w-3 transition-transform ${showModelPicker ? 'rotate-180' : ''}`} />
          </button>

          {showModelPicker && (
            <div className="mb-2 p-3 bg-white border border-gray-200 rounded-xl max-h-[280px] overflow-y-auto shadow-lg">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-semibold text-gray-800">Choose a model</h3>
                <button onClick={() => setShowModelPicker(false)} className="text-gray-400 hover:text-gray-600"><X className="h-3.5 w-3.5" /></button>
              </div>
              <p className="text-xs text-gray-500 mb-2">Select one AI model for your task</p>
              <div className="relative mb-2">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
                <input type="text" placeholder="Search..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full bg-gray-50 border border-gray-200 rounded-lg pl-8 pr-3 py-1.5 text-sm text-gray-800 placeholder-gray-400 outline-none focus:border-emerald-500" />
              </div>
              <div className="flex gap-1 mb-2 bg-gray-50 rounded-lg p-1 flex-wrap">
                {['popular', 'intelligence', 'latest', 'all'].map((tab) => (
                  <button key={tab} onClick={() => setModelTab(tab)} className={`flex-1 px-2 py-1 rounded-lg text-xs font-medium capitalize ${modelTab === tab ? 'bg-emerald-500 text-white' : 'text-gray-600 hover:bg-gray-200'}`}>
                    {tab === 'all' ? 'All' : tab}
                  </button>
                ))}
              </div>
              <button onClick={() => { setSelectedModels(['gpt-5.4-mini']); setShowModelPicker(false) }} className="w-full p-2 mb-2 bg-amber-50 border border-amber-200 rounded-lg text-left hover:bg-amber-100 transition-all">
                <div className="font-semibold text-xs text-amber-600">✨ Auto Mode</div>
                <div className="text-[10px] text-gray-500">picks the best model</div>
              </button>
              <div className="text-[10px] text-gray-500 mb-1.5">or pick your own</div>
              <div className="grid grid-cols-2 gap-1">
                {getCurrentModels().map((model) => (
                  <button key={model.id} onClick={() => toggleModel(model.id)} className={`flex items-center gap-1.5 p-1.5 rounded-lg text-left text-xs w-full ${selectedModels.includes(model.id) ? 'bg-emerald-50 border border-emerald-200' : 'bg-gray-50 border border-transparent hover:bg-gray-100'}`}>
                    <span className="text-sm">{model.icon}</span>
                    <div className="flex-1 min-w-0">
                      <span className={`truncate block ${selectedModels.includes(model.id) ? 'text-emerald-700' : 'text-gray-700'}`}>{model.name}</span>
                      <span className={`text-[8px] ${model.tier === 'pro' ? 'text-amber-500' : 'text-emerald-500'}`}>{model.tier === 'pro' ? '⭐ Pro' : 'Free'}</span>
                    </div>
                    {selectedModels.includes(model.id) && <span className="text-emerald-500 text-xs">✓</span>}
                  </button>
                ))}
              </div>
              <button onClick={() => setShowModelPicker(false)} className="w-full mt-2 bg-emerald-500 text-white py-1.5 rounded-lg font-semibold text-xs hover:shadow-lg transition-all">Apply</button>
            </div>
          )}

          <div className="relative">
            <textarea 
              value={prompt} 
              onChange={(e) => setPrompt(e.target.value)} 
              placeholder="Type a message..." 
              className="w-full min-h-[44px] max-h-[100px] bg-white border border-gray-200 rounded-lg p-2.5 pr-16 text-gray-800 placeholder:text-gray-400 outline-none focus:border-emerald-500 resize-none text-sm" 
              onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSubmit() } }} 
              rows={1}
            />
            <div className="absolute right-2 bottom-2 flex items-center gap-1">
              <button className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100">
                <Sparkles className="h-4 w-4" />
              </button>
              <button 
                onClick={handleSubmit} 
                disabled={isLoading || !prompt.trim() || selectedModels.length === 0} 
                className="bg-[#25D366] text-white p-2 rounded-lg disabled:opacity-50 hover:shadow-lg transition-all"
              >
                {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              </button>
            </div>
          </div>
          {selectedModels.length === 0 && (
            <p className="text-[10px] text-amber-600 mt-1">⚠️ Select a model</p>
          )}
        </div>
      </div>

      <style>{`
        .typing-dot { width: 6px; height: 6px; border-radius: 50%; background: #25D366; display: inline-block; animation: typing 1.4s infinite both; margin: 0 2px; }
        .typing-dot:nth-child(2) { animation-delay: 0.2s; }
        .typing-dot:nth-child(3) { animation-delay: 0.4s; }
        @keyframes typing { 0%, 60%, 100% { transform: translateY(0); opacity: 0.3; } 30% { transform: translateY(-6px); opacity: 1; } }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #c1c1c1; border-radius: 4px; }
        ::-webkit-scrollbar-thumb:hover { background: #a8a8a8; }
      `}</style>
    </div>
  )
}
