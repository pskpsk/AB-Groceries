import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { db } from '../firebase'
import { collection, getDocs, orderBy, query } from 'firebase/firestore'
import { Package, ChevronRight, ReceiptText } from 'lucide-react'

const STATUS_COLORS = {
  Placed: 'bg-blue-50 text-blue-600',
  Confirmed: 'bg-purple-50 text-purple-600',
  Preparing: 'bg-orange-50 text-orange-600',
  'Out for Delivery': 'bg-yellow-50 text-yellow-700',
  Delivered: 'bg-primary-container text-primary',
  Cancelled: 'bg-error-container text-error-red',
}

export default function OrdersScreen() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return
    const q = query(collection(db, 'users', user.uid, 'orders'), orderBy('createdAt', 'desc'))
    getDocs(q).then(snap => {
      setOrders(snap.docs.map(d => ({ id: d.id, ...d.data() })))
      setLoading(false)
    })
  }, [user])

  if (loading) return (
    <div className="px-4 py-5 flex flex-col gap-3">
      <div className="h-7 w-32 bg-gray-200 rounded animate-pulse mb-2" />
      {Array(3).fill(0).map((_, i) => (
        <div key={i} className="h-24 bg-white rounded-2xl animate-pulse" />
      ))}
    </div>
  )

  if (orders.length === 0) return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] gap-4 px-4">
      <div className="w-20 h-20 rounded-full bg-primary-container flex items-center justify-center">
        <ReceiptText size={40} className="text-primary" />
      </div>
      <h2 className="text-xl font-bold text-gray-900">No orders yet</h2>
      <p className="text-text-secondary text-sm text-center">Your order history will appear here</p>
      <button onClick={() => navigate('/')}
        className="bg-primary text-white px-6 py-3 rounded-xl font-semibold text-sm hover:bg-primary-dark transition-colors">
        Start Shopping
      </button>
    </div>
  )

  return (
    <div className="px-4 py-5 flex flex-col gap-3">
      <h1 className="text-2xl font-extrabold text-gray-900 mb-1">My Orders</h1>
      {orders.map(order => (
        <button key={order.id} onClick={() => navigate('/orders/' + order.orderId)}
          className="bg-white rounded-2xl p-4 shadow-sm flex items-center gap-3 text-left hover:shadow-md transition-shadow w-full">
          <div className="w-10 h-10 rounded-xl bg-primary-container flex items-center justify-center flex-shrink-0">
            <Package size={20} className="text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm font-bold text-gray-900">#{order.orderId}</span>
              <span className={"text-xs font-semibold px-2 py-0.5 rounded-full " + (STATUS_COLORS[order.status] || 'bg-gray-100 text-gray-600')}>
                {order.status}
              </span>
            </div>
            <p className="text-xs text-text-secondary">{order.date}</p>
            <p className="text-sm font-semibold text-primary mt-0.5">₹{order.total}</p>
          </div>
          <ChevronRight size={16} className="text-gray-300 flex-shrink-0" />
        </button>
      ))}
    </div>
  )
}
