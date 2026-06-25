import { useWishlist } from '../contexts/WishlistContext'
import { useCart } from '../contexts/CartContext'
import { Heart, Plus, ShoppingBag } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

export default function WishlistScreen() {
  const { items, toggle } = useWishlist()
  const { addItem } = useCart()
  const navigate = useNavigate()

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] gap-4 px-4">
        <div className="w-20 h-20 rounded-full bg-red-50 flex items-center justify-center">
          <Heart size={40} className="text-red-300" />
        </div>
        <h2 className="text-xl font-bold text-gray-900">No saved items</h2>
        <p className="text-text-secondary text-sm text-center">Tap the heart on any product to save it here</p>
        <button onClick={() => navigate('/')}
          className="bg-primary text-white px-6 py-3 rounded-xl font-semibold text-sm hover:bg-primary-dark transition-colors">
          Browse Products
        </button>
      </div>
    )
  }

  return (
    <div className="px-4 py-5">
      <h1 className="text-2xl font-extrabold text-gray-900 mb-1">Wishlist</h1>
      <p className="text-sm text-text-secondary mb-4">{items.length} saved item{items.length !== 1 ? 's' : ''}</p>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {items.map(product => (
          <div key={product.id} className="bg-white rounded-2xl overflow-hidden shadow-sm flex flex-col">
            <div className="relative bg-gray-50 aspect-square">
              {product.imageUrl
                ? <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
                : <div className="w-full h-full flex items-center justify-center text-4xl">🛒</div>}
              <button onClick={() => toggle(product)}
                className="absolute top-2 right-2 w-8 h-8 rounded-full bg-red-500 text-white flex items-center justify-center shadow">
                <Heart size={14} fill="currentColor" />
              </button>
            </div>
            <div className="p-3 flex flex-col flex-1 gap-2">
              <p className="text-sm font-semibold text-gray-900 line-clamp-2">{product.name}</p>
              <div className="flex items-center justify-between mt-auto">
                <span className="font-bold text-gray-900">₹{product.price}</span>
                <button onClick={() => addItem(product)}
                  className="w-8 h-8 rounded-xl bg-primary text-white flex items-center justify-center hover:bg-primary-dark transition-colors">
                  <Plus size={16} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
