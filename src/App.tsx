import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import Login from './pages/Login'
import Chat from './pages/Chat'
import AuthGuard from './components/AuthGuard'

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-white dark:bg-gray-900">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route 
            path="/chat" 
            element={
              <AuthGuard>
                <Chat />
              </AuthGuard>
            } 
          />
          <Route path="/" element={<Navigate to="/login" replace />} />
        </Routes>
        <Toaster
          position="top-center"
          toastOptions={{
            duration: 3000,
            style: {
              background: '#363636',
              color: '#fff',
            },
          }}
        />
      </div>
    </Router>
  )
}

export default App