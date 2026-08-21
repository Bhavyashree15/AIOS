'use client'

import { useState, useEffect, useRef } from 'react'
import { 
  Send, Loader2, Wallet, ChevronDown, 
  Bot, Plus, Image, FolderOpen, Menu, Sparkles,
  MessageSquare, Settings, X, 
  FileText, Trash2, Moon, Sun, Download,
  Search as SearchIcon, Reply, Edit, Pencil
} from 'lucide-react'

// ============================================
// QUICK ACTIONS
// ============================================
const QUICK_ACTIONS = [
  { icon: Image, label: 'Create an Image', prompt: 'Create a detailed description of a futuristic city' },
  { icon: FileText, label: 'Create Document', prompt: 'Write a professional document about' },
]

const STORAGE_KEY = 'aios_chats'

const getStoredChats = () => {
  if (typeof window === 'undefined') return []
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    return stored ? JSON.parse(stored) : []
  } catch {
    return []
  }
}

const saveChats = (chats: any[]) => {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(chats))
  } catch (e) {}
}

export default function DashboardPage() {
  const [prompt, setPrompt] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [walletBalance, setWalletBalance] = useState(100)
  const [chats, setChats] = useState<any[]>([])
  const [currentChatId, setCurrentChatId] = useState<string | null>(null)
  const [messages, setMessages] = useState<any[]>([])
  
  // ===== NEW FEATURES =====
  const [isDark, setIsDark] = useState(false)
  const [chatSearchQuery, setChatSearchQuery] = useState('')
  const [showExportMenu, setShowExportMenu] = useState(false)
  
  // ===== FEATURE: Reply to any message =====
  const [replyToMessage, setReplyToMessage] = useState<any>(null)
  const [replyToIndex, setReplyToIndex] = useState<number | null>(null)
  
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Load chats
  useEffect(() => {
    const stored = getStoredChats()
    if (stored.length > 0) {
      setChats(stored)
      setCurrentChatId(stored[0].id)
      setMessages(stored[0].messages || [])
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
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // ===== DARK MODE =====
  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [isDark])

  // ============================================
  // CHAT FUNCTIONS
  // ============================================
  
  // ===== CREATE NEW CHAT (Like ChatGPT) =====
  const createNewChat = () => {
    const newId = Date.now().toString()
    const newChat = {
      id: newId,
      title: 'New Chat',
      messages: [],
      timestamp: new Date().toISOString(),
    }
    setChats(prev => [newChat, ...prev])
    setCurrentChatId(newId)
    setMessages([])
    setReplyToMessage(null)
    setReplyToIndex(null)
    setSidebarOpen(false)
    // Save immediately
    setTimeout(() => {
      saveChats([newChat, ...chats])
    }, 100)
  }

  const loadChat = (chatId: string) => {
    const chat = chats.find(c => c.id === chatId)
    if (chat) {
      setCurrentChatId(chatId)
      setMessages(chat.messages || [])
      setReplyToMessage(null)
      setReplyToIndex(null)
      setSidebarOpen(false)
    }
  }

  const deleteChat = (chatId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    const updated = chats.filter(c => c.id !== chatId)
    setChats(updated)
    saveChats(updated)
    if (currentChatId === chatId) {
      if (updated.length > 0) {
        loadChat(updated[0].id)
      } else {
        createNewChat()
      }
    }
  }

  const updateChatMessages = (chatId: string, newMessages: any[]) => {
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
    setTimeout(() => {
      saveChats(chats.map(c => {
        if (c.id === chatId) {
          let title = c.title
          if (newMessages.length === 1 && newMessages[0].role === 'user') {
            title = newMessages[0].content.slice(0, 30) + (newMessages[0].content.length > 30 ? '...' : '')
          }
          return { ...c, messages: newMessages, title }
        }
        return c
      }))
    }, 100)
  }

  // ============================================
  // REPLY TO ANY MESSAGE (Like WhatsApp)
  // ============================================
  const handleReplyClick = (message: any, index: number) => {
    setReplyToMessage(message)
    setReplyToIndex(index)
    // Focus on input
    const input = document.getElementById('message-input')
    if (input) {
      input.focus()
    }
  }

  const cancelReply = () => {
    setReplyToMessage(null)
    setReplyToIndex(null)
  }

  // ============================================
  // SEARCH CHATS
  // ============================================
  const filteredChats = chatSearchQuery.trim() === '' 
    ? chats 
    : chats.filter(chat =>
        chat.title.toLowerCase().includes(chatSearchQuery.toLowerCase()) ||
        chat.messages.some(m => m.content.toLowerCase().includes(chatSearchQuery.toLowerCase()))
      )

  // ============================================
  // EXPORT CHAT
  // ============================================
  const exportChat = (format: 'txt' | 'md') => {
    if (messages.length === 0) {
      alert('No messages to export!')
      return
    }

    let content = ''
    const title = currentChatId ? chats.find(c => c.id === currentChatId)?.title || 'Chat' : 'Chat'
    
    if (format === 'txt') {
      content = `AIOS Chat Export\n================\nChat: ${title}\nDate: ${new Date().toISOString()}\n================\n\n`
      messages.forEach((msg: any) => {
        const sender = msg.role === 'user' ? 'User' : 'AI'
        content += `[${sender}]\n${msg.content}\n\n`
      })
    } else {
      content = `# AIOS Chat Export\n**Chat:** ${title}\n**Date:** ${new Date().toISOString()}\n---\n\n`
      messages.forEach((msg: any) => {
        const sender = msg.role === 'user' ? '**User**' : '**AI**'
        content += `${sender}\n${msg.content}\n\n`
      })
    }

    const blob = new Blob([content], { type: format === 'txt' ? 'text/plain' : 'text/markdown' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${title.replace(/[^a-zA-Z0-9]/g, '_')}.${format}`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    setShowExportMenu(false)
  }

  // ============================================
  // SUBMIT QUERY (with context from reply)
  // ============================================
  const handleSubmit = async () => {
    if (!prompt.trim()) return
    
    if (walletBalance < 0.01) {
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: '⚠️ Insufficient balance. Please add funds.', 
        timestamp: new Date().toISOString() 
      }])
      return
    }

    // Build message with context
    let messageContent = prompt
    if (replyToMessage) {
      const sender = replyToMessage.role === 'user' ? 'User' : 'AI'
      const preview = replyToMessage.content.slice(0, 100) + (replyToMessage.content.length > 100 ? '...' : '')
      messageContent = `Replying to ${sender}: "${preview}"\n\n${prompt}`
    }

    const timestamp = new Date().toISOString()
    const userMsg = { 
      role: 'user', 
      content: messageContent, 
      timestamp,
      replyTo: replyToMessage ? { 
        content: replyToMessage.content.slice(0, 50) + (replyToMessage.content.length > 50 ? '...' : ''),
        role: replyToMessage.role 
      } : null 
    }
    
    const updatedMessages = [...messages, userMsg]
    setMessages(updatedMessages)
    
    if (currentChatId) {
      updateChatMessages(currentChatId, updatedMessages)
    }
    
    setIsLoading(true)
    setPrompt('')
    setReplyToMessage(null)
    setReplyToIndex(null)

    try {
      // Simulated response with context awareness
      let mockResponse = `This is a response to: "${prompt}".`
      
      // If replying to a message, acknowledge it
      if (replyToMessage) {
        const sender = replyToMessage.role === 'user' ? 'User' : 'AI'
        mockResponse = `[Replying to ${sender}'s message]\n\n${mockResponse}`
      }
      
      // Add context awareness - if previous messages exist, reference them
      if (messages.length > 0) {
        const lastUserMsg = [...messages].reverse().find(m => m.role === 'user')
        if (lastUserMsg && lastUserMsg.content !== prompt) {
          mockResponse += `\n\n(Note: I'm considering the earlier conversation about: "${lastUserMsg.content.slice(0, 50)}...")`
        }
      }
      
      const assistantMsg = { 
        role: 'assistant', 
        content: mockResponse, 
        timestamp: new Date().toISOString(),
        reactions: { like: 0, dislike: 0, heart: 0 }
      }
      
      const finalMessages = [...updatedMessages, assistantMsg]
      setMessages(finalMessages)
      
      if (currentChatId) {
        updateChatMessages(currentChatId, finalMessages)
      }
    } catch (error) {
      console.error('Error:', error)
    }
    setIsLoading(false)
  }

  // ============================================
  // RENDER
  // ============================================
  return (
    <div className={`min-h-screen ${isDark ? 'bg-[#1a1a1a] text-white' : 'bg-[#ECE5DD] text-gray-800'} flex`}>
      
      {/* ===== OVERLAY ===== */}
      {sidebarOpen && (
        <div 
          className={`fixed inset-0 ${isDark ? 'bg-black/70' : 'bg-black/30'} z-40`}
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ===== SIDEBAR ===== */}
      <div className={`fixed left-0 top-0 h-full z-50 w-72 ${isDark ? 'bg-[#1a1a1a] border-gray-700' : 'bg-white border-gray-200'} border-r flex flex-col overflow-hidden shadow-xl transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        
        {/* Sidebar Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 flex-shrink-0 bg-[#075E54] text-white">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-white font-bold text-sm">AI</div>
            <div className="font-bold text-sm">AIOS</div>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="text-white/80 hover:text-white">
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* New Chat Button - ChatGPT style with pen icon */}
        <div className="p-3 flex-shrink-0 bg-[#f0f0f0]">
          <button 
            onClick={createNewChat} 
            className="w-full bg-[#25D366] text-white px-3 py-2 rounded-lg font-semibold flex items-center justify-center gap-2 text-sm hover:shadow-lg transition-all"
          >
            <Pencil className="h-4 w-4" />
            New Chat
          </button>
        </div>

        {/* Sidebar Content */}
        <div className="flex-1 overflow-y-auto px-2 py-2">
          
          {/* Search Chats */}
          <div className="px-2 mb-3">
            <div className="relative">
              <SearchIcon className={`absolute left-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
              <input
                type="text"
                placeholder="Search chats..."
                value={chatSearchQuery}
                onChange={(e) => setChatSearchQuery(e.target.value)}
                className={`w-full ${isDark ? 'bg-gray-700 text-white placeholder-gray-400' : 'bg-gray-100 text-gray-800 placeholder-gray-400'} rounded-lg pl-8 pr-3 py-1.5 text-sm outline-none focus:border-emerald-500`}
              />
            </div>
          </div>

          {/* Chat List */}
          {filteredChats.length > 0 ? (
            <div>
              <div className={`text-[10px] ${isDark ? 'text-gray-500' : 'text-gray-500'} uppercase tracking-wider mb-2 px-2`}>
                Recent Chats
              </div>
              <div className="space-y-0.5">
                {filteredChats.slice(0, 20).map((chat: any) => (
                  <div key={chat.id} className="group relative flex items-center">
                    <button 
                      onClick={() => loadChat(chat.id)}
                      className={`w-full text-left px-3 py-2.5 rounded-lg text-sm transition-all truncate flex items-center gap-2 ${
                        currentChatId === chat.id 
                          ? 'bg-[#E8F5E9] text-[#075E54]' 
                          : isDark ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      <MessageSquare className="h-3.5 w-3.5 flex-shrink-0 text-gray-400" />
                      <span className="truncate">{chat.title}</span>
                    </button>
                    <button 
                      onClick={(e) => deleteChat(chat.id, e)}
                      className="absolute right-2 opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded hover:bg-red-50 text-gray-400 hover:text-red-500"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ) : chatSearchQuery ? (
            <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'} text-center py-4`}>
              No chats found for "{chatSearchQuery}"
            </div>
          ) : null}
        </div>

        {/* Sidebar Footer */}
        <div className={`p-4 border-t ${isDark ? 'border-gray-700 bg-[#1a1a1a]' : 'border-gray-200 bg-[#f0f0f0]'} flex-shrink-0`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-[#075E54] flex items-center justify-center text-white text-[10px] font-bold">U</div>
              <div><div className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-800'}`}>User</div><div className="text-[10px] text-gray-500">Free Plan</div></div>
            </div>
            <button className={`${isDark ? 'text-gray-400 hover:text-white' : 'text-gray-400 hover:text-gray-600'}`}><Settings className="h-4 w-4" /></button>
          </div>
        </div>
      </div>

      {/* ===== MAIN CHAT AREA ===== */}
      <div className={`flex-1 flex flex-col h-screen min-w-0 ${isDark ? 'bg-[#1a1a1a]' : 'bg-[#ECE5DD]'}`}>
        
        {/* ===== HEADER ===== */}
        <div className={`flex items-center justify-between px-4 py-3 border-b ${isDark ? 'border-gray-700 bg-[#1a1a1a]' : 'border-gray-200 bg-white'} flex-shrink-0 shadow-sm`}>
          <div className="flex items-center gap-3">
            <button onClick={() => setSidebarOpen(true)} className={isDark ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-800'}>
              <Menu className="h-5 w-5" />
            </button>
            <h1 className={`text-sm font-semibold ${isDark ? 'text-white' : 'text-gray-800'}`}>
              {currentChatId ? chats.find(c => c.id === currentChatId)?.title || 'New Chat' : 'AIOS Chat'}
            </h1>
          </div>
          <div className="flex items-center gap-2">
            
            {/* Dark Mode Toggle */}
            <button
              onClick={() => setIsDark(!isDark)}
              className={`p-1.5 rounded-lg transition-colors ${isDark ? 'bg-gray-700 text-yellow-400 hover:bg-gray-600' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
              title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>

            {/* Export Chat */}
            {messages.length > 0 && (
              <div className="relative">
                <button
                  onClick={() => setShowExportMenu(!showExportMenu)}
                  className={`p-1.5 rounded-lg transition-colors ${isDark ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                  title="Export Chat"
                >
                  <Download className="h-4 w-4" />
                </button>
                {showExportMenu && (
                  <div className={`absolute right-0 mt-1 w-36 ${isDark ? 'bg-[#2a2a2a] border-gray-700' : 'bg-white border-gray-200'} rounded-lg shadow-lg border overflow-hidden z-10`}>
                    <button
                      onClick={() => exportChat('txt')}
                      className={`w-full text-left px-3 py-2 text-sm ${isDark ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-100'} flex items-center gap-2`}
                    >
                      Export as TXT
                    </button>
                    <button
                      onClick={() => exportChat('md')}
                      className={`w-full text-left px-3 py-2 text-sm ${isDark ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-100'} flex items-center gap-2`}
                    >
                      Export as MD
                    </button>
                  </div>
                )}
              </div>
            )}

            <div className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-full border ${isDark ? 'bg-gray-700 border-gray-600' : 'bg-gray-100 border-gray-200'}`}>
              <Wallet className="h-3.5 w-3.5 text-emerald-600" />
              <span className={`${isDark ? 'text-emerald-400' : 'text-emerald-600'} font-mono font-semibold text-xs`}>₹{walletBalance.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* ===== MESSAGES ===== */}
        <div className={`flex-1 overflow-y-auto p-4 space-y-2 min-h-0 ${isDark ? 'bg-[#1a1a1a]' : 'bg-[#ECE5DD]'}`}>
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center">
              <div className="w-16 h-16 rounded-full bg-[#25D366] flex items-center justify-center text-3xl font-bold text-white shadow-lg mb-4">AI</div>
              <h2 className={`text-xl font-semibold ${isDark ? 'text-white' : 'text-gray-800'}`}>Hi User, how can I help you today?</h2>
              <p className={`${isDark ? 'text-gray-400' : 'text-gray-500'} text-sm mt-1`}>Ask me anything</p>
              <div className="flex flex-wrap gap-2 mt-4 justify-center">
                {QUICK_ACTIONS.map((action, i) => (
                  <button key={i} onClick={() => { setPrompt(action.prompt); setTimeout(handleSubmit, 300) }} className={`flex items-center gap-1.5 px-3 py-2 ${isDark ? 'bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600' : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'} border rounded-lg text-sm transition-all shadow-sm`}>
                    <action.icon className="h-3.5 w-3.5" />
                    {action.label}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            messages.map((msg: any, i: number) => (
              <div 
                key={i} 
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} group relative`}
              >
                <div 
                  className={`max-w-[75%] p-3 rounded-2xl text-sm shadow-sm ${
                    msg.role === 'user' 
                      ? isDark ? 'bg-[#075E54] text-white rounded-br-none' : 'bg-[#DCF8C6] text-gray-800 rounded-br-none'
                      : isDark ? 'bg-[#2a2a2a] text-white rounded-bl-none' : 'bg-white text-gray-800 rounded-bl-none'
                  }`}
                >
                  {/* Reply Indicator */}
                  {msg.replyTo && (
                    <div className={`text-[10px] ${isDark ? 'text-gray-400' : 'text-gray-500'} mb-1 flex items-center gap-1`}>
                      <Reply className="h-3 w-3" />
                      <span>Replying to {msg.replyTo.role}: "{msg.replyTo.content}"</span>
                    </div>
                  )}
                  
                  <div className="whitespace-pre-wrap leading-relaxed">{msg.content}</div>
                  
                  {/* Timestamp */}
                  <div className={`flex items-center gap-1 mt-1.5`}>
                    <span className={`text-[8px] ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                      {new Date(msg.timestamp || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
                
                {/* ===== REPLY BUTTON - Like WhatsApp ===== */}
                <button
                  onClick={() => handleReplyClick(msg, i)}
                  className={`absolute -bottom-2 ${msg.role === 'user' ? '-left-2' : '-right-2'} opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-full ${
                    isDark ? 'bg-gray-700 hover:bg-gray-600' : 'bg-white hover:bg-gray-100'
                  } shadow-md border ${isDark ? 'border-gray-600' : 'border-gray-200'}`}
                  title="Reply to this message"
                >
                  <Reply className="h-3.5 w-3.5 text-emerald-500" />
                </button>
              </div>
            ))
          )}
          
          {/* Reply Indicator in Input */}
          {replyToMessage && (
            <div className={`flex items-center justify-between ${isDark ? 'bg-gray-700' : 'bg-gray-100'} p-2 rounded-lg mb-2`}>
              <div className="flex items-center gap-2">
                <Reply className="h-4 w-4 text-emerald-500" />
                <span className={`text-xs ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                  Replying to {replyToMessage.role}: "{replyToMessage.content.slice(0, 50)}..."
                </span>
              </div>
              <button onClick={cancelReply} className="text-gray-400 hover:text-red-500">
                <X className="h-4 w-4" />
              </button>
            </div>
          )}
          
          {isLoading && (
            <div className="flex justify-start">
              <div className={`${isDark ? 'bg-[#2a2a2a] border-gray-700' : 'bg-white border-gray-200'} p-3 rounded-2xl rounded-bl-none shadow-sm border`}>
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

        {/* ===== INPUT AREA ===== */}
        <div className={`border-t ${isDark ? 'border-gray-700 bg-[#1a1a1a]' : 'border-gray-200 bg-[#f0f0f0]'} p-3 flex-shrink-0`}>
          <div className="relative">
            <textarea 
              id="message-input"
              value={prompt} 
              onChange={(e) => setPrompt(e.target.value)} 
              placeholder={replyToMessage ? `Reply to ${replyToMessage.role}...` : "Ask me anything..."} 
              className={`w-full min-h-[44px] max-h-[100px] ${isDark ? 'bg-[#2a2a2a] border-gray-700 text-white placeholder-gray-500' : 'bg-white border-gray-200 text-gray-800 placeholder-gray-400'} border rounded-lg p-2.5 pr-16 outline-none focus:border-emerald-500 resize-none text-sm`} 
              onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSubmit() } }} 
              rows={1}
            />
            <div className="absolute right-2 bottom-2 flex items-center gap-1">
              <button 
                onClick={handleSubmit} 
                disabled={isLoading || !prompt.trim()} 
                className="bg-[#25D366] text-white p-2 rounded-lg disabled:opacity-50 hover:shadow-lg transition-all"
              >
                {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              </button>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .typing-dot { width: 6px; height: 6px; border-radius: 50%; background: #25D366; display: inline-block; animation: typing 1.4s infinite both; margin: 0 2px; }
        .typing-dot:nth-child(2) { animation-delay: 0.2s; }
        .typing-dot:nth-child(3) { animation-delay: 0.4s; }
        @keyframes typing { 0%, 60%, 100% { transform: translateY(0); opacity: 0.3; } 30% { transform: translateY(-6px); opacity: 1; } }
        .dark .typing-dot { background: #4a9eff; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #c1c1c1; border-radius: 4px; }
        .group:hover .group-hover\\:opacity-100 {
          opacity: 1 !important;
        }
      `}</style>
    </div>
  )
}
