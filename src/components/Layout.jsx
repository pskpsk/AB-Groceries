import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { ShoppingCart, Heart, Home, User } from 'lucide-react'
import { useCart } from '../contexts/CartContext'
import { useWishlist } from '../contexts/WishlistContext'
import { useAuth } from '../contexts/AuthContext'

export default function Layout() {
  const { count } = useCart()
  const { items: wishItems } = useWishlist()
  const { profile } = useAuth()
  const navigate = useNavigate()

  const navCls = ({ isActive }) =>
    `flex flex-col items-center gap-0.5 px-4 py-2 text-xs font-medium transition-colors ${
      isActive ? 'text-primary' : 'text-text-secondary'
    }`

  return (
    <div className="flex flex-col min-h-screen bg-surface-soft">
      {/* ── Desktop top nav ───────────────────────────────── */}
      <header className="hidden md:flex sticky top-0 z-30 bg-white border-b border-gray-100 shadow-sm px-6 py-3 items-center justify-between">
        <NavLink to="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
            <span className="text-white font-bold text-sm">AB</span>
          </div>
          <span className="font-bold text-lg text-primary">AB Groceries</span>
        </NavLink>
        <nav className="flex items-center gap-1">
          {[
            { to: '/', label: 'Home', icon: Home },
            { to: '/wishlist', label: 'Wishlist', icon: Heart, badge: wishItems.length },
            { to: '/cart', label: 'Cart', icon: ShoppingCart, badge: count },
            { to: '/profile', label: profile?.name || 'Profile', icon: User },
          ].map(({ to, label, icon: Icon, badge }) => (
            <NavLink key={to} to={to} end={to === '/'} className={({ isActive }) =>
              `relative flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                isActive ? 'bg-primary-container text-primary' : 'text-text-secondary hover:bg-gray-50'
              }`
            }>
              <Icon size={16} />
              {label}
              {badge > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-primary text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                  {badge}
                </span>
              )}
            </NavLink>
          ))}
        </nav>
      </header>

      {/* ── Page content ─────────────────────────────────── */}
      <main className="flex-1 pb-20 md:pb-0 max-w-screen-lg mx-auto w-full">
        <Outlet />
      </main>

      {/* ── Mobile bottom nav ─────────────────────────────── */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 z-30 bg-white border-t border-gray-100 flex justify-around">
        <NavLink to="/" end className={navCls}>
          <Home size={22} />
          Home
        </NavLink>
        <NavLink to="/wishlist" className={navCls}>
          <div className="relative">
            <Heart size={22} />
            {wishItems.length > 0 && (
              <span className="absolute -top-1.5 -right-1.5 bg-primary text-white text-[9px] font-bold rounded-full w-3.5 h-3.5 flex items-center justify-center">
                {wishItems.length}
              </span>
            )}
          </div>
          Wishlist
        </NavLink>
        <NavLink to="/cart" className={navCls}>
          <div className="relative">
            <ShoppingCart size={22} />
            {count > 0 && (
              <span className="absolute -top-1.5 -right-1.5 bg-primary text-white text-[9px] font-bold rounded-full w-3.5 h-3.5 flex items-center justify-center">
                {count}
              </span>
            )}
          </div>
          Cart
        </NavLink>
        <NavLink to="/profile" className={navCls}>
          <User size={22} />
          Profile
        </NavLink>
      </nav>
    </div>
  )
}
