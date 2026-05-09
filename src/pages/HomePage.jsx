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
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-30px' });
  return (
    <motion.div ref={ref} className={className}
      initial={{ opacity: 0, y: 24 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay, ease: [0.22, 1, 0.36, 1] }}>
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
    const c = animate(from, to, { duration: 2, ease: [0.22, 1, 0.36, 1], onUpdate: v => setVal(Math.round(v * 10) / 10) });
    return c.stop;
  }, [inView, to]);
  return <span ref={ref}>{val}{suffix}</span>;
}

/* ── Placeholder banners ────────────────────────────────────────── */
const PH = [
  { position: 1, title: "New Season Drop", subtitle: "Men's Footwear 2025", buttonText: 'Shop Now', buttonLink: '/products', bgColor: '#0f172a', textDark: false },
  { position: 2, title: 'Sneakers',         subtitle: 'Street-ready kicks',  buttonText: 'Shop Now', buttonLink: '/collections/sneakers',       bgColor: '#172554', textDark: false },
  { position: 3, title: 'Casual Shoes',     subtitle: 'Everyday comfort',    buttonText: 'Shop Now', buttonLink: '/collections/casual-shoes',    bgColor: '#431407', textDark: false },
  { position: 4, title: 'Slippers & Clogs', subtitle: 'Easy all-day style',  buttonText: 'Shop Now', buttonLink: '/collections/slippers-clogs',  bgColor: '#052e16', textDark: false },
];

