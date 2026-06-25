import { useNavigate } from 'react-router-dom'
import { useCart } from '../contexts/CartContext'
import { Minus, Plus, Trash2, ShoppingCart, ArrowRight } from 'lucide-react'

export default function CartScreen() {
  const { items, updateQty, removeItem, subtotal } = useCart()
  const navigate = useNavigate()
  const deliveryFee = subtotal >= 199 || subtotal === 0 ? 0 : 40
  const gst = Math.round(subtotal * 0.05)
  const total = subtotal + deliveryFee + gst

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] gap-4 px-4">
        <div className="w-20 h-20 rounded-full bg-primary-container flex items-center justify-center">
          <ShoppingCart size={40} className="text-primary" />
        </div>
        <h2 className="text-xl font-bold text-gray-900">Your cart is empty</h2>
        <p className="text-text-secondary text-sm text-center">Add some fresh groceries to get started!</p>
        <button onClick={() => navigate('/')}
          className="bg-primary text-white px-6 py-3 rounded-xl font-semibold text-sm hover:bg-primary-dark transition-colors">
          Shop Now
        </button>
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-full">
      <div className="px-4 pt-5 pb-2">
        <h1 className="text-2xl font-extrabold text-gray-900">My Cart</h1>
        <p className="text-sm text-text-secondary">{items.length} item{items.length !== 1 ? 's' : ''}</p>
      </div>

      <div className="flex-1 px-4 flex flex-col gap-3 pb-4">
        {items.map(({ product, quantity }) => (
          <div key={product.id} className="bg-white rounded-2xl p-3 flex items-center gap-3 shadow-sm">
            <div className="w-16 h-16 rounded-xl bg-gray-50 overflow-hidden flex-shrink-0">
              {product.imageUrl
                ? <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
                : <div className="w-full h-full flex items-center justify-center text-2xl">🛒</div>}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-900 truncate">{product.name}</p>
              {product.unit && <p className="text-xs text-text-secondary">{product.unit}</p>}
              <p className="text-sm font-bold text-primary mt-0.5">₹{product.price * quantity}</p>
            </div>
            <div className="flex flex-col items-end gap-2">
              <button onClick={() => removeItem(product.id)} className="text-gray-300 hover:text-error-red transition-colors">
                <Trash2 size={15} />
              </button>
              <div className="flex items-center gap-1.5">
                <button onClick={() => updateQty(product.id, quantity - 1)}
                  className="w-7 h-7 rounded-lg bg-primary-container text-primary flex items-center justify-center">
                  <Minus size={13} />
                </button>
                <span className="w-5 text-center text-sm font-bold text-primary">{quantity}</span>
                <button onClick={() => updateQty(product.id, quantity + 1)}
                  disabled={quantity >= product.stock}
                  className="w-7 h-7 rounded-lg bg-primary text-white flex items-center justify-center disabled:opacity-40">
                  <Plus size={13} />
                </button>
              </div>
            </div>
          </div>
        ))}

        {/* Bill summary */}
        <div className="bg-white rounded-2xl p-4 shadow-sm mt-2">
          <h3 className="font-bold text-gray-900 mb-3">Bill Summary</h3>
          <div className="flex flex-col gap-2">
            <Row label="Items Total" value={"₹" + subtotal} />
            <Row label="Delivery" value={deliveryFee === 0 ? 'FREE' : "₹" + deliveryFee} green={deliveryFee === 0} />
            <Row label="GST (5%)" value={"₹" + gst} />
            <div className="border-t border-gray-100 my-1" />
            <div className="flex justify-between items-center">
              <span className="font-bold text-gray-900">Total</span>
              <span className="font-bold text-primary text-lg">₹{total}</span>
            </div>
          </div>
          {subtotal < 199 && subtotal > 0 && (
            <p className="text-xs text-orange-600 bg-orange-50 rounded-lg p-2 mt-3">
              Add ₹{199 - subtotal} more to get FREE delivery!
            </p>
          )}
        </div>
      </div>

      {/* Checkout button */}
      <div className="sticky bottom-16 md:bottom-0 bg-white border-t border-gray-100 px-4 py-3 shadow-up">
        <button onClick={() => navigate('/checkout')}
          className="w-full bg-primary text-white py-3.5 rounded-xl font-semibold flex items-center justify-center gap-2 hover:bg-primary-dark transition-colors">
          Proceed to Checkout <ArrowRight size={18} />
        </button>
      </div>
    </div>
  )
}

function Row({ label, value, green }) {
  return (
    <div className="flex justify-between items-center">
      <span className="text-sm text-text-secondary">{label}</span>
      <span className={"text-sm font-semibold " + (green ? 'text-primary' : 'text-gray-900')}>{value}</span>
    </div>
  )
              }
