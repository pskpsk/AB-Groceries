import { useEffect, useState, useMemo } from 'react'
import { db } from '../firebase'
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore'
import { useAuth } from '../contexts/AuthContext'
import { useNavigate } from 'react-router-dom'
import ProductCard from '../components/ProductCard'
import { Search, ShoppingBag, Settings } from 'lucide-react'

const CATEGORIES = ['All','Fruits','Vegetables','Dairy','Bakery','Beverages','Snacks','Staples','Personal Care']

const ICONS = {
  All:'🛒', Fruits:'🍎', Vegetables:'🥦', Dairy:'🥛',
  Bakery:'🍞', Beverages:'🧃', Snacks:'🍿', Staples:'🌾', 'Personal Care':'🧴'
}

export default function HomeScreen() {
  const { profile } = useAuth()
  const navigate = useNavigate()
  const [products, setProducts] = useState([])
  const [category, setCategory] = useState('All')
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const q = query(collection(db, 'products'), orderBy('name'))
    const unsub = onSnapshot(q, snap => {
      setProducts(snap.docs.map(d => ({ id: d.id, ...d.data() })))
      setLoading(false)
    })
    return unsub
  }, [])

  const filtered = useMemo(() => {
    return products.filter(p => {
      const matchCat = category === 'All' || p.category?.toLowerCase() === category.toLowerCase()
      const matchSearch = !search || p.name?.toLowerCase().includes(search.toLowerCase())
      return matchCat && matchSearch
    })
  }, [products, category, search])

  return (
    <div className="flex flex-col min-h-full">
      {/* Header */}
      <div className="bg-white px-4 pt-5 pb-4 sticky top-0 z-20 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-xs text-text-secondary">Good {greeting()},</p>
            <h1 className="text-lg font-extrabold text-gray-900">{profile?.name?.split(' ')[0] || 'there'} 👋</h1>
          </div>
          {profile?.isAdmin && (
            <button onClick={() => navigate('/admin')}
              className="flex items-center gap-1.5 bg-primary-container text-primary px-3 py-1.5 rounded-full text-xs font-semibold">
              <Settings size={13} />Admin
            </button>
          )}
        </div>

        {/* Search */}
        <div className="flex items-center gap-2 bg-surface-soft rounded-xl px-3 py-2.5 border border-gray-100">
          <Search size={16} className="text-text-secondary flex-shrink-0" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search groceries..."
            className="flex-1 text-sm outline-none bg-transparent placeholder:text-text-secondary" />
        </div>
      </div>

      {/* Categories */}
      <div className="flex gap-2 overflow-x-auto px-4 py-3 no-scrollbar bg-white border-b border-gray-50">
        {CATEGORIES.map(cat => (
          <button key={cat} onClick={() => setCategory(cat)}
            className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${
              category === cat
                ? 'bg-primary text-white'
                : 'bg-surface-soft text-text-secondary hover:bg-primary-container hover:text-primary'
            }`}>
            <span>{ICONS[cat]}</span>{cat}
          </button>
        ))}
      </div>

      {/* Products */}
      <div className="flex-1 px-4 py-4">
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {Array(6).fill(0).map((_, i) => (
              <div key={i} className="bg-white rounded-2xl h-56 animate-pulse" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <ShoppingBag size={48} className="text-gray-200" />
            <p className="text-text-secondary font-medium">No products found</p>
            {search && <button onClick={() => setSearch('')} className="text-primary text-sm font-semibold">Clear search</button>}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {filtered.map(p => <ProductCard key={p.id} product={p} />)}
          </div>
        )}
      </div>
    </div>
  )
}

function greeting() {
  const h = new Date().getHours()
  return h < 12 ? 'morning' : h < 17 ? 'afternoon' : 'evening'
}
