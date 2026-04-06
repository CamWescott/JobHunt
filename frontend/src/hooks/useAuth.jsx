import { createContext, useContext, useState, useEffect } from 'react'
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
  updateProfile,
} from 'firebase/auth'
import { auth } from '../services/firebase'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const token = await firebaseUser.getIdToken()
        setUser({
          user_id: firebaseUser.uid,
          email: firebaseUser.email,
          displayName: firebaseUser.displayName,
          token,
        })
      } else {
        setUser(null)
      }
      setLoading(false)
    })

    return unsubscribe
  }, [])

  const signUp = async (email, password, fullName) => {
    const cred = await createUserWithEmailAndPassword(auth, email, password)
    if (fullName) {
      await updateProfile(cred.user, { displayName: fullName })
    }
    const token = await cred.user.getIdToken()
    setUser({
      user_id: cred.user.uid,
      email: cred.user.email,
      displayName: fullName || cred.user.displayName,
      token,
    })
  }

  const signIn = async (email, password) => {
    const cred = await signInWithEmailAndPassword(auth, email, password)
    const token = await cred.user.getIdToken()
    setUser({
      user_id: cred.user.uid,
      email: cred.user.email,
      displayName: cred.user.displayName,
      token,
    })
  }

  const signInWithGoogle = async () => {
    const provider = new GoogleAuthProvider()
    const cred = await signInWithPopup(auth, provider)
    const token = await cred.user.getIdToken()
    setUser({
      user_id: cred.user.uid,
      email: cred.user.email,
      displayName: cred.user.displayName,
      token,
    })
  }

  const signOut = async () => {
    await firebaseSignOut(auth)
    setUser(null)
  }

  // Refresh token periodically (Firebase tokens expire after 1 hour)
  useEffect(() => {
    if (!user) return
    const interval = setInterval(async () => {
      const currentUser = auth.currentUser
      if (currentUser) {
        const token = await currentUser.getIdToken(true)
        setUser((prev) => (prev ? { ...prev, token } : null))
      }
    }, 10 * 60 * 1000) // Refresh every 10 minutes

    return () => clearInterval(interval)
  }, [user])

  return (
    <AuthContext.Provider value={{ user, loading, signUp, signIn, signInWithGoogle, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within AuthProvider')
  return context
}
