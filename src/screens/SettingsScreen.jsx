import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { ArrowLeft, MapPin, LogOut, Info, Shield, Bell } from 'lucide-react'

export default function SettingsScreen() {
  const { logout } = useAuth()
  const navigate = useNavigate()

  async function handleLogout() {
    await logout()
    navigate('/login', { replace: true })
  }

  return (
    <div className="px-4 py-5">
      <div className="flex items-center gap-3 mb-5">
        <button onClick={() => navigate(-1)} className="w-8 h-8 flex items-center justify-center rounded-xl bg-white shadow-sm">
          <ArrowLeft size={16} className="text-gray-700" />
        </button>
        <h1 className="text-2xl font-extrabold text-gray-900">Settings</h1>
      </div>

      <div className="flex flex-col gap-3">
        <Group title="Account">
          <SettingRow icon={MapPin} label="Saved Addresses" onClick={() => navigate('/addresses')} />
        </Group>

        <Group title="App">
          <SettingRow icon={Bell} label="Notifications" sub="Coming soon" disabled />
          <SettingRow icon={Shield} label="Privacy Policy" onClick={() => {}} />
          <SettingRow icon={Info} label="About AB Groceries" sub="Version 1.0.0" />
        </Group>

        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <SettingRow icon={LogOut} label="Logout" onClick={handleLogout} danger />
        </div>
      </div>
    </div>
  )
}

function Group({ title, children }) {
  return (
    <div>
      <p className="text-xs font-semibold text-text-secondary uppercase tracking-wide mb-1.5 px-1">{title}</p>
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">{children}</div>
    </div>
  )
}

function SettingRow({ icon: Icon, label, sub, onClick, danger, disabled }) {
  return (
    <button onClick={onClick} disabled={disabled}
      className={"flex items-center gap-3 px-4 py-3.5 w-full text-left border-b border-gray-50 last:border-0 hover:bg-surface-soft transition-colors disabled:opacity-50 " +
        (danger ? 'text-error-red' : 'text-gray-900')}>
      <Icon size={18} className={danger ? 'text-error-red' : 'text-primary'} />
      <div className="flex-1">
        <p className="text-sm font-semibold">{label}</p>
        {sub && <p className="text-xs text-text-secondary">{sub}</p>}
      </div>
    </button>
  )
}
