import { useQuery } from '@tanstack/react-query';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import {
  FiShoppingBag, FiDollarSign, FiPackage, FiUsers, FiAlertCircle,
  FiTrendingUp, FiPlus, FiEye, FiArrowUpRight, FiClock,
} from 'react-icons/fi';
import api from '../../utils/api';
import { formatPrice, formatDate, ORDER_STATUS_COLORS, getImageUrl } from '../../utils/helpers';
import { PageLoader } from '../../components/common/LoadingSpinner';
import { Link } from 'react-router-dom';
import clsx from 'clsx';

const STATUS_PILL = {
  pending:    'bg-yellow-100 text-yellow-700',
  confirmed:  'bg-blue-100 text-blue-700',
  processing: 'bg-purple-100 text-purple-700',
  shipped:    'bg-indigo-100 text-indigo-700',
  delivered:  'bg-green-100 text-green-700',
  cancelled:  'bg-red-100 text-red-700',
  returned:   'bg-gray-100 text-gray-700',
};

const QUICK_ACTIONS = [
  { label: 'Add Product',    href: '/admin/products/new',  icon: FiPlus,     color: 'bg-blue-600',   desc: 'Upload new product' },
  { label: 'Add Collection', href: '/admin/collections',   icon: FiPackage,  color: 'bg-purple-600', desc: 'Create collection' },
  { label: 'Edit Banners',   href: '/admin/banners',       icon: FiEye,      color: 'bg-orange-500', desc: 'Update homepage banners' },
  { label: 'View Orders',    href: '/admin/orders',        icon: FiShoppingBag, color: 'bg-green-600', desc: 'Manage customer orders' },
];