/* ── Hero slider ────────────────────────────────────────────────── */
function HeroBanner({ banners }) {
  const [cur, setCur] = useState(0);
  const slides = (banners?.filter(b => b.position === 1)?.length ? banners.filter(b => b.position === 1) : [PH[0]]);
  useEffect(() => {
    if (slides.length <= 1) return;
    const t = setInterval(() => setCur(p => (p + 1) % slides.length), 4800);
    return () => clearInterval(t);
  }, [slides.length]);
  const s = slides[cur];
  return (
    <div className="relative w-full overflow-hidden" style={{ background: s.bgColor || '#0f172a', aspectRatio: '16/7', minHeight: 260, maxHeight: 520 }}>
      <AnimatePresence mode="wait">
        <motion.div key={cur} initial={{ opacity: 0, scale: 1.04 }} animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }} transition={{ duration: 0.7 }} className="absolute inset-0">
          {s.image && <img src={s.image} alt={s.title} className="w-full h-full object-cover" />}
          <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/40 to-transparent" />
        </motion.div>
      </AnimatePresence>
      <div className="relative z-10 h-full flex items-center px-5 sm:px-10 md:px-16">
        <div className="max-w-lg">
          <motion.span key={`sub-${cur}`} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="inline-block text-[10px] sm:text-xs font-bold tracking-[0.25em] uppercase text-white/60 mb-2 sm:mb-3">
            {s.subtitle}
          </motion.span>
          <motion.h1 key={`title-${cur}`} initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.18 }}
            className="font-display text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-black tracking-tight leading-none text-white mb-4 sm:mb-6">
            {s.title}
          </motion.h1>
          <motion.div key={`btns-${cur}`} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.28 }}
            className="flex gap-3 flex-wrap">
            <Link to={s.buttonLink || '/products'}
              className="inline-flex items-center gap-2 bg-white text-gray-900 px-5 sm:px-7 py-2.5 sm:py-3 text-xs sm:text-sm font-bold rounded-full hover:bg-gray-100 transition-all shadow-lg">
              {s.buttonText || 'Shop Now'} <FiArrowRight className="text-xs" />
            </Link>
            <Link to="/products"
              className="inline-flex items-center gap-2 border border-white/40 text-white px-5 sm:px-7 py-2.5 sm:py-3 text-xs sm:text-sm font-semibold rounded-full hover:border-white/70 hover:bg-white/10 transition-all">
              View All
            </Link>
          </motion.div>
        </div>
      </div>
      {slides.length > 1 && (
        <>
          <button onClick={() => setCur(p => (p - 1 + slides.length) % slides.length)}
            className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 sm:w-10 sm:h-10 bg-white/15 backdrop-blur-sm hover:bg-white/30 text-white rounded-full flex items-center justify-center z-20 transition-all">
            <FiChevronLeft className="text-sm sm:text-base" />
          </button>
          <button onClick={() => setCur(p => (p + 1) % slides.length)}
            className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 sm:w-10 sm:h-10 bg-white/15 backdrop-blur-sm hover:bg-white/30 text-white rounded-full flex items-center justify-center z-20 transition-all">
            <FiChevronRight className="text-sm sm:text-base" />
          </button>
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 z-20">
            {slides.map((_, i) => (
              <button key={i} onClick={() => setCur(i)}
                className={`h-1 rounded-full transition-all duration-300 ${i === cur ? 'w-8 bg-white' : 'w-2 bg-white/35'}`} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

/* ── USP strip ──────────────────────────────────────────────────── */
function UspStrip({ featureBar }) {
  return (
    <div className="bg-white border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-gray-100">
          {featureBar.map((item, i) => (
            <div key={i} className="flex items-center gap-2.5 py-3 px-4">
              <span className="text-xl flex-shrink-0">{item.icon}</span>
              <div>
                <p className="text-[11px] sm:text-xs font-bold text-gray-900 leading-tight">{item.title}</p>
                <p className="text-[10px] text-gray-500 leading-tight">{item.subtitle}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ── Dual marquee ───────────────────────────────────────────────── */
function DualMarquee({ items }) {
  const row1 = [...items, ...items];
  const row2 = [...items.slice().reverse(), ...items.slice().reverse()];
  return (
    <div className="bg-gray-900 overflow-hidden select-none">
      {/* Row 1 — left */}
      <div className="py-2.5 border-b border-white/10 overflow-hidden">
        <div className="marquee-track">
          {row1.map((item, i) => (
            <span key={i} className="inline-flex items-center gap-3 px-5 text-white/60 text-[10px] sm:text-[11px] font-bold tracking-[0.3em] uppercase">
              <span className="text-amber-400 text-xs">✦</span>{item}
            </span>
          ))}
        </div>
      </div>
      {/* Row 2 — right */}
      <div className="py-2.5 overflow-hidden">
        <div className="marquee-track-reverse">
          {row2.map((item, i) => (
            <span key={i} className="inline-flex items-center gap-3 px-5 text-white/40 text-[10px] sm:text-[11px] font-bold tracking-[0.3em] uppercase">
              <span className="text-white/20 text-xs">◆</span>{item}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ── Section title ──────────────────────────────────────────────── */
function SectionTitle({ title, sub, href, label = 'View All' }) {
  return (
    <div className="flex items-end justify-between mb-4 sm:mb-5">
      <div>
        {sub && <p className="text-[10px] text-gray-400 uppercase tracking-[0.2em] font-bold mb-0.5">{sub}</p>}
        <h2 className="text-lg sm:text-2xl font-bold text-gray-900">{title}</h2>
      </div>
      {href && (
        <Link to={href}
          className="flex-shrink-0 flex items-center gap-1.5 text-[11px] sm:text-xs font-bold text-gray-900 border border-gray-300 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full hover:bg-gray-900 hover:text-white hover:border-gray-900 transition-all">
          {label} <FiArrowRight className="text-[10px]" />
        </Link>
      )}
    </div>
  );
}

/* ── Skeleton card ──────────────────────────────────────────────── */
function Skel() {
  return (
    <div className="bg-white rounded-2xl overflow-hidden border border-gray-100 animate-pulse">
      <div className="aspect-[4/5] bg-gradient-to-br from-gray-100 to-gray-200" />
      <div className="p-3 space-y-2">
        <div className="h-2 bg-gray-100 rounded w-1/3" />
        <div className="h-3 bg-gray-100 rounded w-3/4" />
        <div className="h-3 bg-gray-100 rounded w-1/2" />
        <div className="h-8 bg-gray-100 rounded-xl mt-3" />
      </div>
    </div>
  );
}

/* ── Promo banner ───────────────────────────────────────────────── */
function PromoBanner({ banner, className = '' }) {
  return (
    <Link to={banner.buttonLink || '/products'}
      className={`relative overflow-hidden rounded-2xl flex items-end group ${className}`}
      style={{ backgroundColor: banner.bgColor || '#0f172a', minHeight: 200 }}>
      {banner.image && (
        <img src={banner.image} alt={banner.title}
          className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/5" />
      <div className="relative z-10 p-5 sm:p-7 w-full">
        <p className="text-[10px] text-white/50 font-bold uppercase tracking-[0.25em] mb-1">{banner.subtitle}</p>
        <h3 className="font-display text-2xl sm:text-4xl font-black text-white tracking-tight leading-none mb-3">{banner.title}</h3>
        <span className="inline-flex items-center gap-2 text-xs font-bold text-white border border-white/30 px-4 py-2 rounded-full group-hover:bg-white group-hover:text-gray-900 transition-all">
          {banner.buttonText || 'Shop Now'} <FiArrowRight className="text-[10px]" />
        </span>
      </div>
    </Link>
  );
}

/* ── Reviews (30 realistic) ─────────────────────────────────────── */
const ALL_REVIEWS = [
  { name: 'Rahul M.',   city: 'Mumbai',    r: 5, text: 'Best quality shoes I have bought online. Super fast delivery!', product: 'Sneakers' },
  { name: 'Arjun S.',   city: 'Bangalore', r: 5, text: 'VELOQ never disappoints. Fit is perfect, material is premium!', product: 'Casual Shoes' },
  { name: 'Dev P.',     city: 'Delhi',     r: 5, text: "Ordered for my brother's birthday — he absolutely loves them!", product: 'Slippers' },
  { name: 'Karan T.',   city: 'Pune',      r: 5, text: 'Slippers are super comfortable. Worth every rupee. Highly recommended!', product: 'Slippers' },
  { name: 'Amit R.',    city: 'Jaipur',    r: 5, text: 'Sneakers are fire 🔥 Quality is top notch, delivery was fast!', product: 'Sneakers' },
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
    <div className="flex-shrink-0 w-64 sm:w-72 bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-md hover:border-gray-200 transition-all">
      <div className="flex items-center gap-0.5 mb-3">
        {[1,2,3,4,5].map(i => (
          <FiStar key={i} className={`text-xs ${i <= review.r ? 'text-amber-400 fill-amber-400' : 'text-gray-200'}`} />
        ))}
        <span className="ml-2 text-[10px] text-emerald-600 font-semibold flex items-center gap-0.5">
          <FiCheck className="text-[9px]" /> Verified
        </span>
      </div>
      <p className="text-xs sm:text-sm text-gray-700 leading-relaxed mb-4 line-clamp-3">"{review.text}"</p>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-gray-900 text-white text-xs font-bold flex items-center justify-center flex-shrink-0">
            {review.name[0]}
          </div>
          <div>
            <p className="text-xs font-bold text-gray-900 leading-tight">{review.name}</p>
            <p className="text-[10px] text-gray-400">{review.city}</p>
          </div>
        </div>
        <span className="text-[9px] font-semibold text-gray-400 bg-gray-50 border border-gray-100 px-2 py-1 rounded-full">
          {review.product}
        </span>
      </div>
    </div>
  );
}

/* ── Category fallback emoji map ────────────────────────────────── */
const CAT_EMOJI = {
  sneakers: '👟', 'casual-shoes': '🥿', 'slippers-clogs': '🩴',
  'new-arrivals': '⭐', default: '👞',
};
const CAT_COLORS = {
  sneakers: 'bg-blue-600', 'casual-shoes': 'bg-amber-500',
  'slippers-clogs': 'bg-emerald-600', default: 'bg-gray-700',
};

/* ── DEFAULT theme data ─────────────────────────────────────────── */
const DEFAULT_MARQUEE = ["Premium Men's Footwear", 'Free Delivery ₹999+', '100% Authentic', 'New Arrivals Weekly', 'Sneakers', 'Casual Shoes', 'Slippers & Clogs', 'Express Shipping', 'Easy Returns', 'Premium Quality'];
const DEFAULT_FEATURE = [
  { icon: '🚚', title: 'Free Delivery', subtitle: 'Orders above ₹999' },
  { icon: '🔄', title: '30-Day Returns', subtitle: 'Easy exchange' },
  { icon: '✅', title: '100% Authentic', subtitle: 'Every product' },
  { icon: '⚡', title: 'Fast Dispatch', subtitle: 'Order by 2 PM' },
];

/* ═══════════════════════════════════════════════════════════════════ */
export default function HomePage() {
  /* ── Queries ── */
  const { data: siteSettings } = useQuery({
    queryKey: ['publicSettings'],
    queryFn: () => fetch(`${import.meta.env.VITE_API_URL || '/api'}/settings/public`).then(r => r.json()).then(d => d.settings || {}),
    staleTime: 5 * 60 * 1000,
  });
  const { data: banners } = useQuery({
    queryKey: ['banners'],
    queryFn: () => api.get('/banners'),
    select: d => Array.isArray(d) ? d : (d?.banners || []),
  });
  const { data: collections } = useQuery({
    queryKey: ['publicCollections'],
    queryFn: () => api.get('/collections'),
    select: d => d.collections || [],
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
  const banner2 = banners?.find(b => b.position === 2) || PH[1];
  const banner3 = banners?.find(b => b.position === 3) || PH[2];
  const banner4 = banners?.find(b => b.position === 4) || PH[3];

  const allProducts = allProds?.products || [];
  const bsProducts  = bsProds?.products  || [];
  const naProducts  = naProds?.products  || [];

  /* ── Category tiles: collections from API + static fallbacks ── */
  const catTiles = [
    { label: 'All', slug: null, href: '/products', emoji: '🛍️', color: 'bg-gray-900', image: null },
    ...(collections?.length
      ? collections.map(c => ({
          label: c.name,
          slug: c.slug,
          href: `/collections/${c.slug}`,
          emoji: CAT_EMOJI[c.slug] || CAT_EMOJI.default,
          color: CAT_COLORS[c.slug] || CAT_COLORS.default,
          image: c.image || null,
        }))
      : [
          { label: 'Sneakers',         href: '/collections/sneakers',       emoji: '👟', color: 'bg-blue-600',   image: null },
          { label: 'Casual Shoes',     href: '/collections/casual-shoes',   emoji: '🥿', color: 'bg-amber-500',  image: null },
          { label: 'Slippers & Clogs', href: '/collections/slippers-clogs', emoji: '🩴', color: 'bg-emerald-600',image: null },
        ]
    ),
    { label: 'New Arrivals', href: '/products?newArrival=true', emoji: '⭐', color: 'bg-violet-600', image: null },
    { label: 'Sale',         href: '/products',                  emoji: '🔥', color: 'bg-red-600',    image: null },
  ];

  /* ── Reviews loop ── */
  const doubledReviews = [...ALL_REVIEWS, ...ALL_REVIEWS];

  return (
    <div className="bg-white">

      {/* ══ HERO ══════════════════════════════════════════════════════ */}
      <HeroBanner banners={banners} />

      {/* ══ USP STRIP ════════════════════════════════════════════════ */}
      <UspStrip featureBar={featureBar} />

      {/* ══ CATEGORY STRIP ═══════════════════════════════════════════ */}
      <div className="bg-white border-b border-gray-100 py-5">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex gap-4 sm:gap-6 overflow-x-auto scrollbar-hide justify-start sm:justify-center pb-1">
            {catTiles.map((cat, i) => (
              <Link key={i} to={cat.href}
                className="flex-shrink-0 flex flex-col items-center gap-2 group">
                <div className={`relative w-[60px] h-[60px] sm:w-[70px] sm:h-[70px] rounded-full overflow-hidden border-2 border-transparent group-hover:border-gray-900 group-hover:shadow-lg transition-all duration-200 ${!cat.image ? cat.color : ''}`}>
                  {cat.image
                    ? <img src={getImageUrl(cat.image)} alt={cat.label} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" />
                    : <span className="w-full h-full flex items-center justify-center text-2xl sm:text-3xl">{cat.emoji}</span>
                  }
                </div>
                <span className="text-[10px] sm:text-[11px] font-semibold text-gray-700 text-center leading-tight max-w-[70px] group-hover:text-gray-900 transition-colors">
                  {cat.label}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-3 sm:px-4 space-y-0">

        {/* ══ BEST SELLERS ════════════════════════════════════════════ */}
        {siteSettings?.homepageShowBestSellers !== false && (
          <Reveal className="pt-6">
            <div className="bg-white">
              <SectionTitle title="Best Sellers" sub="Top Picks" href="/products?bestSeller=true" />
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2.5 sm:gap-3">
                {loadBS
                  ? Array.from({ length: 5 }).map((_, i) => <Skel key={i} />)
                  : (bsProducts.length ? bsProducts : allProducts).slice(0, 10).map((p, i) => (
                      <ProductCard key={p._id} product={p} index={i} />
                    ))}
              </div>
              <div className="mt-5 flex justify-center">
                <Link to="/products"
                  className="inline-flex items-center gap-2 border-2 border-gray-900 text-gray-900 font-bold text-sm px-10 py-3 rounded-full hover:bg-gray-900 hover:text-white transition-all duration-200">
                  View All Products <FiArrowRight className="text-xs" />
                </Link>
              </div>
            </div>
          </Reveal>
        )}

        {/* ══ PROMO BANNER — SNEAKERS ══════════════════════════════════ */}
        <Reveal className="pt-6">
          <PromoBanner banner={banner2} className="w-full" />
        </Reveal>

      </div>

      {/* ══ DUAL MARQUEE ════════════════════════════════════════════ */}
      <div className="mt-6">
        <DualMarquee items={marqueeItems} />
      </div>

      <div className="max-w-7xl mx-auto px-3 sm:px-4 space-y-0">

        {/* ══ NEW ARRIVALS ══════════════════════════════════════════════ */}
        {siteSettings?.homepageShowNewArrivals !== false && (
          <Reveal className="pt-6">
            <div className="bg-white">
              <SectionTitle title="New Arrivals" sub="Just Dropped" href="/products?newArrival=true" />
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2.5 sm:gap-3">
                {loadNA
                  ? Array.from({ length: 5 }).map((_, i) => <Skel key={i} />)
                  : (naProducts.length ? naProducts : allProducts).slice(0, 10).map((p, i) => (
                      <ProductCard key={p._id} product={p} index={i} />
                    ))}
              </div>
            </div>
          </Reveal>
        )}

        {/* ══ 2-COL PROMO BANNERS ═══════════════════════════════════════ */}
        <Reveal className="pt-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <PromoBanner banner={banner3} />
            <PromoBanner banner={banner4} />
          </div>
        </Reveal>

        {/* ══ SHOP BY COLLECTION ═══════════════════════════════════════ */}
        {siteSettings?.homepageShowCollections !== false && (
          <Reveal className="pt-6">
            <div className="text-center mb-5 sm:mb-6">
              <p className="text-[10px] text-gray-400 uppercase tracking-[0.25em] font-bold mb-1">Explore</p>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Shop by Collection</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
              {[
                { label: 'Sneakers',         sub: 'Street style & sports',      href: '/collections/sneakers',       bg: '#0f172a' },
                { label: 'Casual Shoes',     sub: 'All-day comfort & style',     href: '/collections/casual-shoes',   bg: '#3b0764' },
                { label: 'Slippers & Clogs', sub: 'Relaxed everyday comfort',    href: '/collections/slippers-clogs', bg: '#052e16' },
              ].map((col, i) => {
                const found = collections?.find(c => c.href === col.href || col.href.includes(c.slug));
                const img = found?.bannerImage || found?.image || null;
                return (
                  <Link key={i} to={col.href}
                    className="relative overflow-hidden rounded-2xl flex flex-col justify-end group"
                    style={{ backgroundColor: col.bg, minHeight: 180, minHeight: 'clamp(160px, 25vw, 260px)' }}>
                    {img && <img src={getImageUrl(img)} alt={col.label} className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-600" />}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent" />
                    <div className="relative z-10 p-4 sm:p-6">
                      <p className="text-white/50 text-[10px] font-bold uppercase tracking-[0.2em] mb-1">{col.sub}</p>
                      <h3 className="font-display text-2xl sm:text-3xl font-black text-white tracking-tight leading-none">{col.label}</h3>
                      <span className="inline-flex items-center gap-1.5 mt-3 text-[11px] font-bold text-white border border-white/25 px-3 py-1.5 rounded-full group-hover:bg-white group-hover:text-gray-900 transition-all">
                        Shop Now <FiArrowRight className="text-[9px]" />
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          </Reveal>
        )}

        {/* ══ ALL PRODUCTS ══════════════════════════════════════════════ */}
        <Reveal className="pt-6">
          <SectionTitle title="Shop All Men's Footwear" sub="Complete Range" href="/products" />
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2.5 sm:gap-3">
            {loadAll
              ? Array.from({ length: 10 }).map((_, i) => <Skel key={i} />)
              : allProducts.slice(0, 15).map((p, i) => <ProductCard key={p._id} product={p} index={i} />)}
          </div>
          {allProducts.length >= 15 && (
            <div className="mt-5 flex justify-center">
              <Link to="/products"
                className="inline-flex items-center gap-2 bg-gray-900 text-white font-bold text-sm px-10 py-3 rounded-full hover:bg-gray-700 transition-all">
                See All Products <FiArrowRight className="text-xs" />
              </Link>
            </div>
          )}
        </Reveal>

      </div>

      {/* ══ REVIEWS AUTO-SCROLL ═══════════════════════════════════════ */}
      {siteSettings?.homepageShowReviews !== false && (
        <div className="mt-8 sm:mt-10 bg-gray-50 py-8 sm:py-10">
          <div className="max-w-7xl mx-auto px-4 mb-5 sm:mb-6">
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2">
              <div>
                <p className="text-[10px] text-gray-400 uppercase tracking-[0.25em] font-bold mb-1">What People Say</p>
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Customer Reviews</h2>
              </div>
              <div className="flex items-center gap-1.5">
                {[1,2,3,4,5].map(i => <FiStar key={i} className="text-amber-400 fill-amber-400 text-sm" />)}
                <span className="font-bold text-sm text-gray-900 ml-1">4.9</span>
                <span className="text-gray-400 text-xs">(500+ reviews)</span>
              </div>
            </div>
          </div>
          {/* Auto-scroll container */}
          <div className="reviews-scroll-wrap overflow-hidden relative">
            {/* Fade edges */}
            <div className="absolute left-0 top-0 bottom-0 w-8 sm:w-16 bg-gradient-to-r from-gray-50 to-transparent z-10 pointer-events-none" />
            <div className="absolute right-0 top-0 bottom-0 w-8 sm:w-16 bg-gradient-to-l from-gray-50 to-transparent z-10 pointer-events-none" />
            <div className="reviews-track px-2">
              {doubledReviews.map((review, i) => (
                <ReviewCard key={i} review={review} />
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-3 sm:px-4 space-y-0">

        {/* ══ WHY VELOQ ════════════════════════════════════════════════ */}
        {siteSettings?.homepageShowWhyUs !== false && (
          <Reveal className="pt-6">
            <div className="bg-gray-900 rounded-2xl overflow-hidden">
              <div className="px-5 sm:px-10 py-8 sm:py-10">
                <div className="text-center mb-6 sm:mb-8">
                  <p className="text-[10px] text-white/40 uppercase tracking-[0.3em] font-bold mb-1">Why Choose Us</p>
                  <h2 className="text-xl sm:text-2xl font-bold text-white">The VELOQ Promise</h2>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
                  {[
                    { icon: <FiTruck />,     title: 'Free Delivery',     desc: 'On orders above ₹999' },
                    { icon: <FiRefreshCw />, title: '30-Day Returns',    desc: 'Hassle-free exchange' },
                    { icon: <FiShield />,    title: '100% Authentic',    desc: 'Every single product' },
                    { icon: <FiZap />,       title: 'Same Day Dispatch', desc: 'Order before 2 PM' },
                  ].map((item, i) => (
                    <motion.div key={i} initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }} transition={{ delay: i * 0.08 }}
                      className="flex flex-col items-center text-center p-4 rounded-xl hover:bg-white/5 transition-colors">
                      <div className="w-11 h-11 bg-white/10 rounded-xl flex items-center justify-center text-white text-lg mb-3">
                        {item.icon}
                      </div>
                      <p className="text-white font-bold text-sm">{item.title}</p>
                      <p className="text-white/45 text-[11px] mt-1">{item.desc}</p>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          </Reveal>
        )}

        {/* ══ STATS ════════════════════════════════════════════════════ */}
        <Reveal className="pt-5">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { from: 0,   to: 500,  suffix: '+',  label: 'Happy Customers', icon: '😊' },
              { from: 0,   to: 50,   suffix: '+',  label: 'Products',        icon: '👟' },
              { from: 4.5, to: 4.9,  suffix: '★',  label: 'Avg Rating',      icon: '⭐' },
              { from: 0,   to: 100,  suffix: '%',  label: 'Authentic',        icon: '✅' },
            ].map(({ from, to, suffix, label, icon }) => (
              <div key={label} className="bg-white border border-gray-100 rounded-2xl p-4 sm:p-5 text-center shadow-sm hover:shadow-md transition-shadow">
                <div className="text-2xl mb-1">{icon}</div>
                <p className="text-xl sm:text-2xl font-bold text-gray-900">
                  <Counter from={from} to={to} suffix={suffix} />
                </p>
                <p className="text-[10px] sm:text-[11px] text-gray-500 font-medium mt-0.5">{label}</p>
              </div>
            ))}
          </div>
        </Reveal>

        {/* ══ NEWSLETTER ═══════════════════════════════════════════════ */}
        <Reveal className="pt-5 pb-8">
          <div className="bg-gray-900 rounded-2xl py-8 sm:py-12 px-5 sm:px-10 text-center">
            <p className="text-[10px] text-white/40 uppercase tracking-[0.3em] font-bold mb-2">Exclusive Access</p>
            <h2 className="text-xl sm:text-2xl font-bold text-white mb-2">Get First Access to New Drops</h2>
            <p className="text-white/50 text-sm mb-6 max-w-sm mx-auto">Early drops, member-only deals, and exclusive styles. Zero spam.</p>
            <form className="flex gap-2 max-w-sm mx-auto" onSubmit={e => e.preventDefault()}>
              <input type="email" placeholder="your@email.com"
                className="flex-1 bg-white/10 border border-white/20 text-white placeholder-white/35 rounded-full px-4 py-3 text-sm focus:outline-none focus:border-white/50 min-w-0" />
              <button type="submit"
                className="flex-shrink-0 bg-white text-gray-900 font-bold text-sm px-5 sm:px-6 py-3 rounded-full hover:bg-gray-100 transition-all">
                Join
              </button>
            </form>
            <p className="text-white/25 text-[10px] mt-3">Unsubscribe anytime · No spam ever</p>
          </div>
        </Reveal>

      </div>
    </div>
  );
}
