import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { FiPackage, FiEye, FiChevronRight } from 'react-icons/fi';
import api from '../utils/api';
import { formatPrice, formatDate } from '../utils/helpers';
import { PageLoader } from '../components/common/LoadingSpinner';
import clsx from 'clsx';

const STATUS_STYLES = {
  pending:    'text-amber-700 bg-amber-50 border-amber-200',
  confirmed:  'text-blue-700 bg-blue-50 border-blue-200',
  processing: 'text-purple-700 bg-purple-50 border-purple-200',
  shipped:    'text-cyan-700 bg-cyan-50 border-cyan-200',
  delivered:  'text-green-700 bg-green-50 border-green-200',
  cancelled:  'text-red-700 bg-red-50 border-red-200',
};

export default function OrdersPage() {
  const [page, setPage] = useState(1);
  const { data, isLoading } = useQuery({
    queryKey: ['myOrders', page],
    queryFn: () => api.get(`/orders/my-orders?page=${page}&limit=10`),
  });

  if (isLoading) return <PageLoader />;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <h1 className="text-2xl font-bold text-ink">My Orders</h1>
      </motion.div>

      {data?.orders?.length === 0 ? (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center justify-center py-24 text-center">
          <div className="w-20 h-20 bg-gray-100 rounded-2xl flex items-center justify-center mb-6">
            <FiPackage className="text-4xl text-mid" />
          </div>
          <h2 className="text-xl font-bold text-ink mb-2">No orders yet</h2>
          <p className="text-mid text-sm mb-8">Your orders will appear here</p>
          <Link to="/products" className="btn-primary px-8 py-3 text-sm inline-flex">Start Shopping</Link>
        </motion.div>
      ) : (
        <div className="space-y-3">
          {data.orders.map((order, i) => (
            <motion.div key={order._id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
              className="bg-white border border-gray-200 rounded-xl p-5 hover:border-gray-300 transition-colors group">
              <div className="flex items-start justify-between gap-3 mb-4">
                <div>
                  <p className="font-semibold text-sm text-ink">{order.orderNumber}</p>
                  <p className="text-xs text-mid mt-0.5">{formatDate(order.createdAt)}</p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className={clsx('text-[10px] font-bold px-2.5 py-1 rounded-full border uppercase tracking-wide', STATUS_STYLES[order.orderStatus] || STATUS_STYLES.pending)}>
                    {order.orderStatus}
                  </span>
                  <Link to={`/orders/${order._id}`}
                    className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-mid hover:border-gray-400 hover:text-ink transition-all">
                    <FiEye className="text-xs" />
                  </Link>
                </div>
              </div>

              <div className="flex gap-2 overflow-x-auto pb-1">
                {order.items?.slice(0, 5).map((item, j) => (
                  <div key={j} className="w-14 h-14 rounded-xl overflow-hidden bg-gray-50 border border-gray-100 flex-shrink-0">
                    <img src={item.image || ''} alt={item.name} className="w-full h-full object-cover" onError={(e) => { e.target.style.display = 'none'; }} />
                  </div>
                ))}
                {order.items?.length > 5 && (
                  <div className="w-14 h-14 bg-gray-50 border border-gray-100 rounded-xl flex items-center justify-center text-xs font-bold text-mid flex-shrink-0">
                    +{order.items.length - 5}
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100">
                <p className="text-xs text-mid">
                  {order.items?.length} {order.items?.length === 1 ? 'item' : 'items'} ·{' '}
                  {order.paymentMethod === 'cod' ? 'Cash on Delivery' : 'Online Payment'}
                </p>
                <div className="flex items-center gap-2">
                  <p className="font-bold text-ink text-sm">{formatPrice(order.total)}</p>
                  <Link to={`/orders/${order._id}`} className="text-mid hover:text-ink transition-colors">
                    <FiChevronRight />
                  </Link>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
