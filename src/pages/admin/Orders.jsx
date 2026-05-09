import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { FiEye, FiSearch } from 'react-icons/fi';
import api from '../../utils/api';
import { formatPrice, formatDate, ORDER_STATUS_COLORS } from '../../utils/helpers';
import { PageLoader } from '../../components/common/LoadingSpinner';
import Pagination from '../../components/common/Pagination';
import clsx from 'clsx';

const STATUS_FILTERS = ['', 'pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'returned'];

export default function AdminOrders() {
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState('');
  const [search, setSearch] = useState('');

  const query = new URLSearchParams({ page, limit: 20, ...(status && { status }), ...(search && { search }) }).toString();

  const { data, isLoading } = useQuery({
    queryKey: ['adminOrders', query],
    queryFn: () => api.get(`/admin/orders?${query}`),
  });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Orders</h1>

      <div className="card p-4 flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-48">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search by order #..." className="input-field pl-9 py-2 text-sm" />
        </div>
        <div className="flex gap-2 flex-wrap">
          {STATUS_FILTERS.map((s) => (
            <button key={s || 'all'}
              onClick={() => { setStatus(s); setPage(1); }}
              className={clsx('px-3 py-1.5 text-xs font-medium rounded-full transition-colors capitalize',
                status === s ? 'bg-brand-black text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200')}>
              {s || 'All'}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? <PageLoader /> : (
        <div className="card overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="p-4 text-left font-semibold text-gray-500">Order</th>
                <th className="p-4 text-left font-semibold text-gray-500 hidden md:table-cell">Customer</th>
                <th className="p-4 text-left font-semibold text-gray-500 hidden lg:table-cell">Date</th>
                <th className="p-4 text-center font-semibold text-gray-500">Status</th>
                <th className="p-4 text-right font-semibold text-gray-500">Total</th>
                <th className="p-4 text-right font-semibold text-gray-500">Action</th>
              </tr>
            </thead>
            <tbody>
              {data?.orders?.map((order) => (
                <tr key={order._id} className="border-b last:border-0 hover:bg-gray-50 transition-colors">
                  <td className="p-4">
                    <p className="font-semibold">{order.orderNumber}</p>
                    <p className="text-xs text-gray-400">{order.items?.length} item(s)</p>
                  </td>
                  <td className="p-4 hidden md:table-cell">
                    <p className="font-medium">{order.user?.name}</p>
                    <p className="text-xs text-gray-400">{order.user?.email}</p>
                  </td>
                  <td className="p-4 text-gray-500 hidden lg:table-cell">{formatDate(order.createdAt)}</td>
                  <td className="p-4 text-center">
                    <span className={clsx('badge text-xs px-2 py-1 capitalize', ORDER_STATUS_COLORS[order.orderStatus])}>
                      {order.orderStatus}
                    </span>
                  </td>
                  <td className="p-4 text-right font-bold">{formatPrice(order.total)}</td>
                  <td className="p-4 text-right">
                    <Link to={`/admin/orders/${order._id}`}
                      className="p-2 hover:bg-blue-50 text-blue-500 rounded-lg transition-colors inline-block">
                      <FiEye className="text-sm" />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {data?.orders?.length === 0 && (
            <div className="text-center py-16 text-gray-400">No orders found</div>
          )}
        </div>
      )}
      <Pagination currentPage={page} totalPages={data?.pages} onPageChange={setPage} />
    </div>
  );
}
