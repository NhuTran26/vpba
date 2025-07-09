import { Authenticator } from '@aws-amplify/ui-react'
import '@aws-amplify/ui-react/styles.css'
import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'

const Login: React.FC = () => {
  const { isAuthenticated } = useAuthStore()
  const navigate = useNavigate()

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/chat')
    }
  }, [isAuthenticated, navigate])

  if (isAuthenticated) return null

  return (
    <div className="min-h-screen flex items-center justify-center font-sans bg-gradient-to-br from-green-700 to-blue-900">
      <div className="max-w-md w-full space-y-8 p-8">
        <Authenticator />
      </div>
    </div>
  )
}

export default Login