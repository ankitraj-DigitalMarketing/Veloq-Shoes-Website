import { useRef, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { motion, useInView, animate, AnimatePresence } from 'framer-motion';
import {
  FiArrowRight, FiChevronLeft, FiChevronRight, FiStar,
  FiTruck, FiRefreshCw, FiShield, FiZap, FiCheck,
} from 'react-icons/fi';
import api from '../utils/api';
import ProductCard from '../components/common/ProductCard';
import { getImageUrl } from '../utils/helpers';

/* ── Scroll reveal ──────────────────────────────────────────────── */
function Reveal({ children, className = '', delay = 0 }) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}

/* ── Animated counter ───────────────────────────────────────────── */
function Counter({ from = 0, to, suffix = '' }) {
  const [val, setVal] = useState(from);
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });
  useEffect(() => {
    if (!inView) return;
    const c = animate(from, to, {
      duration: 2,
      ease: [0.22, 1, 0.36, 1],
      onUpdate: (v) => setVal(Math.round(v * 10) / 10),
    });
    return c.stop;
  }, [inView, to, from]);
  return <span ref={ref}>{val}{suffix}</span>;
}

/* ── Placeholder banners ────────────────────────────────────────── */
const PH = [
  { position: 1, title: 'New Season Drop', subtitle: "Men's Footwear 2025", buttonText: 'Shop Now', buttonLink: '/products', bgColor: '#F5F5F5', textDark: true },
  { position: 2, title: 'Sneakers',         subtitle: 'Street-ready kicks',  buttonText: 'Shop Now', buttonLink: '/collections/sneakers',       bgColor: '#F0F0F0', textDark: true },
  { position: 3, title: 'Casual Shoes',     subtitle: 'Everyday comfort',    buttonText: 'Shop Now', buttonLink: '/collections/casual-shoes',    bgColor: '#F0F0F0', textDark: true },
  { position: 4, title: 'Slippers & Clogs', subtitle: 'Easy all-day style',  buttonText: 'Shop Now', buttonLink: '/collections/slippers-clogs',  bgColor: '#F0F0F0', textDark: true },
];

