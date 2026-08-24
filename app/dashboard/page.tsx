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
  Reply, Pencil, Square, RotateCw,
  Sparkles as SparklesIcon, RefreshCw, PanelLeftClose,
  MoreVertical, PanelLeftOpen
} from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { vscDarkPlus, vs } from 'react-syntax-highlighter/dist/esm/styles/prism'

const ALL_MODELS = {
  free: [
    { id: 'gpt-5.4-mini', name: 'GPT-5.4 mini', icon: '🤖', tier: 'free', cost: 0.0005 },
    { id: 'qwen-3.5-flash', name: 'Qwen3.5 Flash', icon: '🐉', tier: 'free', cost: 0.0008 },
    { id: 'ministral-3-8b', name: 'Ministral 3 8B', icon: '🧠', tier: 'free', cost: 0.001 },
    { id: 'mistral-small-4', name: 'Mistral Small 4', icon: '🌊', tier: 'free', cost: 0.001 },
    { id: 'deepseek-chat', name: 'DeepSeek Chat', icon: '🔮', tier: 'free', cost: 0.0015 },
    { id: 'gemini-3-flash', name: 'Gemini 3 Flash', icon: '⚡', tier: 'free', cost: 0.0005 },
    { id: 'gpt-4o-mini', name: 'GPT-4o mini', icon: '🤖', tier: 'free', cost: 0.0005 },
    { id: 'claude-haiku-4.5', name: 'Claude Haiku 4.5', icon: '🎯', tier: 'free', cost: 0.0008 },
    { id: 'mistral-small', name: 'Mistral Small', icon: '🌊', tier: 'free', cost: 0.001 },
    { id: 'seed-2.0-lite', name: 'Seed 2.0 Lite', icon: '🌱', tier: 'free', cost: 0.0004 },
    { id: 'nova-micro', name: 'Nova Micro', icon: '✨', tier: 'free', cost: 0.0005 },
    { id: 'qwen-3-coder-flash', name: 'Qwen 3 Coder Flash', icon: '💻', tier: 'free', cost: 0.0007 },
    { id: 'gpt-5-mini', name: 'GPT-5 mini', icon: '🤖', tier: 'free', cost: 0.0005 },
  ],
  paid: [
    { id: 'gpt-4.1', name: 'GPT-4.1', icon: '🤖', tier: 'pro', cost: 0.005 },
    { id: 'claude-sonnet-4.0', name: 'Claude Sonnet 4.0', icon: '🎯', tier: 'pro', cost: 0.003 },
    { id: 'gpt-5.4', name: 'GPT-5.4', icon: '🤖', tier: 'pro', cost: 0.005 },
    { id: 'gemini-3-pro-preview', name: 'Gemini 3 Pro Preview', icon: '🧠', tier: 'pro', cost: 0.0025 },
    { id: 'grok-3-mini', name: 'Grok 3 Mini', icon: '🦍', tier: 'pro', cost: 0.002 },
    { id: 'codestral', name: 'Codestral', icon: '💻', tier: 'pro', cost: 0.001 },
    { id: 'gpt-5.6-terra', name: 'GPT-5.6 Terra', icon: '🌍', tier: 'pro', cost: 0.005 },
    { id: 'grok-4.5', name: 'Grok 4.5', icon: '🦍', tier: 'pro', cost: 0.002 },
    { id: 'nova-premier-1.0', name: 'Nova Premier 1.0', icon: '✨', tier: 'pro', cost: 0.0025 },
    { id: 'perplexity-sonar', name: 'Perplexity Sonar', icon: '🔍', tier: 'pro', cost: 0.0006 },
    { id: 'gpt-5.6-luna', name: 'GPT-5.6 Luna', icon: '🌙', tier: 'pro', cost: 0.005 },
    { id: 'deepseek-reasoner', name: 'DeepSeek Reasoner', icon: '🧠', tier: 'pro', cost: 0.0015 },
  ]
}

const getAllModels = () => {
  const all = [...ALL_MODELS.free, ...ALL_MODELS.paid]
  return all.filter((model, index, self) => 
    index === self.findIndex(m => m.id === model.id)
  )
}

