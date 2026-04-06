import { createContext, useContext, useState, useEffect } from 'react'
import { api } from '../services/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('access_token')
    const userData = localStorage.getItem('user_data')
    if (token && userData) {
      setUser(JSON.parse(userData))
    }
    setLoading(false)
  }, [])

  const signUp = async (email, password, fullName) => {
    const res = await api.signUp({ email, password, full_name: fullName })
    localStorage.setItem('access_token', res.access_token)
    localStorage.setItem('user_data', JSON.stringify(res))
    setUser(res)
    return res
  }

  const signIn = async (email, password) => {
    const res = await api.signIn({ email, password })
    localStorage.setItem('access_token', res.access_token)
    localStorage.setItem('user_data', JSON.stringify(res))
    setUser(res)
    return res
  }

  const signOut = () => {
    localStorage.removeItem('access_token')
    localStorage.removeItem('user_data')
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, loading, signUp, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within AuthProvider')
  return context
}
