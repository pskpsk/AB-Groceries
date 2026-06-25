import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { Phone, Lock, ChevronRight, AlertCircle } from 'lucide-react'

export default function LoginScreen() {
  const { sendOtp, verifyOtp } = useAuth()
  const navigate = useNavigate()
  const [step, setStep] = useState('phone')
  const [phone, setPhone] = useState('')
  const [otp, setOtp] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSendOtp(e) {
    e.preventDefault()
    if (phone.length !== 10) { setError('Enter a valid 10-digit mobile number'); return }
    setError(''); setLoading(true)
    try {
      await sendOtp('+91' + phone)
      setStep('otp')
    } catch (err) {
      setError(err.message || 'Failed to send OTP. Try again.')
    } finally { setLoading(false) }
  }

  async function handleVerifyOtp(e) {
    e.preventDefault()
    if (otp.length !== 6) { setError('Enter the 6-digit OTP'); return }
    setError(''); setLoading(true)
    try {
      await verifyOtp(otp)
      navigate('/setup', { replace: true })
    } catch (err) {
      setError('Invalid OTP. Please try again.')
    } finally { setLoading(false) }
  }

  return (
    <div className="min-h-screen bg-surface-soft flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="flex flex-col items-center mb-10">
          <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center mb-4 shadow-lg">
            <span className="text-white font-bold text-2xl">AB</span>
          </div>
          <h1 className="text-2xl font-extrabold text-gray-900">AB Groceries</h1>
          <p className="text-text-secondary mt-1 text-sm">Fresh groceries delivered to your door</p>
        </div>

        <div className="bg-white rounded-3xl shadow-sm p-6">
          {step === 'phone' ? (
            <>
              <h2 className="text-lg font-bold text-gray-900 mb-1">Welcome!</h2>
              <p className="text-sm text-text-secondary mb-6">Enter your mobile number to continue</p>
              <form onSubmit={handleSendOtp} className="flex flex-col gap-4">
                <div>
                  <label className="text-xs font-semibold text-text-secondary uppercase tracking-wide mb-1.5 block">Mobile Number</label>
                  <div className="flex items-center border-2 border-gray-200 rounded-xl focus-within:border-primary transition-colors">
                    <div className="flex items-center gap-2 px-3 border-r border-gray-200 py-3">
                      <Phone size={16} className="text-text-secondary" />
                      <span className="text-sm font-semibold text-gray-700">+91</span>
                    </div>
                    <input type="tel" maxLength={10} value={phone}
                      onChange={e => setPhone(e.target.value.replace(/\D/g, ''))}
                      placeholder="10-digit number"
                      className="flex-1 px-3 py-3 text-sm outline-none bg-transparent" required />
                  </div>
                </div>
                {error && (
                  <div className="flex items-center gap-2 text-error-red text-sm bg-error-container rounded-xl p-3">
                    <AlertCircle size={15} />{error}
                  </div>
                )}
                <button type="submit" disabled={loading}
                  className="bg-primary text-white py-3.5 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 hover:bg-primary-dark transition-colors disabled:opacity-60">
                  {loading
                    ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    : <><span>Send OTP</span><ChevronRight size={16} /></>}
                </button>
              </form>
            </>
          ) : (
            <>
              <button onClick={() => { setStep('phone'); setOtp(''); setError('') }}
                className="text-sm text-primary font-medium mb-4">← Back</button>
              <h2 className="text-lg font-bold text-gray-900 mb-1">Verify OTP</h2>
              <p className="text-sm text-text-secondary mb-6">
                Code sent to <span className="font-semibold text-gray-800">+91 {phone}</span>
              </p>
              <form onSubmit={handleVerifyOtp} className="flex flex-col gap-4">
                <div>
                  <label className="text-xs font-semibold text-text-secondary uppercase tracking-wide mb-1.5 block">Enter OTP</label>
                  <div className="flex items-center border-2 border-gray-200 rounded-xl focus-within:border-primary transition-colors">
                    <div className="px-3 py-3 border-r border-gray-200"><Lock size={16} className="text-text-secondary" /></div>
                    <input type="number" value={otp} onChange={e => setOtp(e.target.value.slice(0,6))}
                      placeholder="6-digit OTP"
                      className="flex-1 px-3 py-3 text-sm outline-none bg-transparent tracking-widest" required />
                  </div>
                </div>
                {error && (
                  <div className="flex items-center gap-2 text-error-red text-sm bg-error-container rounded-xl p-3">
                    <AlertCircle size={15} />{error}
                  </div>
                )}
                <button type="submit" disabled={loading}
                  className="bg-primary text-white py-3.5 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 hover:bg-primary-dark transition-colors disabled:opacity-60">
                  {loading
                    ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    : 'Verify & Continue'}
                </button>
                <button type="button" onClick={handleSendOtp} disabled={loading}
                  className="text-primary text-sm font-medium text-center">Resend OTP</button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
