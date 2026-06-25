import { createContext, useContext, useEffect, useState } from 'react'
import { auth, db } from '../firebase'
import {
  RecaptchaVerifier, signInWithPhoneNumber, signOut, onAuthStateChanged
} from 'firebase/auth'
import { doc, getDoc } from 'firebase/firestore'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [confirmationResult, setConfirmationResult] = useState(null)

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      setUser(u)
      if (u) {
        const snap = await getDoc(doc(db, 'users', u.uid))
        setProfile(snap.exists() ? snap.data() : null)
      } else {
        setProfile(null)
      }
      setLoading(false)
    })
    return unsub
  }, [])

  async function setupRecaptcha(containerId) {
    if (!window.recaptchaVerifier) {
      window.recaptchaVerifier = new RecaptchaVerifier(auth, containerId, {
        size: 'invisible',
        callback: () => {},
        'expired-callback': () => { window.recaptchaVerifier = null }
      })
    }
    return window.recaptchaVerifier
  }

  async function sendOtp(phone) {
    const verifier = await setupRecaptcha('recaptcha-container')
    const result = await signInWithPhoneNumber(auth, phone, verifier)
    setConfirmationResult(result)
    return result
  }

  async function verifyOtp(otp) {
    if (!confirmationResult) throw new Error('No OTP sent yet')
    const credential = await confirmationResult.confirm(otp)
    return credential
  }

  async function logout() {
    await signOut(auth)
    window.recaptchaVerifier = null
  }

  function refreshProfile() {
    if (!user) return
    getDoc(doc(db, 'users', user.uid)).then(snap => {
      setProfile(snap.exists() ? snap.data() : null)
    })
  }

  return (
    <AuthContext.Provider value={{ user, profile, loading, sendOtp, verifyOtp, logout, refreshProfile }}>
      {children}
      <div id="recaptcha-container" />
    </AuthContext.Provider>
  )
}

export function useAuth() { return useContext(AuthContext) }
