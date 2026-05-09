import { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import {
  FiGrid, FiPackage, FiShoppingBag, FiUsers, FiTag, FiSettings,
  FiMenu, FiX, FiLogOut, FiLayers, FiImage, FiSliders, FiStar,
} from 'react-icons/fi';
import useAuthStore from '../../store/authStore';
import clsx from 'clsx';

const NAV_ITEMS = [
  { icon: FiGrid,        label: 'Dashboard',   href: '/admin' },
  { icon: FiPackage,     label: 'Products',    href: '/admin/products' },
  { icon: FiLayers,      label: 'Collections', href: '/admin/collections' },
  { icon: FiShoppingBag, label: 'Orders',      href: '/admin/orders' },
  { icon: FiUsers,       label: 'Customers',   href: '/admin/customers' },
  { icon: FiStar,        label: 'Reviews',     href: '/admin/reviews' },
  { icon: FiTag,         label: 'Coupons',     href: '/admin/coupons' },
  { icon: FiImage,       label: 'Banners',     href: '/admin/banners' },
  { icon: FiSliders,     label: 'Theme',       href: '/admin/theme' },
  { icon: FiSettings,    label: 'Settings',    href: '/admin/settings' },
];

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { pathname } = useLocation();
  const { logout, user } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Sidebar */}
      <aside className={clsx(
        'bg-brand-black text-white flex flex-col transition-all duration-300 flex-shrink-0',
        sidebarOpen ? 'w-64' : 'w-16'
      )}>
        <div className="flex items-center justify-between h-16 px-4 border-b border-gray-700">
          {sidebarOpen && <span className="font-display text-2xl tracking-widest">VELOQ</span>}
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 rounded-lg hover:bg-gray-700 transition-colors ml-auto">
            {sidebarOpen ? <FiX /> : <FiMenu />}
          </button>
        </div>

        <nav className="flex-1 py-4 overflow-y-auto">
          {NAV_ITEMS.map(({ icon: Icon, label, href }) => {
            const isActive = pathname === href || (href !== '/admin' && pathname.startsWith(href));
            return (
              <Link key={href} to={href}
                className={clsx(
                  'flex items-center gap-3 px-4 py-3 mx-2 rounded-xl mb-1 transition-colors text-sm font-medium',
                  isActive ? 'bg-white text-brand-black' : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                )}>
                <Icon className={clsx('text-lg flex-shrink-0', isActive ? 'text-brand-black' : '')} />
                {sidebarOpen && label}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-gray-700 p-4">
          {sidebarOpen && (
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center text-sm font-semibold">
                {user?.name?.[0]?.toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{user?.name}</p>
                <p className="text-xs text-gray-400 truncate">{user?.email}</p>
              </div>
            </div>
          )}
          <button onClick={handleLogout}
            className={clsx('flex items-center gap-3 text-gray-400 hover:text-white transition-colors text-sm w-full',
              !sidebarOpen && 'justify-center')}>
            <FiLogOut />
            {sidebarOpen && 'Logout'}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto admin-main" data-lenis-prevent>
        <div className="p-6 max-w-full">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
