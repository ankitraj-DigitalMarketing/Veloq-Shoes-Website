import { useQuery } from '@tanstack/react-query';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import { FiShoppingBag, FiDollarSign, FiPackage, FiUsers, FiAlertCircle } from 'react-icons/fi';
import api from '../../utils/api';
import { formatPrice, formatDate, ORDER_STATUS_COLORS } from '../../utils/helpers';
import { PageLoader } from '../../components/common/LoadingSpinner';
import { Link } from 'react-router-dom';
import clsx from 'clsx';

export default function AdminDashboard() {
  const { data, isLoading } = useQuery({
    queryKey: ['adminDashboard'],
    queryFn: () => api.get('/admin/dashboard'),
    refetchInterval: 60000,
  });

  if (isLoading) return <PageLoader />;

  const { stats, recentOrders, lowStockProducts, topProducts, revenueChart } = data || {};

  const STAT_CARDS = [
    { label: 'Total Revenue', value: formatPrice(stats?.totalRevenue || 0), icon: FiDollarSign, color: 'bg-green-100 text-green-600' },
    { label: 'Total Orders', value: stats?.totalOrders || 0, icon: FiShoppingBag, color: 'bg-blue-100 text-blue-600' },
    { label: 'Products', value: stats?.totalProducts || 0, icon: FiPackage, color: 'bg-purple-100 text-purple-600' },
    { label: 'Customers', value: stats?.totalCustomers || 0, icon: FiUsers, color: 'bg-orange-100 text-orange-600' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-brand-black">Dashboard</h1>
          <p className="text-gray-400 text-sm mt-1">Welcome back! Here's what's happening.</p>
        </div>
        <Link to="/admin/products/new" className="btn-primary text-sm px-4 py-2">+ Add Product</Link>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {STAT_CARDS.map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="card p-6">
            <div className="flex items-center justify-between mb-3">
              <div className={clsx('w-10 h-10 rounded-xl flex items-center justify-center', color)}>
                <Icon className="text-lg" />
              </div>
            </div>
            <p className="text-2xl font-bold">{value}</p>
            <p className="text-gray-400 text-sm mt-1">{label}</p>
          </div>
        ))}
      </div>

      {/* Revenue Chart */}
      <div className="card p-6">
        <h2 className="font-bold text-lg mb-6">Revenue (Last 30 Days)</h2>
        <ResponsiveContainer width="100%" height={280}>
          <AreaChart data={revenueChart || []}>
            <defs>
              <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#0a0a0a" stopOpacity={0.15} />
                <stop offset="95%" stopColor="#0a0a0a" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="_id" tick={{ fontSize: 11 }} tickFormatter={(d) => d?.slice(5)} />
            <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`} />
            <Tooltip formatter={(v) => [formatPrice(v), 'Revenue']} />
            <Area type="monotone" dataKey="revenue" stroke="#0a0a0a" fill="url(#revenueGrad)" strokeWidth={2} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-lg">Recent Orders</h2>
            <Link to="/admin/orders" className="text-sm text-blue-500 hover:underline">View All</Link>
          </div>
          <div className="space-y-3">
            {recentOrders?.slice(0, 6).map((order) => (
              <Link key={order._id} to={`/admin/orders/${order._id}`}
                className="flex items-center justify-between py-2 hover:bg-gray-50 rounded-xl px-2 transition-colors">
                <div>
                  <p className="text-sm font-semibold">{order.orderNumber}</p>
                  <p className="text-xs text-gray-400">{order.user?.name} · {formatDate(order.createdAt)}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={clsx('badge text-xs px-2 py-0.5', ORDER_STATUS_COLORS[order.orderStatus])}>
                    {order.orderStatus}
                  </span>
                  <span className="font-semibold text-sm">{formatPrice(order.total)}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Low Stock Alert */}
        <div className="card p-6">
          <div className="flex items-center gap-2 mb-4">
            <FiAlertCircle className="text-orange-500" />
            <h2 className="font-bold text-lg">Low Stock Alert</h2>
          </div>
          {lowStockProducts?.length === 0 ? (
            <p className="text-gray-400 text-sm py-4">No low stock items</p>
          ) : (
            <div className="space-y-3">
              {lowStockProducts?.slice(0, 6).map((product) => (
                <Link key={product._id} to={`/admin/products/${product._id}/edit`}
                  className="flex items-center gap-3 py-2 hover:bg-gray-50 rounded-xl px-2 transition-colors">
                  <img
                    src={product.images?.[0]?.url || 'https://placehold.co/40x40/f5f5f5/999?text=V'}
                    alt={product.name}
                    className="w-10 h-10 object-cover rounded-lg bg-gray-100"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{product.name}</p>
                    <p className="text-xs text-orange-500">
                      {product.variants?.filter((v) => v.stock < 5).length} variants low
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Top Products */}
      <div className="card p-6">
        <h2 className="font-bold text-lg mb-4">Top Selling Products</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-left py-3 px-2 font-semibold text-gray-500">Product</th>
                <th className="text-right py-3 px-2 font-semibold text-gray-500">Units Sold</th>
                <th className="text-right py-3 px-2 font-semibold text-gray-500">Revenue</th>
              </tr>
            </thead>
            <tbody>
              {topProducts?.map((item) => (
                <tr key={item._id} className="border-b last:border-0 hover:bg-gray-50 transition-colors">
                  <td className="py-3 px-2">
                    <div className="flex items-center gap-3">
                      <img src={item.product?.images?.[0]?.url || 'https://placehold.co/40x40/f5f5f5/999?text=V'}
                        alt={item.product?.name}
                        className="w-10 h-10 object-cover rounded-lg bg-gray-100" />
                      <span className="font-medium">{item.product?.name}</span>
                    </div>
                  </td>
                  <td className="py-3 px-2 text-right font-semibold">{item.totalSold}</td>
                  <td className="py-3 px-2 text-right font-semibold text-green-600">{formatPrice(item.revenue)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
