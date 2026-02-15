import { useState, useEffect, createContext, useContext } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'sonner'
import LoginPage from './pages/LoginPage'
import HomePage from './pages/HomePage'
import MyTeamsPage from './pages/MyTeamsPage'
import LeaderboardPage from './pages/LeaderboardPage'
import RulesPage from './pages/RulesPage'
import HistoryPage from './pages/HistoryPage'
import AdminPage from './pages/AdminPage'
import Layout from './components/Layout'
import './App.css'

// In production on Vercel, frontend and API are on the same domain — no env var needed.
// For local dev, set VITE_BACKEND_URL=http://localhost:8000 in frontend/.env.local
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || ''
export const API = `${BACKEND_URL}/api`

export const AuthContext = createContext(null)
export function useAuth() { return useContext(AuthContext) }

function App() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const stored = localStorage.getItem('ff_user')
    if (stored) {
      try { setUser(JSON.parse(stored)) } catch { /* ignore */ }
    }
    setLoading(false)
  }, [])

  const login = (u) => { setUser(u); localStorage.setItem('ff_user', JSON.stringify(u)) }
  const logout = () => { setUser(null); localStorage.removeItem('ff_user') }
  const updateUser = (u) => { setUser(u); localStorage.setItem('ff_user', JSON.stringify(u)) }

  if (loading) return null

  return (
    <AuthContext.Provider value={{ user, login, logout, updateUser }}>
      <Toaster theme="light" position="top-center" richColors />
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={user ? <Navigate to="/home" /> : <LoginPage />} />
          <Route path="/" element={user ? <Navigate to="/home" /> : <Navigate to="/login" />} />
          <Route element={user ? <Layout /> : <Navigate to="/login" />}>
            <Route path="/home" element={<HomePage />} />
            <Route path="/teams" element={<MyTeamsPage />} />
            <Route path="/leaderboard" element={<LeaderboardPage />} />
            <Route path="/rules" element={<RulesPage />} />
            <Route path="/legacy" element={<HistoryPage />} />
            <Route path="/history" element={<Navigate to="/legacy" />} />
            {user?.is_admin && <Route path="/admin" element={<AdminPage />} />}
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthContext.Provider>
  )
}

export default App
