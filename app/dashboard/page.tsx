'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Send, Loader2, Wallet, ChevronDown, 
  Bot, Zap, Search, Code, Users, Plus, 
  Image, FolderOpen, Menu, Sparkles,
  MessageSquare, Settings, X, 
  Globe, FileText, GitBranch, Trash2,
  Paperclip, File, Mic, MicOff,
  Copy, Check, ThumbsUp, ThumbsDown, Heart,
  Clock, Moon, Sun, Download, Search as SearchIcon,
  Reply, Pencil
} from 'lucide-react'

// ============================================
// MODELS DATABASE (40+ MODELS)
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

// ============================================
// CHAT STORAGE
// ============================================
const STORAGE_KEY = 'aios_chats'
const THEME_KEY = 'aios_theme'

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
  messages: { role: 'user' | 'assistant', content: string, timestamp?: string, reactions?: { like: number, dislike: number, heart: number } }[]
  timestamp: string
  model?: string
  unread?: boolean
}

type UploadedFile = {
  name: string
  size: number
  type: string
  content: string
  preview?: string
}

type MessageReaction = 'like' | 'dislike' | 'heart'

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
  const [messages, setMessages] = useState<any[]>([])
  
  // File Upload State
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  // Voice Input State
  const [isListening, setIsListening] = useState(false)
  const [isSpeechSupported, setIsSpeechSupported] = useState(true)
  const recognitionRef = useRef<any>(null)
  
  // Features State
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null)
  const [onlineStatus, setOnlineStatus] = useState(true)
  const [typingText, setTypingText] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)
  const [isDark, setIsDark] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(THEME_KEY)
      return saved === 'dark'
    }
    return false
  })
  const [chatSearchQuery, setChatSearchQuery] = useState('')
  const [showExportMenu, setShowExportMenu] = useState(false)
  const [replyToMessage, setReplyToMessage] = useState<any>(null)
  const [replyToIndex, setReplyToIndex] = useState<number | null>(null)
  
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // ===== THEME =====
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(THEME_KEY, isDark ? 'dark' : 'light')
      if (isDark) {
        document.documentElement.classList.add('dark')
      } else {
        document.documentElement.classList.remove('dark')
      }
    }
  }, [isDark])

  // ===== LOAD CHATS =====
  useEffect(() => {
    const stored = getStoredChats()
    if (stored.length > 0) {
      setChats(stored)
      const mostRecent = stored[0]
      setCurrentChatId(mostRecent.id)
      setMessages(mostRecent.messages || [])
      setUnreadCount(0)
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

  // ===== ONLINE STATUS =====
  useEffect(() => {
    const interval = setInterval(() => {
      setOnlineStatus(true)
    }, 30000)
    return () => clearInterval(interval)
  }, [])

  // ===== VOICE INPUT =====
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    if (!SpeechRecognition) {
      setIsSpeechSupported(false)
      return
    }

    const recognition = new SpeechRecognition()
    recognition.continuous = false
    recognition.interimResults = true
    recognition.lang = 'en-US'

    recognition.onresult = (event: any) => {
      let interimTranscript = ''
      let finalTranscript = ''

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript
        if (event.results[i].isFinal) {
          finalTranscript += transcript
        } else {
          interimTranscript += transcript
        }
      }

      const fullText = finalTranscript || interimTranscript
      
      if (finalTranscript) {
        setPrompt(prev => prev ? prev + ' ' + finalTranscript : finalTranscript)
        setTimeout(() => {
          if (finalTranscript.trim()) {
            handleSubmit()
          }
        }, 500)
      } else if (interimTranscript) {
        setPrompt(interimTranscript)
      }
    }

    recognition.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error)
      setIsListening(false)
      if (event.error === 'not-allowed') {
        alert('Please allow microphone access to use voice input.')
      }
    }

    recognition.onend = () => {
      setIsListening(false)
    }

    recognitionRef.current = recognition

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort()
      }
    }
  }, [])

  const toggleVoiceInput = () => {
    if (!isSpeechSupported) {
      alert('Voice input is not supported in this browser. Please use Chrome or Edge.')
      return
    }

    if (isListening) {
      recognitionRef.current?.stop()
      setIsListening(false)
    } else {
      try {
        recognitionRef.current?.start()
        setIsListening(true)
      } catch (error) {
        console.error('Error starting speech recognition:', error)
        alert('Could not start voice input. Please try again.')
      }
    }
  }

  // ===== FILE UPLOAD =====
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsUploading(true)

    try {
      const content = await readFileContent(file)
      
      const uploadedFile: UploadedFile = {
        name: file.name,
        size: file.size,
        type: file.type,
        content: content,
      }

      if (file.type.startsWith('image/')) {
        const preview = URL.createObjectURL(file)
        uploadedFile.preview = preview
      }

      setUploadedFiles(prev => [...prev, uploadedFile])

      const filePrompt = `📎 File attached: ${file.name}\n\nContent:\n${content.slice(0, 2000)}${content.length > 2000 ? '\n... (truncated)' : ''}\n\nPlease analyze this file and answer: `
      setPrompt(filePrompt)

    } catch (error) {
      console.error('Error reading file:', error)
      alert('Failed to read file. Please try again.')
    } finally {
      setIsUploading(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const readFileContent = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      if (file.type.startsWith('image/')) {
        resolve(`[Image: ${file.name} (${Math.round(file.size / 1024)}KB)]`)
      } else if (file.type === 'application/pdf') {
        resolve(`[PDF: ${file.name} (${Math.round(file.size / 1024)}KB) - OCR content extraction coming soon]`)
      } else {
        const reader = new FileReader()
        reader.onload = (event) => {
          const text = event.target?.result as string
          resolve(text)
        }
        reader.onerror = () => reject('Failed to read file')
        reader.readAsText(file)
      }
    })
  }

  const removeFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index))
    setPrompt(prompt.replace(/📎 File attached: .*\n\nContent:\n.*\n\nPlease analyze this file and answer: /, ''))
  }

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
  }

  // ===== CHAT FUNCTIONS =====
  const createNewChat = () => {
    const newId = Date.now().toString()
    const newChat: ChatType = {
      id: newId,
      title: 'New Chat',
      messages: [],
      timestamp: new Date().toISOString(),
      model: selectedModels[0],
      unread: false,
    }
    setChats(prev => [newChat, ...prev])
    setCurrentChatId(newId)
    setMessages([])
    setResponse(null)
    setPrompt('')
    setUploadedFiles([])
    setReplyToMessage(null)
    setReplyToIndex(null)
    setSidebarOpen(false)
    setUnreadCount(0)
    saveChats([newChat, ...chats])
  }

  const loadChat = (chatId: string) => {
    const chat = chats.find(c => c.id === chatId)
    if (chat) {
      setCurrentChatId(chatId)
      setMessages(chat.messages || [])
      setResponse(null)
      setPrompt('')
      setUploadedFiles([])
      setReplyToMessage(null)
      setReplyToIndex(null)
      setSidebarOpen(false)
      setChats(prev => prev.map(c => 
        c.id === chatId ? { ...c, unread: false } : c
      ))
      setUnreadCount(0)
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

  const filteredChats = chatSearchQuery.trim() === '' 
    ? chats 
    : chats.filter((chat: any) =>
        chat.title.toLowerCase().includes(chatSearchQuery.toLowerCase()) ||
        chat.messages.some((m: any) => m.content.toLowerCase().includes(chatSearchQuery.toLowerCase()))
      )

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

  const addReaction = (messageIndex: number, reaction: MessageReaction) => {
    setMessages(prev => {
      const updated = [...prev]
      const msg = updated[messageIndex]
      if (!msg.reactions) {
        msg.reactions = { like: 0, dislike: 0, heart: 0 }
      }
      msg.reactions[reaction] = (msg.reactions[reaction] || 0) + 1
      return updated
    })
    
    if (currentChatId) {
      updateChatMessages(currentChatId, messages)
    }
  }

  const copyMessage = (content: string, id: string) => {
    navigator.clipboard.writeText(content)
    setCopiedMessageId(id)
    setTimeout(() => setCopiedMessageId(null), 2000)
  }

  const simulateTyping = (fullText: string) => {
    setIsTyping(true)
    let index = 0
    setTypingText('')
    const interval = setInterval(() => {
      if (index < fullText.length) {
        setTypingText(prev => prev + fullText[index])
        index++
      } else {
        clearInterval(interval)
        setIsTyping(false)
      }
    }, 15)
    return () => clearInterval(interval)
  }

  const handleReplyClick = (message: any, index: number) => {
    setReplyToMessage(message)
    setReplyToIndex(index)
    const input = document.getElementById('message-input')
    if (input) {
      input.focus()
    }
  }

  const cancelReply = () => {
    setReplyToMessage(null)
    setReplyToIndex(null)
  }

  // ===== SUBMIT QUERY =====
  const handleSubmit = async () => {
    if (!prompt.trim() && uploadedFiles.length === 0) return
    if (selectedModels.length === 0) return
    
    if (walletBalance < 0.01) {
      setMessages(prev => [...prev, { role: 'assistant', content: '⚠️ Insufficient balance. Please add funds.', timestamp: new Date().toISOString() }])
      return
    }

    let fullPrompt = prompt
    if (uploadedFiles.length > 0) {
      const fileContext = uploadedFiles.map(f => 
        `📎 File: ${f.name}\nContent: ${f.content.slice(0, 1000)}`
      ).join('\n\n')
      fullPrompt = `Context from uploaded files:\n${fileContext}\n\nUser question: ${prompt || 'Please analyze these files'}`
    }

    if (replyToMessage) {
      const sender = replyToMessage.role === 'user' ? 'User' : 'AI'
      const preview = replyToMessage.content.slice(0, 100) + (replyToMessage.content.length > 100 ? '...' : '')
      fullPrompt = `[Replying to ${sender}: "${preview}"]\n\n${fullPrompt}`
    }

    const timestamp = new Date().toISOString()
    const userMsg = { 
      role: 'user', 
      content: fullPrompt, 
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
    setUploadedFiles([])
    setReplyToMessage(null)
    setReplyToIndex(null)

    try {
      // Simulate API call - replace with real API
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      let assistantContent = `Here's my response to: "${prompt}"`
      
      if (replyToMessage) {
        const sender = replyToMessage.role === 'user' ? 'User' : 'AI'
        assistantContent = `[Replying to ${sender}]\n\n${assistantContent}`
      }

      const assistantMsg = { 
        role: 'assistant', 
        content: assistantContent, 
        timestamp: new Date().toISOString(),
        reactions: { like: 0, dislike: 0, heart: 0 }
      }
      
      const finalMessages = [...updatedMessages, assistantMsg]
      setMessages(finalMessages)
      simulateTyping(assistantContent)
      
      if (currentChatId) {
        updateChatMessages(currentChatId, finalMessages)
      }
    } catch (error) {
      console.error('Error:', error)
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

  // ============================================
  // NAVIGATION ITEMS - REMOVED "Chat" from Image Studio
  // ============================================
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

  const themeClasses = isDark ? {
    bg: 'bg-[#1a1a1a]',
    bgChat: 'bg-[#1e1e1e]',
    bgInput: 'bg-[#2a2a2a]',
    bgSidebar: 'bg-[#1a1a1a]',
    text: 'text-white',
    textSecondary: 'text-gray-400',
    border: 'border-gray-700',
    cardBg: 'bg-[#2a2a2a]',
    userMsg: 'bg-[#075E54] text-white',
    aiMsg: 'bg-[#2a2a2a] text-white',
    header: 'bg-[#1a1a1a] border-b border-gray-700',
  } : {
    bg: 'bg-[#ECE5DD]',
    bgChat: 'bg-[#ECE5DD]',
    bgInput: 'bg-[#f0f0f0]',
    bgSidebar: 'bg-white',
    text: 'text-gray-800',
    textSecondary: 'text-gray-500',
    border: 'border-gray-200',
    cardBg: 'bg-white',
    userMsg: 'bg-[#DCF8C6] text-gray-800',
    aiMsg: 'bg-white text-gray-800',
    header: 'bg-white border-b border-gray-200',
  }

  return (
    <div className={`flex h-screen ${themeClasses.bg} ${themeClasses.text} overflow-hidden`}>
      
      {/* ===== OVERLAY ===== */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className={`fixed inset-0 z-40 ${isDark ? 'bg-black/70' : 'bg-black/30'}`}
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* ===== SIDEBAR ===== */}
      <motion.div 
        initial={false}
        animate={{ x: sidebarOpen ? 0 : -288 }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        className={`fixed left-0 top-0 h-full z-50 w-72 ${themeClasses.bgSidebar} border-r ${themeClasses.border} flex flex-col overflow-hidden shadow-xl`}
      >
        
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

        {/* ============================================ */}
        {/* NEW CHAT BUTTON - ChatGPT Style (Edit Icon) */}
        {/* ============================================ */}
        <div className="p-3 flex-shrink-0 bg-[#f0f0f0]">
          <button 
            onClick={createNewChat} 
            className="w-full bg-[#25D366] text-white px-3 py-2 rounded-lg font-semibold flex items-center justify-center gap-2 hover:shadow-lg transition-all text-sm"
          >
            <Pencil className="h-4 w-4" />
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
          
          {/* Search Chats */}
          <div className="mt-4 px-2">
            <div className="relative">
              <SearchIcon className="absolute left-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
              <input
                type="text"
                placeholder="Search chats..."
                value={chatSearchQuery}
                onChange={(e) => setChatSearchQuery(e.target.value)}
                className="w-full bg-gray-100 rounded-lg pl-8 pr-3 py-1.5 text-sm text-gray-800 placeholder-gray-400 outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Chat History */}
          {filteredChats.length > 0 ? (
            <div className="mt-4">
              <div className="text-[10px] text-gray-500 uppercase tracking-wider mb-2 px-2 flex items-center justify-between">
                <span>Recent</span>
                {unreadCount > 0 && (
                  <span className="bg-red-500 text-white text-[8px] px-2 py-0.5 rounded-full">
                    {unreadCount} unread
                  </span>
                )}
              </div>
              <div className="space-y-0.5">
                {filteredChats.slice(0, 20).map((chat: any) => (
                  <div key={chat.id} className="group relative flex items-center">
                    <button 
                      onClick={() => loadChat(chat.id)}
                      className={`w-full text-left px-3 py-2.5 rounded-lg text-sm transition-all truncate flex items-center gap-2 ${
                        currentChatId === chat.id 
                          ? 'bg-[#E8F5E9] text-[#075E54]' 
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      <MessageSquare className="h-3.5 w-3.5 flex-shrink-0 text-gray-400" />
                      <span className="truncate">{chat.title}</span>
                      {chat.unread && (
                        <span className="w-2 h-2 bg-red-500 rounded-full flex-shrink-0 animate-pulse" />
                      )}
                      <span className="text-[8px] text-gray-400 ml-auto flex-shrink-0">
                        {new Date(chat.timestamp).toLocaleDateString()}
                      </span>
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
            <div className="mt-4 px-2 text-sm text-gray-500 text-center">
              No chats found for "{chatSearchQuery}"
            </div>
          ) : null}
        </div>

        <div className={`p-4 border-t ${themeClasses.border} flex-shrink-0 bg-[#f0f0f0]`}>
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
      </motion.div>

      {/* ===== MAIN CHAT AREA ===== */}
      <div className="flex-1 flex flex-col h-full min-w-0">
        
        {/* ===== HEADER ===== */}
        <div className={`flex items-center justify-between px-4 py-3 border-b ${themeClasses.border} ${themeClasses.header} flex-shrink-0 shadow-sm`}>
          <div className="flex items-center gap-3 min-w-0">
            <button onClick={() => setSidebarOpen(true)} className="text-gray-600 hover:text-gray-800">
              <Menu className="h-5 w-5" />
            </button>
            <div className="flex items-center gap-2">
              <h1 className={`text-sm font-semibold truncate ${themeClasses.text}`}>
                {currentChatId ? chats.find(c => c.id === currentChatId)?.title || 'New Chat' : 'AIOS Chat'}
              </h1>
              <div className="flex items-center gap-1.5">
                <div className={`w-2 h-2 rounded-full ${onlineStatus ? 'bg-green-500' : 'bg-gray-400'} animate-pulse`} />
                <span className="text-[9px] text-gray-500">
                  {onlineStatus ? 'Online' : 'Offline'}
                </span>
              </div>
            </div>
            {response && (
              <div className="flex items-center gap-1.5 text-[10px]">
                <span className={`px-1.5 py-0.5 rounded-full ${getScoreColor(response.consensus_score || 0)} bg-gray-100`}>
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
            <button
              onClick={() => setIsDark(!isDark)}
              className={`p-1.5 rounded-lg transition-colors ${isDark ? 'bg-gray-700 text-yellow-400 hover:bg-gray-600' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
              title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>

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
              <button onClick={addFunds} className="text-gray-400 hover:text-gray-600"><Plus className="h-2.5 w-2.5" /></button>
            </div>
            <button className="text-gray-400 hover:text-gray-600"><Settings className="h-4 w-4" /></button>
          </div>
        </div>

        {/* ===== MESSAGES ===== */}
        <div className={`flex-1 overflow-y-auto p-4 space-y-2 min-h-0 ${isDark ? 'bg-[#1e1e1e]' : 'bg-[#ECE5DD]'}`}>
          <AnimatePresence>
            {messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center max-w-2xl mx-auto">
                <div className="w-16 h-16 rounded-full bg-[#25D366] flex items-center justify-center text-3xl font-bold text-white shadow-lg mb-4">AI</div>
                <h2 className={`text-xl font-semibold ${isDark ? 'text-white' : 'text-gray-800'}`}>Hi User, how can I help you today?</h2>
                <p className={`${isDark ? 'text-gray-400' : 'text-gray-500'} text-sm mt-1`}>Ask me anything, upload a file, or use voice input 🎤</p>
                <div className="flex flex-wrap gap-2 mt-4 justify-center">
                  {QUICK_ACTIONS.map((action, i) => (
                    <button key={i} onClick={() => handleQuickAction(action.prompt)} className={`flex items-center gap-1.5 px-3 py-2 ${isDark ? 'bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600' : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'} border rounded-lg text-sm transition-all shadow-sm`}>
                      <action.icon className="h-3.5 w-3.5" />
                      {action.label}
                    </button>
                  ))}
                </div>
                <div className={`mt-6 flex items-center gap-4 text-xs ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
                  <span className="flex items-center gap-1"><Bot className="h-3 w-3" /> {selectedModels.length} model</span>
                  <span className="flex items-center gap-1"><Wallet className="h-3 w-3" /> ₹{walletBalance.toFixed(2)}</span>
                  <span className="flex items-center gap-1"><Paperclip className="h-3 w-3" /> Upload</span>
                  <span className="flex items-center gap-1"><Mic className="h-3 w-3" /> Voice</span>
                </div>
              </div>
            ) : (
              messages.map((msg: any, i: number) => {
                const isAI = msg.role === 'assistant'
                return (
                  <div 
                    key={i}
                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} group relative`}
                  >
                    <div className={`max-w-[75%] p-3 rounded-2xl text-sm shadow-sm ${
                      msg.role === 'user' 
                        ? isDark ? 'bg-[#075E54] text-white rounded-br-none' : 'bg-[#DCF8C6] text-gray-800 rounded-br-none'
                        : isDark ? 'bg-[#2a2a2a] text-white rounded-bl-none' : 'bg-white text-gray-800 rounded-bl-none'
                    }`}>
                      {/* Reply Indicator */}
                      {msg.replyTo && (
                        <div className={`text-[10px] ${isDark ? 'text-gray-400' : 'text-gray-500'} mb-1 flex items-center gap-1`}>
                          <Reply className="h-3 w-3" />
                          <span>Replying to {msg.replyTo.role}: "{msg.replyTo.content}"</span>
                        </div>
                      )}

                      {/* Message Content with Typing Animation */}
                      <div className="whitespace-pre-wrap leading-relaxed">
                        {isTyping && i === messages.length - 1 && isAI 
                          ? typingText 
                          : msg.content
                        }
                        {isTyping && i === messages.length - 1 && isAI && (
                          <span className="animate-pulse">|</span>
                        )}
                      </div>
                      
                      {/* Timestamp */}
                      <div className="flex items-center gap-1 mt-1.5">
                        <Clock className={`h-2.5 w-2.5 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
                        <span className={`text-[8px] ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                          {new Date(msg.timestamp || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>

                      {/* Reactions & Copy Button - Only on AI messages */}
                      {isAI && (
                        <div className="flex items-center gap-1 mt-1.5">
                          <button
                            onClick={() => copyMessage(msg.content, `msg-${i}`)}
                            className={`p-0.5 ${isDark ? 'text-gray-500 hover:text-gray-300' : 'text-gray-400 hover:text-gray-600'} transition-colors rounded flex items-center gap-0.5`}
                          >
                            {copiedMessageId === `msg-${i}` ? (
                              <Check className="h-3 w-3 text-green-500" />
                            ) : (
                              <Copy className="h-3 w-3" />
                            )}
                            <span className={`text-[8px] ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>Copy</span>
                          </button>
                          
                          <button
                            onClick={() => addReaction(i, 'like')}
                            className={`p-0.5 ${isDark ? 'text-gray-500 hover:text-blue-400' : 'text-gray-400 hover:text-blue-500'} transition-colors rounded flex items-center gap-0.5`}
                          >
                            <ThumbsUp className="h-3 w-3" />
                            <span className={`text-[8px] ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                              {msg.reactions?.like || 0}
                            </span>
                          </button>
                          
                          <button
                            onClick={() => addReaction(i, 'dislike')}
                            className={`p-0.5 ${isDark ? 'text-gray-500 hover:text-red-400' : 'text-gray-400 hover:text-red-500'} transition-colors rounded flex items-center gap-0.5`}
                          >
                            <ThumbsDown className="h-3 w-3" />
                            <span className={`text-[8px] ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                              {msg.reactions?.dislike || 0}
                            </span>
                          </button>
                          
                          <button
                            onClick={() => addReaction(i, 'heart')}
                            className={`p-0.5 ${isDark ? 'text-gray-500 hover:text-red-400' : 'text-gray-400 hover:text-red-500'} transition-colors rounded flex items-center gap-0.5`}
                          >
                            <Heart className="h-3 w-3" />
                            <span className={`text-[8px] ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                              {msg.reactions?.heart || 0}
                            </span>
                          </button>
                        </div>
                      )}
                    </div>
                    
                    {/* ============================================ */}
                    {/* REPLY BUTTON - Like WhatsApp (on every message) */}
                    {/* ============================================ */}
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
                )
              })
            )}
          </AnimatePresence>
          
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
                  <span className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'} ml-2`}>Getting response...</span>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* ===== INPUT AREA ===== */}
        <div className={`border-t ${isDark ? 'border-gray-700 bg-[#1a1a1a]' : 'border-gray-200 bg-[#f0f0f0]'} p-3 flex-shrink-0`}>
          
          {/* Uploaded Files */}
          {uploadedFiles.length > 0 && (
            <div className="mb-2 flex flex-wrap gap-2">
              {uploadedFiles.map((file, index) => (
                <div key={index} className={`flex items-center gap-2 ${isDark ? 'bg-[#2a2a2a] border-gray-700 text-gray-300' : 'bg-white border-gray-200 text-gray-700'} border rounded-lg px-3 py-1.5 text-sm shadow-sm`}>
                  {file.type.startsWith('image/') && file.preview ? (
                    <img src={file.preview} alt={file.name} className="w-8 h-8 rounded object-cover" />
                  ) : (
                    <File className="h-4 w-4 text-gray-500" />
                  )}
                  <span className="truncate max-w-[120px]">{file.name}</span>
                  <span className={`text-[10px] ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>{formatFileSize(file.size)}</span>
                  <button onClick={() => removeFile(index)} className="text-gray-400 hover:text-red-500">
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Model Selector */}
          <button onClick={() => setShowModelPicker(!showModelPicker)} className={`flex items-center gap-1.5 text-xs ${isDark ? 'text-gray-400 hover:text-gray-300' : 'text-gray-500 hover:text-gray-700'} transition-colors mb-1.5`}>
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
            <div className={`mb-2 p-3 ${isDark ? 'bg-[#2a2a2a] border-gray-700' : 'bg-white border-gray-200'} border rounded-xl max-h-[280px] overflow-y-auto shadow-lg`}>
              <div className="flex items-center justify-between mb-2">
                <h3 className={`text-sm font-semibold ${isDark ? 'text-white' : 'text-gray-800'}`}>Choose a model</h3>
                <button onClick={() => setShowModelPicker(false)} className="text-gray-400 hover:text-gray-600"><X className="h-3.5 w-3.5" /></button>
              </div>
              <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'} mb-2`}>Select one AI model for your task</p>
              <div className="relative mb-2">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
                <input type="text" placeholder="Search..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className={`w-full ${isDark ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-gray-50 border-gray-200 text-gray-800 placeholder-gray-400'} border rounded-lg pl-8 pr-3 py-1.5 text-sm outline-none focus:border-emerald-500`} />
              </div>
              <div className={`flex gap-1 mb-2 ${isDark ? 'bg-gray-700' : 'bg-gray-50'} rounded-lg p-1 flex-wrap`}>
                {['popular', 'intelligence', 'latest', 'all'].map((tab) => (
                  <button key={tab} onClick={() => setModelTab(tab)} className={`flex-1 px-2 py-1 rounded-lg text-xs font-medium capitalize ${modelTab === tab ? 'bg-emerald-500 text-white' : isDark ? 'text-gray-400 hover:bg-gray-600' : 'text-gray-600 hover:bg-gray-200'}`}>
                    {tab === 'all' ? 'All' : tab}
                  </button>
                ))}
              </div>
              <button onClick={() => { setSelectedModels(['gpt-5.4-mini']); setShowModelPicker(false) }} className={`w-full p-2 mb-2 ${isDark ? 'bg-amber-900/20 border-amber-700/30 text-amber-400 hover:bg-amber-900/30' : 'bg-amber-50 border-amber-200 text-amber-600 hover:bg-amber-100'} border rounded-lg text-left transition-all`}>
                <div className="font-semibold text-xs">✨ Auto Mode</div>
                <div className={`text-[10px] ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>picks the best model</div>
              </button>
              <div className={`text-[10px] ${isDark ? 'text-gray-500' : 'text-gray-500'} mb-1.5`}>or pick your own</div>
              <div className="grid grid-cols-2 gap-1">
                {getCurrentModels().map((model) => (
                  <button key={model.id} onClick={() => toggleModel(model.id)} className={`flex items-center gap-1.5 p-1.5 rounded-lg text-left text-xs w-full ${selectedModels.includes(model.id) ? isDark ? 'bg-emerald-900/20 border-emerald-700/30' : 'bg-emerald-50 border-emerald-200' : isDark ? 'bg-gray-700 border-transparent hover:bg-gray-600' : 'bg-gray-50 border-transparent hover:bg-gray-100'} border`}>
                    <span className="text-sm">{model.icon}</span>
                    <div className="flex-1 min-w-0">
                      <span className={`truncate block ${selectedModels.includes(model.id) ? 'text-emerald-400' : isDark ? 'text-white' : 'text-gray-700'}`}>{model.name}</span>
                      <span className={`text-[8px] ${model.tier === 'pro' ? 'text-amber-500' : 'text-emerald-500'}`}>{model.tier === 'pro' ? '⭐ Pro' : 'Free'}</span>
                    </div>
                    {selectedModels.includes(model.id) && <span className="text-emerald-500 text-xs">✓</span>}
                  </button>
                ))}
              </div>
              <button onClick={() => setShowModelPicker(false)} className="w-full mt-2 bg-emerald-500 text-white py-1.5 rounded-lg font-semibold text-xs hover:shadow-lg transition-all">Apply</button>
            </div>
          )}

          {/* TEXT INPUT */}
          <div className="relative">
            <textarea 
              id="message-input"
              value={prompt} 
              onChange={(e) => setPrompt(e.target.value)} 
              placeholder={replyToMessage ? `Reply to ${replyToMessage.role}...` : isListening ? '🎤 Listening...' : 'Type, upload, or speak...'} 
              className={`w-full min-h-[44px] max-h-[100px] ${isDark ? 'bg-[#2a2a2a] border-gray-700 text-white placeholder-gray-500' : 'bg-white border-gray-200 text-gray-800 placeholder-gray-400'} border rounded-lg p-2.5 pr-36 outline-none focus:border-emerald-500 resize-none text-sm`} 
              onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSubmit() } }} 
              rows={1}
            />
            
            {/* Voice Input Indicator */}
            {isListening && (
              <div className="absolute left-2 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                <span className="text-[10px] text-red-500 font-medium">REC</span>
              </div>
            )}

            <div className="absolute right-2 bottom-2 flex items-center gap-1">
              {/* Voice Input Button */}
              <button
                onClick={toggleVoiceInput}
                className={`p-1.5 rounded-lg transition-all ${
                  isListening 
                    ? 'bg-red-500 text-white hover:bg-red-600' 
                    : isDark ? 'text-gray-400 hover:text-gray-300 hover:bg-gray-700' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'
                }`}
                title={isListening ? 'Stop recording' : 'Start voice input'}
              >
                {isListening ? (
                  <MicOff className="h-4 w-4" />
                ) : (
                  <Mic className="h-4 w-4" />
                )}
              </button>

              {/* File Upload Button */}
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileUpload}
                accept=".txt,.pdf,.doc,.docx,.png,.jpg,.jpeg,.gif,.webp,.csv,.json,.xml,.md"
                className="hidden"
                id="file-upload"
              />
              <label 
                htmlFor="file-upload" 
                className={`p-1.5 rounded-lg transition-colors cursor-pointer ${isUploading ? 'opacity-50' : ''} ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
              >
                {isUploading ? (
                  <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
                ) : (
                  <Paperclip className={`h-4 w-4 ${isDark ? 'text-gray-400 hover:text-gray-300' : 'text-gray-400 hover:text-gray-600'}`} />
                )}
              </label>
              
              {/* Send Button */}
              <button 
                onClick={handleSubmit} 
                disabled={isLoading || (!prompt.trim() && uploadedFiles.length === 0) || selectedModels.length === 0} 
                className="bg-[#25D366] text-white p-2 rounded-lg disabled:opacity-50 hover:shadow-lg transition-all"
              >
                {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              </button>
            </div>
          </div>
          
          <div className={`flex items-center flex-wrap gap-2 mt-1.5`}>
            {selectedModels.length === 0 && (
              <p className="text-[10px] text-amber-600">⚠️ Select a model</p>
            )}
            <p className={`text-[9px] ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
              {isListening ? '🎤 Speak now...' : 'Supports: TXT, PDF, Images, DOC, CSV, JSON, XML, MD'}
            </p>
            {!isSpeechSupported && (
              <p className="text-[9px] text-amber-500">⚠️ Voice not supported</p>
            )}
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
        ::-webkit-scrollbar-thumb:hover { background: #a8a8a8; }
        .group:hover .group-hover\\:opacity-100 {
          opacity: 1 !important;
        }
        .dark .group:hover .group-hover\\:opacity-100 {
          opacity: 1 !important;
        }
      `}</style>
    </div>
  )
}