/* ── Hero banner ────────────────────────────────────────────────── */
function HeroBanner({ banners }) {
  const [cur, setCur] = useState(0);
  const slides = banners?.filter((b) => b.position === 1)?.length
    ? banners.filter((b) => b.position === 1)
    : [PH[0]];

  useEffect(() => {
    if (slides.length <= 1) return;
    const t = setInterval(() => setCur((p) => (p + 1) % slides.length), 4000);
    return () => clearInterval(t);
  }, [slides.length]);

  const s = slides[cur];
  const hasImage = !!s.image;

  /* Split title into words for stagger animation */
  const words = (s.title || '').split(' ');

  const wordVariants = {
    hidden: { opacity: 0, y: 40 },
    visible: (i) => ({
      opacity: 1,
      y: 0,
      transition: { delay: 0.2 + i * 0.08, duration: 0.6, ease: [0.22, 1, 0.36, 1] },
    }),
  };

  return (
    <div
      className="relative w-full overflow-hidden flex items-center"
      style={{
        minHeight: '100vh',
        background: hasImage ? (s.bgColor || '#F8F8F8') : 'white',
      }}
    >
      {/* Full-bleed background */}
      <AnimatePresence mode="wait">
        <motion.div
          key={cur}
          initial={{ opacity: 0, scale: 1.04 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8 }}
          className="absolute inset-0"
        >
          {hasImage ? (
            <img
              src={getImageUrl(s.image)}
              alt={s.title}
              className="w-full h-full object-cover brightness-90"
            />
          ) : (
            <div
              className="w-full h-full"
              style={{
                background: 'linear-gradient(135deg, #ffffff 0%, #F8F8F8 50%, #F0F0F0 100%)',
              }}
            />
          )}
          {hasImage && (
            <div
              className="absolute inset-0"
              style={{
                background: 'linear-gradient(to right, rgba(255,255,255,0.88) 0%, rgba(255,255,255,0.5) 50%, rgba(255,255,255,0.1) 100%)',
              }}
            />
          )}
        </motion.div>
      </AnimatePresence>

      {/* Content */}
      <div className="relative z-10 w-full px-5 sm:px-10 md:px-16 lg:px-24">
        <div className="max-w-5xl">

          {/* Subtitle */}
          <motion.span
            key={`sub-${cur}`}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="inline-block text-[11px] sm:text-xs font-bold tracking-[0.35em] uppercase mb-3"
            style={{ color: '#C8FF00', textShadow: '0 0 20px rgba(200,255,0,0.5)' }}
          >
            {s.subtitle}
          </motion.span>

          {/* Giant display title — word by word stagger */}
          <motion.h1
            key={`title-${cur}`}
            initial="hidden"
            animate="visible"
            className="text-[clamp(64px,14vw,200px)] leading-none font-black"
            style={{
              fontFamily: "'Bebas Neue', sans-serif",
              letterSpacing: '0.02em',
              lineHeight: 0.9,
              color: '#0A0A0A',
              display: 'flex',
              flexWrap: 'wrap',
              gap: '0.15em',
            }}
          >
            {words.map((word, i) => (
              <motion.span
                key={`${word}-${i}`}
                custom={i}
                variants={wordVariants}
                style={{ display: 'inline-block' }}
              >
                {word}
              </motion.span>
            ))}
          </motion.h1>

          {/* Lime underline accent */}
          <motion.div
            key={`line-${cur}`}
            initial={{ width: 0 }}
            animate={{ width: '120px' }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="h-1 mt-4 mb-6 rounded-full"
            style={{ background: '#C8FF00', boxShadow: '0 0 12px rgba(200,255,0,0.6)' }}
          />

          {/* CTA Buttons */}
          <motion.div
            key={`btns-${cur}`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="flex gap-3 flex-wrap"
          >
            <Link
              to={s.buttonLink || '/products'}
              className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl text-sm font-black uppercase tracking-wider transition-all duration-200"
              style={{ background: '#0A0A0A', color: '#C8FF00' }}
              onMouseEnter={e => {
                e.currentTarget.style.boxShadow = '0 0 24px rgba(200,255,0,0.3), 0 4px 20px rgba(0,0,0,0.2)';
                e.currentTarget.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.boxShadow = 'none';
                e.currentTarget.style.transform = 'none';
              }}
            >
              {s.buttonText || 'Shop Now'} <FiArrowRight className="text-sm" />
            </Link>
            <Link
              to="/products"
              className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl text-sm font-bold uppercase tracking-wider transition-all duration-200"
              style={{ border: '2px solid #0A0A0A', color: '#0A0A0A', background: 'transparent' }}
              onMouseEnter={e => {
                e.currentTarget.style.background = '#0A0A0A';
                e.currentTarget.style.color = '#C8FF00';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = 'transparent';
                e.currentTarget.style.color = '#0A0A0A';
              }}
            >
              View All
            </Link>
          </motion.div>
        </div>
      </div>

      {/* Slide nav arrows */}
      {slides.length > 1 && (
        <>
          <button
            onClick={() => setCur((p) => (p - 1 + slides.length) % slides.length)}
            className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full flex items-center justify-center z-20 transition-all"
            style={{
              background: 'rgba(255,255,255,0.8)',
              border: '1px solid #E8E8E8',
              color: '#0A0A0A',
              backdropFilter: 'blur(8px)',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.borderColor = '#C8FF00';
              e.currentTarget.style.background = '#C8FF00';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.borderColor = '#E8E8E8';
              e.currentTarget.style.background = 'rgba(255,255,255,0.8)';
            }}
          >
            <FiChevronLeft />
          </button>
          <button
            onClick={() => setCur((p) => (p + 1) % slides.length)}
            className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full flex items-center justify-center z-20 transition-all"
            style={{
              background: 'rgba(255,255,255,0.8)',
              border: '1px solid #E8E8E8',
              color: '#0A0A0A',
              backdropFilter: 'blur(8px)',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.borderColor = '#C8FF00';
              e.currentTarget.style.background = '#C8FF00';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.borderColor = '#E8E8E8';
              e.currentTarget.style.background = 'rgba(255,255,255,0.8)';
            }}
          >
            <FiChevronRight />
          </button>

          {/* Dot navigation */}
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2 z-20">
            {slides.map((_, i) => (
              <button
                key={i}
                onClick={() => setCur(i)}
                className="rounded-full transition-all duration-300"
                style={{
                  width: i === cur ? '32px' : '8px',
                  height: '8px',
                  background: i === cur ? '#C8FF00' : '#E8E8E8',
                  boxShadow: i === cur ? '0 0 8px rgba(200,255,0,0.5)' : 'none',
                }}
              />
            ))}
          </div>
        </>
      )}

      {/* Scroll indicator */}
      <div
        className="absolute bottom-8 right-8 flex flex-col items-center gap-1 z-20"
        style={{ color: '#AAAAAA' }}
      >
        <span className="text-[9px] tracking-[0.3em] uppercase">Scroll</span>
        <motion.div
          animate={{ y: [0, 6, 0] }}
          transition={{ repeat: Infinity, duration: 1.5 }}
          className="w-px h-8"
          style={{ background: 'linear-gradient(to bottom, #AAAAAA, transparent)' }}
        />
      </div>
    </div>
  );
}

/* ── USP strip ──────────────────────────────────────────────────── */
const uspContainerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
};
const uspItemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } },
};

