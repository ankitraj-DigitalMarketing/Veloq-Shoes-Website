import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiShoppingCart, FiHeart, FiUser, FiSearch, FiX,
  FiChevronDown, FiPackage, FiLogOut,
} from 'react-icons/fi';
import { HiOutlineMenuAlt3 } from 'react-icons/hi';
import { useQuery } from '@tanstack/react-query';
import useAuthStore from '../../store/authStore';
import useCartStore from '../../store/cartStore';
import useUIStore from '../../store/uiStore';
import api from '../../utils/api';
import clsx from 'clsx';

const COLLECTIONS = [
  { label: 'Sneakers',     href: '/collections/sneakers' },
  { label: 'Casual Shoes', href: '/collections/casual-shoes' },
  { label: 'Slippers',     href: '/collections/slippers-clogs' },
  { label: 'New Arrivals', href: '/collections/new-arrivals' },
  { label: 'All Products', href: '/products' },
];

const QUICK_SEARCHES = ['Sneakers', 'Casual Shoes', 'Slippers', 'White Shoes', 'Size 9'];

export default function Navbar() {
  const [menuOpen, setMenuOpen]     = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [userOpen, setUserOpen]     = useState(false);
  const [scrolled, setScrolled]     = useState(false);

  const { user, logout, isAuthenticated } = useAuthStore();
  const itemCount = useCartStore((s) => s.getItemCount());
  const { openCart } = useUIStore();
  const navigate   = useNavigate();
  const { pathname } = useLocation();
  const inputRef   = useRef(null);
  const userRef    = useRef(null);

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

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    setMenuOpen(false);
    setSearchOpen(false);
    setUserOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (searchOpen && inputRef.current) setTimeout(() => inputRef.current?.focus(), 80);
  }, [searchOpen]);

  useEffect(() => {
    const handler = (e) => {
      if (userRef.current && !userRef.current.contains(e.target)) setUserOpen(false);
    };
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

  const isActive = (href) =>
    href === '/products' ? pathname === '/products' : pathname.startsWith(href);

  return (
    <>
      {/* ── ANNOUNCEMENT BAR ── */}
      {announcementText && (
        <div
          className="fixed top-0 left-0 right-0 z-50 text-center text-[11px] py-1.5 tracking-widest font-bold uppercase"
          style={{ background: '#0A0A0A', color: '#C8FF00', borderBottom: '1px solid #222' }}
        >
          {announcementText}
        </div>
      )}

      {/* ── MAIN NAVBAR ── */}
      <header
        className={clsx(
          'fixed left-0 right-0 z-50 transition-all duration-300',
          announcementText ? 'top-[30px]' : 'top-0'
        )}
        style={{
          background: scrolled ? 'rgba(10,10,10,0.97)' : 'rgba(10,10,10,0.95)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderBottom: '1px solid #222222',
          boxShadow: scrolled ? '0 4px 30px rgba(0,0,0,0.5)' : 'none',
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6">

          {/* ── 3-COLUMN ROW ── */}
          <div className="relative flex items-center h-14">

            {/* LEFT — desktop nav / mobile hamburger */}
            <div className="flex-1 flex items-center min-w-0">
              <nav className="hidden lg:flex items-center gap-0.5">
                {COLLECTIONS.map((c) => (
                  <Link
                    key={c.label}
                    to={c.href}
                    className={clsx(
                      'px-3 py-1.5 rounded-lg text-[11px] font-semibold tracking-wide uppercase transition-all duration-200 whitespace-nowrap',
                      isActive(c.href)
                        ? 'text-[#C8FF00]'
                        : 'text-[#777] hover:text-white'
                    )}
                    style={isActive(c.href) ? {
                      borderBottom: '2px solid #C8FF00',
                      paddingBottom: '4px',
                    } : {}}
                  >
                    {c.label}
                  </Link>
                ))}
              </nav>

              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="lg:hidden w-9 h-9 flex items-center justify-center rounded-lg text-white hover:text-[#C8FF00] transition-colors"
                style={{ background: 'rgba(255,255,255,0.05)' }}
              >
                {menuOpen ? <FiX className="text-xl" /> : <HiOutlineMenuAlt3 className="text-xl" />}
              </button>
            </div>

            {/* CENTER — logo */}
            <div className="absolute left-1/2 -translate-x-1/2 pointer-events-none">
              <Link to="/" className="pointer-events-auto group">
                <span
                  className="font-display text-2xl tracking-[0.2em] text-white leading-none select-none"
                  style={{ fontFamily: "'Bebas Neue', sans-serif", letterSpacing: '0.2em' }}
                >
                  VELO<span className="group-hover:text-[#C8FF00] transition-colors duration-200">Q</span>
                </span>
              </Link>
            </div>

            {/* RIGHT — icons */}
            <div className="flex-1 flex items-center justify-end gap-0.5">

              <button
                onClick={() => setSearchOpen(!searchOpen)}
                className="w-9 h-9 flex items-center justify-center rounded-lg text-[#777] hover:text-[#C8FF00] transition-colors"
                aria-label="Search"
              >
                {searchOpen ? <FiX className="text-lg" /> : <FiSearch className="text-lg" />}
              </button>

              <Link
                to="/wishlist"
                className="w-9 h-9 flex items-center justify-center rounded-lg text-[#777] hover:text-[#C8FF00] transition-colors"
              >
                <FiHeart className="text-lg" />
              </Link>

              <button
                onClick={openCart}
                className="relative w-9 h-9 flex items-center justify-center rounded-lg text-[#777] hover:text-[#C8FF00] transition-colors"
                aria-label="Open cart"
              >
                <FiShoppingCart className="text-lg" />
                <AnimatePresence>
                  {itemCount > 0 && (
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      exit={{ scale: 0 }}
                      className="absolute -top-0.5 -right-0.5 min-w-[18px] min-h-[18px] text-[9px] font-black rounded-full flex items-center justify-center px-1 leading-none"
                      style={{ background: '#C8FF00', color: '#0A0A0A' }}
                    >
                      {itemCount > 9 ? '9+' : itemCount}
                    </motion.span>
                  )}
                </AnimatePresence>
              </button>

              {isAuthenticated() ? (
                <div className="relative" ref={userRef}>
                  <button
                    onClick={() => setUserOpen(!userOpen)}
                    className="flex items-center gap-1 p-1.5 rounded-lg transition-colors hover:bg-white/5"
                  >
                    <div
                      className="w-7 h-7 rounded-full text-xs font-bold flex items-center justify-center"
                      style={{ background: '#C8FF00', color: '#0A0A0A' }}
                    >
                      {user?.name?.[0]?.toUpperCase()}
                    </div>
                    <FiChevronDown
                      className={clsx(
                        'text-xs text-[#777] transition-transform hidden md:block',
                        userOpen && 'rotate-180'
                      )}
                    />
                  </button>
                  <AnimatePresence>
                    {userOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: -6, scale: 0.97 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -6, scale: 0.97 }}
                        transition={{ duration: 0.15 }}
                        className="absolute right-0 top-11 w-52 rounded-xl py-2 z-50"
                        style={{
                          background: '#111111',
                          border: '1px solid #222222',
                          boxShadow: '0 8px 32px rgba(0,0,0,0.6)',
                        }}
                      >
                        <div
                          className="px-4 py-2 mb-1"
                          style={{ borderBottom: '1px solid #222' }}
                        >
                          <p className="text-xs font-semibold text-white truncate">{user?.name}</p>
                          <p className="text-[10px] text-[#777] truncate">{user?.email}</p>
                        </div>
                        <Link
                          to="/account"
                          className="flex items-center gap-2.5 px-4 py-2 text-sm text-[#aaa] hover:text-[#C8FF00] hover:bg-white/5 transition-colors"
                        >
                          <FiUser className="text-sm" /> My Account
                        </Link>
                        <Link
                          to="/orders"
                          className="flex items-center gap-2.5 px-4 py-2 text-sm text-[#aaa] hover:text-[#C8FF00] hover:bg-white/5 transition-colors"
                        >
                          <FiPackage className="text-sm" /> My Orders
                        </Link>
                        {user?.role === 'admin' && (
                          <Link
                            to="/admin"
                            className="flex items-center gap-2.5 px-4 py-2 text-sm font-semibold hover:bg-white/5 transition-colors"
                            style={{ color: '#C8FF00' }}
                          >
                            Admin Panel
                          </Link>
                        )}
                        <div className="mt-1 pt-1" style={{ borderTop: '1px solid #222' }}>
                          <button
                            onClick={logout}
                            className="w-full flex items-center gap-2.5 px-4 py-2 text-sm text-[#FF3366] hover:bg-white/5 transition-colors"
                          >
                            <FiLogOut className="text-sm" /> Sign Out
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <Link
                  to="/login"
                  className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
                  style={{
                    border: '1px solid #333',
                    color: '#aaa',
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.borderColor = '#C8FF00';
                    e.currentTarget.style.color = '#C8FF00';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.borderColor = '#333';
                    e.currentTarget.style.color = '#aaa';
                  }}
                >
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
              className="overflow-hidden"
              style={{ borderTop: '1px solid #222', background: '#111' }}
            >
              <div className="max-w-2xl mx-auto p-3 pb-4">
                <form onSubmit={handleSearch} className="flex gap-2">
                  <input
                    ref={inputRef}
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search shoes, styles, sizes..."
                    className="flex-1 px-4 py-2.5 rounded-xl text-sm min-w-0"
                    style={{
                      background: '#0A0A0A',
                      border: '1px solid #333',
                      color: '#fff',
                    }}
                  />
                  <button
                    type="submit"
                    className="flex-shrink-0 px-5 py-2.5 rounded-xl text-sm font-black flex items-center gap-1.5 transition-all"
                    style={{ background: '#C8FF00', color: '#0A0A0A' }}
                  >
                    <FiSearch className="text-sm" /> Search
                  </button>
                </form>
                <div className="flex flex-wrap gap-2 mt-2.5">
                  {QUICK_SEARCHES.map((term) => (
                    <button
                      key={term}
                      onClick={() => {
                        navigate(`/products?search=${term}`);
                        setSearchOpen(false);
                      }}
                      className="text-[11px] text-[#777] hover:text-[#C8FF00] rounded-full px-3 py-1 transition-colors"
                      style={{ border: '1px solid #333' }}
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

      {/* ── MOBILE SIDE MENU ── */}
      <AnimatePresence>
        {menuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[55]"
              style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }}
              onClick={() => setMenuOpen(false)}
            />
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="fixed top-0 left-0 bottom-0 w-72 z-[56] flex flex-col"
              style={{
                background: '#0A0A0A',
                borderRight: '1px solid #222',
                boxShadow: '4px 0 40px rgba(0,0,0,0.8)',
              }}
            >
              <div
                className="flex items-center justify-between px-5 py-4"
                style={{ borderBottom: '1px solid #222' }}
              >
                <span
                  className="text-white text-2xl tracking-widest"
                  style={{ fontFamily: "'Bebas Neue', sans-serif" }}
                >
                  VELO<span style={{ color: '#C8FF00' }}>Q</span>
                </span>
                <button
                  onClick={() => setMenuOpen(false)}
                  className="w-8 h-8 flex items-center justify-center rounded-lg text-[#777] hover:text-[#C8FF00] transition-colors"
                  style={{ background: 'rgba(255,255,255,0.05)' }}
                >
                  <FiX />
                </button>
              </div>

              <nav className="flex-1 px-3 py-4 overflow-y-auto">
                <p
                  className="text-[10px] font-bold uppercase tracking-widest mb-3 px-2"
                  style={{ color: '#C8FF00' }}
                >
                  Collections
                </p>
                {COLLECTIONS.map((c, i) => (
                  <motion.div
                    key={c.label}
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                  >
                    <Link
                      to={c.href}
                      className={clsx(
                        'flex items-center py-3 px-3 rounded-xl mb-0.5 text-sm font-semibold transition-all',
                        isActive(c.href)
                          ? 'text-[#C8FF00]'
                          : 'text-[#aaa] hover:text-white hover:bg-white/5'
                      )}
                      style={isActive(c.href) ? { background: 'rgba(200,255,0,0.08)' } : {}}
                    >
                      {c.label}
                    </Link>
                  </motion.div>
                ))}
              </nav>

              {!isAuthenticated() ? (
                <div className="p-4 space-y-2" style={{ borderTop: '1px solid #222' }}>
                  <Link
                    to="/login"
                    className="block w-full text-center py-3 text-sm font-black rounded-xl transition-all"
                    style={{ background: '#C8FF00', color: '#0A0A0A' }}
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/register"
                    className="block w-full text-center py-3 text-sm font-bold rounded-xl transition-all"
                    style={{ border: '1px solid #C8FF00', color: '#C8FF00' }}
                  >
                    Create Account
                  </Link>
                </div>
              ) : (
                <div className="p-3 space-y-0.5" style={{ borderTop: '1px solid #222' }}>
                  <Link
                    to="/account"
                    className="flex items-center gap-2.5 py-2.5 px-3 rounded-xl text-sm font-medium text-[#aaa] hover:text-[#C8FF00] hover:bg-white/5 transition-colors"
                  >
                    <FiUser className="text-[#777]" /> My Account
                  </Link>
                  <Link
                    to="/orders"
                    className="flex items-center gap-2.5 py-2.5 px-3 rounded-xl text-sm font-medium text-[#aaa] hover:text-[#C8FF00] hover:bg-white/5 transition-colors"
                  >
                    <FiPackage className="text-[#777]" /> My Orders
                  </Link>
                  {user?.role === 'admin' && (
                    <Link
                      to="/admin"
                      className="flex items-center gap-2.5 py-2.5 px-3 rounded-xl text-sm font-semibold hover:bg-white/5 transition-colors"
                      style={{ color: '#C8FF00' }}
                    >
                      Admin Panel
                    </Link>
                  )}
                  <button
                    onClick={logout}
                    className="w-full flex items-center gap-2.5 py-2.5 px-3 rounded-xl text-sm font-medium hover:bg-white/5 transition-colors"
                    style={{ color: '#FF3366' }}
                  >
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
