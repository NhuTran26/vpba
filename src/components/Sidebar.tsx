import { Plus } from 'lucide-react'
import { useChatStore } from '../store/chatStore'
import { useAuthStore } from '../store/authStore'
// @ts-ignore
import vpbankLogo from '../assets/VPBank_logo.png'
// @ts-ignore
import userLogo from '../assets/logo.jpg'
import { useRef, useState } from 'react'

const Sidebar: React.FC = () => {
  const {
    chatSessions,
    currentChatId,
    createNewChat,
    setCurrentChat
  } = useChatStore()
  
  const { user, logout } = useAuthStore()
  const [popoverOpen, setPopoverOpen] = useState(false)
  const profileRef = useRef(null)

  const handleNewChat = () => {
    createNewChat()
  }

  const handleProfileClick = () => {
    setPopoverOpen((open) => !open)
  }

  const handleProfileBlur = (e: React.FocusEvent<HTMLDivElement>) => {
    // Close popover if focus leaves the profile area
    if (!e.currentTarget.contains(e.relatedTarget)) {
      setPopoverOpen(false)
    }
  }

  return (
    <div className="w-60 bg-black/60 h-screen flex flex-col border-r border-white/20">
      {/* Header */}
      <div className="p-4 border-b border-white/20 flex items-center justify-center">
        <a href="https://www.vpbank.com.vn/ca-nhan" target="_blank" rel="noopener noreferrer">
          <img src={vpbankLogo} alt="VPBank Logo" className="h-10 object-contain cursor-pointer" />
        </a>
      </div>

      {/* New Chat Button */}
      <div className="p-4">
        <button
          onClick={handleNewChat}
          className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg shadow-lg transition-colors border border-white/20"
        >
          <Plus size={16} />
          New chat
        </button>
      </div>

      {/* Chat Sessions */}
      <div className="flex-1 overflow-y-auto px-4">
        <div className="space-y-1">
          <h2 className="text-sm font-medium text-white mb-2">
            Your conversations
          </h2>
          {chatSessions.map((chat) => (
            <button
              key={chat.id}
              onClick={() => setCurrentChat(chat.id)}
              className={`w-full text-left p-2 rounded-lg transition-colors ${
                currentChatId === chat.id
                  ? 'bg-white/20'
                  : 'hover:bg-white/10'
              }`}
            >
              <div className="text-sm font-medium text-white truncate">
                {chat.title}
              </div>
              <div className="text-xs text-white/70">
                {chat.createdAt.toLocaleDateString()}
              </div>
            </button>
          ))}
        </div>
        
        {/* Time sections */}
        <div className="mt-6 space-y-2">
          <h3 className="text-xs font-medium text-white/70">Last 7 Days</h3>
          <div className="text-xs text-white/70 pl-2">
            {chatSessions.slice(0, 7).map(chat => (
              <div key={chat.id} className="truncate py-1">
                {chat.title}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Section */}
      <div className="p-4 border-t border-white/20">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full overflow-hidden flex items-center justify-center bg-white">
            <img src={userLogo} alt="User Logo" className="w-8 h-8 object-cover" />
          </div>
          <div
            className="flex-1 min-w-0 cursor-pointer relative group"
            tabIndex={0}
            ref={profileRef}
            onClick={handleProfileClick}
            onBlur={handleProfileBlur}
          >
            <div className="text-sm font-medium text-white truncate">
              {user?.email || 'andrew.neilson@vpbank.com.vn'}
            </div>
            <div className="text-xs text-white/70 truncate">Banker</div>
            {popoverOpen && (
              <div className="absolute left-0 bottom-full mb-2 w-48 bg-white rounded-xl shadow-lg z-50 py-2 text-gray-800 border border-gray-200">
                <button className="block w-full text-left px-4 py-2 hover:bg-gray-100">My Profile</button>
                <button className="block w-full text-left px-4 py-2 hover:bg-gray-100">Settings</button>
                <button className="block w-full text-left px-4 py-2 hover:bg-gray-100">Languages</button>
                <button className="block w-full text-left px-4 py-2 hover:bg-gray-100 text-red-500" onClick={logout}>Log out</button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Sidebar