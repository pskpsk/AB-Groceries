import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useCart } from '../contexts/CartContext'
import { db } from '../firebase'
import { collection, addDoc, getDocs, doc, setDoc } from 'firebase/firestore'
import { isServiceable } from '../utils/serviceArea'
import { RAZORPAY_KEY_ID, MERCHANT_NAME, CURRENCY } from '../config/PaymentConfig'
import { MapPin, Plus, User, CreditCard, Package, CheckCircle, Truck, XCircle, AlertCircle } from 'lucide-react'

export default function CheckoutScreen() {
  const { user, profile } = useAuth()
  const { items, subtotal, clearCart } = useCart()
  const navigate = useNavigate()

  const [addresses, setAddresses] = useState([])
  const [selectedAddr, setSelectedAddr] = useState(null)
  const [showAllAddr, setShowAllAddr] = useState(false)
  const [loadingAddr, setLoadingAddr] = useState(true)
  const [paying, setPaying] = useState(false)
  const [error, setError] = useState('')

  const deliveryFee = subtotal >= 199 || subtotal === 0 ? 0 : 40
  const gst = Math.round(subtotal * 0.05)
  const total = subtotal + deliveryFee + gst
  const serviceable = selectedAddr ? isServiceable(selectedAddr.pincode) : false

  useEffect(() => {
    if (!user) return
    getDocs(collection(db, 'users', user.uid, 'addresses')).then(snap => {
      const addrs = snap.docs.map(d => ({ id: d.id, ...d.data() }))
      setAddresses(addrs)
      if (addrs.length > 0) setSelectedAddr(addrs[0])
      setLoadingAddr(false)
    })
  }, [user])

  function handlePay() {
    if (!selectedAddr) { setError('Please select a delivery address'); return }
    if (!serviceable) { setError('Delivery not available for this area'); return }
    if (items.length === 0) { setError('Your cart is empty'); return }
    setError('')
    setPaying(true)

    const options = {
      key: RAZORPAY_KEY_ID,
      amount: total * 100,
      currency: CURRENCY,
      name: MERCHANT_NAME,
      description: 'Grocery Order',
      prefill: { contact: profile?.phone || user.phoneNumber || '' },
      theme: { color: '#2E7D32' },
      handler: async function (response) {
        try {
          const orderId = 'ORD' + Date.now()
          await setDoc(doc(db, 'users', user.uid, 'orders', orderId), {
            orderId,
            items: items.map(i => ({ name: i.product.name, qty: i.quantity, price: i.product.price })),
            total,
            address: selectedAddr,
            status: 'Placed',
            paymentId: response.razorpay_payment_id,
            date: new Date().toLocaleDateString('en-IN', { day:'2-digit', month:'short', year:'numeric', hour:'2-digit', minute:'2-digit' }),
            createdAt: Date.now(),
          })
          clearCart()
          navigate('/success', { replace: true })
        } catch { setError('Order saved failed. Contact support with payment ID: ' + response.razorpay_payment_id) }
        finally { setPaying(false) }
      },
      modal: {
        ondismiss: () => {
          setPaying(false)
          setError('Payment was cancelled.')
        }
      }
    }

    if (!window.Razorpay) { setError('Payment gateway not loaded. Check your internet connection.'); setPaying(false); return }
    const rzp = new window.Razorpay(options)
    rzp.on('payment.failed', (resp) => {
      setPaying(false)
      setError(resp.error?.description || 'Payment failed. Please try again.')
    })
    rzp.open()
  }

  const displayedAddresses = showAllAddr ? addresses : addresses.slice(0, 1)

  return (
    <div className="flex flex-col min-h-full">
      <div className="px-4 pt-5 pb-2">
        <h1 className="text-2xl font-extrabold text-gray-900">Checkout</h1>
      </div>

      <div className="flex-1 px-4 flex flex-col gap-4 pb-4">

        {/* Customer */}
        <Section icon={User} title="Customer Details">
          <InfoRow label="Name" value={profile?.name || '—'} />
          <InfoRow label="Mobile" value={profile?.phone || user?.phoneNumber || '—'} />
        </Section>

        {/* Address */}
        <Section icon={MapPin} title="Delivery Address">
          {loadingAddr ? (
            <div className="h-16 bg-gray-100 rounded-xl animate-pulse" />
          ) : addresses.length === 0 ? (
            <div className="flex flex-col gap-3">
              <p className="text-sm text-text-secondary">No saved addresses.</p>
              <button onClick={() => navigate('/addresses')}
                className="flex items-center gap-2 bg-primary text-white py-2.5 px-4 rounded-xl text-sm font-semibold justify-center hover:bg-primary-dark transition-colors">
                <Plus size={15} />Add Address
              </button>
            </div>
          ) : (
            <>
              {displayedAddresses.map(addr => (
                <label key={addr.id}
                  className={"flex items-start gap-3 p-3 rounded-xl border-2 cursor-pointer transition-colors mb-2 " +
                    (selectedAddr?.id === addr.id ? 'border-primary bg-primary-container' : 'border-gray-100 bg-surface-soft')}>
                  <input type="radio" name="address" checked={selectedAddr?.id === addr.id}
                    onChange={() => setSelectedAddr(addr)} className="mt-1 accent-green-700" />
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{addr.name}
                      <span className="ml-2 text-xs text-text-secondary font-normal bg-white px-1.5 py-0.5 rounded">{addr.label}</span>
                    </p>
                    <p className="text-xs text-text-secondary mt-0.5">{addr.fullAddress}</p>
                  </div>
                </label>
              ))}
              {addresses.length > 1 && (
                <button onClick={() => setShowAllAddr(v => !v)}
                  className="text-primary text-sm font-semibold mb-2">
                  {showAllAddr ? 'Show less' : `Change address (${addresses.length})`}
                </button>
              )}
              <button onClick={() => navigate('/addresses')}
                className="flex items-center gap-2 border-2 border-gray-200 text-gray-700 py-2 px-4 rounded-xl text-sm font-semibold justify-center hover:border-primary hover:text-primary transition-colors">
                <Plus size={15} />Add New Address
              </button>

              {selectedAddr && (
                <div className={"flex items-center gap-2 mt-2 px-3 py-2 rounded-xl text-sm font-semibold " +
                  (serviceable ? 'bg-primary-container text-primary' : 'bg-error-container text-error-red')}>
                  {serviceable ? <Truck size={15} /> : <XCircle size={15} />}
                  {serviceable ? 'Delivery available in your area' : `Delivery not available for PIN ${selectedAddr.pincode}`}
                </div>
              )}
            </>
          )}
        </Section>

        {/* Payment method */}
        <Section icon={CreditCard} title="Payment Method">
          <div className="flex items-center gap-3 bg-surface-soft rounded-xl p-3">
            <input type="radio" checked readOnly className="accent-green-700" />
            <div>
              <p className="text-sm font-semibold text-gray-900">Razorpay</p>
              <p className="text-xs text-text-secondary">Pay via UPI, Cards, Net Banking & Wallets</p>
            </div>
          </div>
        </Section>

        {/* Order summary */}
        <Section icon={Package} title="Order Summary">
          <div className="flex flex-col gap-2">
            {items.map(({ product, quantity }) => (
              <div key={product.id} className="flex justify-between text-sm">
                <span className="text-gray-700 truncate flex-1 mr-2">{product.name} × {quantity}</span>
                <span className="font-semibold text-gray-900">₹{product.price * quantity}</span>
              </div>
            ))}
            <div className="border-t border-gray-100 my-1" />
            <BillRow label="Items Total" value={"₹" + subtotal} />
            <BillRow label="Delivery" value={deliveryFee === 0 ? 'FREE' : "₹" + deliveryFee} green={deliveryFee === 0} />
            <BillRow label="GST (5%)" value={"₹" + gst} />
            <div className="border-t border-gray-100 my-1" />
            <div className="flex justify-between items-center">
              <span className="font-bold text-gray-900">Total</span>
              <span className="font-bold text-primary text-lg">₹{total}</span>
            </div>
          </div>
        </Section>

        {error && (
          <div className="flex items-center gap-2 text-error-red bg-error-container rounded-xl p-3 text-sm">
            <AlertCircle size={15} />{error}
          </div>
        )}
      </div>

      {/* Pay button */}
      <div className="sticky bottom-16 md:bottom-0 bg-white border-t border-gray-100 px-4 py-3 shadow-up">
        <div className="flex justify-between mb-2">
          <span className="text-sm text-text-secondary">Amount Payable</span>
          <span className="font-bold text-gray-900">₹{total}</span>
        </div>
        <button onClick={handlePay} disabled={paying || !serviceable || items.length === 0}
          className="w-full bg-primary text-white py-3.5 rounded-xl font-semibold flex items-center justify-center gap-2 hover:bg-primary-dark transition-colors disabled:opacity-50">
          {paying
            ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            : <>Pay ₹{total} via Razorpay</>}
        </button>
      </div>
    </div>
  )
}

function Section({ icon: Icon, title, children }) {
  return (
    <div className="bg-white rounded-2xl p-4 shadow-sm">
      <div className="flex items-center gap-2 mb-3">
        <Icon size={18} className="text-primary" />
        <h3 className="font-bold text-gray-900">{title}</h3>
      </div>
      {children}
    </div>
  )
}

function InfoRow({ label, value }) {
  return (
    <div className="flex items-center gap-3 bg-surface-soft rounded-xl px-3 py-2.5 mb-2">
      <span className="text-xs text-text-secondary w-14">{label}</span>
      <span className="text-sm font-semibold text-gray-900">{value}</span>
    </div>
  )
}

function BillRow({ label, value, green }) {
  return (
    <div className="flex justify-between items-center">
      <span className="text-sm text-text-secondary">{label}</span>
      <span className={"text-sm font-semibold " + (green ? 'text-primary' : 'text-gray-900')}>{value}</span>
    </div>
  )
}
