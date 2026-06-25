import { useEffect, useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { db } from '../firebase'
import { collection, getDocs, addDoc, deleteDoc, doc } from 'firebase/firestore'
import { isServiceable } from '../utils/serviceArea'
import { MapPin, Plus, Trash2, Home, Briefcase, Navigation, CheckCircle, XCircle, ArrowLeft } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

const LABEL_ICONS = { Home, Work: Briefcase, Other: Navigation }

export default function AddressScreen() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [addresses, setAddresses] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ name:'', phone:'', flat:'', area:'', pincode:'', city:'', state:'', label:'Home' })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  async function load() {
    const snap = await getDocs(collection(db, 'users', user.uid, 'addresses'))
    setAddresses(snap.docs.map(d => ({ id: d.id, ...d.data() })))
    setLoading(false)
  }

  useEffect(() => { if (user) load() }, [user])

  async function handleAdd(e) {
    e.preventDefault()
    if (!form.name || !form.flat || !form.pincode) { setError('Fill all required fields'); return }
    setSaving(true); setError('')
    try {
      const fullAddress = [form.flat, form.area, form.city, form.state, form.pincode].filter(Boolean).join(', ')
      await addDoc(collection(db, 'users', user.uid, 'addresses'), {
        ...form, fullAddress, createdAt: Date.now()
      })
      setForm({ name:'', phone:'', flat:'', area:'', pincode:'', city:'', state:'', label:'Home' })
      setShowForm(false)
      load()
    } catch { setError('Failed to save address') }
    finally { setSaving(false) }
  }

  async function handleDelete(id) {
    if (!confirm('Delete this address?')) return
    await deleteDoc(doc(db, 'users', user.uid, 'addresses', id))
    load()
  }

  return (
    <div className="px-4 py-5">
      <div className="flex items-center gap-3 mb-5">
        <button onClick={() => navigate(-1)} className="w-8 h-8 flex items-center justify-center rounded-xl bg-white shadow-sm">
          <ArrowLeft size={16} className="text-gray-700" />
        </button>
        <h1 className="text-2xl font-extrabold text-gray-900">Saved Addresses</h1>
      </div>

      {loading ? (
        <div className="flex flex-col gap-3">{Array(2).fill(0).map((_, i) => <div key={i} className="h-24 bg-white rounded-2xl animate-pulse" />)}</div>
      ) : (
        <div className="flex flex-col gap-3">
          {addresses.map(addr => {
            const Icon = LABEL_ICONS[addr.label] || Navigation
            const ok = isServiceable(addr.pincode)
            return (
              <div key={addr.id} className="bg-white rounded-2xl p-4 shadow-sm flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary-container flex items-center justify-center flex-shrink-0">
                  <Icon size={18} className="text-primary" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-0.5">
                    <p className="text-sm font-bold text-gray-900">{addr.name}</p>
                    <span className="text-xs text-text-secondary bg-surface-soft px-1.5 py-0.5 rounded">{addr.label}</span>
                  </div>
                  <p className="text-xs text-text-secondary">{addr.fullAddress}</p>
                  <div className={"flex items-center gap-1 mt-1.5 text-xs font-semibold " + (ok ? 'text-primary' : 'text-error-red')}>
                    {ok ? <CheckCircle size={11} /> : <XCircle size={11} />}
                    {ok ? 'Delivery available' : 'Not serviceable'}
                  </div>
                </div>
                <button onClick={() => handleDelete(addr.id)} className="text-gray-300 hover:text-error-red transition-colors mt-1">
                  <Trash2 size={16} />
                </button>
              </div>
            )
          })}

          {!showForm ? (
            <button onClick={() => setShowForm(true)}
              className="flex items-center justify-center gap-2 border-2 border-dashed border-gray-200 rounded-2xl py-4 text-primary font-semibold text-sm hover:border-primary transition-colors bg-white">
              <Plus size={18} />Add New Address
            </button>
          ) : (
            <div className="bg-white rounded-2xl p-4 shadow-sm">
              <h3 className="font-bold text-gray-900 mb-4">New Address</h3>
              <form onSubmit={handleAdd} className="flex flex-col gap-3">
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Name *" value={form.name} onChange={v => setForm(f => ({...f, name: v}))} placeholder="Recipient name" />
                  <Field label="Phone" value={form.phone} onChange={v => setForm(f => ({...f, phone: v}))} placeholder="Mobile" type="tel" />
                </div>
                <Field label="Flat / House No. *" value={form.flat} onChange={v => setForm(f => ({...f, flat: v}))} placeholder="Flat, House no, Building" />
                <Field label="Area / Street" value={form.area} onChange={v => setForm(f => ({...f, area: v}))} placeholder="Area, Street, Colony" />
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Pincode *" value={form.pincode} onChange={v => setForm(f => ({...f, pincode: v}))} placeholder="6-digit PIN" type="number" />
                  <Field label="City" value={form.city} onChange={v => setForm(f => ({...f, city: v}))} placeholder="City" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-text-secondary uppercase tracking-wide mb-1.5 block">Label</label>
                  <div className="flex gap-2">
                    {['Home','Work','Other'].map(l => (
                      <button type="button" key={l} onClick={() => setForm(f => ({...f, label: l}))}
                        className={"px-3 py-1.5 rounded-full text-xs font-semibold border-2 transition-colors " +
                          (form.label === l ? 'border-primary bg-primary-container text-primary' : 'border-gray-200 text-text-secondary')}>
                        {l}
                      </button>
                    ))}
                  </div>
                </div>
                {form.pincode.length === 6 && (
                  <div className={"flex items-center gap-1.5 text-xs font-semibold rounded-xl px-3 py-2 " +
                    (isServiceable(form.pincode) ? 'bg-primary-container text-primary' : 'bg-error-container text-error-red')}>
                    {isServiceable(form.pincode) ? <CheckCircle size={13} /> : <XCircle size={13} />}
                    {isServiceable(form.pincode) ? 'Delivery available' : 'Not serviceable in this area'}
                  </div>
                )}
                {error && <p className="text-error-red text-sm">{error}</p>}
                <div className="flex gap-2 mt-1">
                  <button type="button" onClick={() => setShowForm(false)}
                    className="flex-1 border-2 border-gray-200 text-gray-700 py-2.5 rounded-xl text-sm font-semibold hover:border-gray-300 transition-colors">
                    Cancel
                  </button>
                  <button type="submit" disabled={saving}
                    className="flex-1 bg-primary text-white py-2.5 rounded-xl text-sm font-semibold hover:bg-primary-dark transition-colors disabled:opacity-60">
                    {saving ? 'Saving...' : 'Save Address'}
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function Field({ label, value, onChange, placeholder, type = 'text' }) {
  return (
    <div>
      <label className="text-xs font-semibold text-text-secondary uppercase tracking-wide mb-1 block">{label}</label>
      <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
        className="w-full border-2 border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-primary transition-colors" />
    </div>
  )
}
