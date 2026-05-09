import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { FiCheck, FiPackage, FiArrowRight } from 'react-icons/fi';
import api from '../utils/api';
import { formatPrice, formatDate } from '../utils/helpers';
import { PageLoader } from '../components/common/LoadingSpinner';

export default function OrderConfirmationPage() {
  const { id } = useParams();
  const { data, isLoading } = useQuery({
    queryKey: ['order', id],
    queryFn: () => api.get(`/orders/${id}`),
  });

  if (isLoading) return <PageLoader />;
  const order = data?.order;

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-12">
      {/* Success Header */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
        <motion.div
          initial={{ scale: 0, rotate: -180 }} animate={{ scale: 1, rotate: 0 }}
          transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.1 }}
          className="w-20 h-20 bg-green-50 border-2 border-green-200 rounded-full flex items-center justify-center mx-auto mb-5"
        >
          <FiCheck className="text-3xl text-neon" />
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <h1 className="text-2xl font-bold text-ink mb-2">Order Confirmed!</h1>
          <p className="text-mid text-sm">Thank you for your purchase. We'll send you updates via email.</p>
        </motion.div>
      </motion.div>

      {order && (
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
          className="bg-white border border-gray-200 rounded-xl p-6 space-y-6">
          {/* Order Meta */}
          <div className="flex items-center justify-between pb-5 border-b border-gray-100">
            <div>
              <p className="text-mid text-[10px] uppercase tracking-wider mb-1">Order Number</p>
              <p className="font-bold text-xl text-ink">{order.orderNumber}</p>
            </div>
            <div className="text-right">
              <p className="text-mid text-[10px] uppercase tracking-wider mb-1">Date</p>
              <p className="text-sm text-ink">{formatDate(order.createdAt)}</p>
            </div>
          </div>

          {/* Items */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <FiPackage className="text-mid text-sm" />
              <h3 className="font-semibold text-sm text-ink">Items Ordered</h3>
            </div>
            <div className="space-y-3">
              {order.items?.map((item, i) => (
                <motion.div key={i} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 + i * 0.06 }}
                  className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-50 border border-gray-100 flex-shrink-0">
                    <img src={item.image || ''} alt={item.name} className="w-full h-full object-cover" onError={(e) => { e.target.style.display = 'none'; }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-ink truncate">{item.name}</p>
                    <p className="text-[10px] text-mid mt-0.5">{item.size} · {item.color} · Qty {item.quantity}</p>
                  </div>
                  <p className="font-semibold text-sm text-ink flex-shrink-0">{formatPrice(item.price * item.quantity)}</p>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Price Breakdown */}
          <div className="bg-gray-50 border border-gray-100 rounded-lg p-4 space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-mid">Subtotal</span>
              <span className="text-ink">{formatPrice(order.subtotal)}</span>
            </div>
            {order.discount > 0 && (
              <div className="flex justify-between text-neon">
                <span>Discount</span>
                <span>−{formatPrice(order.discount)}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-mid">Shipping</span>
              <span className={order.shippingCharge === 0 ? 'text-neon' : 'text-ink'}>
                {order.shippingCharge === 0 ? 'FREE' : formatPrice(order.shippingCharge)}
              </span>
            </div>
            <div className="flex justify-between font-bold text-base border-t border-gray-200 pt-2 mt-1">
              <span className="text-ink">Total</span>
              <span className="text-ink">{formatPrice(order.total)}</span>
            </div>
          </div>

          {/* Delivery Address */}
          <div>
            <h3 className="text-xs font-semibold text-ink uppercase tracking-wider mb-2">Delivery Address</h3>
            <div className="text-sm text-mid space-y-0.5">
              <p className="text-ink font-medium">{order.shippingAddress?.fullName}</p>
              <p>{order.shippingAddress?.addressLine1}, {order.shippingAddress?.city}</p>
              <p>{order.shippingAddress?.state} — {order.shippingAddress?.pincode}</p>
            </div>
          </div>

          {/* Payment Status */}
          <div className="flex items-center justify-between bg-gray-50 border border-gray-100 rounded-lg p-4">
            <div>
              <p className="text-xs font-semibold text-ink">Payment</p>
              <p className="text-xs text-mid mt-0.5">{order.paymentMethod === 'cod' ? 'Cash on Delivery' : 'Online Payment'}</p>
            </div>
            <span className={`text-[10px] font-bold px-3 py-1 rounded-full border uppercase tracking-wide ${
              order.paymentStatus === 'paid'
                ? 'text-neon bg-green-50 border-green-200'
                : 'text-amber-700 bg-amber-50 border-amber-200'
            }`}>
              {order.paymentStatus === 'paid' ? 'Paid' : 'Pending'}
            </span>
          </div>
        </motion.div>
      )}

      {/* Actions */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}
        className="flex gap-3 mt-6">
        <Link to="/orders" className="flex-1">
          <span className="block w-full py-3.5 text-center btn-outline text-sm">View All Orders</span>
        </Link>
        <Link to="/products" className="flex-1">
          <span className="btn-primary block w-full py-3.5 text-center text-sm flex items-center justify-center gap-2">
            Continue Shopping <FiArrowRight />
          </span>
        </Link>
      </motion.div>
    </div>
  );
}
