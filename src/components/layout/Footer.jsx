import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiInstagram, FiTwitter, FiYoutube, FiChevronDown } from 'react-icons/fi';

const SHOP_LINKS = [
  { label: "Men's Sneakers",   href: '/collections/sneakers' },
  { label: 'Casual Shoes',     href: '/collections/casual-shoes' },
  { label: 'Slippers & Clogs', href: '/collections/slippers-clogs' },
  { label: 'New Arrivals',     href: '/collections/new-arrivals' },
  { label: 'All Products',     href: '/products' },
];

const HELP_LINKS = [
  { label: 'Size Guide',    href: '#' },
  { label: 'Track Order',   href: '/orders' },
  { label: 'Returns',       href: '#' },
  { label: 'Shipping Info', href: '#' },
  { label: 'FAQs',          href: '#' },
  { label: 'Contact Us',    href: '#' },
];

const PAYMENTS = ['UPI', 'PhonePe', 'GPay', 'Paytm', 'Visa', 'Mastercard', 'RuPay', 'COD'];
const COURIERS = ['Delhivery', 'Bluedart', 'DTDC'];

function AccordionSection({ title, children }) {
  const [open, setOpen] = useState(false);
  return (
    <div>
      {/* Mobile: tappable header */}
      <button
        className="md:hidden flex items-center justify-between w-full py-3.5"
        style={{ borderBottom: '1px solid #222' }}
        onClick={() => setOpen(!open)}
      >
        <span
          className="text-[11px] tracking-[0.25em] uppercase font-bold"
          style={{ color: '#C8FF00' }}
        >
          {title}
        </span>
        <FiChevronDown
          className={`text-sm transition-transform duration-200 flex-shrink-0 ${open ? 'rotate-180' : ''}`}
          style={{ color: '#777' }}
        />
      </button>

      {/* Mobile: collapsible content */}
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="content"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22, ease: 'easeInOut' }}
            className="md:hidden overflow-hidden"
          >
            <div className="py-2 pb-3">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Desktop: always visible */}
      <div className="hidden md:block">
        <p
          className="text-[10px] tracking-[0.3em] uppercase font-bold mb-4"
          style={{ color: '#C8FF00' }}
        >
          {title}
        </p>
        {children}
      </div>
    </div>
  );
}

export default function Footer() {
  return (
    <footer style={{ background: '#0A0A0A', borderTop: '1px solid #222' }}>
      <div className="max-w-7xl mx-auto px-6 pt-10 pb-6">

        <div className="grid grid-cols-1 md:grid-cols-4 gap-0 md:gap-10 mb-6 md:mb-10">

          {/* Brand */}
          <div
            className="md:col-span-1 py-5 md:py-0"
            style={{ borderBottom: '1px solid #222' }}
          >
            <Link to="/" className="inline-block group mb-3">
              <span
                className="font-display text-5xl tracking-[0.2em] text-white"
                style={{ fontFamily: "'Bebas Neue', sans-serif" }}
              >
                VELO<span className="group-hover:text-[#C8FF00] transition-colors duration-200">Q</span>
              </span>
            </Link>
            <p className="text-sm leading-relaxed max-w-xs" style={{ color: '#777' }}>
              Premium men's footwear. Every pair tells a story.
            </p>
            <div className="flex gap-3 mt-5">
              {[FiInstagram, FiTwitter, FiYoutube].map((Icon, i) => (
                <motion.a
                  key={i}
                  href="#"
                  whileHover={{ scale: 1.1 }}
                  className="w-9 h-9 rounded-full flex items-center justify-center transition-all duration-200"
                  style={{ border: '1px solid #333', color: '#777' }}
                  onMouseEnter={e => {
                    e.currentTarget.style.borderColor = '#C8FF00';
                    e.currentTarget.style.color = '#C8FF00';
                    e.currentTarget.style.boxShadow = '0 0 12px rgba(200,255,0,0.3)';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.borderColor = '#333';
                    e.currentTarget.style.color = '#777';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  <Icon className="text-sm" />
                </motion.a>
              ))}
            </div>
          </div>

          {/* Shop links */}
          <AccordionSection title="Shop">
            <ul className="space-y-0.5 md:space-y-2.5">
              {SHOP_LINKS.map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.href}
                    className="text-sm py-1.5 md:py-0 block transition-colors duration-200"
                    style={{ color: '#777' }}
                    onMouseEnter={e => { e.currentTarget.style.color = '#C8FF00'; }}
                    onMouseLeave={e => { e.currentTarget.style.color = '#777'; }}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </AccordionSection>

          {/* Help links */}
          <AccordionSection title="Help">
            <ul className="space-y-0.5 md:space-y-2.5">
              {HELP_LINKS.map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.href}
                    className="text-sm py-1.5 md:py-0 block transition-colors duration-200"
                    style={{ color: '#777' }}
                    onMouseEnter={e => { e.currentTarget.style.color = '#C8FF00'; }}
                    onMouseLeave={e => { e.currentTarget.style.color = '#777'; }}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </AccordionSection>

          {/* Payments */}
          <AccordionSection title="Secure Payments">
            <div className="flex flex-wrap gap-2 mb-4">
              {PAYMENTS.map((p) => (
                <span
                  key={p}
                  className="text-[10px] px-2.5 py-1 rounded font-medium"
                  style={{ border: '1px solid #333', color: '#777' }}
                >
                  {p}
                </span>
              ))}
            </div>
            <p
              className="text-[10px] tracking-widest uppercase font-bold mb-2 md:mb-3"
              style={{ color: '#C8FF00' }}
            >
              Delivery By
            </p>
            <div className="flex gap-2 flex-wrap">
              {COURIERS.map((c) => (
                <span
                  key={c}
                  className="text-[10px] px-2.5 py-1 rounded"
                  style={{ border: '1px solid #333', color: '#777' }}
                >
                  {c}
                </span>
              ))}
            </div>
          </AccordionSection>
        </div>

        {/* Bottom bar */}
        <div
          className="pt-5 flex flex-col md:flex-row items-center justify-between gap-3"
          style={{ borderTop: '1px solid #222' }}
        >
          <p className="text-xs" style={{ color: '#555' }}>
            © {new Date().getFullYear()} VELOQ. All rights reserved.
          </p>
          <div className="flex gap-5">
            {['Privacy Policy', 'Terms of Service', 'Cookie Policy'].map((t) => (
              <a
                key={t}
                href="#"
                className="text-xs transition-colors duration-200"
                style={{ color: '#555' }}
                onMouseEnter={e => { e.currentTarget.style.color = '#C8FF00'; }}
                onMouseLeave={e => { e.currentTarget.style.color = '#555'; }}
              >
                {t}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
