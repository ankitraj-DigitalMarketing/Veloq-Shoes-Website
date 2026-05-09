import { useRef, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { motion, useInView, animate, AnimatePresence } from 'framer-motion';
import {
  FiArrowRight, FiChevronLeft, FiChevronRight, FiStar,
  FiTruck, FiRefreshCw, FiShield, FiZap, FiPhone,
} from 'react-icons/fi';
import api from '../utils/api';
import ProductCard from '../components/common/ProductCard';

/* ─── Scroll reveal ────────────────────────────────────────────────── */
function Reveal({ children, className = '' }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-30px' });
  return (
    <motion.div ref={ref} className={className}
      initial={{ opacity: 0, y: 20 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
    >{children}</motion.div>
  );
}

/* ─── Animated counter ─────────────────────────────────────────────── */
function Counter({ from = 0, to, suffix = '', duration = 1.8 }) {
  const [val, setVal] = useState(from);
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });
  useEffect(() => {
    if (!inView) return;
    const c = animate(from, to, { duration, ease: [0.22, 1, 0.36, 1], onUpdate: (v) => setVal(Math.round(v)) });
    return c.stop;
  }, [inView, to]);
  return <span ref={ref}>{val}{suffix}</span>;
}

/* ─── Placeholder banners ──────────────────────────────────────────── */
const PLACEHOLDER_BANNERS = [
  { position: 1, title: "Men's New Season", subtitle: 'Premium Footwear 2025', buttonText: 'Shop Now', buttonLink: '/products', bgColor: '#111827', textDark: false },
  { position: 2, title: 'Sneakers',         subtitle: 'Street-ready kicks',     buttonText: 'Shop Now', buttonLink: '/collections/sneakers',       bgColor: '#1e3a5f', textDark: false },
  { position: 3, title: 'Casual Shoes',     subtitle: 'Everyday comfort',        buttonText: 'Shop Now', buttonLink: '/collections/casual-shoes',    bgColor: '#3b2f1e', textDark: false },
  { position: 4, title: 'Slippers & Clogs', subtitle: 'Easy style, all day',     buttonText: 'Shop Now', buttonLink: '/collections/slippers-clogs',  bgColor: '#1a3322', textDark: false },
];

/* ─── Hero banner slider ───────────────────────────────────────────── */
function HeroBanner({ banners }) {
  const [cur, setCur] = useState(0);
  const allHero = banners?.filter(b => b.position === 1) || [];
  const slides  = allHero.length > 0 ? allHero : [PLACEHOLDER_BANNERS[0]];

  useEffect(() => {
    if (slides.length <= 1) return;
    const t = setInterval(() => setCur(p => (p + 1) % slides.length), 4500);
    return () => clearInterval(t);
  }, [slides.length]);

  const slide = slides[cur];

  return (
    <div className="relative w-full overflow-hidden bg-gray-900"
      style={{ aspectRatio: '16/6', minHeight: 240, maxHeight: 480 }}>
      <AnimatePresence mode="wait">
        <motion.div key={cur}
          initial={{ opacity: 0, scale: 1.02 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
          transition={{ duration: 0.7 }}
          className="absolute inset-0 flex items-center"
          style={{ backgroundColor: slide.bgColor || '#111827' }}>
          {slide.image && (
            <img src={slide.image} alt={slide.title}
              className="absolute inset-0 w-full h-full object-cover" />
          )}
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/30 to-transparent" />
          <div className="relative z-10 px-6 md:px-16 max-w-2xl">
            <motion.p initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
              className="text-xs font-bold tracking-[0.25em] uppercase text-white/60 mb-2">
              {slide.subtitle}
            </motion.p>
            <motion.h1 initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.18 }}
              className="font-display text-4xl sm:text-5xl md:text-7xl font-black tracking-tight leading-none text-white mb-6">
              {slide.title}
            </motion.h1>
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.28 }}
              className="flex items-center gap-3 flex-wrap">
              <Link to={slide.buttonLink || '/products'}
                className="inline-flex items-center gap-2 bg-white text-ink px-6 py-3 text-sm font-bold rounded-lg hover:bg-gray-100 transition-all">
                {slide.buttonText || 'Shop Now'} <FiArrowRight />
              </Link>
              <Link to="/products"
                className="inline-flex items-center gap-2 border border-white/40 text-white px-5 py-3 text-sm font-semibold rounded-lg hover:border-white/70 transition-all">
                View All
              </Link>
            </motion.div>
          </div>
        </motion.div>
      </AnimatePresence>

      {slides.length > 1 && (
        <>
          <button onClick={() => setCur(p => (p - 1 + slides.length) % slides.length)}
            className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-black/30 hover:bg-black/60 text-white rounded-full flex items-center justify-center z-20 backdrop-blur-sm transition-all">
            <FiChevronLeft />
          </button>
          <button onClick={() => setCur(p => (p + 1) % slides.length)}
            className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-black/30 hover:bg-black/60 text-white rounded-full flex items-center justify-center z-20 backdrop-blur-sm transition-all">
            <FiChevronRight />
          </button>
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-20">
            {slides.map((_, i) => (
              <button key={i} onClick={() => setCur(i)}
                className={`h-1 rounded-full transition-all ${i === cur ? 'w-8 bg-white' : 'w-2 bg-white/40'}`} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

/* ─── Category quick strip ─────────────────────────────────────────── */
const CATS = [
  { label: 'All',              emoji: '🛍️', href: '/products',                   bg: 'bg-gray-900',   text: 'text-white' },
  { label: 'Sneakers',         emoji: '👟', href: '/collections/sneakers',       bg: 'bg-blue-600',   text: 'text-white' },
  { label: 'Casual Shoes',     emoji: '🥿', href: '/collections/casual-shoes',   bg: 'bg-amber-500',  text: 'text-white' },
  { label: 'Slippers & Clogs', emoji: '🩴', href: '/collections/slippers-clogs', bg: 'bg-emerald-600',text: 'text-white' },
  { label: 'New Arrivals',     emoji: '⭐', href: '/products?newArrival=true',   bg: 'bg-purple-600', text: 'text-white' },
  { label: 'Best Sellers',     emoji: '🔥', href: '/products?bestSeller=true',   bg: 'bg-red-600',    text: 'text-white' },
];

/* ─── Section header ───────────────────────────────────────────────── */
function SectionHeader({ title, sub, href, label = 'View All' }) {
  return (
    <div className="flex items-center justify-between mb-5">
      <div>
        {sub && <p className="text-[10px] text-gray-500 uppercase tracking-[0.2em] mb-0.5 font-semibold">{sub}</p>}
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900">{title}</h2>
      </div>
      {href && (
        <Link to={href}
          className="flex items-center gap-1.5 text-xs font-bold text-gray-900 border border-gray-300 px-4 py-2 rounded-lg hover:bg-gray-900 hover:text-white hover:border-gray-900 transition-all">
          {label} <FiArrowRight className="text-xs" />
        </Link>
      )}
    </div>
  );
}

/* ─── Promo banner (full-width inside container) ───────────────────── */
function PromoBanner({ banner, flip = false }) {
  const textDark = banner.textDark;
  return (
    <Link to={banner.buttonLink || '/products'}
      className="relative overflow-hidden flex items-center group"
      style={{ backgroundColor: banner.bgColor || '#111827', minHeight: 200, borderRadius: 12 }}>
      {banner.image && (
        <img src={banner.image} alt={banner.title}
          className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
      )}
      <div className={`absolute inset-0 ${banner.image ? 'bg-gradient-to-r from-black/70 via-black/30 to-transparent' : ''}`} />
      <div className={`relative z-10 py-10 px-8 md:px-14 max-w-xl ${flip ? 'ml-auto' : ''}`}>
        <p className={`text-[11px] tracking-[0.2em] uppercase font-bold mb-2 ${textDark ? 'text-gray-500' : 'text-white/60'}`}>
          {banner.subtitle}
        </p>
        <h2 className={`font-display text-3xl md:text-5xl font-black tracking-tight leading-none mb-5 ${textDark ? 'text-gray-900' : 'text-white'}`}>
          {banner.title}
        </h2>
        <span className={`inline-flex items-center gap-2 text-sm font-bold px-6 py-3 rounded-lg transition-all ${
          textDark ? 'bg-gray-900 text-white hover:bg-gray-700' : 'bg-white text-gray-900 hover:bg-gray-100'
        }`}>
          {banner.buttonText || 'Shop Now'} <FiArrowRight />
        </span>
      </div>
    </Link>
  );
}

/* ─── Skeleton cards ───────────────────────────────────────────────── */
function SkeletonCard() {
  return (
    <div className="bg-white rounded-xl overflow-hidden border border-gray-100 animate-pulse">
      <div className="aspect-[4/5] bg-gray-100" />
      <div className="p-3 space-y-2">
        <div className="h-2.5 bg-gray-100 rounded w-1/3" />
        <div className="h-3 bg-gray-100 rounded w-3/4" />
        <div className="h-3 bg-gray-100 rounded w-1/2" />
      </div>
      <div className="h-9 bg-gray-100 mt-2" />
    </div>
  );
}

/* ─── Marquee ──────────────────────────────────────────────────────── */
function Marquee({ items }) {
  const doubled = [...items, ...items];
  return (
    <div className="overflow-hidden whitespace-nowrap bg-gray-900 py-3">
      <div className="marquee-track">
        {doubled.map((item, i) => (
          <span key={i} className="inline-flex items-center gap-4 mx-6 text-white/70 text-[11px] tracking-[0.2em] uppercase font-semibold">
            <span className="w-1 h-1 rounded-full bg-white/40 inline-block" />
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}

/* ─── Static review data ───────────────────────────────────────────── */
const REVIEWS = [
  { name: 'Rahul M.',  city: 'Mumbai',    rating: 5, text: 'Best quality shoes I have bought online. Exactly as described and super fast delivery!' },
  { name: 'Arjun S.',  city: 'Bangalore', rating: 5, text: 'VELOQ never disappoints. Fit is perfect and material is premium. Will definitely order again!' },
  { name: 'Dev P.',    city: 'Delhi',     rating: 5, text: "Ordered for my brother's birthday — he absolutely loves them. Great packaging and quick delivery." },
  { name: 'Karan T.',  city: 'Pune',      rating: 5, text: 'Slippers are super comfortable and look premium. Worth every rupee. Highly recommended!' },
  { name: 'Amit R.',   city: 'Jaipur',    rating: 5, text: 'Sneakers are fire 🔥 Quality is top notch, delivery was fast. Will buy more soon!' },
  { name: 'Suresh K.', city: 'Chennai',   rating: 4, text: 'Good product, matches the description. Sizing was accurate. Happy with the purchase overall.' },
];

const DEFAULT_MARQUEE = ["Premium Men's Footwear", 'Free Delivery ₹999+', '100% Authentic', 'New Arrivals Weekly', 'Sneakers', 'Casual Shoes', 'Slippers & Clogs', 'Express Shipping'];
const DEFAULT_FEATURE = [
  { icon: '🚚', title: 'Free Delivery',  subtitle: 'Above ₹999' },
  { icon: '🔄', title: '30-Day Returns', subtitle: 'Easy exchange' },
  { icon: '✅', title: '100% Authentic', subtitle: 'Every product' },
  { icon: '⚡', title: 'Fast Dispatch',  subtitle: 'Order by 2 PM' },
];

/* ═══════════════════════════════════════════════════════════════════ */
/*  MAIN HOMEPAGE                                                        */
/* ═══════════════════════════════════════════════════════════════════ */
export default function HomePage() {
  /* Settings */
  const { data: siteSettings } = useQuery({
    queryKey: ['publicSettings'],
    queryFn: () => fetch(`${import.meta.env.VITE_API_URL || '/api'}/settings/public`).then(r => r.json()).then(d => d.settings || {}),
    staleTime: 5 * 60 * 1000,
  });

  /* Banners */
  const { data: banners } = useQuery({
    queryKey: ['banners'],
    queryFn: () => api.get('/banners'),
    select: d => Array.isArray(d) ? d : (d?.banners || []),
  });

  /* Products */
  const { data: allProds, isLoading: loadingAll } = useQuery({
    queryKey: ['homeProducts'],
    queryFn: () => api.get('/products?limit=20&sort=newest'),
  });
  const { data: bsProds, isLoading: loadingBS } = useQuery({
    queryKey: ['bestSellers'],
    queryFn: () => api.get('/products?bestSeller=true&limit=10'),
    enabled: siteSettings?.homepageShowBestSellers !== false,
  });
  const { data: naProds, isLoading: loadingNA } = useQuery({
    queryKey: ['newArrivals'],
    queryFn: () => api.get('/products?newArrival=true&limit=10'),
    enabled: siteSettings?.homepageShowNewArrivals !== false,
  });

  /* Dynamic theme */
  const marqueeItems = siteSettings?.marqueeItems?.length ? siteSettings.marqueeItems : DEFAULT_MARQUEE;
  const featureBar   = siteSettings?.featureBar?.length   ? siteSettings.featureBar   : DEFAULT_FEATURE;

  /* Banners by position */
  const banner2 = banners?.find(b => b.position === 2) || PLACEHOLDER_BANNERS[1];
  const banner3 = banners?.find(b => b.position === 3) || PLACEHOLDER_BANNERS[2];
  const banner4 = banners?.find(b => b.position === 4) || PLACEHOLDER_BANNERS[3];

  const allProducts = allProds?.products || [];
  const bsProducts  = bsProds?.products  || [];
  const naProducts  = naProds?.products  || [];

  return (
    <div className="bg-gray-50 min-h-screen">

      {/* ══ HERO SLIDER ═══════════════════════════════════════════════ */}
      <HeroBanner banners={banners} />

      {/* ══ CATEGORY QUICK STRIP ══════════════════════════════════════ */}
      <div className="bg-white border-b border-gray-100 py-4 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-1 -mx-1 px-1">
            {CATS.map((cat, i) => (
              <Link key={i} to={cat.href}
                className="flex-shrink-0 flex flex-col items-center gap-1.5 group">
                <div className={`w-14 h-14 sm:w-16 sm:h-16 rounded-full ${cat.bg} flex items-center justify-center text-2xl shadow-sm group-hover:shadow-md group-hover:scale-105 transition-all duration-200`}>
                  {cat.emoji}
                </div>
                <span className="text-[11px] font-semibold text-gray-700 text-center leading-tight max-w-[60px]">
                  {cat.label}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-3 sm:px-4 py-4 space-y-6">

        {/* ══ USP STRIP ════════════════════════════════════════════════ */}
        <div className="bg-white border border-gray-100 rounded-xl py-4 px-5 shadow-sm">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {featureBar.map((item, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gray-50 border border-gray-100 rounded-xl flex items-center justify-center flex-shrink-0 text-xl">
                  {item.icon}
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-900">{item.title}</p>
                  <p className="text-[11px] text-gray-500 mt-0.5">{item.subtitle}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ══ BEST SELLERS ══════════════════════════════════════════════ */}
        {siteSettings?.homepageShowBestSellers !== false && (
          <Reveal>
            <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm">
              <SectionHeader title="Best Sellers" sub="Top Picks" href="/products?bestSeller=true" />
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                {loadingBS
                  ? Array.from({ length: 5 }).map((_, i) => <SkeletonCard key={i} />)
                  : (bsProducts.length ? bsProducts : allProducts).slice(0, 10).map((p, i) => (
                      <ProductCard key={p._id} product={p} index={i} />
                    ))
                }
              </div>
              <div className="mt-5 text-center">
                <Link to="/products" className="inline-flex items-center gap-2 border-2 border-gray-900 text-gray-900 font-bold text-sm px-10 py-3 rounded-lg hover:bg-gray-900 hover:text-white transition-all">
                  View All Products <FiArrowRight />
                </Link>
              </div>
            </div>
          </Reveal>
        )}

        {/* ══ PROMO BANNER 1 — SNEAKERS ═════════════════════════════════ */}
        <Reveal>
          <PromoBanner banner={banner2} />
        </Reveal>

        {/* ══ MARQUEE ═══════════════════════════════════════════════════ */}
        <Marquee items={marqueeItems} />

        {/* ══ NEW ARRIVALS ══════════════════════════════════════════════ */}
        {siteSettings?.homepageShowNewArrivals !== false && (
          <Reveal>
            <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm">
              <SectionHeader title="New Arrivals" sub="Just Dropped" href="/products?newArrival=true" />
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                {loadingNA
                  ? Array.from({ length: 5 }).map((_, i) => <SkeletonCard key={i} />)
                  : (naProducts.length ? naProducts : allProducts).slice(0, 10).map((p, i) => (
                      <ProductCard key={p._id} product={p} index={i} />
                    ))
                }
              </div>
            </div>
          </Reveal>
        )}

        {/* ══ 2-COLUMN PROMO BANNERS ════════════════════════════════════ */}
        <Reveal>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <PromoBanner banner={banner3} />
            <PromoBanner banner={banner4} flip />
          </div>
        </Reveal>

        {/* ══ ALL PRODUCTS GRID ═════════════════════════════════════════ */}
        <Reveal>
          <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm">
            <SectionHeader title="Shop All Men's Footwear" sub="Complete Collection" href="/products" />
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
              {loadingAll
                ? Array.from({ length: 10 }).map((_, i) => <SkeletonCard key={i} />)
                : allProducts.slice(0, 15).map((p, i) => (
                    <ProductCard key={p._id} product={p} index={i} />
                  ))
              }
            </div>
            {allProducts.length > 15 && (
              <div className="mt-5 text-center">
                <Link to="/products"
                  className="inline-flex items-center gap-2 bg-gray-900 text-white font-bold text-sm px-10 py-3 rounded-lg hover:bg-gray-700 transition-all">
                  Load More Products <FiArrowRight />
                </Link>
              </div>
            )}
          </div>
        </Reveal>

        {/* ══ SHOP BY COLLECTION ════════════════════════════════════════ */}
        {siteSettings?.homepageShowCollections !== false && (
          <Reveal>
            <div>
              <div className="text-center mb-5">
                <p className="text-[11px] text-gray-500 uppercase tracking-[0.2em] font-semibold mb-1">Men's Footwear</p>
                <h2 className="text-2xl font-bold text-gray-900">Shop by Collection</h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[
                  { label: 'Sneakers',         sub: 'Street-ready kicks for every day',   href: '/collections/sneakers',       bg: '#0f172a', img: null },
                  { label: 'Casual Shoes',     sub: 'Comfort meets everyday style',        href: '/collections/casual-shoes',   bg: '#431407', img: null },
                  { label: 'Slippers & Clogs', sub: 'Relaxed & easy all-day comfort',      href: '/collections/slippers-clogs', bg: '#052e16', img: null },
                ].map((col, i) => (
                  <Link key={i} to={col.href}
                    className="relative overflow-hidden rounded-2xl flex flex-col justify-end p-6 group"
                    style={{ backgroundColor: col.bg, minHeight: 220 }}>
                    {col.img && <img src={col.img} alt={col.label} className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                    <div className="relative z-10">
                      <p className="text-white/60 text-[11px] font-semibold uppercase tracking-widest mb-1">{col.sub}</p>
                      <h3 className="text-white font-display text-3xl font-black tracking-tight">{col.label}</h3>
                      <span className="inline-flex items-center gap-2 mt-3 text-white text-xs font-bold border border-white/30 px-4 py-2 rounded-lg group-hover:bg-white group-hover:text-gray-900 transition-all">
                        Shop Now <FiArrowRight className="text-xs" />
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </Reveal>
        )}

        {/* ══ WHY VELOQ ════════════════════════════════════════════════ */}
        {siteSettings?.homepageShowWhyUs !== false && (
          <Reveal>
            <div className="bg-gray-900 rounded-xl overflow-hidden">
              <div className="px-6 py-8 md:px-10">
                <div className="text-center mb-8">
                  <p className="text-[11px] text-white/40 uppercase tracking-[0.3em] font-semibold mb-2">Why Choose Us</p>
                  <h2 className="text-2xl md:text-3xl font-bold text-white">The VELOQ Promise</h2>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    { icon: <FiTruck className="text-2xl" />,     title: 'Free Delivery',      desc: 'On orders above ₹999' },
                    { icon: <FiRefreshCw className="text-2xl" />, title: '30-Day Returns',     desc: 'Hassle-free exchange' },
                    { icon: <FiShield className="text-2xl" />,    title: '100% Authentic',     desc: 'Every single product' },
                    { icon: <FiZap className="text-2xl" />,       title: 'Same Day Dispatch',  desc: 'Order before 2 PM' },
                  ].map((item, i) => (
                    <div key={i} className="text-center py-4">
                      <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center mx-auto mb-3 text-white">
                        {item.icon}
                      </div>
                      <p className="text-white font-bold text-sm">{item.title}</p>
                      <p className="text-white/50 text-[11px] mt-1">{item.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Reveal>
        )}

        {/* ══ STATS BAR ════════════════════════════════════════════════ */}
        <Reveal>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { from: 0, to: 500,  suffix: '+', label: 'Happy Customers' },
              { from: 0, to: 50,   suffix: '+', label: 'Products Available' },
              { from: 4, to: 4.9,  suffix: '★', label: 'Average Rating' },
              { from: 0, to: 100,  suffix: '%', label: 'Authentic Products' },
            ].map(({ from, to, suffix, label }) => (
              <div key={label} className="bg-white border border-gray-100 rounded-xl p-5 text-center shadow-sm">
                <p className="text-2xl md:text-3xl font-bold text-gray-900">
                  <Counter from={from} to={to} suffix={suffix} />
                </p>
                <p className="text-[11px] text-gray-500 mt-1 font-medium">{label}</p>
              </div>
            ))}
          </div>
        </Reveal>

        {/* ══ CUSTOMER REVIEWS ══════════════════════════════════════════ */}
        {siteSettings?.homepageShowReviews !== false && (
          <Reveal>
            <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm">
              <div className="text-center mb-6">
                <p className="text-[11px] text-gray-500 uppercase tracking-[0.2em] font-semibold mb-1">What Customers Say</p>
                <h2 className="text-2xl font-bold text-gray-900">Real Reviews</h2>
                <div className="flex items-center justify-center gap-1 mt-2">
                  {[1,2,3,4,5].map(i => <FiStar key={i} className="text-amber-400 fill-amber-400 text-sm" />)}
                  <span className="text-sm font-bold text-gray-900 ml-2">4.9</span>
                  <span className="text-gray-400 text-sm ml-1">from 500+ reviews</span>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {REVIEWS.map((review, i) => (
                  <motion.div key={i}
                    initial={{ opacity: 0, y: 14 }} whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }} transition={{ delay: i * 0.06 }}
                    className="border border-gray-100 rounded-xl p-4 hover:border-gray-200 hover:shadow-md transition-all"
                  >
                    <div className="flex items-center gap-0.5 mb-3">
                      {Array.from({ length: 5 }).map((_, j) => (
                        <FiStar key={j} className={`text-xs ${j < review.rating ? 'text-amber-400 fill-amber-400' : 'text-gray-200'}`} />
                      ))}
                      <span className="text-[10px] text-gray-400 ml-1">Verified Purchase</span>
                    </div>
                    <p className="text-sm text-gray-700 leading-relaxed mb-4">"{review.text}"</p>
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-full bg-gray-900 text-white text-xs font-bold flex items-center justify-center flex-shrink-0">
                        {review.name[0]}
                      </div>
                      <div>
                        <p className="text-xs font-bold text-gray-900">{review.name}</p>
                        <p className="text-[10px] text-gray-500">{review.city}</p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </Reveal>
        )}

        {/* ══ CONTACT & SUPPORT BAR ════════════════════════════════════ */}
        <Reveal>
          <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 bg-gray-900 rounded-xl flex items-center justify-center">
                  <FiPhone className="text-white text-base" />
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-900">Customer Support</p>
                  <p className="text-[11px] text-gray-500">Mon-Sat · 10AM – 7PM</p>
                </div>
              </div>
              <div className="flex items-center gap-3 flex-wrap justify-center">
                <Link to="/products" className="text-xs font-semibold text-gray-700 border border-gray-200 px-4 py-2 rounded-lg hover:border-gray-900 hover:text-gray-900 transition-all">
                  Browse Products
                </Link>
                <Link to="/orders" className="text-xs font-semibold text-gray-700 border border-gray-200 px-4 py-2 rounded-lg hover:border-gray-900 hover:text-gray-900 transition-all">
                  Track Order
                </Link>
                <Link to="/register" className="text-xs font-bold bg-gray-900 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-all">
                  Create Account
                </Link>
              </div>
            </div>
          </div>
        </Reveal>

        {/* ══ NEWSLETTER ════════════════════════════════════════════════ */}
        <Reveal>
          <div className="bg-gray-900 rounded-xl py-10 px-6 text-center">
            <p className="text-[11px] text-white/40 uppercase tracking-[0.3em] font-semibold mb-1">Exclusive Offers</p>
            <h2 className="text-2xl font-bold text-white mb-1">Get Early Access to New Drops</h2>
            <p className="text-white/50 text-sm mb-6">Member-only deals · New arrivals first · Zero spam</p>
            <form className="flex gap-2 max-w-md mx-auto" onSubmit={(e) => e.preventDefault()}>
              <input type="email" placeholder="Enter your email address"
                className="flex-1 bg-white/10 border border-white/20 text-white placeholder-white/40 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-white/50" />
              <button type="submit"
                className="bg-white text-gray-900 font-bold text-sm px-6 py-3 rounded-lg hover:bg-gray-100 transition-all flex-shrink-0">
                Subscribe
              </button>
            </form>
            <p className="text-white/30 text-[11px] mt-3">Join 500+ subscribers. Unsubscribe anytime.</p>
          </div>
        </Reveal>

        <div className="pb-4" />
      </div>
    </div>
  );
}
