import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-hot-toast'
import { useAuthStore } from '../store/authStore'
// @ts-ignore
import vpbankLogoWhite from '../assets/cropped-VPBank_logo_white.avif'
// @ts-ignore
import bgImage from '../assets/background.avif'

const Login: React.FC = () => {
  const [email, setEmail] = useState('admin@gmail.com')
  const [password, setPassword] = useState('123456')
  const [isLoading, setIsLoading] = useState(false)
  
  const { login, isAuthenticated } = useAuthStore()
  const navigate = useNavigate()

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/chat')
    }
  }, [isAuthenticated, navigate])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const success = login(email, password)
      if (success) {
        toast.success('Đăng nhập thành công!')
        navigate('/chat')
      } else {
        toast.error('Sai thông tin đăng nhập')
      }
    } catch (error) {
      toast.error('Đã xảy ra lỗi khi đăng nhập')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center font-sans"
      style={{
        fontFamily: "'Lexend', 'Prompt', sans-serif",
        backgroundImage: `url(${bgImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }}
    >
      <div className="max-w-md w-full space-y-8 p-8">
        <div className="text-center">
          <img src={vpbankLogoWhite} alt="VPBank Logo" className="object-contain" />
        </div>
        <div className="bg-white/90 dark:bg-gray-800/90 rounded-2xl shadow-2xl p-8">
          <h2 className="mt-4 text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight mb-6 text-center">
              Đăng nhập
          </h2>
          <form onSubmit={handleSubmit} className="space-y-7">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="mt-2 block w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl shadow-sm placeholder-gray-400 dark:placeholder-gray-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base transition-all"
                placeholder="Nhập email của bạn"
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Mật khẩu
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="mt-2 block w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl shadow-sm placeholder-gray-400 dark:placeholder-gray-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base transition-all"
                placeholder="Nhập mật khẩu"
              />
            </div>
            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-md text-base font-semibold text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                style={{
                  fontFamily: "'Lexend', 'Prompt', sans-serif",
                  backgroundImage: `url(${bgImage})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  backgroundRepeat: 'no-repeat',
                }}
              >
                {isLoading ? 'Đang đăng nhập...' : 'Đăng nhập'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default Login