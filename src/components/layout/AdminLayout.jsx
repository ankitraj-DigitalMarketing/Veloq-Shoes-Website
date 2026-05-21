import { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  FiGrid, FiPackage, FiShoppingBag, FiUsers, FiTag, FiSettings,
  FiMenu, FiX, FiLogOut, FiLayers, FiImage, FiSliders, FiStar,
  FiExternalLink, FiBell, FiChevronRight,
} from 'react-icons/fi';
import useAuthStore from '../../store/authStore';
import api from '../../utils/api';
import clsx from 'clsx';

const NAV_GROUPS = [
  {
    label: 'Store',
    items: [
      { icon: FiGrid,        label: 'Dashboard',   href: '/admin' },
      { icon: FiPackage,     label: 'Products',    href: '/admin/products' },
      { icon: FiLayers,      label: 'Collections', href: '/admin/collections' },
      { icon: FiShoppingBag, label: 'Orders',      href: '/admin/orders' },
      { icon: FiUsers,       label: 'Customers',   href: '/admin/customers' },
      { icon: FiStar,        label: 'Reviews',     href: '/admin/reviews' },
    ],
  },
  {
    label: 'Marketing',
    items: [
      { icon: FiTag,    label: 'Coupons', href: '/admin/coupons' },
      { icon: FiImage,  label: 'Banners', href: '/admin/banners' },
    ],
  },
  {
    label: 'Customize',
    items: [
      { icon: FiSliders,  label: 'Theme',    href: '/admin/theme' },
      { icon: FiSettings, label: 'Settings', href: '/admin/settings' },
    ],
  },
];

function NavItem({ icon: Icon, label, href, active, collapsed }) {
  return (
    <Link to={href}
      className={clsx(
        'flex items-center gap-3 px-3 py-2.5 rounded-xl mb-0.5 transition-all duration-150 text-sm font-medium group',
        active
          ? 'bg-white text-gray-900 shadow-sm'
          : 'text-gray-400 hover:bg-white/10 hover:text-white'
      )}>
      <Icon className={clsx('text-base flex-shrink-0', active ? 'text-gray-900' : 'text-gray-400 group-hover:text-white')} />
      {!collapsed && <span className="truncate">{label}</span>}
    </Link>
  );
}

export default function AdminLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { pathname } = useLocation();
  const { logout, user } = useAuthStore();
  const navigate = useNavigate();

  const { data: dashData } = useQuery({
    queryKey: ['adminDashboardBadge'],
    queryFn: () => api.get('/admin/dashboard'),
    refetchInterval: 120000,
    staleTime: 60000,
  });
  const pendingOrders = dashData?.stats?.pendingOrders || 0;

  const handleLogout = () => { logout(); navigate('/login'); };

  const SidebarContent = ({ isMobile = false }) => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className={clsx('flex items-center h-16 border-b border-white/10 flex-shrink-0',
        collapsed && !isMobile ? 'justify-center px-2' : 'px-4 gap-3')}>
        <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center flex-shrink-0">
          <span className="text-gray-900 font-black text-sm">V</span>
        </div>
        {(!collapsed || isMobile) && (
          <span className="font-black text-white text-lg tracking-widest">VELOQ</span>
        )}
        {(!collapsed || isMobile) && (
          <button onClick={() => isMobile ? setMobileOpen(false) : setCollapsed(true)}
            className="ml-auto text-gray-400 hover:text-white transition-colors p-1">
            {isMobile ? <FiX /> : <FiChevronRight className="rotate-180" />}
          </button>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-4">
        {NAV_GROUPS.map((group) => (
          <div key={group.label}>
            {(!collapsed || isMobile) && (
              <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest px-3 mb-1">{group.label}</p>
            )}
            {group.items.map(({ icon, label, href }) => {
              const active = pathname === href || (href !== '/admin' && pathname.startsWith(href));
              return (
                <div key={href} onClick={() => isMobile && setMobileOpen(false)}>
                  <NavItem icon={icon} label={label} href={href} active={active} collapsed={collapsed && !isMobile} />
                </div>
              );
            })}
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className={clsx('border-t border-white/10 p-3 flex-shrink-0', collapsed && !isMobile ? 'flex justify-center' : '')}>
        {(!collapsed || isMobile) ? (
          <div className="space-y-1">
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/5">
              <div className="w-7 h-7 bg-white/20 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0">
                {user?.name?.[0]?.toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-white truncate">{user?.name}</p>
                <p className="text-[10px] text-gray-400 truncate">{user?.email}</p>
              </div>
            </div>
            <button onClick={handleLogout}
              className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors text-xs w-full px-3 py-2 rounded-xl hover:bg-white/10">
              <FiLogOut className="text-sm" /> Logout
            </button>
          </div>
        ) : (
          <button onClick={handleLogout} className="text-gray-400 hover:text-white p-2 rounded-xl hover:bg-white/10">
            <FiLogOut />
          </button>
        )}
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Desktop Sidebar */}
      <aside className={clsx(
        'hidden md:flex flex-col bg-gray-900 transition-all duration-300 flex-shrink-0',
        collapsed ? 'w-16' : 'w-60'
      )}>
        {collapsed ? (
          <div className="flex flex-col h-full">
            <div className="h-16 border-b border-white/10 flex items-center justify-center">
              <button onClick={() => setCollapsed(false)} className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
                <span className="text-gray-900 font-black text-sm">V</span>
              </button>
            </div>
            <nav className="flex-1 overflow-y-auto py-3 px-2">
              {NAV_GROUPS.flatMap(g => g.items).map(({ icon, label, href }) => {
                const active = pathname === href || (href !== '/admin' && pathname.startsWith(href));
                return <NavItem key={href} icon={icon} label={label} href={href} active={active} collapsed />;
              })}
            </nav>
            <div className="border-t border-white/10 p-2 flex justify-center">
              <button onClick={handleLogout} className="text-gray-400 hover:text-white p-2 rounded-xl hover:bg-white/10">
                <FiLogOut />
              </button>
            </div>
          </div>
        ) : (
          <SidebarContent />
        )}
      </aside>

      {/* Mobile Sidebar Overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-black/60" onClick={() => setMobileOpen(false)} />
          <aside className="absolute left-0 top-0 bottom-0 w-64 bg-gray-900 flex flex-col z-10">
            <SidebarContent isMobile />
          </aside>
        </div>
      )}

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Header */}
        <header className="h-14 bg-white border-b border-gray-200 flex items-center px-4 gap-3 flex-shrink-0 z-10">
          <button onClick={() => setMobileOpen(true)} className="md:hidden p-2 text-gray-500 hover:text-gray-900">
            <FiMenu />
          </button>

          {/* Breadcrumb-style title */}
          <div className="flex-1 flex items-center gap-2 text-sm text-gray-500">
            <span className="font-semibold text-gray-900">Admin</span>
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-2">
            {pendingOrders > 0 && (
              <Link to="/admin/orders" className="relative p-2 text-gray-500 hover:text-gray-900 transition-colors">
                <FiBell className="text-lg" />
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                  {pendingOrders > 9 ? '9+' : pendingOrders}
                </span>
              </Link>
            )}
            <a href="/" target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-xs font-semibold text-gray-700 border border-gray-200 px-3 py-1.5 rounded-lg hover:border-gray-400 hover:bg-gray-50 transition-all">
              <FiExternalLink className="text-xs" /> View Store
            </a>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto admin-main" data-lenis-prevent>
          <div className="p-6 max-w-full">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
