import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiHome, FiSearch, FiShoppingBag, FiUser } from 'react-icons/fi';
import useCartStore from '../../store/cartStore';
import clsx from 'clsx';

const NAV_ITEMS = [
  { icon: FiHome,        label: 'Home',    href: '/' },
  { icon: FiSearch,      label: 'Search',  href: '/products' },
  { icon: FiShoppingBag, label: 'Cart',    href: '/cart',    cart: true },
  { icon: FiUser,        label: 'Account', href: '/account' },
];

export default function MobileBottomNav() {
  const { pathname } = useLocation();
  const itemCount = useCartStore((s) => s.getItemCount());

  return (
    <nav className="fixed bottom-0 left-0 right-0 md:hidden z-40 bg-white border-t border-gray-200 shadow-[0_-2px_12px_rgba(0,0,0,0.08)]">
      <div className="grid grid-cols-4 px-2 py-1">
        {NAV_ITEMS.map(({ icon: Icon, label, href, cart }) => {
          const isActive = pathname === href || (href !== '/' && pathname.startsWith(href));
          return (
            <Link key={href} to={href} className="flex flex-col items-center py-2.5 gap-1 relative">
              <motion.div
                whileTap={{ scale: 0.85 }}
                className={clsx(
                  'relative w-9 h-9 flex items-center justify-center rounded-xl transition-colors',
                  isActive ? 'bg-ink/8' : ''
                )}
              >
                <Icon className={clsx('text-xl transition-colors', isActive ? 'text-ink' : 'text-mid')} />
                <AnimatePresence>
                  {cart && itemCount > 0 && (
                    <motion.span
                      initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}
                      className="absolute -top-1 -right-1 w-4 h-4 bg-ink text-white text-[9px] font-black rounded-full flex items-center justify-center"
                    >
                      {itemCount > 9 ? '9+' : itemCount}
                    </motion.span>
                  )}
                </AnimatePresence>
              </motion.div>
              <span className={clsx('text-[9px] font-semibold tracking-wide uppercase transition-colors', isActive ? 'text-ink' : 'text-mid')}>
                {label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
