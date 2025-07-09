import { create } from 'zustand'
import axios from 'axios'
import { useAuthStore } from './authStore'

export interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

export interface ChatSession {
  id: string
  title: string
  messages: Message[]
  createdAt: Date
}

interface ChatState {
  currentChatId: string | null
  chatSessions: ChatSession[]
  isLoading: boolean
  isDarkMode: boolean
  createNewChat: () => string
  sendMessage: (message: string) => Promise<void>
  setCurrentChat: (chatId: string) => void
  toggleDarkMode: () => void
  getCurrentChat: () => ChatSession | null
}

export const useChatStore = create<ChatState>((set, get) => ({
  currentChatId: null,
  chatSessions: [
    {
      id: '1',
      title: 'Create Html Game Environment...',
      messages: [],
      createdAt: new Date(Date.now() - 86400000) // Yesterday
    },
    {
      id: '2',
      title: 'Apply To Leave For Emergency',
      messages: [],
      createdAt: new Date(Date.now() - 172800000) // 2 days ago
    },
    {
      id: '3',
      title: 'What Is UI UX Design?',
      messages: [],
      createdAt: new Date(Date.now() - 259200000) // 3 days ago
    },
    {
      id: '4',
      title: 'Create POS System',
      messages: [],
      createdAt: new Date(Date.now() - 345600000) // 4 days ago
    },
    {
      id: '5',
      title: 'What Is UX Audit?',
      messages: [],
      createdAt: new Date(Date.now() - 432000000) // 5 days ago
    },
    {
      id: '6',
      title: 'Create Chatbot GPT...',
      messages: [],
      createdAt: new Date(Date.now() - 518400000) // 6 days ago
    },
    {
      id: '7',
      title: 'How Chat GPT Work?',
      messages: [],
      createdAt: new Date(Date.now() - 604800000) // 7 days ago
    }
  ],
  isLoading: false,
  isDarkMode: false,

  createNewChat: () => {
    const newChatId = Date.now().toString()
    const newChat: ChatSession = {
      id: newChatId,
      title: 'New Chat',
      messages: [],
      createdAt: new Date()
    }
    
    set((state) => ({
      chatSessions: [newChat, ...state.chatSessions],
      currentChatId: newChatId
    }))
    
    return newChatId
  },

  sendMessage: async (message: string) => {
    const state = get()
    let chatId = state.currentChatId
    
    // Create new chat if none exists
    if (!chatId) {
      chatId = get().createNewChat()
    }
    
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: message,
      timestamp: new Date()
    }
    
    // Add user message
    set((state) => ({
      chatSessions: state.chatSessions.map(chat => 
        chat.id === chatId 
          ? { 
              ...chat, 
              messages: [...chat.messages, userMessage],
              title: chat.title === 'New Chat' ? message.slice(0, 30) + '...' : chat.title
            }
          : chat
      ),
      isLoading: true
    }))
    
    try {
      // Call backend API with Cognito JWT
      const jwt = useAuthStore.getState().user?.jwt
      const response = await axios.post('http://localhost:3001/api/chat', {
        message: message,
        sessionId: chatId
      }, {
        headers: jwt ? { Authorization: `Bearer ${jwt}` } : {}
      })
      
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response.data.response || 'No response from assistant.',
        timestamp: new Date()
      }
      
      set((state) => ({
        chatSessions: state.chatSessions.map(chat => 
          chat.id === chatId 
            ? { ...chat, messages: [...chat.messages, assistantMessage] }
            : chat
        ),
        isLoading: false
      }))
      
    } catch (error) {
      console.error('Error sending message:', error)
      
      // Add error message
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Sorry, I encountered an error while processing your message. Please try again.',
        timestamp: new Date()
      }
      
      set((state) => ({
        chatSessions: state.chatSessions.map(chat => 
          chat.id === chatId 
            ? { ...chat, messages: [...chat.messages, errorMessage] }
            : chat
        ),
        isLoading: false
      }))
    }
  },

  setCurrentChat: (chatId: string) => {
    set({ currentChatId: chatId })
  },

  toggleDarkMode: () => {
    set((state) => {
      const newDarkMode = !state.isDarkMode
      if (newDarkMode) {
        document.documentElement.classList.add('dark')
      } else {
        document.documentElement.classList.remove('dark')
      }
      return { isDarkMode: newDarkMode }
    })
  },

  getCurrentChat: () => {
    const state = get()
    return state.chatSessions.find(chat => chat.id === state.currentChatId) || null
  }
}))