import { useState, useEffect, useRef } from 'react'
import { Send, Loader2 } from 'lucide-react'
import Sidebar from '../components/Sidebar'
import ChatMessage from '../components/ChatMessage'
import { useChatStore } from '../store/chatStore'
// @ts-ignore
import chatBg from '../assets/background.jpg'

const Chat: React.FC = () => {
  const [inputMessage, setInputMessage] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  
  const {
    getCurrentChat,
    sendMessage,
    isLoading,
  } = useChatStore()

  const currentChat = getCurrentChat()

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [currentChat?.messages])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!inputMessage.trim() || isLoading) return

    const message = inputMessage.trim()
    setInputMessage('')
    
    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
    }
    
    await sendMessage(message)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e as any)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputMessage(e.target.value)
    
    // Auto-resize textarea
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`
    }
  }

  return (
    <div
      className="flex h-screen font-sans"
      style={{
        fontFamily: "'Lexend', 'Prompt', sans-serif",
        backgroundImage: `url(${chatBg})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }}
    >
      <Sidebar />
      <div className="flex-1 flex flex-col items-center justify-center p-4">
        <div className="w-full flex flex-col h-[90vh] bg-black/60 rounded-2xl shadow-xl overflow-hidden">
          {/* Header */}
          <div className="border-b border-gray-200 dark:border-gray-700 p-6 bg-transparent">
            <h1 className="text-2xl font-bold text-white tracking-tight">
              {currentChat?.title || 'Select a chat or start a new one'}
            </h1>
          </div>
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-8 space-y-6 bg-transparent text-white">
            {currentChat?.messages.length === 0 ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <div className="text-5xl mb-4">🤖</div>
                  <h2 className="text-2xl font-semibold text-white mb-2">
                    How can I help you today?
                  </h2>
                  <p className="text-white/80">
                    Ask me anything and I'll do my best to help you.
                  </p>
                </div>
              </div>
            ) : (
              <>
                {currentChat?.messages.map((message) => (
                  <ChatMessage key={message.id} message={message} />
                ))}
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="max-w-[70%]">
                      <div className="bg-white/20 rounded-lg px-4 py-2 flex items-center gap-2">
                        <Loader2 size={16} className="animate-spin text-white/80" />
                        <span className="text-sm text-white/80">
                          Thinking...
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
            <div ref={messagesEndRef} />
          </div>
          {/* Input */}
          <div className="border-t border-gray-200 dark:border-gray-700 p-6 bg-transparent">
            <form onSubmit={handleSubmit} className="flex gap-3">
              <div className="flex-1 relative">
                <textarea
                  ref={textareaRef}
                  value={inputMessage}
                  onChange={handleInputChange}
                  onKeyDown={handleKeyDown}
                  placeholder="What's in your mind?..."
                  className="w-full px-5 py-3 pr-14 border border-white/30 rounded-xl bg-black/40 text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-green-400 resize-none min-h-[48px] max-h-40 shadow-sm transition-all"
                  rows={1}
                />
                <button
                  type="submit"
                  disabled={!inputMessage.trim() || isLoading}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 p-2 text-white hover:text-green-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isLoading ? (
                    <Loader2 size={20} className="animate-spin text-white" />
                  ) : (
                    <Send size={20} />
                  )}
                </button>
              </div>
            </form>
            <div className="text-xs text-white/80 mt-3 text-center">
              Press Enter to send, Shift+Enter for new line
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Chat