const SUGGESTIONS = [
  { icon: '🎨', label: 'Create an image', prompt: 'Create a detailed description of a futuristic city' },
  { icon: '📊', label: 'Compare ideas', prompt: 'Compare these concepts:' },
  { icon: '🔍', label: 'Search the web', prompt: 'Search for the latest information about' },
  { icon: '📝', label: 'Write a document', prompt: 'Write a professional document about' },
]

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
  messages: { role: 'user' | 'assistant', content: string, timestamp?: string, reactions?: { like: number, dislike: number, heart: number }, model_used?: string }[]
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
  const [modelTab, setModelTab] = useState('auto')
  const [searchQuery, setSearchQuery] = useState('')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [walletBalance, setWalletBalance] = useState(100)
  const [activePage, setActivePage] = useState('chat')
  const [chats, setChats] = useState<ChatType[]>([])
  const [currentChatId, setCurrentChatId] = useState<string | null>(null)
  const [messages, setMessages] = useState<any[]>([])
  const [isStopped, setIsStopped] = useState(false)
  
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  const [isListening, setIsListening] = useState(false)
  const [isSpeechSupported, setIsSpeechSupported] = useState(true)
  const recognitionRef = useRef<any>(null)
  
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
  const [editingMessageIndex, setEditingMessageIndex] = useState<number | null>(null)
  const [editingText, setEditingText] = useState('')
  const [hoveredMessageId, setHoveredMessageId] = useState<string | null>(null)
  const [modelUsed, setModelUsed] = useState<string | null>(null)
  
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const abortControllerRef = useRef<AbortController | null>(null)

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

  useEffect(() => {
    const interval = setInterval(() => {
      setOnlineStatus(true)
    }, 30000)
    return () => clearInterval(interval)
  }, [])

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
    setEditingMessageIndex(null)
    setSidebarOpen(false)
    setUnreadCount(0)
    setModelUsed(null)
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
      setEditingMessageIndex(null)
      setSidebarOpen(false)
      setModelUsed(null)
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
        const firstUserMsg = newMessages.find(m => m.role === 'user')
        if (firstUserMsg) {
          title = firstUserMsg.content.slice(0, 30) + (firstUserMsg.content.length > 30 ? '...' : '')
        } else if (newMessages.length === 0) {
          title = 'New Chat'
        }
        return { ...c, messages: newMessages, title }
      }
      return c
    }))
    setTimeout(() => {
      saveChats(chats.map(c => {
        if (c.id === chatId) {
          let title = c.title
          const firstUserMsg = newMessages.find(m => m.role === 'user')
          if (firstUserMsg) {
            title = firstUserMsg.content.slice(0, 30) + (firstUserMsg.content.length > 30 ? '...' : '')
          } else if (newMessages.length === 0) {
            title = 'New Chat'
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
    const isPaid = getAllModels().find(m => m.id === id)?.tier === 'pro'
    
    if (selectedModels.includes(id)) {
      if (isPaid && selectedModels.length === 1) {
        return
      }
      setSelectedModels(selectedModels.filter(m => m !== id))
    } else {
      if (isPaid) {
        setSelectedModels([id])
      } else {
        setSelectedModels([...selectedModels, id])
      }
    }
  }

  const getCurrentModels = () => {
    let models = modelTab === 'auto' ? getAllModels() : ALL_MODELS[modelTab as keyof typeof ALL_MODELS] || []
    if (searchQuery) {
      models = models.filter(m => m.name.toLowerCase().includes(searchQuery.toLowerCase()))
    }
    return models
  }

  const handleAutoSelect = () => {
    setSelectedModels(['gpt-5.4-mini'])
    setShowModelPicker(false)
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
      if (index < fullText.length && !isStopped) {
        setTypingText(prev => prev + fullText[index])
        index++
      } else {
        clearInterval(interval)
        setIsTyping(false)
        setIsStopped(false)
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

  const startEditing = (message: any, index: number) => {
    setEditingMessageIndex(index)
    setEditingText(message.content)
  }

  const cancelEditing = () => {
    setEditingMessageIndex(null)
    setEditingText('')
  }

  const saveEditing = (index: number) => {
    if (editingText.trim()) {
      const updatedMessages = [...messages]
      updatedMessages[index] = { ...updatedMessages[index], content: editingText.trim() }
      setMessages(updatedMessages)
      if (currentChatId) {
        updateChatMessages(currentChatId, updatedMessages)
      }
      setEditingMessageIndex(null)
      setEditingText('')
    }
  }

  const regenerateResponse = (index: number) => {
    let userPrompt = ''
    for (let i = index - 1; i >= 0; i--) {
      if (messages[i].role === 'user') {
        userPrompt = messages[i].content
        break
      }
    }
    if (userPrompt) {
      const updatedMessages = messages.slice(0, index)
      setMessages(updatedMessages)
      if (currentChatId) {
        updateChatMessages(currentChatId, updatedMessages)
      }
      setPrompt(userPrompt)
      setTimeout(() => handleSubmit(), 100)
    }
  }

  const stopGeneration = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
      abortControllerRef.current = null
    }
    setIsStopped(true)
    setIsTyping(false)
    setIsLoading(false)
    setTypingText('')
  }

  const askAnotherAI = () => {
    const lastUserMsg = [...messages].reverse().find(m => m.role === 'user')
    if (lastUserMsg) {
      setPrompt(lastUserMsg.content)
      setTimeout(() => handleSubmit(), 100)
    }
  }

  const handleClearChat = () => {
    if (messages.length === 0) return
    if (confirm('Are you sure you want to clear all messages?')) {
      setMessages([])
      if (currentChatId) {
        updateChatMessages(currentChatId, [])
      }
      setResponse(null)
    }
  }

  const handleSubmit = async () => {
    if (!prompt.trim() && uploadedFiles.length === 0) {
      return
    }
    
    if (selectedModels.length === 0) {
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: '⚠️ Please select a model first!', 
        timestamp: new Date().toISOString(),
        reactions: { like: 0, dislike: 0, heart: 0 }
      }])
      return
    }
    
    if (walletBalance < 0.01) {
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: '⚠️ Insufficient balance. Please add funds.', 
        timestamp: new Date().toISOString(),
        reactions: { like: 0, dislike: 0, heart: 0 }
      }])
      return
    }

    const timestamp = new Date().toISOString()
    
    const userMsg = { 
      role: 'user', 
      content: prompt, 
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
    setIsStopped(false)
    const currentPrompt = prompt
    setPrompt('')
    setUploadedFiles([])
    const currentReplyTo = replyToMessage
    setReplyToMessage(null)
    setReplyToIndex(null)

    abortControllerRef.current = new AbortController()

    try {
      const res = await fetch('/api/ai/consensus', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          prompt: currentPrompt, 
          models: selectedModels
        }),
        signal: abortControllerRef.current.signal
      })
      
      const data = await res.json()
      let assistantContent: string
      
      if (data.error === 'insufficient_credits') {
        assistantContent = `⚠️ Insufficient credits. Please add funds at https://openrouter.ai/settings/creds`
      } else if (data.error === 'free_model_limit') {
        assistantContent = `⚠️ Free model daily limit reached. Try again later.`
      } else if (data.error === 'model_unavailable') {
        assistantContent = `⚠️ Model currently unavailable. Try again later.`
      } else if (data.error === 'all_models_failed') {
        assistantContent = `⚠️ All free models are currently unavailable. Try again later or add credits.`
      } else if (data.error) {
        assistantContent = `⚠️ ${data.error}`
      } else if (data.consensus) {
        setResponse(data)
        assistantContent = data.consensus
        if (data.wallet_balance !== undefined) {
          setWalletBalance(data.wallet_balance)
        }
        if (data.model_used) {
          setModelUsed(data.model_used)
        }
      } else {
        assistantContent = '⚠️ No response from AI. Please try again.'
      }
      
      const assistantMsg = { 
        role: 'assistant', 
        content: assistantContent, 
        timestamp: new Date().toISOString(),
        reactions: { like: 0, dislike: 0, heart: 0 },
        model_used: data.model_used || modelUsed || 'AI Assistant'
      }
      
      const finalMessages = [...updatedMessages, assistantMsg]
      setMessages(finalMessages)
      simulateTyping(assistantContent)
      
      if (currentChatId) {
        updateChatMessages(currentChatId, finalMessages)
      }
    } catch (error: any) {
      if (error.name === 'AbortError') {
        const stoppedMsg = { 
          role: 'assistant', 
          content: '⏹️ Generation stopped by user.', 
          timestamp: new Date().toISOString(),
          reactions: { like: 0, dislike: 0, heart: 0 }
        }
        const finalMessages = [...updatedMessages, stoppedMsg]
        setMessages(finalMessages)
        if (currentChatId) {
          updateChatMessages(currentChatId, finalMessages)
        }
      } else {
        console.error('Error:', error)
        const errorMsg = { 
          role: 'assistant', 
          content: '❌ Error: Could not connect to AI. Please try again.', 
          timestamp: new Date().toISOString(),
          reactions: { like: 0, dislike: 0, heart: 0 }
        }
        const finalMessages = [...updatedMessages, errorMsg]
        setMessages(finalMessages)
        if (currentChatId) {
          updateChatMessages(currentChatId, finalMessages)
        }
      }
    }
    setIsLoading(false)
    abortControllerRef.current = null
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

  const handleSuggestionClick = (promptText: string) => {
    setPrompt(promptText)
    setTimeout(() => {
      handleSubmit()
    }, 100)
  }

  const navItems = [
    { id: 'image', icon: Image, label: 'Image Studio' },
    { id: 'experts', icon: Users, label: 'Experts' },
    { id: 'projects', icon: FolderOpen, label: 'Projects' },
  ]

  const MarkdownContent = ({ content }: { content: string }) => {
    return (
      <ReactMarkdown
        components={{
          code({ node, inline, className, children, ...props }: any) {
            const match = /language-(\w+)/.exec(className || '')
            return !inline && match ? (
              <SyntaxHighlighter
                style={isDark ? vscDarkPlus : vs}
                language={match[1]}
                PreTag="div"
                {...props}
              >
                {String(children).replace(/\n$/, '')}
              </SyntaxHighlighter>
            ) : (
              <code className={`${className} ${isDark ? 'bg-[#2a2a2a] text-[#e5e5e5]' : 'bg-gray-100 text-gray-800'} px-1.5 py-0.5 rounded text-sm`} {...props}>
                {children}
              </code>
            )
          },
          p({ children }: any) {
            return <p className="mb-2 last:mb-0">{children}</p>
          },
          strong({ children }: any) {
            return <strong className="font-bold">{children}</strong>
          },
          em({ children }: any) {
            return <em className="italic">{children}</em>
          },
          ul({ children }: any) {
            return <ul className="list-disc pl-5 mb-2 space-y-1">{children}</ul>
          },
          ol({ children }: any) {
            return <ol className="list-decimal pl-5 mb-2 space-y-1">{children}</ol>
          },
          li({ children }: any) {
            return <li>{children}</li>
          },
          blockquote({ children }: any) {
            return <blockquote className={`border-l-4 ${isDark ? 'border-gray-600' : 'border-gray-300'} pl-3 my-2 italic`}>{children}</blockquote>
          },
          h1({ children }: any) {
            return <h1 className="text-2xl font-bold mb-2">{children}</h1>
          },
          h2({ children }: any) {
            return <h2 className="text-xl font-bold mb-2">{children}</h2>
          },
          h3({ children }: any) {
            return <h3 className="text-lg font-bold mb-2">{children}</h3>
          },
          a({ href, children }: any) {
            return <a href={href} className="text-blue-500 hover:underline" target="_blank" rel="noopener noreferrer">{children}</a>
          },
        }}
      >
        {content}
      </ReactMarkdown>
    )
  }

  return (
    <div className={`flex h-screen ${isDark ? 'dark bg-[#343541]' : 'bg-[#f7f7f8]'} overflow-hidden font-sans`}>
      
      {/* ==========================================
          SIDEBAR - EXACTLY LIKE CHATGPT
          ========================================== */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <div className={`
        fixed lg:relative inset-y-0 left-0 z-50 w-64 
        ${isDark ? 'bg-[#202123]' : 'bg-white'} 
        border-r ${isDark ? 'border-[#4a4b5a]' : 'border-[#e5e5e5]'}
        flex flex-col transition-transform duration-300 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* New Chat Button - TOP */}
        <div className="p-3 border-b border-[#4a4b5a]/20 dark:border-[#4a4b5a]">
          <button 
            onClick={createNewChat} 
            className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium transition-all bg-[#10a37f] hover:bg-[#0d8b6e] text-white"
          >
            <Plus className="h-4 w-4" />
            <span>New chat</span>
          </button>
        </div>

        {/* Chat History with Search */}
        <div className="px-3 py-2">
          <div className="relative">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#8e8ea0]" />
            <input
              type="text"
              placeholder="Search chats..."
              value={chatSearchQuery}
              onChange={(e) => setChatSearchQuery(e.target.value)}
              className={`w-full pl-9 pr-3 py-1.5 rounded-lg text-sm ${isDark ? 'bg-[#2a2b32] text-[#ececec] placeholder-[#8e8ea0] border-[#4a4b5a]' : 'bg-[#f7f7f8] text-[#2d2d2d] placeholder-[#8e8ea0] border-[#e5e5e5]'} border outline-none focus:ring-1 focus:ring-[#10a37f]`}
            />
          </div>
        </div>

        {/* Chat History List */}
        <div className="flex-1 overflow-y-auto px-2 pb-2 space-y-0.5">
          {filteredChats.slice(0, 50).map((chat: any) => (
            <div key={chat.id} className="group relative flex items-center">
              <button 
                onClick={() => loadChat(chat.id)}
                className={`
                  w-full text-left px-3 py-2.5 rounded-lg text-sm transition-all truncate flex items-center gap-3
                  ${currentChatId === chat.id 
                    ? isDark ? 'bg-[#2a2b32] text-white' : 'bg-[#e5e5e5] text-black' 
                    : isDark ? 'text-[#ececec] hover:bg-[#2a2b32]' : 'text-[#2d2d2d] hover:bg-[#e5e5e5]'
                  }
                `}
              >
                <MessageSquare className="h-4 w-4 flex-shrink-0 opacity-60" />
                <span className="truncate text-sm">{chat.title}</span>
              </button>
              {/* Dustbin icon - ALWAYS VISIBLE on hover */}
              <button 
                onClick={(e) => deleteChat(chat.id, e)}
                className="absolute right-2 opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded hover:bg-red-500/10 text-gray-400 hover:text-red-500"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>

        {/* Bottom - User */}
        <div className={`border-t ${isDark ? 'border-[#4a4b5a]' : 'border-[#e5e5e5]'} p-3`}>
          <div className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-gray-200/20 dark:hover:bg-white/5 cursor-pointer transition-colors">
            <div className="w-7 h-7 rounded-full bg-[#10a37f] flex items-center justify-center text-white text-xs font-bold">
              U
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium truncate text-[#ececec] dark:text-white">User</div>
            </div>
            <Settings className="h-4 w-4 opacity-60" />
          </div>
        </div>
      </div>

      {/* ==========================================
          MAIN CHAT
          ========================================== */}
      <div className="flex-1 flex flex-col h-full min-w-0">
        
        {/* Header */}
        <div className={`flex items-center justify-between px-4 py-3 border-b ${isDark ? 'border-[#4a4b5a] bg-[#343541]' : 'border-[#e5e5e5] bg-white'} flex-shrink-0`}>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setSidebarOpen(true)} 
              className={`p-1.5 rounded-lg transition-colors lg:hidden ${isDark ? 'hover:bg-[#2a2b32]' : 'hover:bg-[#e5e5e5]'}`}
            >
              <Menu className="h-5 w-5 opacity-60" />
            </button>
            <h1 className={`text-sm font-medium truncate ${isDark ? 'text-[#ececec]' : 'text-[#2d2d2d]'}`}>
              {currentChatId ? chats.find(c => c.id === currentChatId)?.title || 'New Chat' : 'New Chat'}
            </h1>
            <button 
              onClick={createNewChat}
              className={`p-1.5 rounded-lg transition-colors ${isDark ? 'hover:bg-[#2a2b32]' : 'hover:bg-[#e5e5e5]'}`}
              title="New Chat"
            >
              <Pencil className="h-3.5 w-3.5 opacity-60" />
            </button>
          </div>
          
          <div className="flex items-center gap-1">
            <button
              onClick={() => setShowModelPicker(!showModelPicker)}
              className={`p-1.5 rounded-lg transition-colors ${isDark ? 'hover:bg-[#2a2b32]' : 'hover:bg-[#e5e5e5]'} text-xs flex items-center gap-1`}
            >
              <span className="opacity-60">{selectedModels.length} models</span>
              <ChevronDown className="h-3 w-3 opacity-60" />
            </button>

            <button
              onClick={() => setIsDark(!isDark)}
              className={`p-1.5 rounded-lg transition-colors ${isDark ? 'hover:bg-[#2a2b32]' : 'hover:bg-[#e5e5e5]'}`}
            >
              {isDark ? <Sun className="h-4 w-4 opacity-60" /> : <Moon className="h-4 w-4 opacity-60" />}
            </button>

            <div className="relative">
              <button
                onClick={() => setShowExportMenu(!showExportMenu)}
                className={`p-1.5 rounded-lg transition-colors ${isDark ? 'hover:bg-[#2a2b32]' : 'hover:bg-[#e5e5e5]'}`}
              >
                <MoreVertical className="h-4 w-4 opacity-60" />
              </button>
              
              {showExportMenu && (
                <div className={`absolute right-0 mt-1 w-56 ${isDark ? 'bg-[#2a2b32] border-[#4a4b5a]' : 'bg-white border-[#e5e5e5]'} rounded-lg shadow-lg border overflow-hidden z-10`}>
                  <div className={`px-4 py-2.5 border-b ${isDark ? 'border-[#4a4b5a]' : 'border-[#e5e5e5]'} flex items-center justify-between`}>
                    <span className={`text-sm ${isDark ? 'text-[#8e8ea0]' : 'text-[#8e8ea0]'}`}>Balance</span>
                    <span className={`text-sm font-semibold ${isDark ? 'text-[#10a37f]' : 'text-[#10a37f]'}`}>₹{walletBalance.toFixed(2)}</span>
                  </div>
                  <button
                    onClick={() => { addFunds(); setShowExportMenu(false) }}
                    className={`w-full text-left px-4 py-2.5 text-sm ${isDark ? 'text-[#ececec] hover:bg-[#3a3b4a]' : 'text-[#2d2d2d] hover:bg-[#e5e5e5]'} flex items-center gap-2`}
                  >
                    <Plus className="h-4 w-4" />
                    Add Funds
                  </button>
                  <button
                    onClick={() => { exportChat('txt'); setShowExportMenu(false) }}
                    className={`w-full text-left px-4 py-2.5 text-sm ${isDark ? 'text-[#ececec] hover:bg-[#3a3b4a]' : 'text-[#2d2d2d] hover:bg-[#e5e5e5]'} flex items-center gap-2 border-t ${isDark ? 'border-[#4a4b5a]' : 'border-[#e5e5e5]'}`}
                  >
                    <Download className="h-4 w-4" />
                    Export as TXT
                  </button>
                  <button
                    onClick={() => { exportChat('md'); setShowExportMenu(false) }}
                    className={`w-full text-left px-4 py-2.5 text-sm ${isDark ? 'text-[#ececec] hover:bg-[#3a3b4a]' : 'text-[#2d2d2d] hover:bg-[#e5e5e5]'} flex items-center gap-2 border-t ${isDark ? 'border-[#4a4b5a]' : 'border-[#e5e5e5]'}`}
                  >
                    <FileText className="h-4 w-4" />
                    Export as MD
                  </button>
                  <button
                    onClick={() => { handleClearChat(); setShowExportMenu(false) }}
                    className={`w-full text-left px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2 border-t ${isDark ? 'border-[#4a4b5a]' : 'border-[#e5e5e5]'}`}
                  >
                    <Trash2 className="h-4 w-4" />
                    Clear Chat
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Model Picker */}
        {showModelPicker && (
          <div className={`absolute right-4 top-14 z-20 p-3 rounded-xl shadow-xl border ${isDark ? 'bg-[#2a2b32] border-[#4a4b5a]' : 'bg-white border-[#e5e5e5]'} max-h-[320px] overflow-y-auto w-72`}>
            <div className="flex items-center justify-between mb-3">
              <h3 className={`text-sm font-semibold ${isDark ? 'text-white' : 'text-gray-800'}`}>Select Models</h3>
              <button onClick={() => setShowModelPicker(false)} className="text-gray-400 hover:text-gray-600">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="flex gap-1 mb-3 bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
              {['auto', 'free', 'paid'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setModelTab(tab)}
                  className={`flex-1 px-2 py-1 rounded-lg text-xs font-medium capitalize transition-all ${
                    modelTab === tab
                      ? 'bg-[#10a37f] text-white'
                      : isDark ? 'text-gray-400 hover:text-gray-300' : 'text-gray-600 hover:text-gray-800'
                  }`}
                >
                  {tab === 'auto' ? '✨ Auto' : tab}
                </button>
              ))}
            </div>

            <div className="relative mb-3">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
              <input
                type="text"
                placeholder="Search models..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`w-full pl-8 pr-3 py-1.5 text-sm rounded-lg border ${
                  isDark ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-gray-50 border-gray-200 text-gray-800 placeholder-gray-400'
                } outline-none focus:ring-2 focus:ring-[#10a37f]/30`}
              />
            </div>

            {modelTab === 'auto' && (
              <button
                onClick={handleAutoSelect}
                className={`w-full p-3 mb-2 rounded-lg border-2 border-[#10a37f]/30 bg-[#10a37f]/5 text-left transition-all hover:bg-[#10a37f]/10`}
              >
                <div className="flex items-center gap-2">
                  <span className="text-lg">✨</span>
                  <div>
                    <div className={`font-semibold text-sm ${isDark ? 'text-white' : 'text-gray-800'}`}>Auto Mode</div>
                    <div className={`text-[10px] ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Automatically picks the best model</div>
                  </div>
                  {selectedModels.length === 1 && (
                    <span className="ml-auto text-[#10a37f] text-xs font-medium">✓ Active</span>
                  )}
                </div>
              </button>
            )}

            <div className="grid grid-cols-2 gap-1">
              {getCurrentModels().map((model) => {
                const isSelected = selectedModels.includes(model.id)
                
                return (
                  <button
                    key={model.id}
                    onClick={() => {
                      if (modelTab === 'auto') {
                        setSelectedModels([model.id])
                      } else {
                        toggleModel(model.id)
                      }
                    }}
                    className={`flex items-center gap-2 p-2 rounded-lg text-left text-xs transition-all ${
                      isSelected
                        ? isDark ? 'bg-[#10a37f]/20 border-[#10a37f]/50' : 'bg-[#10a37f]/10 border-[#10a37f]'
                        : isDark ? 'bg-gray-700/50 hover:bg-gray-600/50 border-transparent' : 'bg-gray-50 hover:bg-gray-100 border-transparent'
                    } border`}
                  >
                    <span className="text-sm">{model.icon}</span>
                    <div className="flex-1 min-w-0">
                      <div className={`truncate ${isSelected ? 'text-[#10a37f]' : isDark ? 'text-white' : 'text-gray-700'}`}>
                        {model.name}
                      </div>
                      <div className={`text-[8px] ${model.tier === 'pro' ? 'text-amber-500' : 'text-[#10a37f]'}`}>
                        {model.tier === 'pro' ? '⭐ Paid' : 'Free'}
                      </div>
                    </div>
                    {isSelected && (
                      <span className="text-[#10a37f] text-xs">✓</span>
                    )}
                  </button>
                )
              })}
            </div>

            <button 
              onClick={() => setShowModelPicker(false)} 
              className="w-full mt-3 bg-[#10a37f] text-white py-2 rounded-lg font-medium text-xs hover:bg-[#0d8b6e] transition-all"
            >
              Done
            </button>
          </div>
        )}

        {/* Messages */}
        <div className={`flex-1 overflow-y-auto ${isDark ? 'bg-[#343541]' : 'bg-[#f7f7f8]'}`}>
          <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">
            {messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center min-h-[60vh] text-center">
                <h2 className={`text-3xl font-semibold ${isDark ? 'text-[#ececec]' : 'text-[#2d2d2d]'}`}>
                  How can I help?
                </h2>
                <p className={`text-sm mt-2 ${isDark ? 'text-[#8e8ea0]' : 'text-[#8e8ea0]'}`}>
                  Start a conversation by typing below.
                </p>
                <div className="grid grid-cols-2 gap-2 mt-6 w-full max-w-2xl">
                  {SUGGESTIONS.map((suggestion, i) => (
                    <button
                      key={i}
                      onClick={() => handleSuggestionClick(suggestion.prompt)}
                      className={`flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all ${
                        isDark 
                          ? 'bg-[#2a2b32] hover:bg-[#3a3b4a] border border-[#4a4b5a] hover:border-[#5a5b6a]' 
                          : 'bg-white hover:bg-gray-50 border border-[#e5e5e5] hover:border-[#d5d5d5]'
                      } border shadow-sm hover:shadow-md`}
                    >
                      <span className="text-lg">{suggestion.icon}</span>
                      <span className={`text-sm font-medium ${isDark ? 'text-[#ececec]' : 'text-[#2d2d2d]'}`}>
                        {suggestion.label}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              messages.map((msg: any, i: number) => {
                const isAI = msg.role === 'assistant'
                const msgId = `msg-${i}`
                const isHovered = hoveredMessageId === msgId
                
                return (
                  <div 
                    key={i} 
                    className={`flex gap-4 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    onMouseEnter={() => setHoveredMessageId(msgId)}
                    onMouseLeave={() => setHoveredMessageId(null)}
                  >
                    <div className={`max-w-[85%] ${msg.role === 'user' ? 'order-2' : 'order-1'}`}>
                      {msg.replyTo && (
                        <div className={`text-[10px] ${isDark ? 'text-[#8e8ea0]' : 'text-[#8e8ea0]'} mb-1 flex items-center gap-1`}>
                          <Reply className="h-3 w-3" />
                          <span>Replying to {msg.replyTo.role}: "{msg.replyTo.content}"</span>
                        </div>
                      )}

                      {editingMessageIndex === i && msg.role === 'user' ? (
                        <div className="flex flex-col gap-2 w-full">
                          <textarea
                            value={editingText}
                            onChange={(e) => setEditingText(e.target.value)}
                            className={`w-full p-3 rounded-xl text-sm ${isDark ? 'bg-[#2a2b32] text-[#ececec] border-[#4a4b5a]' : 'bg-white text-[#2d2d2d] border-[#e5e5e5]'} border focus:outline-none focus:ring-2 focus:ring-[#10a37f]/30 resize-none`}
                            rows={3}
                          />
                          <div className="flex gap-2">
                            <button
                              onClick={() => saveEditing(i)}
                              className="px-3 py-1.5 bg-[#10a37f] text-white rounded-lg text-xs font-medium hover:bg-[#0d8b6e] transition-all"
                            >
                              Save
                            </button>
                            <button
                              onClick={cancelEditing}
                              className={`px-3 py-1.5 rounded-lg text-xs font-medium ${isDark ? 'bg-[#4a4b5a] text-[#ececec] hover:bg-[#5a5b6a]' : 'bg-[#e5e5e5] text-[#2d2d2d] hover:bg-[#d5d5d5]'} transition-all`}
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className={`
                          px-4 py-3 text-sm leading-relaxed
                          ${msg.role === 'user' 
                            ? 'bg-[#10a37f] text-white rounded-2xl rounded-tr-sm' 
                            : isDark ? 'text-[#ececec]' : 'text-[#2d2d2d]'
                          }
                        `}>
                          {msg.role === 'assistant' ? (
                            <div className="prose prose-sm max-w-none dark:prose-invert">
                              <MarkdownContent content={isTyping && i === messages.length - 1 && isAI && !isStopped ? typingText : msg.content} />
                            </div>
                          ) : (
                            <div className="whitespace-pre-wrap">{msg.content}</div>
                          )}
                          {isTyping && i === messages.length - 1 && isAI && !isStopped && (
                            <span className="animate-pulse">|</span>
                          )}
                        </div>
                      )}

                      {!editingMessageIndex || editingMessageIndex !== i ? (
                        <div className={`flex items-center gap-2 mt-1.5 ${isDark ? 'text-[#8e8ea0]' : 'text-[#8e8ea0]'}`}>
                          {/* Timestamp */}
                          <span className="text-[10px] opacity-60">
                            {new Date(msg.timestamp || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                          
                          {/* Copy - BOLD icon */}
                          <button
                            onClick={() => copyMessage(msg.content, msgId)}
                            className={`p-0.5 rounded hover:bg-black/10 dark:hover:bg-white/10 transition-colors`}
                          >
                            {copiedMessageId === msgId ? (
                              <Check className="h-3.5 w-3.5 text-[#10a37f] stroke-[2.5]" />
                            ) : (
                              <Copy className="h-3.5 w-3.5 opacity-60 stroke-[2.5]" />
                            )}
                          </button>

                          {/* Regenerate - BOLD icon (only for AI) */}
                          {msg.role === 'assistant' && (
                            <button
                              onClick={() => regenerateResponse(i)}
                              className="p-0.5 rounded hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
                            >
                              <RotateCw className="h-3.5 w-3.5 opacity-60 stroke-[2.5]" />
                            </button>
                          )}

                          {/* Reply - BOLD icon */}
                          <button
                            onClick={() => handleReplyClick(msg, i)}
                            className="p-0.5 rounded hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
                          >
                            <Reply className="h-3.5 w-3.5 opacity-60 stroke-[2.5]" />
                          </button>

                          {/* Edit - BOLD icon (only for user) */}
                          {msg.role === 'user' && (
                            <button
                              onClick={() => startEditing(msg, i)}
                              className="p-0.5 rounded hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
                            >
                              <Pencil className="h-3.5 w-3.5 opacity-60 stroke-[2.5]" />
                            </button>
                          )}

                          {/* Ask Another AI - Restored! */}
                          {msg.role === 'assistant' && (
                            <button
                              onClick={askAnotherAI}
                              className="flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-medium transition-all bg-[#10a37f]/10 hover:bg-[#10a37f]/20 text-[#10a37f]"
                            >
                              <RefreshCw className="h-3 w-3 stroke-[2.5]" />
                              <span>Ask Another AI</span>
                            </button>
                          )}
                        </div>
                      ) : null}
                    </div>
                  </div>
                )
              })
            )}
            
            {isLoading && (
              <div className="flex justify-start">
                <div className={`flex items-center gap-2 px-4 py-2 ${isDark ? 'text-[#ececec]' : 'text-[#2d2d2d]'}`}>
                  <div className="typing-dot"></div>
                  <div className="typing-dot"></div>
                  <div className="typing-dot"></div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Reply To Indicator */}
        {replyToMessage && (
          <div className={`flex items-center justify-between px-4 py-2 ${isDark ? 'bg-[#2a2b32] border-[#4a4b5a]' : 'bg-[#f0f0f0] border-[#e5e5e5]'} border-t`}>
            <div className="flex items-center gap-2">
              <Reply className="h-4 w-4 text-[#10a37f]" />
              <span className={`text-xs ${isDark ? 'text-[#ececec]' : 'text-[#2d2d2d]'}`}>
                Replying to {replyToMessage.role}: "{replyToMessage.content.slice(0, 50)}..."
              </span>
            </div>
            <button onClick={cancelReply} className="text-gray-400 hover:text-red-500">
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* Input */}
        <div className={`border-t ${isDark ? 'border-[#4a4b5a] bg-[#343541]' : 'border-[#e5e5e5] bg-white'} p-3 flex-shrink-0`}>
          <div className="max-w-3xl mx-auto">
            {uploadedFiles.length > 0 && (
              <div className="mb-2 flex flex-wrap gap-2">
                {uploadedFiles.map((file, index) => (
                  <div key={index} className={`flex items-center gap-2 ${isDark ? 'bg-[#2a2b32] border-[#4a4b5a] text-[#ececec]' : 'bg-[#f7f7f8] border-[#e5e5e5] text-[#2d2d2d]'} border rounded-lg px-3 py-1.5 text-sm`}>
                    {file.type.startsWith('image/') && file.preview ? (
                      <img src={file.preview} alt={file.name} className="w-8 h-8 rounded object-cover" />
                    ) : (
                      <File className="h-4 w-4 opacity-60" />
                    )}
                    <span className="truncate max-w-[120px]">{file.name}</span>
                    <span className={`text-[10px] ${isDark ? 'text-[#8e8ea0]' : 'text-[#8e8ea0]'}`}>{formatFileSize(file.size)}</span>
                    <button onClick={() => removeFile(index)} className="text-gray-400 hover:text-red-500">
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="relative flex items-end">
              <textarea 
                id="message-input"
                value={prompt} 
                onChange={(e) => setPrompt(e.target.value)} 
                placeholder={replyToMessage ? `Reply to ${replyToMessage.role}...` : isListening ? '🎤 Listening...' : 'Send a message...'} 
                className={`
                  w-full min-h-[44px] max-h-[120px] 
                  ${isDark ? 'bg-[#40414f] border-[#4a4b5a] text-[#ececec] placeholder-[#8e8ea0]' : 'bg-white border-[#e5e5e5] text-[#2d2d2d] placeholder-[#8e8ea0]'} 
                  border rounded-xl p-2.5 pr-24 outline-none focus:ring-1 focus:ring-[#10a37f] resize-none text-sm transition-all
                `} 
                onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSubmit() } }} 
                rows={1}
              />
              
              {isListening && (
                <div className="absolute left-2 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
                  <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                  <span className="text-[10px] text-red-500 font-medium">REC</span>
                </div>
              )}

              <div className="absolute right-2 bottom-2 flex items-center gap-1">
                <button
                  onClick={toggleVoiceInput}
                  className={`p-1.5 rounded-lg transition-all ${isListening ? 'bg-red-500 text-white' : isDark ? 'hover:bg-[#40414f]' : 'hover:bg-[#e5e5e5]'}`}
                >
                  {isListening ? (
                    <MicOff className="h-4 w-4" />
                  ) : (
                    <Mic className={`h-4 w-4 ${isDark ? 'text-[#8e8ea0]' : 'text-[#8e8ea0]'}`} />
                  )}
                </button>

                <input type="file" ref={fileInputRef} onChange={handleFileUpload} className="hidden" id="file-upload" accept=".txt,.pdf,.doc,.docx,.png,.jpg,.jpeg,.gif,.webp,.csv,.json,.xml,.md" />
                <label 
                  htmlFor="file-upload" 
                  className={`p-1.5 rounded-lg transition-colors cursor-pointer ${isDark ? 'hover:bg-[#40414f]' : 'hover:bg-[#e5e5e5]'}`}
                >
                  <Paperclip className={`h-4 w-4 ${isDark ? 'text-[#8e8ea0]' : 'text-[#8e8ea0]'}`} />
                </label>
                
                {isLoading ? (
                  <button 
                    onClick={stopGeneration}
                    className="bg-[#10a37f] text-white p-1.5 rounded-lg hover:bg-[#0d8b6e] transition-all"
                  >
                    <Square className="h-4 w-4" />
                  </button>
                ) : (
                  <button 
                    onClick={handleSubmit} 
                    disabled={!prompt.trim() && uploadedFiles.length === 0} 
                    className={`p-1.5 rounded-lg transition-all ${prompt.trim() || uploadedFiles.length > 0 ? 'bg-[#10a37f] text-white hover:bg-[#0d8b6e]' : isDark ? 'bg-[#40414f] text-[#8e8ea0]' : 'bg-[#e5e5e5] text-[#8e8ea0]'}`}
                  >
                    <Send className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>
            
            <div className="flex items-center justify-between mt-1.5">
              <div className="flex items-center gap-2">
                {selectedModels.length === 0 && (
                  <p className="text-[10px] text-amber-500">⚠️ Select a model</p>
                )}
                <p className={`text-[9px] ${isDark ? 'text-[#8e8ea0]' : 'text-[#8e8ea0]'}`}>
                  Supports: TXT, PDF, Images, DOC, CSV, JSON, XML, MD
                </p>
              </div>
              <p className={`text-[9px] ${isDark ? 'text-[#8e8ea0]' : 'text-[#8e8ea0]'}`}>
                {isListening ? '🎤 Speak now...' : `₹${walletBalance.toFixed(2)}`}
              </p>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .typing-dot { 
          width: 6px; 
          height: 6px; 
          border-radius: 50%; 
          background: #10a37f; 
          display: inline-block; 
          animation: typing 1.4s infinite both; 
          margin: 0 2px; 
        }
        .typing-dot:nth-child(2) { animation-delay: 0.2s; }
        .typing-dot:nth-child(3) { animation-delay: 0.4s; }
        @keyframes typing { 
          0%, 60%, 100% { transform: translateY(0); opacity: 0.3; } 
          30% { transform: translateY(-6px); opacity: 1; } 
        }
        .dark .typing-dot { background: #10a37f; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #c1c1c1; border-radius: 4px; }
        ::-webkit-scrollbar-thumb:hover { background: #a8a8a8; }
        .prose pre { background: transparent !important; padding: 0 !important; }
        .prose code { font-size: 0.875em; }
      `}</style>
    </div>
  )
}
