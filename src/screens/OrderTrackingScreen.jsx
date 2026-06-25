import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { db } from '../firebase'
import { doc, getDoc } from 'firebase/firestore'
import { ArrowLeft, CheckCircle, Circle } from 'lucide-react'

const STEPS = ['Placed', 'Confirmed', 'Preparing', 'Out for Delivery', 'Delivered']

export default function OrderTrackingScreen() {
  const { orderId } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user || !orderId) return
    getDoc(doc(db, 'users', user.uid, 'orders', orderId)).then(snap => {
      if (snap.exists()) setOrder({ id: snap.id, ...snap.data() })
      setLoading(false)
    })
  }, [user, orderId])

  if (loading) return <div className="flex items-center justify-center min-h-[60vh]"><div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>
  if (!order) return <div className="flex items-center justify-center min-h-[60vh] text-text-secondary">Order not found</div>

  const currentStep = STEPS.indexOf(order.status)

  return (
    <div className="px-4 py-5">
      <button onClick={() => navigate('/orders')} className="flex items-center gap-1.5 text-primary font-semibold text-sm mb-5">
        <ArrowLeft size={16} />Back to Orders
      </button>

      <div className="bg-white rounded-2xl p-4 shadow-sm mb-4">
        <div className="flex items-start justify-between mb-2">
          <div>
            <p className="text-xs text-text-secondary">Order ID</p>
            <p className="font-bold text-gray-900">#{order.orderId}</p>
          </div>
          <span className={"text-xs font-bold px-2.5 py-1 rounded-full " +
            (order.status === 'Delivered' ? 'bg-primary-container text-primary' :
             order.status === 'Cancelled' ? 'bg-error-container text-error-red' : 'bg-blue-50 text-blue-600')}>
            {order.status}
          </span>
        </div>
        <p className="text-xs text-text-secondary mb-0.5">{order.date}</p>
        <p className="text-lg font-extrabold text-primary">₹{order.total}</p>
      </div>

      {/* Timeline */}
      {order.status !== 'Cancelled' && (
        <div className="bg-white rounded-2xl p-4 shadow-sm mb-4">
          <h3 className="font-bold text-gray-900 mb-4">Order Timeline</h3>
          <div className="flex flex-col gap-0">
            {STEPS.map((step, i) => {
              const done = i <= currentStep
              const active = i === currentStep
              return (
                <div key={step} className="flex items-start gap-3">
                  <div className="flex flex-col items-center">
                    <div className={"w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 " +
                      (done ? 'bg-primary' : 'bg-gray-200')}>
                      {done ? <CheckCircle size={14} className="text-white" /> : <Circle size={14} className="text-gray-400" />}
                    </div>
                    {i < STEPS.length - 1 && <div className={"w-0.5 h-8 mt-1 " + (done ? 'bg-primary' : 'bg-gray-200')} />}
                  </div>
                  <div className="pb-6">
                    <p className={"text-sm font-semibold " + (active ? 'text-primary' : done ? 'text-gray-900' : 'text-gray-400')}>{step}</p>
                    {active && <p className="text-xs text-text-secondary mt-0.5">{order.date}</p>}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Items */}
      <div className="bg-white rounded-2xl p-4 shadow-sm mb-4">
        <h3 className="font-bold text-gray-900 mb-3">Items Ordered</h3>
        <div className="flex flex-col gap-2">
          {(order.items || []).map((item, i) => (
            <div key={i} className="flex justify-between text-sm">
              <span className="text-gray-700">{item.name} × {item.qty}</span>
              <span className="font-semibold text-gray-900">₹{item.price * item.qty}</span>
            </div>
          ))}
          <div className="border-t border-gray-100 my-1" />
          <div className="flex justify-between">
            <span className="font-bold text-gray-900">Total</span>
            <span className="font-bold text-primary">₹{order.total}</span>
          </div>
        </div>
      </div>

      {/* Delivery address */}
      {order.address && (
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <h3 className="font-bold text-gray-900 mb-2">Delivery Address</h3>
          <p className="text-sm font-semibold text-gray-900">{order.address.name}</p>
          <p className="text-sm text-text-secondary">{order.address.fullAddress}</p>
        </div>
      )}
    </div>
  )
}
