import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { db, storage } from '../firebase'
import {
  collection, getDocs, addDoc, updateDoc, deleteDoc, doc, query, orderBy
} from 'firebase/firestore'
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'
import { ArrowLeft, Plus, Pencil, Trash2, Package, Users, ReceiptText, X, Upload, Check } from 'lucide-react'

const TABS = ['Products', 'Orders', 'Users']
const CATS = ['Fruits','Vegetables','Dairy','Bakery','Beverages','Snacks','Staples','Personal Care']
const STATUS_OPTIONS = ['Placed','Confirmed','Preparing','Out for Delivery','Delivered','Cancelled']

const EMPTY_PRODUCT = { name:'', description:'', price:'', category:'Fruits', unit:'', stock:'', imageUrl:'' }

export default function AdminScreen() {
  const { profile } = useAuth()
  const navigate = useNavigate()
  const [tab, setTab] = useState('Products')

  if (!profile?.isAdmin) {
    return (
      <div className="flex items-center justify-center min-h-[70vh] text-text-secondary">
        Access denied. Admin only.
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-full">
      {/* Header */}
      <div className="bg-white px-4 pt-5 pb-0 shadow-sm sticky top-0 z-20">
        <div className="flex items-center gap-3 mb-3">
          <button onClick={() => navigate(-1)} className="w-8 h-8 flex items-center justify-center rounded-xl bg-surface-soft">
            <ArrowLeft size={16} className="text-gray-700" />
          </button>
          <h1 className="text-xl font-extrabold text-gray-900">Admin Panel</h1>
        </div>
        <div className="flex border-b border-gray-100">
          {TABS.map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={"flex-1 py-2.5 text-sm font-semibold transition-colors " +
                (tab === t ? 'text-primary border-b-2 border-primary' : 'text-text-secondary')}>
              {t}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 px-4 py-4">
        {tab === 'Products' && <ProductsTab />}
        {tab === 'Orders'   && <OrdersTab />}
        {tab === 'Users'    && <UsersTab />}
      </div>
    </div>
  )
}

/* ──────────────────────────────────────────────────────────────── PRODUCTS TAB */
function ProductsTab() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(EMPTY_PRODUCT)
  const [imageFile, setImageFile] = useState(null)
  const [saving, setSaving] = useState(false)
  const [search, setSearch] = useState('')

  async function load() {
    const snap = await getDocs(query(collection(db, 'products'), orderBy('name')))
    setProducts(snap.docs.map(d => ({ id: d.id, ...d.data() })))
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  function openAdd() { setEditing(null); setForm(EMPTY_PRODUCT); setImageFile(null); setShowForm(true) }
  function openEdit(p) {
    setEditing(p)
    setForm({ name: p.name, description: p.description||'', price: String(p.price),
              category: p.category, unit: p.unit||'', stock: String(p.stock), imageUrl: p.imageUrl||'' })
    setImageFile(null)
    setShowForm(true)
  }

  async function handleSave(e) {
    e.preventDefault()
    setSaving(true)
    try {
      let imageUrl = form.imageUrl
      if (imageFile) {
        const storageRef = ref(storage, 'products/' + Date.now() + '_' + imageFile.name)
        await uploadBytes(storageRef, imageFile)
        imageUrl = await getDownloadURL(storageRef)
      }
      const data = {
        name: form.name.trim(), description: form.description.trim(),
        price: Number(form.price), category: form.category,
        unit: form.unit.trim(), stock: Number(form.stock), imageUrl,
      }
      if (editing) await updateDoc(doc(db, 'products', editing.id), data)
      else await addDoc(collection(db, 'products'), { ...data, createdAt: Date.now() })
      setShowForm(false)
      load()
    } catch (err) { alert('Save failed: ' + err.message) }
    finally { setSaving(false) }
  }

  async function handleDelete(id) {
    if (!confirm('Delete this product?')) return
    await deleteDoc(doc(db, 'products', id))
    load()
  }

  const filtered = products.filter(p =>
    !search || p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.category.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm text-text-secondary">{products.length} products</span>
        <button onClick={openAdd}
          className="flex items-center gap-1.5 bg-primary text-white px-3 py-2 rounded-xl text-sm font-semibold hover:bg-primary-dark transition-colors">
          <Plus size={15} />Add Product
        </button>
      </div>

      <input value={search} onChange={e => setSearch(e.target.value)}
        placeholder="Search products..." className="w-full border-2 border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-primary mb-3" />

      {loading ? (
        <div className="flex flex-col gap-2">{Array(4).fill(0).map((_, i) => <div key={i} className="h-16 bg-white rounded-xl animate-pulse" />)}</div>
      ) : (
        <div className="flex flex-col gap-2">
          {filtered.map(p => (
            <div key={p.id} className="bg-white rounded-xl p-3 flex items-center gap-3 shadow-sm">
              <div className="w-12 h-12 rounded-lg bg-gray-50 overflow-hidden flex-shrink-0">
                {p.imageUrl ? <img src={p.imageUrl} alt={p.name} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-xl">🛒</div>}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900 truncate">{p.name}</p>
                <p className="text-xs text-text-secondary">{p.category} · ₹{p.price} · Stock: {p.stock}</p>
              </div>
              <div className="flex gap-2">
                <button onClick={() => openEdit(p)} className="w-8 h-8 rounded-lg bg-primary-container text-primary flex items-center justify-center hover:bg-primary-light transition-colors">
                  <Pencil size={13} />
                </button>
                <button onClick={() => handleDelete(p.id)} className="w-8 h-8 rounded-lg bg-error-container text-error-red flex items-center justify-center">
                  <Trash2 size={13} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Product Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-3xl p-5 w-full max-w-md max-h-[90vh] overflow-y-auto shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-gray-900 text-lg">{editing ? 'Edit Product' : 'Add Product'}</h3>
              <button onClick={() => setShowForm(false)} className="w-8 h-8 flex items-center justify-center rounded-xl bg-surface-soft">
                <X size={16} className="text-gray-500" />
              </button>
            </div>
            <form onSubmit={handleSave} className="flex flex-col gap-3">
              <Field label="Product Name *" value={form.name} onChange={v => setForm(f=>({...f,name:v}))} placeholder="e.g. Fresh Apples" />
              <Field label="Description" value={form.description} onChange={v => setForm(f=>({...f,description:v}))} placeholder="Short description" />
              <div className="grid grid-cols-2 gap-3">
                <Field label="Price (₹) *" value={form.price} onChange={v => setForm(f=>({...f,price:v}))} type="number" placeholder="0" />
                <Field label="Stock *" value={form.stock} onChange={v => setForm(f=>({...f,stock:v}))} type="number" placeholder="0" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-text-secondary uppercase tracking-wide mb-1 block">Category *</label>
                  <select value={form.category} onChange={e => setForm(f=>({...f,category:e.target.value}))}
                    className="w-full border-2 border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-primary bg-white">
                    {CATS.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <Field label="Unit" value={form.unit} onChange={v => setForm(f=>({...f,unit:v}))} placeholder="e.g. 1 kg" />
              </div>
              <div>
                <label className="text-xs font-semibold text-text-secondary uppercase tracking-wide mb-1 block">Product Image</label>
                <div className="border-2 border-dashed border-gray-200 rounded-xl p-3 flex flex-col items-center gap-2 hover:border-primary transition-colors cursor-pointer"
                  onClick={() => document.getElementById('img-upload').click()}>
                  {imageFile ? (
                    <div className="flex items-center gap-2 text-primary text-sm font-semibold">
                      <Check size={15} />{imageFile.name}
                    </div>
                  ) : form.imageUrl ? (
                    <img src={form.imageUrl} alt="" className="h-16 rounded-lg object-cover" />
                  ) : (
                    <div className="flex flex-col items-center gap-1 text-text-secondary">
                      <Upload size={20} />
                      <p className="text-xs">Click to upload image</p>
                    </div>
                  )}
                  <input id="img-upload" type="file" accept="image/*" className="hidden"
                    onChange={e => setImageFile(e.target.files[0])} />
                </div>
                {!imageFile && (
                  <input value={form.imageUrl} onChange={e => setForm(f=>({...f,imageUrl:e.target.value}))}
                    placeholder="Or paste image URL" className="w-full mt-2 border-2 border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-primary" />
                )}
              </div>
              <div className="flex gap-2 mt-1">
                <button type="button" onClick={() => setShowForm(false)}
                  className="flex-1 border-2 border-gray-200 text-gray-700 py-2.5 rounded-xl text-sm font-semibold">
                  Cancel
                </button>
                <button type="submit" disabled={saving}
                  className="flex-1 bg-primary text-white py-2.5 rounded-xl text-sm font-semibold hover:bg-primary-dark transition-colors disabled:opacity-60">
                  {saving ? 'Saving…' : editing ? 'Update' : 'Add Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

/* ──────────────────────────────────────────────────────────────── ORDERS TAB */
function OrdersTab() {
  const [allOrders, setAllOrders] = useState([])
  const [loading, setLoading] = useState(true)

  async function load() {
    const usersSnap = await getDocs(collection(db, 'users'))
    const orders = []
    for (const userDoc of usersSnap.docs) {
      const ordSnap = await getDocs(query(collection(db, 'users', userDoc.id, 'orders'), orderBy('createdAt','desc')))
      ordSnap.docs.forEach(d => orders.push({ id: d.id, userId: userDoc.id, userName: userDoc.data().name, ...d.data() }))
    }
    orders.sort((a, b) => b.createdAt - a.createdAt)
    setAllOrders(orders)
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  async function updateStatus(userId, orderId, status) {
    await updateDoc(doc(db, 'users', userId, 'orders', orderId), { status })
    setAllOrders(prev => prev.map(o => o.id === orderId && o.userId === userId ? { ...o, status } : o))
  }

  if (loading) return <div className="flex justify-center py-10"><div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>

  return (
    <div className="flex flex-col gap-3">
      <p className="text-sm text-text-secondary">{allOrders.length} total orders</p>
      {allOrders.length === 0
        ? <p className="text-center text-text-secondary py-10">No orders yet</p>
        : allOrders.map(order => (
          <div key={order.id + order.userId} className="bg-white rounded-2xl p-4 shadow-sm">
            <div className="flex items-start justify-between mb-2">
              <div>
                <p className="text-sm font-bold text-gray-900">#{order.orderId}</p>
                <p className="text-xs text-text-secondary">{order.userName} · {order.date}</p>
              </div>
              <p className="font-bold text-primary">₹{order.total}</p>
            </div>
            <div>
              <label className="text-xs font-semibold text-text-secondary uppercase tracking-wide mb-1 block">Status</label>
              <select value={order.status} onChange={e => updateStatus(order.userId, order.id, e.target.value)}
                className="w-full border-2 border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-primary bg-white">
                {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>
        ))
      }
    </div>
  )
}

/* ──────────────────────────────────────────────────────────────── USERS TAB */
function UsersTab() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getDocs(collection(db, 'users')).then(snap => {
      setUsers(snap.docs.map(d => ({ id: d.id, ...d.data() })))
      setLoading(false)
    })
  }, [])

  async function toggleAdmin(userId, current) {
    await updateDoc(doc(db, 'users', userId), { isAdmin: !current })
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, isAdmin: !current } : u))
  }

  if (loading) return <div className="flex justify-center py-10"><div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>

  return (
    <div className="flex flex-col gap-3">
      <p className="text-sm text-text-secondary">{users.length} users</p>
      {users.map(u => (
        <div key={u.id} className="bg-white rounded-2xl p-4 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
            <span className="text-white font-bold text-sm">{u.name?.charAt(0)?.toUpperCase() || '?'}</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-gray-900 truncate">{u.name}</p>
            <p className="text-xs text-text-secondary">{u.phone}</p>
          </div>
          <button onClick={() => toggleAdmin(u.id, u.isAdmin)}
            className={"text-xs font-semibold px-2.5 py-1 rounded-full border-2 transition-colors " +
              (u.isAdmin ? 'border-primary bg-primary-container text-primary' : 'border-gray-200 text-text-secondary hover:border-primary hover:text-primary')}>
            {u.isAdmin ? '✓ Admin' : 'Make Admin'}
          </button>
        </div>
      ))}
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
