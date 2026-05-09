import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiShoppingCart, FiHeart, FiUser, FiSearch, FiX, FiChevronDown, FiPackage, FiLogOut } from 'react-icons/fi';
import { HiOutlineMenuAlt3 } from 'react-icons/hi';
import { useQuery } from '@tanstack/react-query';
import useAuthStore from '../../store/authStore';
import useCartStore from '../../store/cartStore';
import api from '../../utils/api';
import clsx from 'clsx';

const COLLECTIONS = [
  { label: 'Sneakers',         href: '/collections/sneakers' },
  { label: 'Casual Shoes',     href: '/collections/casual-shoes' },
  { label: 'Slippers',         href: '/collections/slippers-clogs' },
  { label: 'New Arrivals',     href: '/collections/new-arrivals' },
  { label: 'All Products',     href: '/products' },
];

const QUICK_SEARCHES = ['Sneakers', 'Casual Shoes', 'Slippers', 'White Shoes', 'Size 9'];

export default function Navbar() {
  const [menuOpen, setMenuOpen]   = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [userOpen, setUserOpen]   = useState(false);
  const { user, logout, isAuthenticated } = useAuthStore();
  const itemCount = useCartStore((s) => s.getItemCount());
  const navigate  = useNavigate();
  const { pathname } = useLocation();
  const inputRef  = useRef(null);
  const userRef   = useRef(null);

  const { data: settingsData } = useQuery({
    queryKey: ['publicSettings'],
    queryFn: () => api.get('/settings/public'),
    staleTime: 5 * 60 * 1000,
    retry: false,
  });
  const settings = settingsData?.settings || {};
  const announcementText = settings.announcementEnabled !== false
    ? (settings.announcementText || "Free delivery on orders above ₹999 · 100% Authentic Men's Footwear")
    : null;

  useEffect(() => { setMenuOpen(false); setSearchOpen(false); setUserOpen(false); }, [pathname]);

  useEffect(() => {
    if (searchOpen && inputRef.current) setTimeout(() => inputRef.current?.focus(), 80);
  }, [searchOpen]);

  useEffect(() => {
    const handler = (e) => { if (userRef.current && !userRef.current.contains(e.target)) setUserOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
      setSearchOpen(false);
    }
  };

  const isActive = (href) => href === '/products'
    ? pathname === '/products'
    : pathname.startsWith(href);

  return (
    <>
      {/* ── ANNOUNCEMENT BAR ── */}
      {announcementText && (
        <div className="bg-ink text-white text-center text-[11px] py-1.5 tracking-wide fixed top-0 left-0 right-0 z-50">
          {announcementText}
        </div>
      )}

      {/* ── MAIN NAVBAR ── */}
      <header className={clsx(
        'fixed left-0 right-0 z-50 bg-white border-b border-gray-200 shadow-sm',
        announcementText ? 'top-[30px]' : 'top-0'
      )}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6">

          {/* ── 3-COLUMN ROW ── */}
          <div className="relative flex items-center h-14">

            {/* LEFT — desktop nav links / mobile hamburger */}
            <div className="flex-1 flex items-center min-w-0">
              <nav className="hidden lg:flex items-center gap-0.5">
                {COLLECTIONS.map((c) => (
                  <Link
                    key={c.label}
                    to={c.href}
                    className={clsx(
                      'px-2.5 py-1.5 rounded-lg text-[11px] font-semibold transition-all whitespace-nowrap',
                      isActive(c.href)
                        ? 'bg-ink text-white'
                        : 'text-mid hover:text-ink hover:bg-gray-50'
                    )}
                  >
                    {c.label}
                  </Link>
                ))}
              </nav>

              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="lg:hidden w-9 h-9 flex items-center justify-center rounded-lg text-ink hover:bg-gray-100 transition-colors"
              >
                {menuOpen ? <FiX className="text-xl" /> : <HiOutlineMenuAlt3 className="text-xl" />}
              </button>
            </div>

            {/* CENTER — logo (absolutely positioned so it's truly centered) */}
            <div className="absolute left-1/2 -translate-x-1/2 pointer-events-none">
              <Link to="/" className="pointer-events-auto">
                <span className="font-display text-2xl font-black tracking-[0.15em] text-ink leading-none select-none">
                  VELOQ
                </span>
              </Link>
            </div>

            {/* RIGHT — search, wishlist, cart, account */}
            <div className="flex-1 flex items-center justify-end gap-0.5">

              <button
                onClick={() => setSearchOpen(!searchOpen)}
                className="w-9 h-9 flex items-center justify-center rounded-lg text-mid hover:bg-gray-100 hover:text-ink transition-colors"
                aria-label="Search"
              >
                {searchOpen ? <FiX className="text-lg" /> : <FiSearch className="text-lg" />}
              </button>

              <Link to="/wishlist" className="w-9 h-9 flex items-center justify-center rounded-lg text-mid hover:bg-gray-100 hover:text-ink transition-colors">
                <FiHeart className="text-lg" />
              </Link>

              <Link to="/cart" className="relative w-9 h-9 flex items-center justify-center rounded-lg text-mid hover:bg-gray-100 hover:text-ink transition-colors">
                <FiShoppingCart className="text-lg" />
                <AnimatePresence>
                  {itemCount > 0 && (
                    <motion.span
                      initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}
                      className="absolute -top-0.5 -right-0.5 min-w-[18px] min-h-[18px] bg-ink text-white text-[9px] font-black rounded-full flex items-center justify-center px-1 leading-none"
                    >
                      {itemCount > 9 ? '9+' : itemCount}
                    </motion.span>
                  )}
                </AnimatePresence>
              </Link>

              {isAuthenticated() ? (
                <div className="relative" ref={userRef}>
                  <button
                    onClick={() => setUserOpen(!userOpen)}
                    className="flex items-center gap-1 p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div className="w-7 h-7 rounded-full bg-ink text-white text-xs font-bold flex items-center justify-center">
                      {user?.name?.[0]?.toUpperCase()}
                    </div>
                    <FiChevronDown className={clsx('text-xs text-mid transition-transform hidden md:block', userOpen && 'rotate-180')} />
                  </button>
                  <AnimatePresence>
                    {userOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: -6, scale: 0.97 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -6, scale: 0.97 }}
                        transition={{ duration: 0.15 }}
                        className="absolute right-0 top-11 w-52 bg-white border border-gray-200 rounded-xl py-2 shadow-xl z-50"
                      >
                        <div className="px-4 py-2 border-b border-gray-100 mb-1">
                          <p className="text-xs font-semibold text-ink truncate">{user?.name}</p>
                          <p className="text-[10px] text-mid truncate">{user?.email}</p>
                        </div>
                        <Link to="/account" className="flex items-center gap-2.5 px-4 py-2 text-sm text-ink hover:bg-gray-50 transition-colors">
                          <FiUser className="text-mid text-sm" /> My Account
                        </Link>
                        <Link to="/orders" className="flex items-center gap-2.5 px-4 py-2 text-sm text-ink hover:bg-gray-50 transition-colors">
                          <FiPackage className="text-mid text-sm" /> My Orders
                        </Link>
                        {user?.role === 'admin' && (
                          <Link to="/admin" className="flex items-center gap-2.5 px-4 py-2 text-sm font-semibold text-blue-600 hover:bg-blue-50 transition-colors">
                            Admin Panel
                          </Link>
                        )}
                        <div className="border-t border-gray-100 mt-1 pt-1">
                          <button onClick={logout} className="w-full flex items-center gap-2.5 px-4 py-2 text-sm text-red-500 hover:bg-red-50 transition-colors">
                            <FiLogOut className="text-sm" /> Sign Out
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <Link to="/login" className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-300 text-xs font-semibold text-ink hover:border-ink hover:bg-gray-50 transition-all">
                  <FiUser className="text-sm" /> Sign In
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* ── SEARCH DROPDOWN ── */}
        <AnimatePresence>
          {searchOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden border-t border-gray-100 bg-white"
            >
              <div className="max-w-2xl mx-auto p-3 pb-4">
                <form onSubmit={handleSearch} className="flex gap-2">
                  <input
                    ref={inputRef}
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search shoes, styles, sizes..."
                    className="input-field py-2.5 text-sm"
                  />
                  <button type="submit" className="btn-primary px-5 py-2.5 flex-shrink-0 text-sm gap-1.5">
                    <FiSearch className="text-sm" /> Search
                  </button>
                </form>
                <div className="flex flex-wrap gap-2 mt-2.5">
                  {QUICK_SEARCHES.map(term => (
                    <button
                      key={term}
                      onClick={() => { navigate(`/products?search=${term}`); setSearchOpen(false); }}
                      className="text-[11px] text-mid hover:text-ink border border-gray-200 hover:border-gray-400 rounded-full px-3 py-1 transition-colors"
                    >
                      {term}
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* ── MOBILE SIDE MENU (slides from left) ── */}
      <AnimatePresence>
        {menuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/40 z-[55]"
              onClick={() => setMenuOpen(false)}
            />
            <motion.div
              initial={{ x: '-100%' }} animate={{ x: 0 }} exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="fixed top-0 left-0 bottom-0 w-72 z-[56] bg-white shadow-2xl flex flex-col"
            >
              <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
                <span className="font-display text-xl tracking-widest text-ink">VELOQ</span>
                <button onClick={() => setMenuOpen(false)} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100">
                  <FiX className="text-ink" />
                </button>
              </div>

              <nav className="flex-1 px-3 py-3 overflow-y-auto">
                <p className="text-[10px] font-semibold text-mid uppercase tracking-widest mb-2 px-2">Collections</p>
                {COLLECTIONS.map((c, i) => (
                  <motion.div key={c.label} initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }}>
                    <Link
                      to={c.href}
                      className={clsx(
                        'flex items-center py-3 px-3 rounded-xl mb-0.5 text-sm font-medium transition-all',
                        isActive(c.href) ? 'bg-ink text-white' : 'text-ink hover:bg-gray-50'
                      )}
                    >
                      {c.label}
                    </Link>
                  </motion.div>
                ))}
              </nav>

              {!isAuthenticated() ? (
                <div className="p-4 border-t border-gray-100 space-y-2">
                  <Link to="/login" className="block w-full text-center btn-primary py-3 text-sm">Sign In</Link>
                  <Link to="/register" className="block w-full text-center btn-outline py-3 text-sm">Create Account</Link>
                </div>
              ) : (
                <div className="p-3 border-t border-gray-100 space-y-0.5">
                  <Link to="/account" className="flex items-center gap-2.5 py-2.5 px-3 rounded-xl text-sm font-medium text-ink hover:bg-gray-50">
                    <FiUser className="text-mid" /> My Account
                  </Link>
                  <Link to="/orders" className="flex items-center gap-2.5 py-2.5 px-3 rounded-xl text-sm font-medium text-ink hover:bg-gray-50">
                    <FiPackage className="text-mid" /> My Orders
                  </Link>
                  {user?.role === 'admin' && (
                    <Link to="/admin" className="flex items-center gap-2.5 py-2.5 px-3 rounded-xl text-sm font-semibold text-blue-600 hover:bg-blue-50">
                      Admin Panel
                    </Link>
                  )}
                  <button onClick={logout} className="w-full flex items-center gap-2.5 py-2.5 px-3 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50">
                    <FiLogOut /> Sign Out
                  </button>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
