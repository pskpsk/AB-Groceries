import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import { CartProvider } from './contexts/CartContext'
import { WishlistProvider } from './contexts/WishlistContext'
import Layout from './components/Layout'
import ProtectedRoute from './components/ProtectedRoute'

import LoginScreen from './screens/LoginScreen'
import ProfileSetupScreen from './screens/ProfileSetupScreen'
import HomeScreen from './screens/HomeScreen'
import CartScreen from './screens/CartScreen'
import WishlistScreen from './screens/WishlistScreen'
import CheckoutScreen from './screens/CheckoutScreen'
import OrderSuccessScreen from './screens/OrderSuccessScreen'
import OrdersScreen from './screens/OrdersScreen'
import OrderTrackingScreen from './screens/OrderTrackingScreen'
import ProfileScreen from './screens/ProfileScreen'
import AddressScreen from './screens/AddressScreen'
import SettingsScreen from './screens/SettingsScreen'
import AdminScreen from './screens/AdminScreen'

function AuthGate({ children }) {
  const { user, profile, loading } = useAuth()
  if (loading) return (
    <div className="flex items-center justify-center min-h-screen bg-surface-soft">
      <div className="flex flex-col items-center gap-4">
        <div className="w-14 h-14 rounded-full bg-primary flex items-center justify-center shadow-lg">
          <span className="text-white font-bold text-xl">AB</span>
        </div>
        <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    </div>
  )
  if (!user) return <Navigate to="/login" replace />
  if (!profile) return <Navigate to="/setup" replace />
  return children
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <WishlistProvider>
            <Routes>
              <Route path="/login" element={<LoginScreen />} />
              <Route path="/setup" element={<ProfileSetupScreen />} />
              <Route element={<AuthGate><Layout /></AuthGate>}>
                <Route index element={<HomeScreen />} />
                <Route path="cart" element={<CartScreen />} />
                <Route path="wishlist" element={<WishlistScreen />} />
                <Route path="checkout" element={<CheckoutScreen />} />
                <Route path="success" element={<OrderSuccessScreen />} />
                <Route path="orders" element={<OrdersScreen />} />
                <Route path="orders/:orderId" element={<OrderTrackingScreen />} />
                <Route path="profile" element={<ProfileScreen />} />
                <Route path="addresses" element={<AddressScreen />} />
                <Route path="settings" element={<SettingsScreen />} />
                <Route path="admin" element={<AdminScreen />} />
              </Route>
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </WishlistProvider>
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}