export default function AdminDashboard() {
  const { data, isLoading } = useQuery({
    queryKey: ['adminDashboard'],
    queryFn: () => api.get('/admin/dashboard'),
    refetchInterval: 60000,
  });

  if (isLoading) return <PageLoader />;

  const { stats, recentOrders, lowStockProducts, topProducts, revenueChart } = data || {};

  const STAT_CARDS = [
    {
      label: 'Total Revenue', value: formatPrice(stats?.totalRevenue || 0),
      sub: `This month: ${formatPrice(stats?.monthOrders ? (stats?.totalRevenue / (stats?.totalOrders || 1)) * stats?.monthOrders : 0)}`,
      icon: FiDollarSign, bg: 'bg-emerald-50', iconColor: 'text-emerald-600', border: 'border-emerald-100',
    },
    {
      label: 'Total Orders', value: stats?.totalOrders || 0,
      sub: `This month: ${stats?.monthOrders || 0}`,
      icon: FiShoppingBag, bg: 'bg-blue-50', iconColor: 'text-blue-600', border: 'border-blue-100',
    },
    {
      label: 'Products', value: stats?.totalProducts || 0,
      sub: 'Active listings',
      icon: FiPackage, bg: 'bg-violet-50', iconColor: 'text-violet-600', border: 'border-violet-100',
    },
    {
      label: 'Customers', value: stats?.totalCustomers || 0,
      sub: 'Registered users',
      icon: FiUsers, bg: 'bg-amber-50', iconColor: 'text-amber-600', border: 'border-amber-100',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-500 text-sm mt-0.5">Welcome back! Here's your store overview.</p>
        </div>
        <div className="flex items-center gap-2">
          {stats?.pendingOrders > 0 && (
            <Link to="/admin/orders?status=pending"
              className="flex items-center gap-2 bg-yellow-50 border border-yellow-200 text-yellow-700 text-xs font-semibold px-3 py-2 rounded-xl hover:bg-yellow-100 transition-colors">
              <FiClock className="text-sm" />
              {stats.pendingOrders} pending order{stats.pendingOrders !== 1 ? 's' : ''}
            </Link>
          )}
          <Link to="/admin/products/new" className="btn-primary text-sm px-4 py-2 flex items-center gap-2">
            <FiPlus /> Add Product
          </Link>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {QUICK_ACTIONS.map(({ label, href, icon: Icon, color, desc }) => (
          <Link key={href} to={href}
            className="bg-white border border-gray-200 rounded-xl p-4 flex items-center gap-3 hover:border-gray-300 hover:shadow-sm transition-all group">
            <div className={clsx('w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0', color)}>
              <Icon className="text-white text-base" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-gray-900 truncate group-hover:text-blue-600 transition-colors">{label}</p>
              <p className="text-[10px] text-gray-400 truncate">{desc}</p>
            </div>
          </Link>
        ))}
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {STAT_CARDS.map(({ label, value, sub, icon: Icon, bg, iconColor, border }) => (
          <div key={label} className={clsx('bg-white border rounded-xl p-5', border)}>
            <div className="flex items-start justify-between mb-3">
              <div className={clsx('w-10 h-10 rounded-xl flex items-center justify-center', bg)}>
                <Icon className={clsx('text-lg', iconColor)} />
              </div>
              <FiArrowUpRight className="text-gray-300 text-sm" />
            </div>
            <p className="text-2xl font-bold text-gray-900">{value}</p>
            <p className="text-gray-500 text-xs mt-1 font-medium">{label}</p>
            <p className="text-gray-400 text-[11px] mt-0.5">{sub}</p>
          </div>
        ))}
      </div>

      {/* Revenue Chart */}
      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="font-bold text-gray-900">Revenue Overview</h2>
            <p className="text-xs text-gray-400 mt-0.5">Last 30 days</p>
          </div>
          <FiTrendingUp className="text-emerald-500 text-lg" />
        </div>
        <ResponsiveContainer width="100%" height={240}>
          <AreaChart data={revenueChart || []}>
            <defs>
              <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#111827" stopOpacity={0.12} />
                <stop offset="95%" stopColor="#111827" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
            <XAxis dataKey="_id" tick={{ fontSize: 10, fill: '#9ca3af' }} tickFormatter={(d) => d?.slice(5)} />
            <YAxis tick={{ fontSize: 10, fill: '#9ca3af' }} tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`} />
            <Tooltip
              contentStyle={{ background: '#111827', border: 'none', borderRadius: '12px', padding: '8px 12px' }}
              labelStyle={{ color: '#9ca3af', fontSize: 11 }}
              itemStyle={{ color: '#fff', fontSize: 12, fontWeight: 600 }}
              formatter={(v) => [formatPrice(v), 'Revenue']}
            />
            <Area type="monotone" dataKey="revenue" stroke="#111827" fill="url(#revGrad)" strokeWidth={2} dot={false} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <h2 className="font-bold text-gray-900">Recent Orders</h2>
            <Link to="/admin/orders" className="text-xs font-semibold text-blue-600 hover:underline flex items-center gap-1">
              View All <FiArrowUpRight className="text-[10px]" />
            </Link>
          </div>
          <div className="divide-y divide-gray-50">
            {recentOrders?.slice(0, 6).map((order) => (
              <Link key={order._id} to={`/admin/orders/${order._id}`}
                className="flex items-center justify-between px-5 py-3 hover:bg-gray-50 transition-colors">
                <div>
                  <p className="text-sm font-semibold text-gray-900">{order.orderNumber}</p>
                  <p className="text-xs text-gray-400">{order.user?.name} · {formatDate(order.createdAt)}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={clsx('text-[10px] font-bold px-2 py-0.5 rounded-full capitalize', STATUS_PILL[order.orderStatus] || 'bg-gray-100 text-gray-600')}>
                    {order.orderStatus}
                  </span>
                  <span className="text-sm font-bold text-gray-900">{formatPrice(order.total)}</span>
                </div>
              </Link>
            ))}
            {!recentOrders?.length && (
              <p className="text-gray-400 text-sm py-8 text-center">No orders yet</p>
            )}
          </div>
        </div>

        {/* Low Stock */}
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          <div className="flex items-center gap-2 px-5 py-4 border-b border-gray-100">
            <FiAlertCircle className="text-orange-500 text-base" />
            <h2 className="font-bold text-gray-900">Low Stock Alert</h2>
          </div>
          <div className="divide-y divide-gray-50">
            {lowStockProducts?.length === 0 && (
              <p className="text-gray-400 text-sm py-8 text-center">All products well stocked ✓</p>
            )}
            {lowStockProducts?.slice(0, 6).map((product) => (
              <Link key={product._id} to={`/admin/products/${product._id}/edit`}
                className="flex items-center gap-3 px-5 py-3 hover:bg-gray-50 transition-colors">
                <img
                  src={getImageUrl(product.images?.[0]?.url) || 'https://placehold.co/40x40/f5f5f5/999?text=V'}
                  alt={product.name}
                  className="w-10 h-10 object-cover rounded-lg bg-gray-100 flex-shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{product.name}</p>
                  <p className="text-xs text-orange-500 font-medium">
                    {product.variants?.filter((v) => v.stock < 5).length} variant(s) low
                  </p>
                </div>
                <span className="text-xs font-bold text-orange-500 bg-orange-50 px-2 py-0.5 rounded-full flex-shrink-0">
                  Low
                </span>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Top Products */}
      {topProducts?.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100">
            <h2 className="font-bold text-gray-900">Top Selling Products</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="text-left py-3 px-5 font-semibold text-gray-500 text-xs uppercase tracking-wider">Product</th>
                  <th className="text-right py-3 px-5 font-semibold text-gray-500 text-xs uppercase tracking-wider">Units</th>
                  <th className="text-right py-3 px-5 font-semibold text-gray-500 text-xs uppercase tracking-wider">Revenue</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {topProducts.map((item, i) => (
                  <tr key={item._id} className="hover:bg-gray-50 transition-colors">
                    <td className="py-3.5 px-5">
                      <div className="flex items-center gap-3">
                        <span className="text-xs text-gray-400 font-bold w-4">{i + 1}</span>
                        <img
                          src={getImageUrl(item.product?.images?.[0]?.url) || 'https://placehold.co/40x40/f5f5f5/999?text=V'}
                          alt={item.product?.name}
                          className="w-9 h-9 object-cover rounded-lg bg-gray-100 flex-shrink-0"
                        />
                        <span className="font-medium text-gray-900">{item.product?.name}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-5 text-right font-bold text-gray-900">{item.totalSold}</td>
                    <td className="py-3.5 px-5 text-right font-bold text-emerald-600">{formatPrice(item.revenue)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
