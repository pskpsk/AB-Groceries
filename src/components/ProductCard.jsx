import { Heart, Plus, Minus, ShoppingCart } from 'lucide-react'
import { useCart } from '../contexts/CartContext'
import { useWishlist } from '../contexts/WishlistContext'

export default function ProductCard({ product }) {
  const { items, addItem, updateQty } = useCart()
  const { toggle, isWishlisted } = useWishlist()

  const cartItem = items.find(i => i.product.id === product.id)
  const qty = cartItem?.quantity || 0
  const wishlisted = isWishlisted(product.id)

  const stockBadge = product.stock === 0
    ? <span className="text-[10px] font-semibold text-error-red bg-error-container px-1.5 py-0.5 rounded">Out of Stock</span>
    : product.stock <= 5
    ? <span className="text-[10px] font-semibold text-orange-600 bg-orange-50 px-1.5 py-0.5 rounded">Only {product.stock} left</span>
    : null

  return (
    <div className="bg-white rounded-2xl shadow-sm overflow-hidden flex flex-col">
      {/* Image */}
      <div className="relative bg-gray-50 aspect-square">
        {product.imageUrl
          ? <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
          : <div className="w-full h-full flex items-center justify-center text-4xl">🛒</div>
        }
        <button
          onClick={() => toggle(product)}
          className={`absolute top-2 right-2 w-8 h-8 rounded-full flex items-center justify-center shadow transition-colors ${
            wishlisted ? 'bg-red-500 text-white' : 'bg-white text-gray-400'
          }`}
        >
          <Heart size={15} fill={wishlisted ? 'currentColor' : 'none'} />
        </button>
        {product.offer && (
          <span className="absolute top-2 left-2 bg-orange-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded">
            {product.offer}% OFF
          </span>
        )}
      </div>

      {/* Info */}
      <div className="p-3 flex flex-col flex-1 gap-1">
        <p className="text-xs text-text-secondary capitalize">{product.category}</p>
        <p className="text-sm font-semibold text-gray-900 line-clamp-2 leading-snug">{product.name}</p>
        {product.unit && <p className="text-xs text-text-secondary">{product.unit}</p>}
        <div className="flex items-center gap-1 mt-0.5">{stockBadge}</div>

        <div className="flex items-center justify-between mt-auto pt-2">
          <span className="text-base font-bold text-gray-900">₹{product.price}</span>

          {qty === 0 ? (
            <button
              disabled={product.stock === 0}
              onClick={() => addItem(product)}
              className="w-8 h-8 rounded-xl bg-primary text-white flex items-center justify-center disabled:opacity-40 hover:bg-primary-dark transition-colors"
            >
              <Plus size={16} />
            </button>
          ) : (
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => updateQty(product.id, qty - 1)}
                className="w-7 h-7 rounded-lg bg-primary-container text-primary flex items-center justify-center"
              >
                <Minus size={13} />
              </button>
              <span className="w-5 text-center text-sm font-bold text-primary">{qty}</span>
              <button
                onClick={() => updateQty(product.id, qty + 1)}
                disabled={qty >= product.stock}
                className="w-7 h-7 rounded-lg bg-primary text-white flex items-center justify-center disabled:opacity-40"
              >
                <Plus size={13} />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
