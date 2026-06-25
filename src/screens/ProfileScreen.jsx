import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useCart } from '../contexts/CartContext'
import { db } from '../firebase'
import { collection, getDocs } from 'firebase/firestore'
import { useEffect, useState } from 'react'
import { User, Phone, Mail, Package, MapPin, Settings, LogOut, ChevronRight, ShieldCheck } from 'lucide-react'

export default function ProfileScreen() {
  const { user, profile, logout } = useAuth()
  const { clearCart } = useCart()
  const navigate = useNavigate()
  const [orderCount, setOrderCount] = useState(0)
  const [totalSpent, setTotalSpent] = useState(0)

  useEffect(() => {
    if (!user) return
    getDocs(collection(db, 'users', user.uid, 'orders')).then(snap => {
      setOrderCount(snap.size)
      setTotalSpent(snap.docs.reduce((s, d) => s + (d.data().total || 0), 0))
    })
  }, [user])

  async function handleLogout() {
    clearCart()
    await logout()
    navigate('/login', { replace: true })
  }

  return (
    <div className="px-4 py-5 flex flex-col gap-4">
      {/* Avatar card */}
      <div className="bg-white rounded-2xl p-5 shadow-sm flex items-center gap-4">
        <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
          <span className="text-white text-2xl font-bold">
            {profile?.name?.charAt(0)?.toUpperCase() || '?'}
          </span>
        </div>
        <div>
          <h2 className="text-lg font-extrabold text-gray-900">{profile?.name || 'User'}</h2>
          <p className="text-sm text-text-secondary">{profile?.phone || user?.phoneNumber}</p>
          {profile?.isAdmin && (
            <span className="flex items-center gap-1 text-xs font-semibold text-primary bg-primary-container px-2 py-0.5 rounded-full mt-1 w-fit">
              <ShieldCheck size={11} />Admin
            </span>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3">
        <StatCard label="Orders" value={orderCount} />
        <StatCard label="Total Spent" value={"₹" + totalSpent} />
      </div>

      {/* Info */}
      <div className="bg-white rounded-2xl p-4 shadow-sm flex flex-col gap-3">
        <h3 className="font-bold text-gray-900">Account Info</h3>
        {profile?.email && <InfoRow icon={Mail} label="Email" value={profile.email} />}
        <InfoRow icon={Phone} label="Phone" value={profile?.phone || user?.phoneNumber || '—'} />
      </div>

      {/* Navigation */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        <NavItem icon={Package} label="My Orders" onClick={() => navigate('/orders')} />
        <NavItem icon={MapPin} label="Saved Addresses" onClick={() => navigate('/addresses')} />
        {profile?.isAdmin && <NavItem icon={ShieldCheck} label="Admin Panel" onClick={() => navigate('/admin')} />}
        <NavItem icon={Settings} label="Settings" onClick={() => navigate('/settings')} />
        <NavItem icon={LogOut} label="Logout" onClick={handleLogout} danger />
      </div>
    </div>
  )
}

function StatCard({ label, value }) {
  return (
    <div className="bg-white rounded-2xl p-4 shadow-sm text-center">
      <p className="text-xl font-extrabold text-primary">{value}</p>
      <p className="text-xs text-text-secondary mt-0.5">{label}</p>
    </div>
  )
}

function InfoRow({ icon: Icon, label, value }) {
  return (
    <div className="flex items-center gap-3 bg-surface-soft rounded-xl px-3 py-2.5">
      <Icon size={16} className="text-primary flex-shrink-0" />
      <span className="text-xs text-text-secondary w-12">{label}</span>
      <span className="text-sm font-semibold text-gray-900">{value}</span>
    </div>
  )
}

function NavItem({ icon: Icon, label, onClick, danger }) {
  return (
    <button onClick={onClick}
      className={"flex items-center gap-3 px-4 py-3.5 w-full text-left border-b border-gray-50 last:border-0 hover:bg-surface-soft transition-colors " +
        (danger ? 'text-error-red' : 'text-gray-900')}>
      <Icon size={18} className={danger ? 'text-error-red' : 'text-primary'} />
      <span className="flex-1 text-sm font-semibold">{label}</span>
      <ChevronRight size={15} className="text-gray-300" />
    </button>
  )
}
