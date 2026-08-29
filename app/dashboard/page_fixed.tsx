'use client'

import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
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


function AIOSLogo({ size = 28, wordmark = false }: { size?: number; wordmark?: boolean }) {
  return (
    <span className="inline-flex items-center gap-2 shrink-0">
      <svg
        width={size}
        height={size}
        viewBox="0 0 48 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        {/* AIOS Infinite Orbit — custom continuous orbital mark */}
        <path
          d="M11.2 17.1C14.1 11.6 20 8 26.8 8c5.8 0 10.7 2.3 13.6 6.1 2.5 3.3 2.7 7.5.5 10.7-2.3 3.3-6.7 5-11.1 4.2l-8.1-1.5c-4.5-.8-8.9.9-11.1 4.2-2.2 3.2-2 7.4.5 10.7C13.9 46.3 18.8 48 24.6 48"
          transform="translate(0 -4)"
          stroke="currentColor"
          strokeWidth="4.2"
          strokeLinecap="round"
        />
        <path
          d="M36.8 30.9C33.9 36.4 28 40 21.2 40c-5.8 0-10.7-2.3-13.6-6.1-2.5-3.3-2.7-7.5-.5-10.7 2.3-3.3 6.7-5 11.1-4.2l8.1 1.5c4.5.8 8.9-.9 11.1-4.2 2.2-3.2 2-7.4-.5-10.7C34.1 1.7 29.2 0 23.4 0"
          transform="translate(0 4)"
          stroke="currentColor"
          strokeWidth="4.2"
          strokeLinecap="round"
        />
        <circle cx="10.5" cy="24" r="2.4" fill="currentColor" />
        <circle cx="37.5" cy="24" r="2.4" fill="currentColor" />
      </svg>
      {wordmark && <span className="text-[1.05em] font-semibold tracking-[-0.03em]">AIOS</span>}
    </span>
  )
}

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
  messages: {
    role: 'user' | 'assistant',
    content: string,
    timestamp?: string,
    reactions?: { like: number, dislike: number, heart: number },
    model_used?: string
  }[]
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
  const [isAutoMode, setIsAutoMode] = useState(true)
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
  
  const exportMenuRef = useRef<HTMLDivElement>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const abortControllerRef = useRef<AbortController | null>(null)
  const typingIntervalRef = useRef<NodeJS.Timeout | null>(null)

  // ADDED: Reference for the expandable message textarea
  const messageInputRef = useRef<HTMLTextAreaElement>(null)

  // ADDED: Automatically resize the message input
  const autoResizeTextarea = (textarea: HTMLTextAreaElement) => {
    textarea.style.height = 'auto'

    const maxHeight = 220
    const newHeight = Math.min(textarea.scrollHeight, maxHeight)

    textarea.style.height = `${newHeight}px`
  }

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
    if (!showExportMenu) return

    const handleOutsideClick = (event: MouseEvent | TouchEvent) => {
      const target = event.target as Node
      if (exportMenuRef.current && !exportMenuRef.current.contains(target)) {
        setShowExportMenu(false)
      }
    }

    document.addEventListener('mousedown', handleOutsideClick)
    document.addEventListener('touchstart', handleOutsideClick)

    return () => {
      document.removeEventListener('mousedown', handleOutsideClick)
      document.removeEventListener('touchstart', handleOutsideClick)
    }
  }, [showExportMenu])

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setShowExportMenu(false)
        setShowModelPicker(false)
        setSidebarOpen(false)
      }
    }
    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [])

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

        if (messageInputRef.current) {
          autoResizeTextarea(messageInputRef.current)
        }
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

      requestAnimationFrame(() => {
        if (messageInputRef.current) {
          autoResizeTextarea(messageInputRef.current)
        }
      })

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

    requestAnimationFrame(() => {
      if (messageInputRef.current) {
        autoResizeTextarea(messageInputRef.current)
      }
    })
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

    // Reset input height
    requestAnimationFrame(() => {
      if (messageInputRef.current) {
        messageInputRef.current.style.height = '56px'
      }
    })

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

      // Reset input height
      requestAnimationFrame(() => {
        if (messageInputRef.current) {
          messageInputRef.current.style.height = '56px'
        }
      })
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
    setIsAutoMode(true)
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
    setIsStopped(false)
    
    if (fullText.length > 0) {
      setTypingText(fullText[0])
      let index = 1
      
      if (typingIntervalRef.current) {
        clearInterval(typingIntervalRef.current)
      }
      
      typingIntervalRef.current = setInterval(() => {
        if (index < fullText.length && !isStopped) {
          setTypingText(prev => prev + fullText[index])
          index++
        } else {
          clearInterval(typingIntervalRef.current)
          typingIntervalRef.current = null
          setIsTyping(false)
          setIsStopped(false)
          setTypingText(fullText)
        }
      }, 20)
    } else {
      setTypingText('')
      setIsTyping(false)
    }
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

      requestAnimationFrame(() => {
        if (messageInputRef.current) {
          autoResizeTextarea(messageInputRef.current)
        }
      })

      setTimeout(() => handleSubmit(), 100)
    }
  }

  const stopGeneration = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
      abortControllerRef.current = null
    }
    if (typingIntervalRef.current) {
      clearInterval(typingIntervalRef.current)
      typingIntervalRef.current = null
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

      requestAnimationFrame(() => {
        if (messageInputRef.current) {
          autoResizeTextarea(messageInputRef.current)
        }
      })

      setTimeout(() => {
        handleSubmit()
      }, 100)
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
    const currentAutoMode = isAutoMode

    setPrompt('')

    // Reset expanded textarea after sending
    requestAnimationFrame(() => {
      if (messageInputRef.current) {
        messageInputRef.current.style.height = '56px'
      }
    })

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
        assistantContent = `⚠️ Insufficient credits. Please add funds.`
      } else if (data.error === 'free_model_limit') {
        assistantContent = `⚠️ Free model daily limit reached. Try again later.`
      } else if (data.error === 'model_unavailable') {
        assistantContent = `⚠️ Model currently unavailable. Try again later.`
      } else if (data.error === 'all_models_failed') {
        assistantContent = `⚠️ All models are currently unavailable. Try again later.`
      } else if (data.error === 'missing_api_key') {
        assistantContent = `⚠️ API key not configured. Please add your Gemini API key.`
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
        model_used: data.model_used || modelUsed || 'AI Assistant',
        auto_mode: currentAutoMode
      }
      
      const finalMessages = [...updatedMessages, assistantMsg]
      setMessages(finalMessages)
      
      if (!data.error && assistantContent.length > 0) {
        simulateTyping(assistantContent)
      } else {
        setIsLoading(false)
      }
      
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

    requestAnimationFrame(() => {
      if (messageInputRef.current) {
        autoResizeTextarea(messageInputRef.current)
      }
    })

    setTimeout(() => {
      handleSubmit()
    }, 100)
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
              <code
                className={`${className} ${
                  isDark
                    ? 'bg-[#2a2a2a] text-[#e5e5e5]'
                    : 'bg-gray-100 text-gray-800'
                } px-1.5 py-0.5 rounded text-sm`}
                {...props}
              >
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
            return (
              <blockquote
                className={`border-l-4 ${
                  isDark ? 'border-gray-600' : 'border-gray-300'
                } pl-3 my-2 italic`}
              >
                {children}
              </blockquote>
            )
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
            return (
              <a
                href={href}
                className="text-blue-500 hover:underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                {children}
              </a>
            )
          },
        }}
      >
        {content}
      </ReactMarkdown>
    )
  }

  return (
    <div
      className={`${isDark ? 'dark bg-[#080b12] text-white' : 'bg-[#f7f8fb] text-[#17181c]'} flex h-[100dvh] w-full overflow-hidden font-sans`}
    >
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <button
          aria-label="Close sidebar"
          className="fixed inset-0 z-40 bg-black/55 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ============================================================
          LEFT SIDEBAR — AIOS
          ============================================================ */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-[300px] shrink-0 flex-col border-r transition-transform duration-300 lg:relative lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } ${
          isDark
            ? 'border-white/[0.08] bg-[#0a0d14]'
            : 'border-black/[0.08] bg-white'
        }`}
      >
        <div className={`flex h-[70px] items-center justify-between border-b px-4 ${isDark ? 'border-white/[0.07]' : 'border-black/[0.07]'}`}>
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-violet-400/25 bg-gradient-to-br from-violet-500/25 via-blue-500/15 to-cyan-400/10 text-xl shadow-[0_0_24px_rgba(124,58,237,.18)]">
              ✦
            </div>
            <span className="text-[24px] font-semibold tracking-[-0.04em]">AIOS</span>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className={`hidden rounded-lg p-2 transition lg:block ${isDark ? 'text-white/50 hover:bg-white/[0.06] hover:text-white' : 'text-black/50 hover:bg-black/[0.05] hover:text-black'}`}
            title="Collapse sidebar"
          >
            <PanelLeftClose className="h-4 w-4" />
          </button>
        </div>

        <div className="px-3 py-3">
          <button
            onClick={createNewChat}
            className="group flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#4965ff] via-[#6652e8] to-[#a044e8] px-4 py-3 text-sm font-semibold text-white shadow-[0_8px_30px_rgba(92,78,220,.22)] transition hover:scale-[1.01] hover:shadow-[0_10px_35px_rgba(92,78,220,.35)]"
          >
            <Plus className="h-4 w-4" />
            New Chat
            <span className="ml-auto hidden rounded-md bg-white/15 px-1.5 py-0.5 text-[10px] font-medium text-white/80 sm:inline">⌘ K</span>
          </button>
        </div>

        <div className="px-3 pb-3">
          <div className="relative">
            <SearchIcon className={`absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 ${isDark ? 'text-white/40' : 'text-black/40'}`} />
            <input
              value={chatSearchQuery}
              onChange={(e) => setChatSearchQuery(e.target.value)}
              placeholder="Search chats..."
              className={`h-10 w-full rounded-xl border pl-9 pr-3 text-sm outline-none transition focus:ring-2 focus:ring-violet-500/30 ${
                isDark
                  ? 'border-white/[0.09] bg-white/[0.025] text-white placeholder:text-white/35'
                  : 'border-black/[0.09] bg-[#f7f8fb] text-black placeholder:text-black/35'
              }`}
            />
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-2 pb-3">
          <div className={`px-3 pb-2 pt-1 text-[11px] font-medium uppercase tracking-[0.08em] ${isDark ? 'text-white/40' : 'text-black/40'}`}>Today</div>
          {filteredChats.slice(0, 50).map((chat: any) => (
            <div key={chat.id} className="group relative mb-0.5">
              <button
                onClick={() => loadChat(chat.id)}
                className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-[13px] transition ${
                  currentChatId === chat.id
                    ? isDark
                      ? 'border border-violet-400/30 bg-violet-500/[0.10] text-white shadow-[inset_0_0_24px_rgba(124,58,237,.06)]'
                      : 'border border-violet-400/30 bg-violet-50 text-black'
                    : isDark
                      ? 'border border-transparent text-white/75 hover:bg-white/[0.045] hover:text-white'
                      : 'border border-transparent text-black/70 hover:bg-black/[0.035] hover:text-black'
                }`}
              >
                <MessageSquare className="h-4 w-4 shrink-0 opacity-60" />
                <span className="min-w-0 flex-1 truncate">{chat.title}</span>
                <span className={`shrink-0 text-[10px] ${isDark ? 'text-white/35' : 'text-black/35'}`}>
                  {chat.timestamp ? new Date(chat.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                </span>
              </button>
              <button
                onClick={(e) => deleteChat(chat.id, e)}
                aria-label="Delete chat"
                className="absolute right-1 top-1/2 -translate-y-1/2 rounded-lg bg-red-500/10 p-1.5 text-red-400 opacity-0 transition group-hover:opacity-100"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}

          {filteredChats.length === 0 && (
            <div className={`px-4 py-10 text-center text-xs ${isDark ? 'text-white/35' : 'text-black/35'}`}>
              No chats found
            </div>
          )}
        </div>

        <div className={`border-t p-3 ${isDark ? 'border-white/[0.07]' : 'border-black/[0.07]'}`}>
          <button
            onClick={addFunds}
            className={`mb-3 flex w-full items-center gap-3 rounded-xl border p-3 text-left transition hover:-translate-y-0.5 ${
              isDark
                ? 'border-violet-400/20 bg-gradient-to-r from-violet-500/[0.08] to-blue-500/[0.04]'
                : 'border-violet-200 bg-violet-50'
            }`}
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-violet-500/15 text-violet-300">
              <Zap className="h-4 w-4" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-xs font-semibold">Upgrade to Pro</div>
              <div className={`truncate text-[10px] ${isDark ? 'text-white/40' : 'text-black/45'}`}>Unlock more models & features</div>
            </div>
          </button>

          <div className={`flex items-center gap-3 rounded-xl border p-3 ${isDark ? 'border-white/[0.07] bg-white/[0.02]' : 'border-black/[0.07] bg-black/[0.02]'}`}>
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 text-sm font-bold text-white">B</div>
            <div className="min-w-0 flex-1">
              <div className="truncate text-sm font-medium">Bhavyashree</div>
              <div className={`text-[10px] ${isDark ? 'text-white/40' : 'text-black/45'}`}>Free Plan</div>
            </div>
            <Settings className="h-4 w-4 text-white/40" />
          </div>
        </div>
      </aside>

      {/* ============================================================
          MAIN AREA
          ============================================================ */}
      <main className="relative flex min-w-0 flex-1 flex-col">
        {/* Top header */}
        <header className={`z-20 flex min-h-[76px] shrink-0 items-center gap-2 border-b px-3 sm:px-6 ${isDark ? 'border-white/[0.07] bg-[#090c13]/95' : 'border-black/[0.07] bg-white/95'} backdrop-blur-xl`}>
          <button
            onClick={() => setSidebarOpen(true)}
            className={`flex h-10 w-10 items-center justify-center rounded-xl p-2.5 transition lg:hidden ${isDark ? 'text-white/70 hover:bg-white/[0.06]' : 'text-black/65 hover:bg-black/[0.05]'}`}
          >
            <Menu className="h-5 w-5" />
          </button>

          <div className="flex min-w-0 items-center gap-3">
            <div className={`flex items-center gap-2.5 ${isDark ? 'text-white' : 'text-black'}`}>
              <AIOSLogo size={34} wordmark />
            </div>
            {currentChatId && (
              <div className={`hidden max-w-[280px] truncate border-l pl-3 text-sm sm:block ${isDark ? 'border-white/[0.10] text-white/45' : 'border-black/[0.09] text-black/45'}`}>
                {chats.find(c => c.id === currentChatId)?.title || 'New Chat'}
              </div>
            )}
          </div>

          <div className="ml-auto flex items-center gap-1.5 sm:gap-2">
            <button onClick={addFunds} className={`hidden items-center gap-2 rounded-xl border px-3 py-2 sm:flex ${isDark ? 'border-white/[0.09] bg-white/[0.025]' : 'border-black/[0.08] bg-white'}`}>
              <Wallet className="h-4 w-4 text-violet-400" />
              <span className="text-[11px] text-white/60">Wallet</span>
              <span className="text-sm font-semibold text-emerald-400">₹{walletBalance.toFixed(2)}</span>
            </button>

            <button title="Help" className={`rounded-xl p-2.5 ${isDark ? 'text-white/55 hover:bg-white/[0.05]' : 'text-black/50 hover:bg-black/[0.04]'}`}>
              <span className="flex h-4 w-4 items-center justify-center rounded-full border border-current text-[10px] font-bold">?</span>
            </button>

            <button onClick={() => setIsDark(!isDark)} title="Toggle theme" className={`rounded-xl p-2.5 ${isDark ? 'text-white/55 hover:bg-white/[0.05]' : 'text-black/50 hover:bg-black/[0.04]'}`}>
              {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>

            <div className="hidden h-8 w-px bg-white/[0.08] sm:block" />

            <div ref={exportMenuRef} className="relative">
              <button onClick={() => setShowExportMenu(!showExportMenu)} title="More" className={`rounded-xl p-2.5 ${isDark ? 'text-white/55 hover:bg-white/[0.05]' : 'text-black/50 hover:bg-black/[0.04]'}`}>
                <MoreVertical className="h-4 w-4" />
              </button>
              {showExportMenu && (
                <div className={`absolute right-0 top-12 z-[70] w-56 overflow-hidden rounded-2xl border p-1.5 shadow-2xl ${isDark ? 'border-white/[0.10] bg-[#171a22]' : 'border-black/[0.08] bg-white'}`}>
                  <div className={`px-3 py-2 text-xs ${isDark ? 'text-white/45' : 'text-black/45'}`}>Wallet balance <span className="float-right font-semibold text-emerald-500">₹{walletBalance.toFixed(2)}</span></div>
                  <button onClick={() => { addFunds(); setShowExportMenu(false) }} className="flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-left text-sm hover:bg-white/[0.06]"><Plus className="h-4 w-4" /> Add Funds</button>
                  <button onClick={() => exportChat('txt')} className="flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-left text-sm hover:bg-white/[0.06]"><Download className="h-4 w-4" /> Export as TXT</button>
                  <button onClick={() => exportChat('md')} className="flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-left text-sm hover:bg-white/[0.06]"><FileText className="h-4 w-4" /> Export as MD</button>
                  <button onClick={() => { handleClearChat(); setShowExportMenu(false) }} className="flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-left text-sm text-red-400 hover:bg-red-500/10"><Trash2 className="h-4 w-4" /> Clear Chat</button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* ============================================================
            CONTENT + RIGHT MODEL PANEL
            ============================================================ */}
        <div className="flex min-h-0 flex-1">
          <section className="relative flex min-w-0 flex-1 flex-col">
            <div className={`min-h-0 flex-1 overflow-y-auto ${isDark ? 'bg-[#090c13]' : 'bg-[#f7f8fb]'}`}>
              <div className="mx-auto w-full max-w-[900px] px-3 py-5 sm:px-6 sm:py-7">
                {messages.length === 0 ? (
                  <div className="flex min-h-[60vh] flex-col items-center justify-center px-3 text-center">
                    <div className={`mb-6 flex h-20 w-20 items-center justify-center rounded-[26px] border shadow-[0_0_60px_rgba(124,58,237,.14)] ${isDark ? 'border-violet-400/20 bg-white/[0.025]' : 'border-violet-200 bg-white'}`}><AIOSLogo size={54} /></div>
                    <h2 className="text-[28px] font-semibold tracking-[-0.025em] sm:text-[30px]">How can I help?</h2>
                    <p className={`mt-2 text-[15px] leading-6 ${isDark ? 'text-white/40' : 'text-black/45'}`}>Ask anything, analyze files, or explore ideas.</p>
                    <div className="mt-7 grid w-full max-w-2xl grid-cols-1 gap-2 sm:grid-cols-2">
                      {SUGGESTIONS.map((suggestion, i) => (
                        <button key={i} onClick={() => handleSuggestionClick(suggestion.prompt)} className={`flex items-center gap-3 rounded-2xl border p-4 text-left transition hover:-translate-y-0.5 ${isDark ? 'border-white/[0.08] bg-white/[0.025] hover:border-violet-400/25 hover:bg-white/[0.045]' : 'border-black/[0.08] bg-white hover:border-violet-300 hover:bg-violet-50/50'}`}>
                          <span className="text-lg">{suggestion.icon}</span>
                          <span className="text-sm font-medium">{suggestion.label}</span>
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
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.25 }}
                        className="mb-7 w-full"
                        onMouseEnter={() => setHoveredMessageId(msgId)}
                        onMouseLeave={() => setHoveredMessageId(null)}
                      >
                        {msg.replyTo && (
                          <div className={`mb-2 ml-auto flex max-w-[80%] items-center gap-1.5 text-[10px] ${isDark ? 'text-white/35' : 'text-black/40'}`}>
                            <Reply className="h-3 w-3" /> Replying to {msg.replyTo.role}: “{msg.replyTo.content}”
                          </div>
                        )}

                        {editingMessageIndex === i && msg.role === 'user' ? (
                          <div className="ml-auto flex max-w-[88%] flex-col gap-2">
                            <textarea value={editingText} onChange={(e) => setEditingText(e.target.value)} rows={3} className={`w-full resize-none rounded-2xl border p-4 text-sm outline-none focus:ring-2 focus:ring-violet-500/30 ${isDark ? 'border-white/[0.10] bg-white/[0.04] text-white' : 'border-black/[0.08] bg-white'}`} />
                            <div className="flex gap-2">
                              <button onClick={() => saveEditing(i)} className="rounded-xl bg-violet-600 px-3 py-2 text-xs font-semibold text-white">Save</button>
                              <button onClick={cancelEditing} className="rounded-xl bg-white/[0.06] px-3 py-2 text-xs">Cancel</button>
                            </div>
                          </div>
                        ) : (
                          <div className={isAI ? 'w-full' : 'flex justify-end'}>
                            <div className={isAI ? 'w-full' : 'max-w-[88%]'}>
                              {isAI ? (
                                <div className={`rounded-2xl border p-4 sm:p-5 ${isDark ? 'border-white/[0.11] bg-gradient-to-br from-[#151a22] to-[#11161e] shadow-[0_16px_45px_rgba(0,0,0,.16)]' : 'border-black/[0.08] bg-white shadow-[0_12px_35px_rgba(15,23,42,.06)]'}`}>
                                  <div className="mb-3 flex items-center gap-2.5">
                                    <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border ${isDark ? 'border-white/[0.08] bg-white/[0.035]' : 'border-black/[0.06] bg-black/[0.02]'}`}><AIOSLogo size={24} /></div>
                                    <span className="text-sm font-semibold">{msg.auto_mode ? 'AIOS · Auto' : (msg.model_used || 'AIOS Assistant')}</span>
                                    <span className={`text-[10px] ${isDark ? 'text-white/35' : 'text-black/35'}`}>{new Date(msg.timestamp || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                  </div>
                                  <div className={`prose prose-sm max-w-none leading-7 ${isDark ? 'prose-invert' : ''}`}>
                                    <MarkdownContent content={(isTyping && i === messages.length - 1 && isAI && !isStopped) ? (typingText || msg.content) : msg.content} />
                                  </div>
                                  {isTyping && i === messages.length - 1 && isAI && !isStopped && <span className="ml-0.5 animate-pulse">▍</span>}
                                </div>
                              ) : (
                                <div className="flex justify-end">
                                  <div className="rounded-2xl rounded-tr-md bg-gradient-to-br from-[#4c63ff] to-[#7951e8] px-4 py-3 text-[15px] leading-6 text-white shadow-[0_10px_30px_rgba(79,70,229,.18)]">
                                    <div className="whitespace-pre-wrap break-words">{msg.content}</div>
                                  </div>
                                </div>
                              )}

                              <div className={`group/actions mt-1.5 flex items-center gap-0.5 ${isAI ? '' : 'justify-end'} ${isDark ? 'text-white/35' : 'text-black/35'}`}>
                                <span className="text-[10px]">{new Date(msg.timestamp || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                <button onClick={() => copyMessage(msg.content, msgId)} title="Copy" className={`rounded-lg p-1.5 transition hover:bg-white/[0.06] ${isAI ? 'opacity-70 hover:opacity-100' : 'opacity-0 group-hover/actions:opacity-100 focus:opacity-100 max-sm:opacity-100'}`}>
                                  {copiedMessageId === msgId ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                                </button>
                                {msg.role === 'assistant' && (
                                  <>
                                    <button onClick={() => addReaction(i, 'like')} title="Like" className={`rounded-lg p-1.5 transition hover:bg-white/[0.06] ${isDark ? 'hover:text-white' : 'hover:text-black'}`}><ThumbsUp className="h-3.5 w-3.5" /></button>
                                    <button onClick={() => addReaction(i, 'dislike')} title="Dislike" className={`rounded-lg p-1.5 transition hover:bg-white/[0.06] ${isDark ? 'hover:text-white' : 'hover:text-black'}`}><ThumbsDown className="h-3.5 w-3.5" /></button>
                                    <button onClick={() => addReaction(i, 'heart')} title="Heart" className={`rounded-lg p-1.5 transition hover:bg-white/[0.06] ${isDark ? 'hover:text-white' : 'hover:text-black'}`}><Heart className="h-3.5 w-3.5" /></button>
                                    <button onClick={() => handleReplyClick(msg, i)} title="Reply" className={`rounded-lg p-1.5 transition hover:bg-white/[0.06] ${isDark ? 'hover:text-white' : 'hover:text-black'}`}><Reply className="h-3.5 w-3.5" /></button>
                                    <button onClick={() => regenerateResponse(i)} title="Regenerate" className={`rounded-lg p-1.5 transition hover:bg-white/[0.06] ${isDark ? 'hover:text-white' : 'hover:text-black'}`}><RotateCw className="h-3.5 w-3.5" /></button>
                                  </>
                                )}
                                {msg.role === 'user' && <button onClick={() => startEditing(msg, i)} title="Edit" className={`group/edit relative rounded-lg p-1.5 transition hover:bg-white/[0.06] ${isDark ? 'hover:text-white' : 'hover:text-black'} opacity-70 hover:opacity-100`}><Pencil className="h-3.5 w-3.5" /></button>}
                                {isAI && <button onClick={askAnotherAI} className="ml-1 rounded-lg bg-violet-500/10 px-2 py-1 text-[10px] font-medium text-violet-300 transition hover:bg-violet-500/15"><RefreshCw className="mr-1 inline h-3 w-3" />Ask Another AI</button>}
                              </div>
                            </div>
                          </div>
                        )}
                      </motion.div>
                    )
                  })
                )}

                {isLoading && (
                  <div className="mb-6 flex items-center gap-3 rounded-2xl border border-white/[0.09] bg-white/[0.025] px-4 py-3 text-xs text-white/45">
                    <div className="flex gap-1.5">
                      <span className="h-2 w-2 animate-bounce rounded-full bg-violet-400" />
                      <span className="h-2 w-2 animate-bounce rounded-full bg-blue-400 [animation-delay:150ms]" />
                      <span className="h-2 w-2 animate-bounce rounded-full bg-cyan-400 [animation-delay:300ms]" />
                    </div>
                    Generating response...
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            </div>

            {/* Reply bar */}
            {replyToMessage && (
              <div className={`border-t px-4 py-2.5 ${isDark ? 'border-white/[0.07] bg-[#0d1119]' : 'border-black/[0.07] bg-white'}`}>
                <div className="mx-auto flex max-w-[900px] items-center justify-between">
                  <div className="flex min-w-0 items-center gap-2 text-xs"><Reply className="h-4 w-4 shrink-0 text-violet-400" /><span className="truncate">Replying to {replyToMessage.role}: “{replyToMessage.content.slice(0, 70)}...”</span></div>
                  <button onClick={cancelReply} className="rounded-lg p-1 text-white/45 hover:bg-white/[0.05] hover:text-red-400"><X className="h-4 w-4" /></button>
                </div>
              </div>
            )}

            {/* Composer */}
            <div className={`shrink-0 border-t px-3 pb-[max(.75rem,env(safe-area-inset-bottom))] pt-3 sm:px-6 sm:pt-4 ${isDark ? 'border-white/[0.07] bg-[#090c13]/96' : 'border-black/[0.07] bg-white/96'} backdrop-blur-xl`}>
              <div className="mx-auto w-full max-w-[900px]">
                {/* Model selector — kept directly above the composer for a natural chat workflow */}
                <div className="relative mb-3 flex items-center justify-between">
                  <button
                    onClick={() => setShowModelPicker(!showModelPicker)}
                    aria-label="Choose AI model"
                    className={`group flex min-h-10 items-center gap-2.5 rounded-xl border px-3 py-2 text-sm font-medium shadow-sm transition-all duration-200 ${
                      showModelPicker
                        ? (isDark ? 'border-violet-400/35 bg-violet-500/[0.10] text-white shadow-[0_8px_25px_rgba(124,58,237,.12)]' : 'border-violet-300 bg-violet-50 text-black shadow-[0_8px_25px_rgba(124,58,237,.08)]')
                        : (isDark ? 'border-white/[0.09] bg-white/[0.025] text-white/80 hover:border-white/[0.16] hover:bg-white/[0.045]' : 'border-black/[0.08] bg-white text-black/75 hover:border-violet-200 hover:bg-violet-50/60')
                    }`}
                  >
                    <span className={`flex h-7 w-7 items-center justify-center rounded-lg border ${isDark ? 'border-white/[0.08] bg-white/[0.035]' : 'border-black/[0.06] bg-black/[0.02]'}`}><AIOSLogo size={22} /></span>
                    <span>{isAutoMode ? 'Auto' : (getAllModels().find(m => m.id === selectedModels[0])?.name || 'Choose model')}</span>
                    <ChevronDown className={`ml-0.5 h-4 w-4 transition-transform duration-200 ${showModelPicker ? 'rotate-180' : ''} ${isDark ? 'text-white/45' : 'text-black/40'}`} />
                  </button>
                </div>

                {uploadedFiles.length > 0 && (
                  <div className="mb-2 flex gap-2 overflow-x-auto pb-1">
                    {uploadedFiles.map((file, index) => (
                      <div key={index} className={`flex shrink-0 items-center gap-2 rounded-xl border px-2.5 py-2 text-xs ${isDark ? 'border-white/[0.09] bg-white/[0.025]' : 'border-black/[0.08] bg-white'}`}>
                        {file.type.startsWith('image/') && file.preview ? <img src={file.preview} alt={file.name} className="h-7 w-7 rounded-md object-cover" /> : <File className="h-4 w-4 opacity-60" />}
                        <span className="max-w-[120px] truncate">{file.name}</span>
                        <span className="text-[9px] opacity-40">{formatFileSize(file.size)}</span>
                        <button onClick={() => removeFile(index)} className="rounded p-0.5 opacity-60 hover:text-red-400"><X className="h-3.5 w-3.5" /></button>
                      </div>
                    ))}
                  </div>
                )}

                <div className={`relative rounded-2xl border p-2 shadow-[0_10px_35px_rgba(0,0,0,.12)] transition focus-within:border-violet-500/60 focus-within:ring-1 focus-within:ring-violet-500/20 ${isDark ? 'border-violet-400/35 bg-[#11151d]' : 'border-violet-300 bg-white'}`}>
                  <textarea
                    ref={messageInputRef}
                    id="message-input"
                    value={prompt}
                    onChange={(e) => { setPrompt(e.target.value); autoResizeTextarea(e.target) }}
                    onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSubmit() } }}
                    placeholder={replyToMessage ? `Reply to ${replyToMessage.role}...` : isListening ? 'Listening...' : 'Ask anything...'}
                    rows={1}
                    className={`min-h-[58px] max-h-[220px] w-full resize-none overflow-y-auto bg-transparent px-2 pb-16 pt-2.5 text-[15px] leading-6 outline-none ${isDark ? 'text-white placeholder:text-white/35' : 'text-black placeholder:text-black/35'}`}
                  />

                  {isListening && <div className="absolute left-4 top-4 flex items-center gap-1.5 text-[10px] font-semibold text-red-400"><span className="h-2 w-2 animate-pulse rounded-full bg-red-500" /> REC</div>}

                  <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between">
                    <div className="flex items-center gap-0.5 sm:gap-1">
                      <button onClick={() => fileInputRef.current?.click()} className={`flex items-center gap-1.5 rounded-xl px-2.5 py-2 text-xs ${isDark ? 'text-white/60 hover:bg-white/[0.05]' : 'text-black/60 hover:bg-black/[0.04]'}`}><Paperclip className="h-4 w-4" /><span className="hidden sm:inline">Attach</span></button>
                      <input ref={fileInputRef} type="file" onChange={handleFileUpload} className="hidden" accept=".txt,.pdf,.doc,.docx,.png,.jpg,.jpeg,.gif,.webp,.csv,.json,.xml,.md" />
                      <button onClick={() => fileInputRef.current?.click()} className={`hidden items-center gap-1.5 rounded-xl px-2.5 py-2 text-xs sm:flex ${isDark ? 'text-white/60 hover:bg-white/[0.05]' : 'text-black/60 hover:bg-black/[0.04]'}`}><Image className="h-4 w-4" /> Image</button>
                      <button onClick={() => fileInputRef.current?.click()} className={`hidden items-center gap-1.5 rounded-xl px-2.5 py-2 text-xs md:flex ${isDark ? 'text-white/60 hover:bg-white/[0.05]' : 'text-black/60 hover:bg-black/[0.04]'}`}><File className="h-4 w-4" /> File</button>
                      <button className={`hidden items-center gap-1.5 rounded-xl px-2.5 py-2 text-xs lg:flex ${isDark ? 'text-white/60 hover:bg-white/[0.05]' : 'text-black/60 hover:bg-black/[0.04]'}`}><Globe className="h-4 w-4" /> Web Search</button>
                    </div>

                    <div className="flex items-center gap-1">
                      <button onClick={toggleVoiceInput} title={isListening ? 'Stop voice input' : 'Voice input'} className={`rounded-xl p-2.5 transition ${isListening ? 'bg-red-500 text-white' : isDark ? 'text-white/60 hover:bg-white/[0.06]' : 'text-black/55 hover:bg-black/[0.04]'}`}>
                        {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                      </button>
                      {(isLoading || isTyping) ? (
                        <button onClick={stopGeneration} title="Stop generating" className="rounded-xl bg-red-500 p-2.5 text-white shadow-lg shadow-red-500/20 transition hover:bg-red-600"><Square className="h-4 w-4" /></button>
                      ) : (
                        <button onClick={handleSubmit} disabled={!prompt.trim() && uploadedFiles.length === 0} title="Send" className={`rounded-xl p-2.5 text-white transition ${prompt.trim() || uploadedFiles.length > 0 ? 'bg-gradient-to-r from-[#4d62ff] to-[#7a4de8] shadow-lg shadow-violet-500/20 hover:scale-[1.03]' : isDark ? 'bg-white/[0.07] text-white/30' : 'bg-black/[0.06] text-black/25'}`}><Send className="h-4 w-4" /></button>
                      )}
                    </div>
                  </div>
                </div>
                <div className={`mt-1.5 text-center text-[9px] ${isDark ? 'text-white/25' : 'text-black/30'}`}>AIOS may display inaccurate info. Please verify important details.</div>
              </div>
            </div>
          </section>

          {/* ========================================================
              RIGHT MODEL PANEL — opens from the header model button
              ======================================================== */}
          {showModelPicker && (
            <aside className={`hidden w-[318px] shrink-0 border-l xl:flex xl:flex-col ${isDark ? 'border-white/[0.08] bg-[#0b0e15]' : 'border-black/[0.08] bg-white'}`}>
              <div className="flex items-center justify-between border-b border-white/[0.07] px-5 py-4">
                <h2 className="text-[17px] font-medium">Models</h2>
                <button onClick={() => setShowModelPicker(false)} className="rounded-lg p-1.5 text-white/55 hover:bg-white/[0.05]"><X className="h-5 w-5" /></button>
              </div>

              <div className="px-4 pt-4">
                <div className={`relative rounded-xl border ${isDark ? 'border-white/[0.09] bg-white/[0.025]' : 'border-black/[0.08] bg-[#f7f8fb]'}`}>
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/35" />
                  <input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search models..." className={`h-10 w-full bg-transparent pl-9 pr-3 text-sm outline-none ${isDark ? 'text-white placeholder:text-white/35' : 'text-black placeholder:text-black/35'}`} />
                </div>

                <div className={`mt-3 grid grid-cols-4 rounded-xl p-1 ${isDark ? 'bg-white/[0.035]' : 'bg-black/[0.035]'}`}>
                  {['auto', 'free', 'paid'].map(tab => (
                    <button key={tab} onClick={() => tab !== 'custom' && setModelTab(tab)} className={`rounded-lg py-1.5 text-[11px] capitalize transition ${modelTab === tab ? 'bg-white/[0.10] font-medium shadow-sm' : 'text-white/45 hover:text-white/70'}`}>{tab === 'auto' ? 'Auto' : tab === 'paid' ? 'Pro' : 'Free'}</button>
                  ))}
                </div>
              </div>

              <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4">
                <div className={`mb-2 text-[10px] font-semibold uppercase tracking-widest ${isDark ? 'text-white/35' : 'text-black/35'}`}>Auto</div>
                <button onClick={handleAutoSelect} className={`mb-4 flex w-full items-center gap-3 rounded-xl border p-3 text-left transition ${isAutoMode ? isDark ? 'border-violet-400/20 bg-violet-500/[0.08]' : 'border-violet-300 bg-violet-50' : isDark ? 'border-white/[0.07] bg-white/[0.025] hover:bg-white/[0.045]' : 'border-black/[0.07] bg-white hover:bg-black/[0.025]'}`}>
                  <span className={`flex h-9 w-9 items-center justify-center rounded-xl border ${isDark ? 'border-white/[0.08] bg-white/[0.035]' : 'border-black/[0.06] bg-black/[0.02]'}`}><AIOSLogo size={27} /></span>
                  <div className="min-w-0 flex-1"><div className="text-sm font-medium">Auto</div><div className="text-[10px] opacity-40">AIOS chooses the best available model</div></div>
                  {isAutoMode && <Check className="h-4 w-4 text-violet-400" />}
                </button>

                <div className={`mb-2 text-[10px] font-semibold uppercase tracking-widest ${isDark ? 'text-white/35' : 'text-black/35'}`}>Free Models</div>
                <div className="space-y-1.5">
                  {getCurrentModels().filter(m => m.tier === 'free').map(model => {
                    const selected = selectedModels.includes(model.id)
                    return (
                      <button key={model.id} onClick={() => { setIsAutoMode(false); setSelectedModels([model.id]); setModelTab('free'); setShowModelPicker(false) }} className={`flex w-full items-center gap-3 rounded-xl p-2.5 text-left transition ${selected ? isDark ? 'bg-white/[0.06]' : 'bg-black/[0.035]' : 'hover:bg-white/[0.04]'}`}>
                        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500/20 to-violet-500/10 text-sm">{model.icon}</span>
                        <div className="min-w-0 flex-1"><div className="truncate text-sm font-medium">{model.name}</div><div className="truncate text-[10px] opacity-40">{model.id.includes('qwen') ? 'Very fast responses' : model.id.includes('ministral') ? 'Good for most tasks' : model.id.includes('mistral') ? 'Balanced performance' : model.id.includes('deepseek') ? 'Advanced reasoning' : 'Fast & smart'}</div></div>
                        {selected && <Check className="h-4 w-4 text-violet-400" />}
                      </button>
                    )
                  })}
                </div>

                <div className={`mb-2 mt-5 text-[10px] font-semibold uppercase tracking-widest ${isDark ? 'text-white/35' : 'text-black/35'}`}>Pro Models</div>
                <div className="space-y-1.5">
                  {getCurrentModels().filter(m => m.tier === 'pro').map(model => {
                    const selected = selectedModels.includes(model.id)
                    return (
                      <button key={model.id} onClick={() => { setIsAutoMode(false); toggleModel(model.id) }} className={`flex w-full items-center gap-3 rounded-xl p-2.5 text-left transition ${selected ? isDark ? 'bg-white/[0.06]' : 'bg-black/[0.035]' : 'hover:bg-white/[0.04]'}`}>
                        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-orange-500/15 to-violet-500/10 text-sm">{model.icon}</span>
                        <div className="min-w-0 flex-1"><div className="truncate text-sm font-medium">{model.name}</div><div className="truncate text-[10px] opacity-40">Most powerful AI model</div></div>
                        <span className="rounded-md border border-violet-400/25 px-1.5 py-0.5 text-[9px] text-violet-300">Pro</span>
                        {selected && <Check className="h-4 w-4 text-violet-400" />}
                      </button>
                    )
                  })}
                </div>
              </div>

              <div className={`m-3 rounded-2xl border p-4 ${isDark ? 'border-white/[0.08] bg-white/[0.025]' : 'border-black/[0.08] bg-white'}`}>
                <div className="mb-4 text-xs font-medium">Current selection</div>
                <div className="flex items-center gap-3">
                  <span className={`flex h-10 w-10 items-center justify-center rounded-xl border ${isDark ? 'border-white/[0.08] bg-white/[0.035]' : 'border-black/[0.06] bg-black/[0.02]'}`}><AIOSLogo size={30} /></span>
                  <div className="min-w-0 flex-1"><div className="truncate text-sm font-medium">{isAutoMode ? 'Auto' : (getAllModels().find(m => m.id === selectedModels[0])?.name || 'Choose model')}</div><div className="text-[10px] opacity-40">{isAutoMode ? 'AIOS chooses the best model' : 'Selected model'}</div></div>
                  <button onClick={() => setShowModelPicker(false)} className="rounded-xl border border-white/[0.08] px-3 py-2 text-xs">Change</button>
                </div>
                <div className="mt-4 grid grid-cols-3 gap-2 border-t border-white/[0.07] pt-3">
                  <div><div className="text-[10px] opacity-45">Speed</div><div className="mt-1 text-sm">⚡⚡⚡</div></div>
                  <div><div className="text-[10px] opacity-45">Intelligence</div><div className="mt-1 text-sm">★★★★★</div></div>
                  <div><div className="text-[10px] opacity-45">Cost</div><div className="mt-1 text-xs font-semibold text-emerald-400">FREE</div></div>
                </div>
              </div>
            </aside>
          )}
        </div>
      </main>

      {/* Mobile model picker */}
      {showModelPicker && (
        <div className="fixed inset-0 z-[60] flex items-end bg-black/60 backdrop-blur-sm xl:hidden" onClick={() => setShowModelPicker(false)}>
          <div onClick={(e) => e.stopPropagation()} className={`max-h-[82dvh] w-full overflow-hidden rounded-t-3xl border-t p-4 shadow-2xl ${isDark ? 'border-white/[0.10] bg-[#10141c]' : 'border-black/[0.08] bg-white'}`}>
            <div className="mb-3 flex items-center justify-between"><div><h2 className="text-base font-semibold">Choose a model</h2><p className={`mt-0.5 text-[10px] ${isDark ? 'text-white/40' : 'text-black/40'}`}>Auto is recommended for most requests</p></div><button onClick={() => setShowModelPicker(false)} className={`rounded-xl p-2 ${isDark ? 'hover:bg-white/[0.06]' : 'hover:bg-black/[0.05]'}`}><X className="h-5 w-5 opacity-60" /></button></div>
            <div className="mb-3 flex gap-1 overflow-x-auto">
              {['auto', 'free', 'paid'].map(tab => <button key={tab} onClick={() => setModelTab(tab)} className={`rounded-xl px-4 py-2 text-xs font-medium capitalize transition ${modelTab === tab ? 'bg-violet-600 text-white shadow-sm' : isDark ? 'text-white/50 hover:bg-white/[0.05] hover:text-white/80' : 'text-black/50 hover:bg-black/[0.04] hover:text-black/80'}`}>{tab === 'auto' ? 'Auto' : tab === 'free' ? 'Free' : 'Pro'}</button>)}
            </div>
            <div className="max-h-[60dvh] overflow-y-auto space-y-1.5">
              {modelTab === 'auto' ? (
                <button onClick={handleAutoSelect} className={`mb-2 flex w-full items-center gap-3 rounded-2xl border p-3.5 text-left transition ${isAutoMode ? (isDark ? 'border-violet-400/30 bg-violet-500/[0.10]' : 'border-violet-300 bg-violet-50') : (isDark ? 'border-white/[0.08] bg-white/[0.025]' : 'border-black/[0.08] bg-white')}`}>
                  <span className={`flex h-9 w-9 items-center justify-center rounded-xl border ${isDark ? 'border-white/[0.08] bg-white/[0.035]' : 'border-black/[0.06] bg-black/[0.02]'}`}><AIOSLogo size={27} /></span>
                  <span className="min-w-0 flex-1"><span className="block text-sm font-semibold">Auto</span><span className={`block text-[10px] ${isDark ? 'text-white/40' : 'text-black/40'}`}>AIOS chooses the best available model</span></span>
                  {isAutoMode && <Check className="h-4 w-4 text-violet-400" />}
                </button>
              ) : null}
              {getCurrentModels().filter(model => modelTab === 'auto' ? model.tier === 'free' : true).map(model => <button key={model.id} onClick={() => { setIsAutoMode(false); setSelectedModels([model.id]); setShowModelPicker(false) }} className={`flex w-full items-center gap-3 rounded-2xl p-3 text-left transition ${selectedModels.includes(model.id) && !isAutoMode ? (isDark ? 'bg-white/[0.06]' : 'bg-black/[0.035]') : isDark ? 'hover:bg-white/[0.05]' : 'hover:bg-black/[0.035]'}`}><span className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-500/10 text-lg">{model.icon}</span><span className="flex-1 truncate text-sm">{model.name}</span>{model.tier === 'pro' && <span className="rounded-md border border-violet-400/25 px-1.5 py-0.5 text-[9px] text-violet-400">Pro</span>}{selectedModels.includes(model.id) && !isAutoMode && <Check className="h-4 w-4 text-violet-400" />}</button>)}
            </div>
          </div>
        </div>
      )}

      <style>{`
        ::-webkit-scrollbar { width: 5px; height: 5px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(127,127,127,.25); border-radius: 999px; }
        ::-webkit-scrollbar-thumb:hover { background: rgba(127,127,127,.4); }
        .prose pre { background: transparent !important; padding: 0 !important; margin: 0.75rem 0 !important; }
        .prose code { font-size: .875em; }
        .prose p { margin-top: .35rem; margin-bottom: .75rem; }
        .prose p:last-child { margin-bottom: 0; }
        textarea { scrollbar-width: thin; }
        button, a { -webkit-tap-highlight-color: transparent; }
        @media (prefers-reduced-motion: no-preference) {
          .aios-smooth { transition-timing-function: cubic-bezier(.22,1,.36,1); }
        }
      `}</style>
    </div>
  )
}