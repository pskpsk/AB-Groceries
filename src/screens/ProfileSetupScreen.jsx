import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { db } from '../firebase'
import { doc, setDoc } from 'firebase/firestore'
import { User, Mail, CheckCircle } from 'lucide-react'

export default function ProfileSetupScreen() {
  const { user, refreshProfile } = useAuth()
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    if (!name.trim()) { setError('Name is required'); return }
    setLoading(true)
    try {
      await setDoc(doc(db, 'users', user.uid), {
        name: name.trim(), email: email.trim(),
        phone: user.phoneNumber, isAdmin: false, createdAt: Date.now(),
      })
      refreshProfile()
      navigate('/', { replace: true })
    } catch { setError('Failed to save profile. Try again.') }
    finally { setLoading(false) }
  }

  return (
    <div className="min-h-screen bg-surface-soft flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 rounded-full bg-primary-container flex items-center justify-center mb-3">
            <User size={32} className="text-primary" />
          </div>
          <h1 className="text-xl font-bold text-gray-900">Complete Your Profile</h1>
          <p className="text-sm text-text-secondary mt-1">Just a few details to get started</p>
        </div>
        <div className="bg-white rounded-3xl shadow-sm p-6">
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label className="text-xs font-semibold text-text-secondary uppercase tracking-wide mb-1.5 block">Full Name *</label>
              <div className="flex items-center border-2 border-gray-200 rounded-xl focus-within:border-primary transition-colors">
                <div className="px-3 py-3 border-r border-gray-200"><User size={16} className="text-text-secondary" /></div>
                <input type="text" value={name} onChange={e => setName(e.target.value)}
                  placeholder="Your full name" className="flex-1 px-3 py-3 text-sm outline-none" required />
              </div>
            </div>
            <div>
              <label className="text-xs font-semibold text-text-secondary uppercase tracking-wide mb-1.5 block">Email (optional)</label>
              <div className="flex items-center border-2 border-gray-200 rounded-xl focus-within:border-primary transition-colors">
                <div className="px-3 py-3 border-r border-gray-200"><Mail size={16} className="text-text-secondary" /></div>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                  placeholder="your@email.com" className="flex-1 px-3 py-3 text-sm outline-none" />
              </div>
            </div>
            {error && <p className="text-error-red text-sm bg-error-container rounded-xl p-3">{error}</p>}
            <button type="submit" disabled={loading}
              className="bg-primary text-white py-3.5 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 hover:bg-primary-dark transition-colors disabled:opacity-60 mt-2">
              {loading
                ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                : <><CheckCircle size={16} />Save & Continue</>}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
