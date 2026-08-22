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
  Sparkles as SparklesIcon
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
          models: selectedModels,
          max_tokens: 20  // ← CHANGED TO 20
        }),
        signal: abortControllerRef.current.signal
      })
      
      const data = await res.json()
      let assistantContent: string
      
      if (res.status === 402 || data.error === 'insufficient_credits') {
        assistantContent = `⚠️ Insufficient credits. Please add funds at https://openrouter.ai/settings/creds`
      } else if (data.error) {
        assistantContent = `⚠️ ${data.error}`
      } else if (data.consensus) {
        setResponse(data)
        assistantContent = data.consensus
        if (data.wallet_balance !== undefined) {
          setWalletBalance(data.wallet_balance)
        }
      } else {
        assistantContent = '⚠️ No response from AI. Please try again.'
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

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-emerald-600'
    if (score >= 60) return 'text-amber-600'
    return 'text-red-600'
  }

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
    <div className={`flex h-screen ${isDark ? 'bg-[#1a1a1a]' : 'bg-[#f7f7f8]'} ${isDark ? 'text-white' : 'text-gray-800'} overflow-hidden font-sans`}>
      
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

      <motion.div 
        initial={false}
        animate={{ x: sidebarOpen ? 0 : -288 }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        className={`fixed left-0 top-0 h-full z-50 w-72 ${isDark ? 'bg-[#1a1a1a]' : 'bg-white'} border-r ${isDark ? 'border-gray-700' : 'border-gray-200'} flex flex-col overflow-hidden shadow-xl`}
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

        <div className="p-3 flex-shrink-0 bg-[#f0f0f0]">
          <button onClick={createNewChat} className="w-full bg-[#25D366] text-white px-3 py-2 rounded-lg font-semibold flex items-center justify-center gap-2 hover:shadow-lg transition-all text-sm">
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

        <div className={`p-4 border-t ${isDark ? 'border-gray-700' : 'border-gray-200'} flex-shrink-0 bg-[#f0f0f0]`}>
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

      <div className="flex-1 flex flex-col h-full min-w-0">
        
        <div className={`flex items-center justify-between px-4 py-3 border-b ${isDark ? 'border-gray-700 bg-[#1a1a1a]' : 'border-gray-200 bg-white'} flex-shrink-0 shadow-sm min-h-[60px]`}>
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <button onClick={() => setSidebarOpen(true)} className={`${isDark ? 'text-gray-400 hover:text-gray-200' : 'text-gray-600 hover:text-gray-800'}`}>
              <Menu className="h-5 w-5 flex-shrink-0" />
            </button>
            <div className="flex items-center gap-2 min-w-0">
              <h1 className={`text-sm font-semibold truncate ${isDark ? 'text-white' : 'text-gray-800'}`}>
                {currentChatId ? chats.find(c => c.id === currentChatId)?.title || 'New Chat' : 'AIOS Chat'}
              </h1>
              <div className="flex items-center gap-1.5 flex-shrink-0">
                <div className={`w-2 h-2 rounded-full ${onlineStatus ? 'bg-green-500' : 'bg-gray-400'} animate-pulse`} />
                <span className="text-[9px] text-gray-500 hidden sm:inline">
                  {onlineStatus ? 'Online' : 'Offline'}
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-1 flex-shrink-0">
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
            <button className={`${isDark ? 'text-gray-400 hover:text-gray-200' : 'text-gray-400 hover:text-gray-600'}`}><Settings className="h-4 w-4" /></button>
          </div>
        </div>

        {/* ===== MESSAGES - CHATGPT STYLE WITH MARKDOWN ===== */}
        <div className={`flex-1 overflow-y-auto px-4 py-4 space-y-4 min-h-0 ${isDark ? 'bg-[#1a1a1a]' : 'bg-[#f7f7f8]'}`}>
          <AnimatePresence>
            {messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center max-w-3xl mx-auto">
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.5 }}
                  className="w-16 h-16 rounded-full bg-[#25D366] flex items-center justify-center text-3xl font-bold text-white shadow-lg mb-6"
                >
                  AI
                </motion.div>
                <motion.h2 
                  initial={{ y: 10, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.1 }}
                  className={`text-3xl font-semibold ${isDark ? 'text-white' : 'text-gray-800'}`}
                >
                  Hi User, how can I help you today?
                </motion.h2>
                <motion.p 
                  initial={{ y: 10, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className={`${isDark ? 'text-gray-400' : 'text-gray-500'} text-sm mt-2`}
                >
                  Ask me anything, upload a file, or use voice input 🎤
                </motion.p>
                
                <motion.div 
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="grid grid-cols-2 gap-3 mt-6 w-full max-w-2xl"
                >
                  {SUGGESTIONS.map((suggestion, i) => (
                    <button
                      key={i}
                      onClick={() => handleSuggestionClick(suggestion.prompt)}
                      className={`flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all ${
                        isDark 
                          ? 'bg-[#2a2a2a] hover:bg-[#333] border-gray-700' 
                          : 'bg-white hover:bg-gray-50 border-gray-200'
                      } border shadow-sm`}
                    >
                      <span className="text-xl">{suggestion.icon}</span>
                      <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                        {suggestion.label}
                      </span>
                    </button>
                  ))}
                </motion.div>
                
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  className={`mt-6 flex items-center gap-4 text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}
                >
                  <span className="flex items-center gap-1"><Bot className="h-3 w-3" /> {selectedModels.length} model</span>
                  <span className="flex items-center gap-1"><Wallet className="h-3 w-3" /> ₹{walletBalance.toFixed(2)}</span>
                  <span className="flex items-center gap-1"><Paperclip className="h-3 w-3" /> Upload</span>
                  <span className="flex items-center gap-1"><Mic className="h-3 w-3" /> Voice</span>
                </motion.div>
              </div>
            ) : (
              messages.map((msg: any, i: number) => {
                const isAI = msg.role === 'assistant'
                const isEditing = editingMessageIndex === i
                const msgId = `msg-${i}`
                
                return (
                  <motion.div 
                    key={i}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} w-full`}
                    onMouseEnter={() => setHoveredMessageId(msgId)}
                    onMouseLeave={() => setHoveredMessageId(null)}
                  >
                    <div className={`relative max-w-[100%] w-full flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                      {msg.replyTo && (
                        <div className={`text-[10px] ${isDark ? 'text-gray-400' : 'text-gray-500'} mb-1 flex items-center gap-1`}>
                          <Reply className="h-3 w-3" />
                          <span>Replying to {msg.replyTo.role}: "{msg.replyTo.content}"</span>
                        </div>
                      )}

                      {isEditing && msg.role === 'user' ? (
                        <div className="w-full flex flex-col gap-2">
                          <textarea
                            value={editingText}
                            onChange={(e) => setEditingText(e.target.value)}
                            className={`w-full p-3 rounded-lg text-sm ${isDark ? 'bg-[#2a2a2a] text-white border-gray-700' : 'bg-white text-gray-800 border-gray-300'} border focus:outline-none focus:border-emerald-500 resize-none`}
                            rows={3}
                          />
                          <div className="flex gap-2">
                            <button
                              onClick={() => saveEditing(i)}
                              className="px-3 py-1 bg-emerald-500 text-white rounded-lg text-xs font-medium hover:bg-emerald-600 transition-all"
                            >
                              Save
                            </button>
                            <button
                              onClick={cancelEditing}
                              className={`px-3 py-1 rounded-lg text-xs font-medium ${isDark ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'} transition-all`}
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div 
                          className={`px-4 py-3 ${msg.role === 'user' ? 'shadow-sm' : ''}`}
                          style={{
                            backgroundColor: msg.role === 'user' 
                              ? (isDark ? '#2563EB' : '#0A7CFF')
                              : 'transparent',
                            color: msg.role === 'user' 
                              ? '#ffffff'
                              : (isDark ? '#e5e5e5' : '#1a1a1a'),
                            borderRadius: msg.role === 'user' ? '16px 4px 16px 16px' : '0px',
                            maxWidth: msg.role === 'user' ? 'auto' : '100%',
                            width: msg.role === 'assistant' ? '100%' : 'auto',
                            wordWrap: 'break-word',
                            fontSize: '16px',
                            lineHeight: '1.6',
                          }}
                        >
                          {msg.role === 'assistant' ? (
                            <div className="prose prose-sm max-w-none dark:prose-invert">
                              <MarkdownContent content={isTyping && i === messages.length - 1 && isAI && !isStopped ? typingText : msg.content} />
                            </div>
                          ) : (
                            <div 
                              className="whitespace-pre-wrap leading-relaxed"
                              style={{ 
                                color: '#ffffff',
                                fontSize: '16px',
                                lineHeight: '1.6',
                              }}
                            >
                              {msg.content}
                            </div>
                          )}
                          {isTyping && i === messages.length - 1 && isAI && !isStopped && (
                            <span className="animate-pulse" style={{ color: isDark ? '#e5e5e5' : '#1a1a1a' }}>|</span>
                          )}
                        </div>
                      )}

                      {!isEditing && (
                        <div className={`flex items-center gap-0.5 mt-1 transition-opacity duration-200 ${
                          msg.role === 'assistant' ? 'opacity-100' : hoveredMessageId === msgId ? 'opacity-100' : 'opacity-0'
                        }`} style={{ color: isDark ? '#6b7280' : '#9ca3af' }}>
                          <span className={`text-[10px] ${isDark ? 'text-gray-500' : 'text-gray-400'} mr-1`}>
                            {new Date(msg.timestamp || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                          
                          <button
                            onClick={() => copyMessage(msg.content, msgId)}
                            className="p-1 rounded transition-colors hover:bg-gray-100 hover:text-gray-700 flex items-center gap-1 text-[11px]"
                            style={{ color: isDark ? '#6b7280' : '#9ca3af' }}
                          >
                            {copiedMessageId === msgId ? (
                              <Check className="h-3.5 w-3.5 text-green-500" />
                            ) : (
                              <Copy className="h-3.5 w-3.5" />
                            )}
                            <span className="text-[10px]">Copy</span>
                          </button>
                          
                          {msg.role === 'user' && (
                            <button
                              onClick={() => startEditing(msg, i)}
                              className="p-1 rounded transition-colors hover:bg-gray-100 hover:text-gray-700 flex items-center gap-1 text-[11px]"
                              style={{ color: isDark ? '#6b7280' : '#9ca3af' }}
                            >
                              <Pencil className="h-3.5 w-3.5" />
                              <span className="text-[10px]">Edit</span>
                            </button>
                          )}
                          
                          {msg.role === 'assistant' && (
                            <button
                              onClick={() => regenerateResponse(i)}
                              className="p-1 rounded transition-colors hover:bg-gray-100 hover:text-gray-700 flex items-center gap-1 text-[11px]"
                              style={{ color: isDark ? '#6b7280' : '#9ca3af' }}
                            >
                              <RotateCw className="h-3.5 w-3.5" />
                              <span className="text-[10px]">Regenerate</span>
                            </button>
                          )}
                          
                          <button
                            onClick={() => addReaction(i, 'like')}
                            className="p-1 rounded transition-colors hover:bg-gray-100 hover:text-gray-700 flex items-center gap-1 text-[11px]"
                            style={{ color: isDark ? '#6b7280' : '#9ca3af' }}
                          >
                            <ThumbsUp className="h-3.5 w-3.5" />
                            <span className="text-[10px]">{msg.reactions?.like || 0}</span>
                          </button>
                          
                          <button
                            onClick={() => addReaction(i, 'dislike')}
                            className="p-1 rounded transition-colors hover:bg-gray-100 hover:text-gray-700 flex items-center gap-1 text-[11px]"
                            style={{ color: isDark ? '#6b7280' : '#9ca3af' }}
                          >
                            <ThumbsDown className="h-3.5 w-3.5" />
                            <span className="text-[10px]">{msg.reactions?.dislike || 0}</span>
                          </button>
                          
                          <button
                            onClick={() => addReaction(i, 'heart')}
                            className="p-1 rounded transition-colors hover:bg-gray-100 hover:text-gray-700 flex items-center gap-1 text-[11px]"
                            style={{ color: isDark ? '#6b7280' : '#9ca3af' }}
                          >
                            <Heart className="h-3.5 w-3.5" />
                            <span className="text-[10px]">{msg.reactions?.heart || 0}</span>
                          </button>

                          <button
                            onClick={() => handleReplyClick(msg, i)}
                            className="p-1 rounded transition-colors hover:bg-gray-100 hover:text-gray-700 flex items-center gap-1 text-[11px]"
                            style={{ color: isDark ? '#6b7280' : '#9ca3af' }}
                          >
                            <Reply className="h-3.5 w-3.5" />
                            <span className="text-[10px]">Reply</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )
              })
            )}
          </AnimatePresence>
          
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
              <div className="bg-white p-3 rounded-2xl rounded-bl-sm shadow-sm border border-gray-200">
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

        {/* ===== INPUT AREA ===== */}
        <div className={`border-t ${isDark ? 'border-gray-700 bg-[#1a1a1a]' : 'border-gray-200 bg-[#f0f0f0]'} p-3 flex-shrink-0`}>
          
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

          <div className="relative">
            <button 
              onClick={() => setShowModelPicker(!showModelPicker)} 
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs w-full justify-between ${
                isDark ? 'bg-[#2a2a2a] hover:bg-[#333] border-gray-700' : 'bg-white hover:bg-gray-50 border-gray-200'
              } border transition-all mb-2`}
            >
              <div className="flex items-center gap-2">
                <div className="flex -space-x-1">
                  {selectedModels.slice(0, 3).map(id => {
                    const model = getAllModels().find(m => m.id === id)
                    return model ? <span key={id} className="text-sm">{model.icon}</span> : null
                  })}
                  {selectedModels.length > 3 && (
                    <span className={`text-[8px] ${isDark ? 'text-gray-400' : 'text-gray-500'} ml-1`}>
                      +{selectedModels.length - 3}
                    </span>
                  )}
                </div>
                <span className={`text-xs font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  {selectedModels.length === 0 ? 'Select model' :
                   selectedModels.length === 1 ? getAllModels().find(m => m.id === selectedModels[0])?.name || 'Model' :
                   `${selectedModels.length} models`}
                </span>
              </div>
              <ChevronDown className={`h-3 w-3 ${isDark ? 'text-gray-400' : 'text-gray-400'} transition-transform ${showModelPicker ? 'rotate-180' : ''}`} />
            </button>

            {showModelPicker && (
              <div className={`absolute bottom-full mb-2 left-0 right-0 z-50 p-3 rounded-xl shadow-xl border ${
                isDark ? 'bg-[#2a2a2a] border-gray-700' : 'bg-white border-gray-200'
              } max-h-[320px] overflow-y-auto`}>
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
                          ? 'bg-emerald-500 text-white'
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
                    } outline-none focus:border-emerald-500`}
                  />
                </div>

                {modelTab === 'auto' && (
                  <button
                    onClick={handleAutoSelect}
                    className={`w-full p-3 mb-2 rounded-lg border-2 border-emerald-500/30 bg-emerald-500/5 text-left transition-all hover:bg-emerald-500/10`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-lg">✨</span>
                      <div>
                        <div className={`font-semibold text-sm ${isDark ? 'text-white' : 'text-gray-800'}`}>Auto Mode</div>
                        <div className={`text-[10px] ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Automatically picks the best model</div>
                      </div>
                      {selectedModels.length === 1 && (
                        <span className="ml-auto text-emerald-500 text-xs font-medium">✓ Active</span>
                      )}
                    </div>
                  </button>
                )}

                <div className="text-[10px] text-gray-400 mb-2">
                  {modelTab === 'free' && 'Select multiple free models'}
                  {modelTab === 'paid' && 'Select one paid model'}
                  {modelTab === 'auto' && 'Choose your preferred model'}
                </div>

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
                            ? isDark ? 'bg-emerald-900/30 border-emerald-700/50' : 'bg-emerald-50 border-emerald-300'
                            : isDark ? 'bg-gray-700/50 hover:bg-gray-600/50 border-transparent' : 'bg-gray-50 hover:bg-gray-100 border-transparent'
                        } border`}
                      >
                        <span className="text-sm">{model.icon}</span>
                        <div className="flex-1 min-w-0">
                          <div className={`truncate ${isSelected ? 'text-emerald-400 dark:text-emerald-400' : isDark ? 'text-white' : 'text-gray-700'}`}>
                            {model.name}
                          </div>
                          <div className={`text-[8px] ${model.tier === 'pro' ? 'text-amber-500' : 'text-emerald-500'}`}>
                            {model.tier === 'pro' ? '⭐ Paid' : 'Free'}
                          </div>
                        </div>
                        {isSelected && (
                          <span className="text-emerald-500 text-xs">✓</span>
                        )}
                      </button>
                    )
                  })}
                </div>

                <button 
                  onClick={() => setShowModelPicker(false)} 
                  className="w-full mt-3 bg-emerald-500 text-white py-2 rounded-lg font-medium text-xs hover:bg-emerald-600 transition-all"
                >
                  Done
                </button>
              </div>
            )}
          </div>

          <div className="relative mt-2">
            <textarea 
              id="message-input"
              value={prompt} 
              onChange={(e) => setPrompt(e.target.value)} 
              placeholder={replyToMessage ? `Reply to ${replyToMessage.role}...` : isListening ? '🎤 Listening...' : 'Type, upload, or speak...'} 
              className={`w-full min-h-[44px] max-h-[100px] ${isDark ? 'bg-[#2a2a2a] border-gray-700 text-white placeholder-gray-500' : 'bg-white border-gray-200 text-gray-800 placeholder-gray-400'} border rounded-lg p-2.5 pr-36 outline-none focus:border-emerald-500 resize-none text-sm`} 
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
              
              {isLoading ? (
                <button 
                  onClick={stopGeneration}
                  className="bg-red-500 text-white p-2 rounded-lg hover:bg-red-600 transition-all shadow-lg"
                  title="Stop generating"
                >
                  <Square className="h-4 w-4" />
                </button>
              ) : (
                <button 
                  onClick={handleSubmit} 
                  disabled={(!prompt.trim() && uploadedFiles.length === 0) || selectedModels.length === 0} 
                  className="bg-[#25D366] text-white p-2 rounded-lg disabled:opacity-50 hover:shadow-lg transition-all"
                >
                  <Send className="h-4 w-4" />
                </button>
              )}
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
        .prose pre { background: transparent !important; padding: 0 !important; }
        .prose code { font-size: 0.875em; }
      `}</style>
    </div>
  )
}
