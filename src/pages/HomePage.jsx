import { useRef, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { motion, useInView, animate, AnimatePresence } from 'framer-motion';
import {
  FiArrowRight, FiTruck, FiRefreshCw, FiShield, FiZap,
  FiChevronLeft, FiChevronRight, FiStar, FiAward, FiPackage, FiHeadphones,
} from 'react-icons/fi';
import api from '../utils/api';
import ProductCard from '../components/common/ProductCard';

/* ─── Scroll reveal ─────────────────────────────────────────────── */
function Reveal({ children, delay = 0, className = '' }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-40px' });
  return (
    <motion.div ref={ref} className={className}
      initial={{ opacity: 0, y: 18 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}

/* ─── Animated counter ──────────────────────────────────────────── */
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

/* ─── Banner placeholders ───────────────────────────────────────── */
const PLACEHOLDER_BANNERS = [
  { position: 1, title: 'New Season Drop', subtitle: "Men's Footwear 2025", buttonText: 'Shop Now', buttonLink: '/products', bgColor: '#111827', textDark: false },
  { position: 2, title: 'Sneakers',         subtitle: 'Street-ready kicks',  buttonText: 'Shop',     buttonLink: '/collections/sneakers',       bgColor: '#1f2937', textDark: false },
  { position: 3, title: 'Casual Shoes',     subtitle: 'Everyday comfort',    buttonText: 'Shop',     buttonLink: '/collections/casual-shoes',    bgColor: '#374151', textDark: false },
  { position: 4, title: 'Free Delivery on ₹999+', subtitle: 'Slippers, Clogs & More', buttonText: 'Explore', buttonLink: '/collections/slippers-clogs', bgColor: '#f3f4f6', textDark: true },
];

/* ─── Hero banner slider ─────────────────────────────────────────── */
function HeroBanner({ banners }) {
  const [cur, setCur] = useState(0);
  const allHero = banners?.filter(b => b.position === 1) || [PLACEHOLDER_BANNERS[0]];
  const slides  = allHero.length > 0 ? allHero : [PLACEHOLDER_BANNERS[0]];

  useEffect(() => {
    if (slides.length <= 1) return;
    const t = setInterval(() => setCur(p => (p + 1) % slides.length), 4500);
    return () => clearInterval(t);
  }, [slides.length]);

  const slide = slides[cur];
  const textCls    = slide.textDark ? 'text-ink'    : 'text-white';
  const subtextCls = slide.textDark ? 'text-mid'    : 'text-white/70';

  return (
    <div className="relative w-full overflow-hidden rounded-xl" style={{ aspectRatio: '16/5', minHeight: 220, maxHeight: 420 }}>
      <AnimatePresence mode="wait">
        <motion.div
          key={cur}
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          transition={{ duration: 0.6 }}
          className="absolute inset-0 flex items-center"
          style={{ backgroundColor: slide.bgColor || '#111827' }}
        >
          {slide.image && <img src={slide.image} alt={slide.title} className="absolute inset-0 w-full h-full object-cover" />}
          <div className={`absolute inset-0 ${slide.image ? 'bg-gradient-to-r from-black/60 via-black/30 to-transparent' : ''}`} />
          <div className="relative z-10 px-8 md:px-16 max-w-xl">
            <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
              className={`text-xs font-semibold tracking-[0.2em] uppercase mb-2 ${subtextCls}`}>
              {slide.subtitle}
            </motion.p>
            <motion.h2 initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.18 }}
              className={`font-display text-4xl md:text-6xl font-black tracking-tight leading-none mb-5 ${textCls}`}>
              {slide.title}
            </motion.h2>
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.28 }}>
              <Link to={slide.buttonLink || '/products'}
                className={`inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold transition-all shadow-btn ${slide.textDark ? 'bg-ink text-white hover:bg-gray-800' : 'bg-white text-ink hover:bg-gray-100'}`}>
                {slide.buttonText || 'Shop Now'} <FiArrowRight />
              </Link>
            </motion.div>
          </div>
        </motion.div>
      </AnimatePresence>

      {slides.length > 1 && (
        <>
          <button onClick={() => setCur(p => (p - 1 + slides.length) % slides.length)}
            className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/80 hover:bg-white rounded-full flex items-center justify-center shadow-md z-20 transition-all hover:scale-110">
            <FiChevronLeft className="text-ink text-sm" />
          </button>
          <button onClick={() => setCur(p => (p + 1) % slides.length)}
            className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/80 hover:bg-white rounded-full flex items-center justify-center shadow-md z-20 transition-all hover:scale-110">
            <FiChevronRight className="text-ink text-sm" />
          </button>
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 z-20">
            {slides.map((_, i) => (
              <button key={i} onClick={() => setCur(i)}
                className={`h-1.5 rounded-full transition-all ${i === cur ? 'w-6 bg-white' : 'w-1.5 bg-white/40'}`} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

/* ─── Small banner ───────────────────────────────────────────────── */
function SmallBanner({ banner }) {
  const textCls    = banner.textDark ? 'text-ink' : 'text-white';
  const subtextCls = banner.textDark ? 'text-mid' : 'text-white/70';
  return (
    <Link to={banner.buttonLink || '/products'}
      className="relative overflow-hidden rounded-xl flex items-end p-5 group"
      style={{ backgroundColor: banner.bgColor || '#1f2937', minHeight: 150 }}
    >
      {banner.image && <img src={banner.image} alt={banner.title} className="absolute inset-0 w-full h-full object-cover" />}
      <div className={`absolute inset-0 ${banner.image ? 'bg-gradient-to-t from-black/60 to-transparent' : ''} group-hover:brightness-110 transition-all`} />
      <div className="relative z-10">
        <p className={`text-[10px] tracking-widest uppercase font-semibold mb-1 ${subtextCls}`}>{banner.subtitle}</p>
        <h3 className={`font-display text-2xl font-black tracking-tight leading-none ${textCls}`}>{banner.title}</h3>
        <span className={`inline-flex items-center gap-1 text-xs font-semibold mt-2.5 ${textCls} group-hover:gap-2.5 transition-all`}>
          {banner.buttonText || 'Shop'} <FiArrowRight className="text-xs" />
        </span>
      </div>
    </Link>
  );
}

/* ─── Section header ─────────────────────────────────────────────── */
function SectionHeader({ title, sub, href, label = 'View All' }) {
  return (
    <div className="flex items-end justify-between mb-5">
      <div>
        {sub && <p className="text-[10px] text-mid uppercase tracking-[0.2em] mb-1 font-semibold">{sub}</p>}
        <h2 className="text-xl font-bold text-ink leading-tight">{title}</h2>
      </div>
      {href && (
        <Link to={href} className="text-xs font-semibold text-ink hover:underline flex items-center gap-1 pb-0.5 border-b border-ink/30 hover:border-ink transition-all">
          {label} <FiArrowRight className="text-xs" />
        </Link>
      )}
    </div>
  );
}

/* ─── Marquee ────────────────────────────────────────────────────── */
function Marquee({ items }) {
  const doubled = [...items, ...items];
  return (
    <div className="overflow-hidden whitespace-nowrap">
      <div className="marquee-track">
        {doubled.map((item, i) => (
          <span key={i} className="inline-flex items-center gap-4 mx-4 text-mid text-[10px] tracking-[0.3em] uppercase font-semibold">
            <span className="w-1 h-1 rounded-full bg-lite inline-block" />
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}

/* ─── Review card ────────────────────────────────────────────────── */
const REVIEWS = [
  { name: 'Rahul M.',  city: 'Mumbai',    rating: 5, text: 'Best quality shoes I have bought online. Exactly as described and super fast delivery!', product: 'Sneakers' },
  { name: 'Arjun S.',  city: 'Bangalore', rating: 5, text: 'VELOQ never disappoints. Fit is perfect and material is premium. Will definitely order again!', product: 'Casual Shoes' },
  { name: 'Dev P.',    city: 'Delhi',     rating: 5, text: 'Ordered for my brother\'s birthday — he absolutely loves them. Great packaging and quick delivery.', product: 'Slippers' },
];

/* ─── Trending style card ────────────────────────────────────────── */
const TRENDING = [
  { label: 'Street Wear',  gradient: 'from-blue-500 to-violet-600',  tag: 'HOT',      href: '/collections/sneakers' },
  { label: 'Office Ready', gradient: 'from-gray-700 to-gray-900',    tag: 'POPULAR',  href: '/collections/casual-shoes' },
  { label: 'Outdoor',      gradient: 'from-green-500 to-emerald-700',tag: 'NEW',      href: '/products' },
  { label: 'Summer Vibes', gradient: 'from-orange-400 to-pink-500',  tag: 'TRENDING', href: '/collections/slippers-clogs' },
  { label: 'Classic',      gradient: 'from-amber-500 to-yellow-400', tag: 'TIMELESS', href: '/products' },
];

/* ─── MAIN PAGE ──────────────────────────────────────────────────── */
export default function HomePage() {
  const { data: banners } = useQuery({
    queryKey: ['banners'],
    queryFn: () => api.get('/banners'),
    select: (data) => Array.isArray(data) ? data : (data?.banners || []),
  });
  const { data: newArrivals } = useQuery({
    queryKey: ['newArrivals'],
    queryFn: () => api.get('/products?newArrival=true&limit=8'),
  });
  const { data: bestSellers } = useQuery({
    queryKey: ['bestSellers'],
    queryFn: () => api.get('/products?bestSeller=true&limit=8'),
  });
  const { data: allProducts } = useQuery({
    queryKey: ['homeProducts'],
    queryFn: () => api.get('/products?limit=12'),
  });

  const banner2 = (banners && banners.find(b => b.position === 2)) || PLACEHOLDER_BANNERS[1];
  const banner3 = (banners && banners.find(b => b.position === 3)) || PLACEHOLDER_BANNERS[2];
  const banner4 = (banners && banners.find(b => b.position === 4)) || PLACEHOLDER_BANNERS[3];

  const collections = [
    { label: 'Sneakers',         sub: 'Street Kicks',    emoji: '👟', href: '/collections/sneakers',       bg: 'from-blue-50 to-blue-100',    color: 'text-blue-700',   border: 'border-blue-100' },
    { label: 'Casual Shoes',     sub: 'Everyday Style',  emoji: '🥿', href: '/collections/casual-shoes',   bg: 'from-amber-50 to-amber-100',  color: 'text-amber-700',  border: 'border-amber-100' },
    { label: 'Slippers & Clogs', sub: 'Easy Comfort',    emoji: '🩴', href: '/collections/slippers-clogs', bg: 'from-green-50 to-green-100',  color: 'text-green-700',  border: 'border-green-100' },
    { label: 'New Arrivals',     sub: 'Just Dropped',    emoji: '⭐', href: '/collections/new-arrivals',   bg: 'from-purple-50 to-purple-100',color: 'text-purple-700', border: 'border-purple-100' },
  ];

  const products   = newArrivals?.products || allProducts?.products || [];
  const bsProducts = bestSellers?.products || [];

  return (
    <div className="bg-void">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 py-3 space-y-4">

        {/* ── HERO ── */}
        <HeroBanner banners={banners} />

        {/* ── 2 SMALL BANNERS ── */}
        <div className="grid grid-cols-2 gap-3">
          <SmallBanner banner={banner2} />
          <SmallBanner banner={banner3} />
        </div>

        {/* ── USP STRIP ── */}
        <div className="bg-white border border-gray-100 rounded-xl py-4 px-4 shadow-sm">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { icon: FiTruck,      title: 'Free Delivery',  desc: 'Above ₹999' },
              { icon: FiRefreshCw,  title: '30-Day Returns', desc: 'Easy exchange' },
              { icon: FiShield,     title: '100% Authentic', desc: 'Every product' },
              { icon: FiZap,        title: 'Fast Dispatch',  desc: 'Order by 2 PM' },
            ].map(({ icon: Icon, title, desc }) => (
              <div key={title} className="flex items-center gap-3">
                <div className="w-9 h-9 bg-ink/5 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Icon className="text-ink text-base" />
                </div>
                <div>
                  <p className="text-ink text-xs font-bold">{title}</p>
                  <p className="text-mid text-[10px]">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── SHOP BY COLLECTION ── */}
        <Reveal>
          <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm">
            <SectionHeader title="Shop by Collection" sub="Men's Footwear" />
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {collections.map((c, i) => (
                <motion.div key={c.label}
                  initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }} transition={{ delay: i * 0.07, duration: 0.4 }}
                >
                  <Link to={c.href}
                    className={`flex flex-col items-center justify-center gap-2.5 p-5 rounded-xl bg-gradient-to-br ${c.bg} border ${c.border} hover:shadow-card-lg transition-all group`}
                  >
                    <span className="text-4xl group-hover:scale-110 transition-transform duration-300">{c.emoji}</span>
                    <div className="text-center">
                      <p className={`font-bold text-sm ${c.color}`}>{c.label}</p>
                      <p className="text-[10px] text-mid mt-0.5">{c.sub}</p>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        </Reveal>

        {/* ── WHY VELOQ ── */}
        <Reveal>
          <div className="bg-gradient-to-br from-ink via-gray-900 to-gray-800 rounded-xl p-5 md:p-8 overflow-hidden relative">
            <div className="absolute -top-12 -right-12 w-48 h-48 rounded-full bg-white/5 pointer-events-none" />
            <div className="absolute -bottom-8 -left-8 w-36 h-36 rounded-full bg-white/5 pointer-events-none" />
            <div className="relative z-10">
              <div className="mb-6 text-center">
                <p className="text-white/40 text-[10px] tracking-[0.3em] uppercase mb-1">Why Choose Us</p>
                <h2 className="font-display text-2xl md:text-3xl font-black text-white tracking-tight">The VELOQ Difference</h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[
                  { icon: FiAward,      title: 'Curated Quality',    desc: 'Every shoe handpicked for quality, style and durability. No compromises.' },
                  { icon: FiPackage,    title: 'Lightning Delivery',  desc: 'Express delivery across India. Order by 2 PM, dispatched same day.' },
                  { icon: FiHeadphones, title: 'Premium Support',     desc: '24/7 support for every question. Hassle-free 30-day returns guaranteed.' },
                ].map((item, i) => (
                  <motion.div key={item.title}
                    initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }} transition={{ delay: i * 0.08 }}
                    className="bg-white/8 backdrop-blur-sm border border-white/10 rounded-xl p-4 text-center hover:bg-white/12 transition-colors"
                  >
                    <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center mx-auto mb-3">
                      <item.icon className="text-white text-lg" />
                    </div>
                    <h3 className="text-white font-bold text-sm mb-1.5">{item.title}</h3>
                    <p className="text-white/50 text-xs leading-relaxed">{item.desc}</p>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </Reveal>

        {/* ── MARQUEE ── */}
        <div className="bg-white border border-gray-100 rounded-xl py-3 overflow-hidden shadow-sm">
          <Marquee items={["Premium Men's Footwear", "Free Delivery ₹999+", "100% Authentic", "New Arrivals Weekly", "Sneakers", "Casual Shoes", "Slippers & Clogs", "Express Shipping"]} />
        </div>

        {/* ── TRENDING STYLES ── */}
        <Reveal>
          <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm">
            <SectionHeader title="Trending Styles" sub="What's Hot Right Now" href="/products" />
            <div className="flex gap-3 overflow-x-auto pb-2 snap-x scrollbar-hide -mx-1 px-1">
              {TRENDING.map((s, i) => (
                <motion.div key={s.label}
                  initial={{ opacity: 0, x: 16 }} whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }} transition={{ delay: i * 0.06 }}
                  className="flex-shrink-0 snap-start"
                >
                  <Link to={s.href}
                    className={`flex flex-col justify-between w-32 sm:w-36 h-44 rounded-xl bg-gradient-to-br ${s.gradient} relative overflow-hidden group cursor-pointer`}
                  >
                    <div className="p-3">
                      <span className="text-[9px] font-black bg-white/25 backdrop-blur-sm text-white px-2 py-0.5 rounded-full tracking-wider">
                        {s.tag}
                      </span>
                    </div>
                    <div className="p-3 bg-gradient-to-t from-black/50 to-transparent">
                      <p className="text-white font-bold text-sm leading-tight">{s.label}</p>
                      <span className="text-white/70 text-[11px] flex items-center gap-1 mt-1 group-hover:gap-2 transition-all">
                        Shop <FiArrowRight className="text-[10px]" />
                      </span>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        </Reveal>

        {/* ── NEW ARRIVALS ── */}
        <Reveal>
          <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm">
            <SectionHeader title="New Arrivals" sub="Just Dropped" href="/products?newArrival=true" />
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {products.slice(0, 8).map((p, i) => (
                <ProductCard key={p._id} product={p} index={i} />
              ))}
              {!products.length && Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="aspect-[4/5] skeleton rounded-xl" />
              ))}
            </div>
            {products.length > 0 && (
              <div className="mt-5 text-center">
                <Link to="/products?newArrival=true" className="btn-outline py-2.5 px-8 text-sm inline-flex">
                  View All New Arrivals <FiArrowRight className="ml-1" />
                </Link>
              </div>
            )}
          </div>
        </Reveal>

        {/* ── BOTTOM BANNER ── */}
        <Reveal>
          <div className="relative overflow-hidden rounded-xl flex items-center py-8 px-8 md:px-16 group"
            style={{ backgroundColor: banner4.bgColor || '#f3f4f6', minHeight: 140 }}>
            {banner4.image && (
              <img src={banner4.image} alt={banner4.title} className="absolute inset-0 w-full h-full object-cover" />
            )}
            <div className={`absolute inset-0 ${banner4.image ? 'bg-black/20' : ''}`} />
            <div className="relative z-10 flex items-center justify-between w-full gap-4">
              <div>
                <p className={`text-[11px] tracking-[0.2em] uppercase font-semibold mb-1 ${banner4.textDark ? 'text-mid' : 'text-white/70'}`}>
                  {banner4.subtitle}
                </p>
                <h3 className={`font-display text-3xl md:text-4xl font-black tracking-tight ${banner4.textDark ? 'text-ink' : 'text-white'}`}>
                  {banner4.title}
                </h3>
              </div>
              <Link to={banner4.buttonLink || '/products'}
                className={`flex-shrink-0 inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold transition-all shadow-btn ${banner4.textDark ? 'bg-ink text-white hover:bg-gray-800' : 'bg-white text-ink hover:bg-gray-100'}`}>
                {banner4.buttonText || 'Shop Now'} <FiArrowRight />
              </Link>
            </div>
          </div>
        </Reveal>

        {/* ── BEST SELLERS ── */}
        {bsProducts.length > 0 && (
          <Reveal>
            <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm">
              <SectionHeader title="Best Sellers" sub="Community Picks" href="/products?bestSeller=true" />
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {bsProducts.slice(0, 8).map((p, i) => (
                  <ProductCard key={p._id} product={p} index={i} />
                ))}
              </div>
            </div>
          </Reveal>
        )}

        {/* ── CUSTOMER REVIEWS ── */}
        <Reveal>
          <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm">
            <SectionHeader title="What Customers Say" sub="Real Reviews" />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {REVIEWS.map((review, i) => (
                <motion.div key={i}
                  initial={{ opacity: 0, y: 14 }} whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }} transition={{ delay: i * 0.08 }}
                  className="border border-gray-100 rounded-xl p-4 hover:shadow-card transition-shadow"
                >
                  <div className="flex items-center gap-0.5 mb-3">
                    {Array.from({ length: 5 }).map((_, j) => (
                      <FiStar key={j} className={`text-sm ${j < review.rating ? 'text-gold fill-gold' : 'text-gray-200'}`} />
                    ))}
                  </div>
                  <p className="text-sm text-ink leading-relaxed mb-4">"{review.text}"</p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-ink text-white text-xs font-bold flex items-center justify-center">
                        {review.name[0]}
                      </div>
                      <div>
                        <p className="text-xs font-bold text-ink">{review.name}</p>
                        <p className="text-[10px] text-mid">{review.city}</p>
                      </div>
                    </div>
                    <span className="text-[10px] text-mid bg-gray-50 px-2.5 py-1 rounded-lg border border-gray-100">
                      {review.product}
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </Reveal>

        {/* ── STATS ── */}
        <Reveal>
          <div className="bg-ink rounded-xl py-8 px-4 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-ink to-gray-800" />
            <div className="relative z-10 grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              {[
                { from: 0,  to: 9,    suffix: '+',  label: 'Products' },
                { from: 0,  to: 500,  suffix: '+',  label: 'Happy Customers' },
                { from: 4,  to: 4.9,  suffix: '★',  label: 'Avg Rating' },
                { from: 0,  to: 100,  suffix: '%',  label: 'Authentic' },
              ].map(({ from, to, suffix, label }) => (
                <div key={label} className="py-2">
                  <p className="font-display text-3xl md:text-4xl text-white font-black">
                    <Counter from={from} to={to} suffix={suffix} />
                  </p>
                  <p className="text-white/40 text-[10px] mt-1 uppercase tracking-[0.2em]">{label}</p>
                </div>
              ))}
            </div>
          </div>
        </Reveal>

        {/* ── SIZE GUIDE CTA ── */}
        <Reveal>
          <div className="bg-gradient-to-r from-gray-50 to-white border border-gray-100 rounded-xl p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm">
            <div>
              <p className="text-[10px] text-mid uppercase tracking-[0.2em] mb-1 font-semibold">Not Sure About Your Size?</p>
              <h3 className="text-xl font-bold text-ink">Find Your Perfect Fit</h3>
              <p className="text-sm text-mid mt-1 max-w-sm">Use our size guide and find the right size for every style. Comfort guaranteed.</p>
            </div>
            <Link to="/products" className="flex-shrink-0 btn-primary text-sm gap-2">
              Size Guide <FiArrowRight />
            </Link>
          </div>
        </Reveal>

        {/* ── NEWSLETTER ── */}
        <Reveal>
          <div className="bg-white border border-gray-100 rounded-xl py-10 px-6 text-center shadow-sm">
            <div className="max-w-md mx-auto">
              <p className="text-[10px] text-mid uppercase tracking-[0.3em] mb-1">Stay in the Loop</p>
              <h2 className="text-2xl font-bold text-ink mb-2">Get Exclusive Deals</h2>
              <p className="text-mid text-sm mb-6">Early drops, exclusive styles, member-only offers. Zero spam, ever.</p>
              <form className="flex gap-2" onSubmit={(e) => e.preventDefault()}>
                <input type="email" placeholder="your@email.com" className="input-field py-3 flex-1 text-sm" />
                <button type="submit" className="btn-primary flex-shrink-0 py-3 px-6 text-sm">Subscribe</button>
              </form>
              <p className="text-[10px] text-mid mt-3">Join 500+ subscribers. Unsubscribe anytime.</p>
            </div>
          </div>
        </Reveal>

      </div>
    </div>
  );
}
