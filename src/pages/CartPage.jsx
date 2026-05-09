import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiTrash2, FiTag, FiArrowRight, FiShoppingBag, FiX } from 'react-icons/fi';
import useCartStore from '../store/cartStore';
import useAuthStore from '../store/authStore';
import api from '../utils/api';
import { formatPrice, getImageUrl } from '../utils/helpers';
import toast from 'react-hot-toast';

export default function CartPage() {
  const { items, removeFromCart, updateQuantity, getSubtotal, coupon, discount, applyCoupon, removeCoupon } = useCartStore();
  const { isAuthenticated } = useAuthStore();
  const navigate = useNavigate();
  const [couponCode, setCouponCode] = useState('');
  const [couponLoading, setCouponLoading] = useState(false);

  const subtotal = getSubtotal();
  const shippingCharge = subtotal >= 999 ? 0 : 99;
  const total = subtotal - discount + shippingCharge;
  const gst = Math.round((total * 18) / 118);

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;
    setCouponLoading(true);
    try {
      const data = await api.post('/orders/apply-coupon', { code: couponCode, subtotal });
      applyCoupon(data.coupon, data.discount);
      toast.success('Coupon applied!');
    } catch (err) {
      toast.error(err.message || 'Invalid coupon');
    } finally {
      setCouponLoading(false);
    }
  };

  const handleCheckout = () => {
    if (!isAuthenticated()) { navigate('/login?redirect=/checkout'); return; }
    navigate('/checkout');
  };

  if (items.length === 0) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center px-4">
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="text-center">
          <div className="w-24 h-24 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <FiShoppingBag className="text-4xl text-mid" />
          </div>
          <h2 className="text-2xl font-bold text-ink mb-2">Your cart is empty</h2>
          <p className="text-mid text-sm mb-8">Looks like you haven't added anything yet.</p>
          <Link to="/products" className="btn-primary px-8 py-3 text-sm inline-flex">Continue Shopping</Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <div className="flex items-baseline gap-3 mb-6">
        <h1 className="text-2xl font-bold text-ink">Shopping Cart</h1>
        <span className="text-mid text-sm">{items.reduce((s, i) => s + i.quantity, 0)} items</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-3">
          <AnimatePresence>
            {items.map((item, index) => (
              <motion.div
                key={`${item.product}-${item.size}-${item.color}`}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20, height: 0, marginBottom: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                className="bg-white border border-gray-200 rounded-xl p-4 flex gap-4 group hover:border-gray-300 transition-colors"
              >
                <Link to={`/products/${item.slug}`} className="flex-shrink-0">
                  <div className="w-20 h-20 rounded-xl overflow-hidden bg-gray-50">
                    <img
                      src={getImageUrl(item.image)}
                      alt={item.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      onError={(e) => { e.target.src = 'https://placehold.co/200x200/f3f4f6/9ca3af?text=VELOQ'; }}
                    />
                  </div>
                </Link>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <Link to={`/products/${item.slug}`}>
                      <h3 className="font-semibold text-sm text-ink hover:text-dark transition-colors line-clamp-2">{item.name}</h3>
                    </Link>
                    <button
                      onClick={() => removeFromCart(item.product, item.size, item.color)}
                      className="text-mid hover:text-sale transition-colors flex-shrink-0 p-1 opacity-0 group-hover:opacity-100"
                    >
                      <FiTrash2 className="text-sm" />
                    </button>
                  </div>
                  <div className="flex gap-2 mt-1">
                    <span className="text-[10px] text-mid bg-gray-50 border border-gray-200 px-2 py-0.5 rounded">UK {item.size?.replace('UK ', '')}</span>
                    <span className="text-[10px] text-mid bg-gray-50 border border-gray-200 px-2 py-0.5 rounded">{item.color}</span>
                  </div>
                  <div className="flex items-center justify-between mt-3">
                    <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden">
                      <button
                        onClick={() => updateQuantity(item.product, item.size, item.color, item.quantity - 1)}
                        className="w-8 h-8 hover:bg-gray-50 transition-colors text-mid hover:text-ink font-bold flex items-center justify-center text-lg"
                      >−</button>
                      <span className="w-8 text-center text-sm font-semibold text-ink">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.product, item.size, item.color, item.quantity + 1)}
                        className="w-8 h-8 hover:bg-gray-50 transition-colors text-mid hover:text-ink font-bold flex items-center justify-center text-lg"
                      >+</button>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-ink text-sm">{formatPrice(item.price * item.quantity)}</p>
                      {item.quantity > 1 && <p className="text-[10px] text-mid">{formatPrice(item.price)} each</p>}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="bg-white border border-gray-200 rounded-xl p-5 sticky top-32"
          >
            <h2 className="font-bold text-lg text-ink mb-5">Order Summary</h2>

            {/* Coupon */}
            <div className="mb-5">
              <AnimatePresence mode="wait">
                {coupon ? (
                  <motion.div key="applied" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    className="flex items-center justify-between bg-green-50 border border-green-200 rounded-lg px-3 py-2.5">
                    <div>
                      <p className="text-sm font-semibold text-ink flex items-center gap-2">
                        <FiTag className="text-neon" /> {coupon.code}
                      </p>
                      <p className="text-xs text-mid mt-0.5">Saving {formatPrice(discount)}</p>
                    </div>
                    <button onClick={removeCoupon} className="text-mid hover:text-sale transition-colors"><FiX /></button>
                  </motion.div>
                ) : (
                  <motion.div key="input" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex gap-2">
                    <input
                      type="text" value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                      placeholder="Promo code"
                      className="input-field text-sm py-2.5 flex-1"
                    />
                    <button onClick={handleApplyCoupon} disabled={couponLoading}
                      className="px-4 py-2.5 bg-ink text-white text-xs font-bold rounded-lg hover:bg-gray-800 transition-colors flex-shrink-0 disabled:opacity-50">
                      {couponLoading ? '...' : 'Apply'}
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Breakdown */}
            <div className="space-y-2.5 text-sm border-t border-gray-100 pt-4">
              <div className="flex justify-between">
                <span className="text-mid">Subtotal ({items.reduce((s, i) => s + i.quantity, 0)} items)</span>
                <span className="text-ink font-medium">{formatPrice(subtotal)}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-neon">
                  <span>Discount</span>
                  <span>−{formatPrice(discount)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-mid">Shipping</span>
                <span className={shippingCharge === 0 ? 'text-neon font-medium' : 'text-ink'}>
                  {shippingCharge === 0 ? 'FREE' : formatPrice(shippingCharge)}
                </span>
              </div>
              <div className="flex justify-between text-mid text-xs">
                <span>GST (included)</span>
                <span>{formatPrice(gst)}</span>
              </div>
              {subtotal < 999 && (
                <p className="text-xs text-mid bg-amber-50 border border-amber-100 rounded-lg p-2.5">
                  Add {formatPrice(999 - subtotal)} more for FREE shipping
                </p>
              )}
              <div className="border-t border-gray-100 pt-3 flex justify-between font-bold text-base">
                <span className="text-ink">Total</span>
                <span className="text-ink">{formatPrice(total)}</span>
              </div>
            </div>

            <button onClick={handleCheckout}
              className="w-full btn-primary mt-5 py-3.5 text-sm flex items-center justify-center gap-2">
              Proceed to Checkout <FiArrowRight />
            </button>
            <div className="text-center mt-3">
              <Link to="/products" className="text-xs text-mid hover:text-ink transition-colors">← Continue Shopping</Link>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
