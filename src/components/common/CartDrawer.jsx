import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { FiX, FiShoppingBag, FiTrash2, FiArrowRight } from 'react-icons/fi';
import useCartStore from '../../store/cartStore';
import useAuthStore from '../../store/authStore';
import useUIStore from '../../store/uiStore';
import { formatPrice, getImageUrl } from '../../utils/helpers';

const FREE_SHIPPING_MIN = 999;

export default function CartDrawer() {
  const { cartOpen, closeCart } = useUIStore();
  const { items, removeFromCart, updateQuantity, getSubtotal, discount, getItemCount } = useCartStore();
  const { isAuthenticated } = useAuthStore();
  const navigate = useNavigate();

  const subtotal = getSubtotal();
  const shippingCharge = subtotal >= FREE_SHIPPING_MIN ? 0 : 99;
  const total = subtotal - discount + shippingCharge;
  const progressPercent = Math.min((subtotal / FREE_SHIPPING_MIN) * 100, 100);
  const itemCount = getItemCount();

  const handleCheckout = () => {
    closeCart();
    if (!isAuthenticated()) {
      navigate('/login?redirect=/checkout');
    } else {
      navigate('/checkout');
    }
  };

  return (
    <AnimatePresence>
      {cartOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-[60]"
        >
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-[2px]"
            onClick={closeCart}
          />

          {/* Drawer panel */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 280 }}
            className="absolute right-0 top-0 bottom-0 w-full sm:w-[360px] bg-white flex flex-col shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 flex-shrink-0">
              <div className="flex items-center gap-2">
                <FiShoppingBag className="text-ink text-base" />
                <h2 className="font-bold text-ink text-base">My Cart</h2>
                {itemCount > 0 && (
                  <span className="bg-ink text-white text-[10px] font-black rounded-full w-5 h-5 flex items-center justify-center leading-none">
                    {itemCount > 9 ? '9+' : itemCount}
                  </span>
                )}
              </div>
              <button
                onClick={closeCart}
                className="w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center text-mid hover:text-ink transition-colors"
                aria-label="Close cart"
              >
                <FiX className="text-base" />
              </button>
            </div>

            {/* Free shipping progress */}
            {items.length > 0 && (
              <div className="px-5 py-3 bg-gray-50 border-b border-gray-100 flex-shrink-0">
                {subtotal >= FREE_SHIPPING_MIN ? (
                  <p className="text-xs font-semibold text-green-600 text-center">
                    You've unlocked FREE delivery!
                  </p>
                ) : (
                  <>
                    <p className="text-xs text-mid mb-2">
                      Add{' '}
                      <span className="font-semibold text-ink">
                        {formatPrice(FREE_SHIPPING_MIN - subtotal)}
                      </span>{' '}
                      more for free delivery
                    </p>
                    <div className="w-full bg-gray-200 rounded-full h-1.5 overflow-hidden">
                      <motion.div
                        className="h-full bg-ink rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${progressPercent}%` }}
                        transition={{ duration: 0.6, ease: 'easeOut' }}
                      />
                    </div>
                  </>
                )}
              </div>
            )}

            {/* Items list */}
            <div className="flex-1 overflow-y-auto">
              {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center px-6 py-10">
                  <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mb-4">
                    <FiShoppingBag className="text-2xl text-mid" />
                  </div>
                  <h3 className="font-semibold text-ink mb-1">Your cart is empty</h3>
                  <p className="text-xs text-mid mb-5">Add items to get started</p>
                  <button onClick={closeCart} className="btn-primary text-sm px-6 py-2.5">
                    Continue Shopping
                  </button>
                </div>
              ) : (
                <div className="p-4 space-y-4">
                  <AnimatePresence initial={false}>
                    {items.map((item) => (
                      <motion.div
                        key={`${item.product}-${item.size}-${item.color}`}
                        layout
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, x: 30, transition: { duration: 0.2 } }}
                        className="flex gap-3"
                      >
                        <Link
                          to={`/products/${item.slug}`}
                          onClick={closeCart}
                          className="flex-shrink-0"
                        >
                          <div className="w-16 h-16 rounded-xl overflow-hidden bg-gray-50 border border-gray-100">
                            <img
                              src={getImageUrl(item.image)}
                              alt={item.name}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.target.src = 'https://placehold.co/200x200/f3f4f6/9ca3af?text=VELOQ';
                              }}
                            />
                          </div>
                        </Link>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-1">
                            <Link to={`/products/${item.slug}`} onClick={closeCart}>
                              <h4 className="text-xs font-semibold text-ink line-clamp-2 hover:underline leading-snug">
                                {item.name}
                              </h4>
                            </Link>
                            <button
                              onClick={() => removeFromCart(item.product, item.size, item.color)}
                              className="text-gray-300 hover:text-red-500 transition-colors flex-shrink-0 p-0.5"
                              aria-label="Remove item"
                            >
                              <FiTrash2 className="text-xs" />
                            </button>
                          </div>

                          <p className="text-[10px] text-mid mt-0.5">
                            {item.size} · {item.color}
                          </p>

                          <div className="flex items-center justify-between mt-2">
                            <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden">
                              <button
                                onClick={() =>
                                  updateQuantity(item.product, item.size, item.color, item.quantity - 1)
                                }
                                className="w-7 h-7 text-mid hover:text-ink hover:bg-gray-50 font-bold flex items-center justify-center text-base transition-colors"
                              >
                                −
                              </button>
                              <span className="w-7 text-center text-xs font-semibold text-ink">
                                {item.quantity}
                              </span>
                              <button
                                onClick={() =>
                                  updateQuantity(item.product, item.size, item.color, item.quantity + 1)
                                }
                                className="w-7 h-7 text-mid hover:text-ink hover:bg-gray-50 font-bold flex items-center justify-center text-base transition-colors"
                              >
                                +
                              </button>
                            </div>
                            <p className="text-sm font-bold text-ink">
                              {formatPrice(item.price * item.quantity)}
                            </p>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              )}
            </div>

            {/* Sticky footer */}
            {items.length > 0 && (
              <div className="border-t border-gray-100 p-4 space-y-2.5 flex-shrink-0 bg-white">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-mid">Subtotal ({itemCount} item{itemCount !== 1 ? 's' : ''})</span>
                  <span className="font-semibold text-ink">{formatPrice(subtotal)}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-sm text-green-600">
                    <span>Discount</span>
                    <span>−{formatPrice(discount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span className="text-mid">Shipping</span>
                  <span className={shippingCharge === 0 ? 'text-green-600 font-medium' : 'text-ink'}>
                    {shippingCharge === 0 ? 'FREE' : formatPrice(shippingCharge)}
                  </span>
                </div>
                <div className="flex justify-between font-bold text-base border-t border-gray-100 pt-2.5">
                  <span className="text-ink">Total</span>
                  <span className="text-ink">{formatPrice(total)}</span>
                </div>
                <button
                  onClick={handleCheckout}
                  className="w-full btn-primary py-3.5 text-sm flex items-center justify-center gap-2"
                >
                  Proceed to Checkout <FiArrowRight />
                </button>
                <Link
                  to="/cart"
                  onClick={closeCart}
                  className="block text-center text-xs text-mid hover:text-ink transition-colors py-1"
                >
                  View full cart
                </Link>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
