import { useNavigate } from 'react-router-dom'
import { CheckCircle, Package, Home } from 'lucide-react'

export default function OrderSuccessScreen() {
  const navigate = useNavigate()
  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] px-4 text-center">
      <div className="w-24 h-24 rounded-full bg-primary-container flex items-center justify-center mb-6 shadow-lg">
        <CheckCircle size={52} className="text-primary" />
      </div>
      <h1 className="text-2xl font-extrabold text-gray-900 mb-2">Order Placed!</h1>
      <p className="text-text-secondary mb-2">Your groceries are on their way.</p>
      <p className="text-sm text-text-secondary mb-10">You can track your order status from the Orders screen.</p>
      <div className="flex flex-col gap-3 w-full max-w-xs">
        <button onClick={() => navigate('/orders')}
          className="flex items-center justify-center gap-2 bg-primary text-white py-3.5 rounded-xl font-semibold hover:bg-primary-dark transition-colors">
          <Package size={18} />Track Order
        </button>
        <button onClick={() => navigate('/')}
          className="flex items-center justify-center gap-2 border-2 border-gray-200 text-gray-700 py-3.5 rounded-xl font-semibold hover:border-primary hover:text-primary transition-colors">
          <Home size={18} />Continue Shopping
        </button>
      </div>
    </div>
  )
}