function UspStrip({ featureBar }) {
  return (
    <motion.div
      style={{ background: '#FFFFFF', borderTop: '1px solid #E8E8E8', borderBottom: '1px solid #E8E8E8' }}
      variants={uspContainerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-60px' }}
    >
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-4">
          {featureBar.map((item, i) => (
            <motion.div
              key={i}
              variants={uspItemVariants}
              className="flex items-center gap-3 py-4 px-5"
              style={{ borderRight: i < featureBar.length - 1 ? '1px solid #E8E8E8' : 'none' }}
            >
              {/* Icon: URL image or text/emoji */}
              <span className="flex-shrink-0 w-8 h-8 flex items-center justify-center">
                {typeof item.icon === 'string' && item.icon.startsWith('http') ? (
                  <img src={item.icon} alt="" className="w-7 h-7 object-contain" />
                ) : (
                  <span className="text-xl" style={{ color: '#0A0A0A' }}>
                    {item.icon}
                  </span>
                )}
              </span>
              <div>
                <p className="text-[11px] sm:text-xs font-bold leading-tight" style={{ color: '#0A0A0A' }}>{item.title}</p>
                <p className="text-[10px] leading-tight" style={{ color: '#666' }}>{item.subtitle}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

/* ── Dual marquee ───────────────────────────────────────────────── */
function DualMarquee({ items }) {
  const row1 = [...items, ...items];
  const row2 = [...items.slice().reverse(), ...items.slice().reverse()];
  return (
    <motion.div
      className="overflow-hidden select-none"
      initial={{ opacity: 0, scaleX: 0.95 }}
      whileInView={{ opacity: 1, scaleX: 1 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
    >
      {/* Row 1 — black bg, white text, lime separators */}
      <div
        className="py-3 overflow-hidden"
        style={{ background: '#0A0A0A', borderBottom: '1px solid #1a1a1a' }}
      >
        <div className="marquee-track">
          {row1.map((item, i) => (
            <span
              key={i}
              className="inline-flex items-center gap-3 px-6 text-[11px] font-bold tracking-[0.3em] uppercase"
              style={{ color: '#FFFFFF' }}
            >
              <span style={{ color: '#C8FF00', fontSize: '10px' }}>✦</span>
              {item}
            </span>
          ))}
        </div>
      </div>

      {/* Row 2 — lime bg, black text, white separators */}
      <div className="py-3 overflow-hidden" style={{ background: '#C8FF00' }}>
        <div className="marquee-track-reverse">
          {row2.map((item, i) => (
            <span
              key={i}
              className="inline-flex items-center gap-3 px-6 text-[11px] font-bold tracking-[0.3em] uppercase"
              style={{ color: '#0A0A0A' }}
            >
              <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '10px' }}>◆</span>
              {item}
            </span>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

/* ── Section title ──────────────────────────────────────────────── */
function SectionTitle({ title, sub, href, label = 'View All' }) {
  return (
    <motion.div
      className="flex items-end justify-between mb-5 sm:mb-6"
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
    >
      <div>
        {sub && (
          <p
            className="text-[10px] uppercase tracking-[0.3em] font-bold mb-1"
            style={{ color: '#C8FF00' }}
          >
            {sub}
          </p>
        )}
        <h2
          className="text-3xl sm:text-5xl font-black leading-none"
          style={{ fontFamily: "'Bebas Neue', sans-serif", color: '#0A0A0A', letterSpacing: '0.02em' }}
        >
          {title}
        </h2>
        <div className="h-0.5 mt-2 w-16" style={{ background: '#C8FF00', boxShadow: '0 0 8px rgba(200,255,0,0.5)' }} />
      </div>
      {href && (
        <Link
          to={href}
          className="flex-shrink-0 flex items-center gap-1.5 text-[11px] sm:text-xs font-bold px-4 py-2 rounded-full transition-all duration-200"
          style={{ border: '1px solid #0A0A0A', color: '#0A0A0A' }}
          onMouseEnter={e => {
            e.currentTarget.style.background = '#0A0A0A';
            e.currentTarget.style.color = '#C8FF00';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.background = 'transparent';
            e.currentTarget.style.color = '#0A0A0A';
          }}
        >
          {label} <FiArrowRight className="text-[10px]" />
        </Link>
      )}
    </motion.div>
  );
}

/* ── Skeleton card (light) ──────────────────────────────────────── */
function Skel() {
  return (
    <div
      className="rounded-xl overflow-hidden animate-pulse"
      style={{ background: '#FFFFFF', border: '1px solid #E8E8E8' }}
    >
      <div
        className="aspect-[4/5]"
        style={{ background: 'linear-gradient(135deg, #F8F8F8, #F0F0F0)' }}
      />
      <div className="p-3 space-y-2">
        <div className="h-2 rounded w-1/3" style={{ background: '#E8E8E8' }} />
        <div className="h-3 rounded w-3/4" style={{ background: '#E8E8E8' }} />
        <div className="h-3 rounded w-1/2" style={{ background: '#E8E8E8' }} />
        <div className="h-8 rounded-xl mt-3" style={{ background: '#E8E8E8' }} />
      </div>
    </div>
  );
}

/* ── Promo banner ───────────────────────────────────────────────── */
function PromoBanner({ banner, className = '' }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
    >
      <Link
        to={banner.buttonLink || '/products'}
        className={`relative overflow-hidden rounded-2xl flex items-end group ${className}`}
        style={{ backgroundColor: banner.bgColor || '#F5F5F5', minHeight: 220, border: '1px solid #E8E8E8' }}
      >
        {banner.image && (
          <img
            src={getImageUrl(banner.image)}
            alt={banner.title}
            className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
          />
        )}
        <div
          className="absolute inset-0"
          style={{
            background: banner.image
              ? 'linear-gradient(to top, rgba(10,10,10,0.85) 0%, rgba(10,10,10,0.3) 50%, rgba(10,10,10,0.05) 100%)'
              : 'linear-gradient(to top, rgba(0,0,0,0.07) 0%, rgba(0,0,0,0.02) 100%)',
          }}
        />
        <div className="relative z-10 p-5 sm:p-7 w-full">
          <p
            className="text-[10px] font-bold uppercase tracking-[0.25em] mb-1"
            style={{ color: banner.image ? '#C8FF00' : '#C8FF00' }}
          >
            {banner.subtitle}
          </p>
          <h3
            className="text-3xl sm:text-5xl font-black leading-none mb-3"
            style={{ fontFamily: "'Bebas Neue', sans-serif", color: banner.image ? '#FFFFFF' : '#0A0A0A' }}
          >
            {banner.title}
          </h3>
          <span
            className="inline-flex items-center gap-2 text-xs font-bold px-4 py-2 rounded-full transition-all duration-200"
            style={
              banner.image
                ? { border: '1px solid rgba(200,255,0,0.5)', color: '#C8FF00' }
                : { border: '1px solid #0A0A0A', color: '#0A0A0A', background: 'transparent' }
            }
            onMouseEnter={e => {
              if (banner.image) {
                e.currentTarget.style.background = '#C8FF00';
                e.currentTarget.style.color = '#0A0A0A';
              } else {
                e.currentTarget.style.background = '#0A0A0A';
                e.currentTarget.style.color = '#C8FF00';
              }
            }}
            onMouseLeave={e => {
              if (banner.image) {
                e.currentTarget.style.background = 'transparent';
                e.currentTarget.style.color = '#C8FF00';
              } else {
                e.currentTarget.style.background = 'transparent';
                e.currentTarget.style.color = '#0A0A0A';
              }
            }}
          >
            {banner.buttonText || 'Shop Now'} <FiArrowRight className="text-[10px]" />
          </span>
        </div>
      </Link>
    </motion.div>
  );
}

/* ── Category card with 3D tilt ─────────────────────────────────── */
function CategoryCard({ cat, index = 0 }) {
  const ref = useRef(null);

  /* Alternating: odd from left, even from right */
  const xDir = index % 2 === 0 ? -40 : 40;

  const handleMove = (e) => {
    if (!ref.current) return;
    const r = ref.current.getBoundingClientRect();
    const x = ((e.clientX - r.left) / r.width - 0.5) * 14;
    const y = ((e.clientY - r.top)  / r.height - 0.5) * -10;
    ref.current.style.transform = `perspective(1200px) rotateX(${y}deg) rotateY(${x}deg) scale(1.02)`;
  };

  const handleLeave = () => {
    if (ref.current) ref.current.style.transform = '';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 40, x: xDir, scale: 0.95 }}
      whileInView={{ opacity: 1, y: 0, x: 0, scale: 1 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.6, delay: index * 0.1, ease: [0.22, 1, 0.36, 1] }}
    >
      <Link
        ref={ref}
        to={cat.href}
        className="relative overflow-hidden rounded-2xl flex flex-col justify-end group block"
        style={{
          backgroundColor: '#F5F5F5',
          minHeight: 'clamp(180px, 22vw, 280px)',
          border: '1px solid #E8E8E8',
          transition: 'transform 0.3s cubic-bezier(0.22,1,0.36,1), box-shadow 0.3s',
        }}
        onMouseMove={handleMove}
        onMouseLeave={handleLeave}
        onMouseEnter={e => {
          e.currentTarget.style.boxShadow = '0 20px 60px rgba(0,0,0,0.1)';
          e.currentTarget.style.borderColor = '#d0d0d0';
        }}
      >
        {cat.image ? (
          <img
            src={getImageUrl(cat.image)}
            alt={cat.label}
            className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
          />
        ) : (
          <div
            className="absolute inset-0"
            style={{
              background: `linear-gradient(135deg, ${cat.bg || '#F5F5F5'} 0%, #EBEBEB 100%)`,
            }}
          />
        )}
        <div
          className="absolute inset-0"
          style={{
            background: cat.image
              ? 'linear-gradient(to top, rgba(10,10,10,0.8) 0%, rgba(10,10,10,0.2) 60%, transparent 100%)'
              : 'linear-gradient(to top, rgba(0,0,0,0.08) 0%, rgba(0,0,0,0.02) 100%)',
          }}
        />
        <div className="relative z-10 p-4 sm:p-6">
          <h3
            className="font-black text-2xl sm:text-3xl leading-none"
            style={{ fontFamily: "'Bebas Neue', sans-serif", color: cat.image ? '#FFFFFF' : '#0A0A0A' }}
          >
            {cat.label}
          </h3>
          <span
            className="inline-flex items-center gap-1.5 mt-2 text-[11px] font-bold px-3 py-1.5 rounded-full transition-all duration-200"
            style={
              cat.image
                ? { border: '1px solid rgba(200,255,0,0.4)', color: '#C8FF00' }
                : { border: '1px solid #0A0A0A', color: '#0A0A0A' }
            }
          >
            Shop Now <FiArrowRight className="text-[9px]" />
          </span>
        </div>
      </Link>
    </motion.div>
  );
}

/* ── Reviews (30 realistic Indian customers) ────────────────────── */
const ALL_REVIEWS = [
  { name: 'Rahul M.',   city: 'Mumbai',    r: 5, text: 'Best quality shoes I have bought online. Super fast delivery!', product: 'Sneakers' },
  { name: 'Arjun S.',   city: 'Bangalore', r: 5, text: 'VELOQ never disappoints. Fit is perfect, material is premium!', product: 'Casual Shoes' },
  { name: 'Dev P.',     city: 'Delhi',     r: 5, text: "Ordered for my brother's birthday — he absolutely loves them!", product: 'Slippers' },
  { name: 'Karan T.',   city: 'Pune',      r: 5, text: 'Slippers are super comfortable. Worth every rupee. Highly recommended!', product: 'Slippers' },
  { name: 'Amit R.',    city: 'Jaipur',    r: 5, text: 'Sneakers are fire. Quality is top notch, delivery was fast!', product: 'Sneakers' },
  { name: 'Suresh K.',  city: 'Chennai',   r: 4, text: 'Good product, accurate sizing. Happy with the purchase overall.', product: 'Casual Shoes' },
  { name: 'Mohit V.',   city: 'Hyderabad', r: 5, text: 'Exactly as shown in pictures. Premium feel, great packaging!', product: 'Sneakers' },
  { name: 'Deepak L.',  city: 'Kolkata',   r: 5, text: 'Wore them to office first day — got so many compliments!', product: 'Casual Shoes' },
  { name: 'Sanjay G.',  city: 'Ahmedabad', r: 4, text: 'Value for money. Quality exceeds expectations at this price point.', product: 'Slippers' },
  { name: 'Vikas M.',   city: 'Lucknow',   r: 5, text: 'Second purchase from VELOQ. Never going back to other brands!', product: 'Sneakers' },
  { name: 'Rohit B.',   city: 'Noida',     r: 5, text: 'Clogs are amazing for home use. Soft sole, easy to clean.', product: 'Slippers' },
  { name: 'Ankit J.',   city: 'Indore',    r: 5, text: 'Lightweight sneakers, perfect for gym. Love the black color!', product: 'Sneakers' },
  { name: 'Pranav S.',  city: 'Surat',     r: 5, text: 'Quick delivery and exactly as described. Very happy!', product: 'Casual Shoes' },
  { name: 'Yash K.',    city: 'Nagpur',    r: 4, text: 'Nice design and comfortable fit. Will order again soon.', product: 'Sneakers' },
  { name: 'Gaurav N.',  city: 'Bhopal',    r: 5, text: 'The sole grip is excellent. Perfect for monsoon season!', product: 'Casual Shoes' },
  { name: 'Tushar P.',  city: 'Vadodara',  r: 5, text: 'Premium quality at an affordable price. Totally worth it!', product: 'Slippers' },
  { name: 'Nikhil A.',  city: 'Patna',     r: 5, text: 'Shoes look 10x better in person. Great craftsmanship.', product: 'Casual Shoes' },
  { name: 'Varun C.',   city: 'Ranchi',    r: 4, text: 'Very comfortable for long walks. Breathable material.', product: 'Sneakers' },
  { name: 'Sumit R.',   city: 'Coimbatore',r: 5, text: 'Packaging was premium and shoes arrived in perfect condition!', product: 'Casual Shoes' },
  { name: 'Kartik S.',  city: 'Kanpur',    r: 5, text: 'The best casual shoes I own. Versatile and stylish!', product: 'Casual Shoes' },
  { name: 'Harsh V.',   city: 'Mysore',    r: 5, text: 'Love the minimalist design. Goes with everything I wear!', product: 'Sneakers' },
  { name: 'Prateek M.', city: 'Gurgaon',   r: 5, text: 'Great customer service and fast shipping. 10/10!', product: 'Slippers' },
  { name: 'Aditya B.',  city: 'Faridabad',  r: 4, text: 'Comfortable from day one, no breaking-in needed!', product: 'Casual Shoes' },
  { name: 'Ravi K.',    city: 'Dehradun',   r: 5, text: 'Bought the grey sneakers — absolutely stunning in person!', product: 'Sneakers' },
  { name: 'Manish T.',  city: 'Agra',       r: 5, text: 'Slippers are so soft, I wear them all day at home!', product: 'Slippers' },
  { name: 'Shivam G.',  city: 'Chandigarh', r: 5, text: 'Price to quality ratio is unbeatable. Highly recommend!', product: 'Casual Shoes' },
  { name: 'Akash P.',   city: 'Ludhiana',   r: 5, text: 'Perfect fit, true to size. Look and feel super premium!', product: 'Sneakers' },
  { name: 'Sachin J.',  city: 'Nagpur',     r: 4, text: 'Good grip and cushioning. Comfortable for daily use.', product: 'Slippers' },
  { name: 'Vishal M.',  city: 'Kochi',      r: 5, text: 'Very elegant design. Got compliments at work the next day!', product: 'Casual Shoes' },
  { name: 'Nitin A.',   city: 'Guwahati',   r: 5, text: "VELOQ's quality is consistent. This is my 3rd pair!", product: 'Sneakers' },
];

function ReviewCard({ review }) {
  return (
    <div
      className="flex-shrink-0 w-64 sm:w-72 p-5 rounded-2xl"
      style={{ background: '#FFFFFF', border: '1px solid #E8E8E8', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}
    >
      <div className="flex items-center gap-0.5 mb-3">
        {[1, 2, 3, 4, 5].map((i) => (
          <FiStar
            key={i}
            className="text-xs"
            style={{
              color: i <= review.r ? '#C8FF00' : '#E8E8E8',
              fill: i <= review.r ? '#C8FF00' : 'none',
            }}
          />
        ))}
        <span
          className="ml-2 text-[10px] font-semibold flex items-center gap-0.5"
          style={{ color: '#C8FF00' }}
        >
          <FiCheck className="text-[9px]" /> Verified
        </span>
      </div>
      <p
        className="text-xs sm:text-sm leading-relaxed mb-4 line-clamp-3"
        style={{ color: '#666' }}
      >
        "{review.text}"
      </p>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div
            className="w-8 h-8 rounded-full text-xs font-bold flex items-center justify-center flex-shrink-0"
            style={{ background: '#C8FF00', color: '#0A0A0A' }}
          >
            {review.name[0]}
          </div>
          <div>
            <p className="text-xs font-bold leading-tight" style={{ color: '#0A0A0A' }}>{review.name}</p>
            <p className="text-[10px]" style={{ color: '#AAAAAA' }}>{review.city}</p>
          </div>
        </div>
        <span
          className="text-[9px] font-semibold px-2 py-1 rounded-full"
          style={{ background: '#F5F5F5', border: '1px solid #E8E8E8', color: '#666' }}
        >
          {review.product}
        </span>
      </div>
    </div>
  );
}

/* ── DEFAULT data ───────────────────────────────────────────────── */
const DEFAULT_MARQUEE = [
  "Premium Men's Footwear", 'Free Delivery ₹999+', '100% Authentic',
  'New Arrivals Weekly', 'Sneakers', 'Casual Shoes', 'Slippers & Clogs',
  'Express Shipping', 'Easy Returns', 'Premium Quality',
];
const DEFAULT_FEATURE = [
  { icon: '🚚', title: 'Free Delivery',   subtitle: 'Orders above ₹999' },
  { icon: '🔄', title: '30-Day Returns',  subtitle: 'Easy exchange' },
  { icon: '✅', title: '100% Authentic',  subtitle: 'Every product' },
  { icon: '⚡', title: 'Fast Dispatch',   subtitle: 'Order by 2 PM' },
];

/* stagger variants for product grids */
const gridContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.07 } },
};

/* ═══════════════════════════════════════════════════════════════════ */
export default function HomePage() {

  /* ── Queries ── */
  const { data: siteSettings } = useQuery({
    queryKey: ['publicSettings'],
    queryFn: () =>
      fetch(`${import.meta.env.VITE_API_URL || '/api'}/settings/public`)
        .then((r) => r.json())
        .then((d) => d.settings || {}),
    staleTime: 5 * 60 * 1000,
  });

  const { data: banners } = useQuery({
    queryKey: ['banners'],
    queryFn: () => api.get('/banners'),
    select: (d) => (Array.isArray(d) ? d : d?.banners || []),
  });

  const { data: collections } = useQuery({
    queryKey: ['publicCollections'],
    queryFn: () => api.get('/collections'),
    select: (d) => d.collections || [],
  });

  const { data: allProds, isLoading: loadAll } = useQuery({
    queryKey: ['homeProducts'],
    queryFn: () => api.get('/products?limit=20&sort=newest'),
  });

  const { data: bsProds, isLoading: loadBS } = useQuery({
    queryKey: ['bestSellers'],
    queryFn: () => api.get('/products?bestSeller=true&limit=10'),
    enabled: siteSettings?.homepageShowBestSellers !== false,
  });

  const { data: naProds, isLoading: loadNA } = useQuery({
    queryKey: ['newArrivals'],
    queryFn: () => api.get('/products?newArrival=true&limit=10'),
    enabled: siteSettings?.homepageShowNewArrivals !== false,
  });

  /* ── Theme ── */
  const marqueeItems = siteSettings?.marqueeItems?.length ? siteSettings.marqueeItems : DEFAULT_MARQUEE;
  const featureBar   = siteSettings?.featureBar?.length   ? siteSettings.featureBar   : DEFAULT_FEATURE;

  /* ── Banners ── */
  const banner2 = banners?.find((b) => b.position === 2) || PH[1];
  const banner3 = banners?.find((b) => b.position === 3) || PH[2];
  const banner4 = banners?.find((b) => b.position === 4) || PH[3];

  const allProducts = allProds?.products || [];
  const bsProducts  = bsProds?.products  || [];
  const naProducts  = naProds?.products  || [];

  /* ── Collection tiles ── */
  const colTiles = collections?.length
    ? collections.map((c) => ({
        label: c.name,
        href:  `/collections/${c.slug}`,
        image: c.image || null,
        bg:    '#F5F5F5',
      }))
    : [
        { label: 'Sneakers',         href: '/collections/sneakers',       image: null, bg: '#F0F0F0' },
        { label: 'Casual Shoes',     href: '/collections/casual-shoes',   image: null, bg: '#F0F0F0' },
        { label: 'Slippers & Clogs', href: '/collections/slippers-clogs', image: null, bg: '#F0F0F0' },
      ];

  const doubledReviews = [...ALL_REVIEWS, ...ALL_REVIEWS];

  return (
    <div style={{ background: '#FFFFFF', color: '#0A0A0A' }}>

      {/* ══ A. HERO ══════════════════════════════════════════════════ */}
      <HeroBanner banners={banners} />

      {/* ══ B. USP STRIP ════════════════════════════════════════════ */}
      <UspStrip featureBar={featureBar} />

      {/* ══ C. DUAL MARQUEE ═════════════════════════════════════════ */}
      <DualMarquee items={marqueeItems} />

      {/* ══ D. CATEGORY STRIP ═══════════════════════════════════════ */}
      {siteSettings?.homepageShowCollections !== false && (
        <div className="py-12 sm:py-16 px-4 sm:px-6 max-w-7xl mx-auto" style={{ background: '#FFFFFF' }}>
          <SectionTitle title="SHOP BY COLLECTION" sub="Explore" />
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {colTiles.map((cat, i) => (
              <CategoryCard key={i} cat={cat} index={i} />
            ))}
          </div>
        </div>
      )}

      {/* ══ E. NEW DROPS ═════════════════════════════════════════════ */}
      {siteSettings?.homepageShowNewArrivals !== false && (
        <div className="py-10 px-4 sm:px-6 max-w-7xl mx-auto" style={{ background: '#FFFFFF' }}>
          <SectionTitle
            title="NEW DROPS"
            sub="Just Dropped"
            href="/products?newArrival=true"
          />
          <motion.div
            className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3"
            variants={gridContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-60px' }}
          >
            {loadNA
              ? Array.from({ length: 5 }).map((_, i) => <Skel key={i} />)
              : (naProducts.length ? naProducts : allProducts).slice(0, 10).map((p, i) => (
                  <ProductCard key={p._id} product={p} index={i} />
                ))}
          </motion.div>
        </div>
      )}

      {/* ══ F. BEST SELLERS ══════════════════════════════════════════ */}
      {siteSettings?.homepageShowBestSellers !== false && (
        <div className="py-10 px-4 sm:px-6 max-w-7xl mx-auto" style={{ background: '#F5F5F5' }}>
          <SectionTitle
            title="BEST SELLERS"
            sub="Top Picks"
            href="/products?bestSeller=true"
          />
          <motion.div
            className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3"
            variants={gridContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-60px' }}
          >
            {loadBS
              ? Array.from({ length: 5 }).map((_, i) => <Skel key={i} />)
              : (bsProducts.length ? bsProducts : allProducts).slice(0, 10).map((p, i) => (
                  <ProductCard key={p._id} product={p} index={i} />
                ))}
          </motion.div>
          <div className="mt-8 flex justify-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.5 }}
            >
              <Link
                to="/products"
                className="inline-flex items-center gap-2 px-10 py-3 rounded-full text-sm font-black uppercase tracking-wider transition-all duration-200"
                style={{ border: '2px solid #0A0A0A', color: '#0A0A0A' }}
                onMouseEnter={e => {
                  e.currentTarget.style.background = '#0A0A0A';
                  e.currentTarget.style.color = '#C8FF00';
                  e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.15)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.color = '#0A0A0A';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                View All Products <FiArrowRight />
              </Link>
            </motion.div>
          </div>
        </div>
      )}

      {/* ══ G. PROMO BANNERS ═════════════════════════════════════════ */}
      <div className="py-8 px-4 sm:px-6 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <PromoBanner banner={banner3} />
          <PromoBanner banner={banner4} />
        </div>
      </div>

      {/* ══ Second marquee between sections ════════════════════════ */}
      <DualMarquee items={marqueeItems} />

      {/* ══ H. REVIEWS AUTO-SCROLL ═══════════════════════════════════ */}
      {siteSettings?.homepageShowReviews !== false && (
        <motion.div
          className="py-12 sm:py-16"
          style={{ background: '#F5F5F5' }}
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="max-w-7xl mx-auto px-4 mb-6">
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
              <div>
                <p
                  className="text-[10px] uppercase tracking-[0.3em] font-bold mb-1"
                  style={{ color: '#C8FF00' }}
                >
                  What People Say
                </p>
                <h2
                  className="text-4xl sm:text-6xl font-black"
                  style={{ fontFamily: "'Bebas Neue', sans-serif", color: '#0A0A0A' }}
                >
                  CUSTOMER REVIEWS
                </h2>
              </div>
              <div className="flex items-center gap-1.5">
                {[1, 2, 3, 4, 5].map((i) => (
                  <FiStar
                    key={i}
                    className="text-sm"
                    style={{ color: '#C8FF00', fill: '#C8FF00' }}
                  />
                ))}
                <span className="font-bold text-sm ml-1" style={{ color: '#0A0A0A' }}>4.9</span>
                <span className="text-xs" style={{ color: '#AAAAAA' }}>(500+ reviews)</span>
              </div>
            </div>
          </div>

          <div className="reviews-scroll-wrap overflow-hidden relative">
            {/* Fade edges */}
            <div
              className="absolute left-0 top-0 bottom-0 w-10 sm:w-20 z-10 pointer-events-none"
              style={{ background: 'linear-gradient(to right, #F5F5F5, transparent)' }}
            />
            <div
              className="absolute right-0 top-0 bottom-0 w-10 sm:w-20 z-10 pointer-events-none"
              style={{ background: 'linear-gradient(to left, #F5F5F5, transparent)' }}
            />
            <div className="reviews-track px-2">
              {doubledReviews.map((review, i) => (
                <ReviewCard key={i} review={review} />
              ))}
            </div>
          </div>
        </motion.div>
      )}

      {/* ══ I. STATS (dark bg for contrast) ══════════════════════════ */}
      <motion.div
        className="py-12 sm:py-16 px-4 sm:px-6"
        style={{ background: '#0A0A0A' }}
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true, margin: '-60px' }}
        transition={{ duration: 0.5 }}
      >
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { from: 0, to: 10000, suffix: '+', label: 'Customers',        sub: 'Happy shoppers' },
              { from: 0, to: 50,    suffix: '+', label: 'Styles',           sub: 'Unique designs' },
              { from: 4, to: 4.8,   suffix: '★', label: 'Rating',           sub: 'Avg store rating' },
              { from: 0, to: 100,   suffix: '%', label: 'Same Day Dispatch', sub: 'Order by 2 PM' },
            ].map(({ from, to, suffix, label, sub }, i) => (
              <motion.div
                key={label}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{ delay: i * 0.15, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                className="rounded-2xl p-5 sm:p-6 text-center"
                style={{ background: '#111', border: '1px solid #1a1a1a' }}
              >
                <p
                  className="text-4xl sm:text-5xl font-black leading-none mb-1"
                  style={{ fontFamily: "'Bebas Neue', sans-serif", color: '#C8FF00' }}
                >
                  <Counter from={from} to={to} suffix={suffix} />
                </p>
                <p className="text-sm font-bold" style={{ color: '#FFFFFF' }}>{label}</p>
                <p className="text-[10px] mt-0.5" style={{ color: '#666' }}>{sub}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* ══ J. NEWSLETTER ════════════════════════════════════════════ */}
      <motion.div
        className="py-4 pb-12 px-4 sm:px-6 max-w-7xl mx-auto"
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-60px' }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      >
        <div
          className="rounded-2xl py-12 sm:py-16 px-5 sm:px-12 text-center relative overflow-hidden"
          style={{
            background: '#F5F5F5',
            border: '1px solid #E8E8E8',
          }}
        >
          {/* Lime top accent line */}
          <div
            className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-px"
            style={{
              background: 'linear-gradient(to right, transparent, #C8FF00, transparent)',
              boxShadow: '0 0 20px rgba(200,255,0,0.4)',
            }}
          />

          <p
            className="text-[10px] uppercase tracking-[0.35em] font-bold mb-3"
            style={{ color: '#C8FF00' }}
          >
            Exclusive Access
          </p>
          <h2
            className="text-4xl sm:text-6xl font-black mb-3 leading-none"
            style={{ fontFamily: "'Bebas Neue', sans-serif", color: '#0A0A0A' }}
          >
            GET FIRST ACCESS<br />TO NEW DROPS
          </h2>
          <p className="text-sm mb-8 max-w-sm mx-auto" style={{ color: '#666' }}>
            Early drops, member-only deals, and exclusive styles. Zero spam.
          </p>

          <form
            className="flex gap-2 max-w-sm mx-auto"
            onSubmit={(e) => e.preventDefault()}
          >
            <input
              type="email"
              placeholder="your@email.com"
              className="flex-1 px-4 py-3 rounded-xl text-sm min-w-0"
              style={{
                background: '#FFFFFF',
                border: '1px solid #E8E8E8',
                color: '#0A0A0A',
              }}
              onFocus={e => { e.target.style.borderColor = '#0A0A0A'; }}
              onBlur={e => { e.target.style.borderColor = '#E8E8E8'; }}
            />
            <button
              type="submit"
              className="flex-shrink-0 px-6 py-3 rounded-xl text-sm font-black uppercase tracking-wider transition-all duration-200"
              style={{ background: '#0A0A0A', color: '#C8FF00' }}
              onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 0 20px rgba(200,255,0,0.3), 0 4px 16px rgba(0,0,0,0.2)'; }}
              onMouseLeave={e => { e.currentTarget.style.boxShadow = 'none'; }}
            >
              Join
            </button>
          </form>
          <p className="text-[10px] mt-3" style={{ color: '#AAAAAA' }}>
            Unsubscribe anytime · No spam ever
          </p>
        </div>
      </motion.div>

    </div>
  );
}
