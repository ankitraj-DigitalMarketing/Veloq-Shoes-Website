import { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, useMotionValue, useTransform, useSpring } from 'framer-motion';
import { FiHeart, FiShoppingCart, FiStar, FiCheck } from 'react-icons/fi';
import { formatPrice, getDiscountPercent, getImageUrl } from '../../utils/helpers';
import useCartStore from '../../store/cartStore';
import useWishlistStore from '../../store/wishlistStore';
import useAuthStore from '../../store/authStore';
import clsx from 'clsx';

export default function ProductCard({ product, index = 0 }) {
  const [added, setAdded] = useState(false);
  const cardRef = useRef(null);

  const { addToCart }      = useCartStore();
  const { toggle, isInWishlist } = useWishlistStore();
  const { isAuthenticated } = useAuthStore();

  const discount   = getDiscountPercent(product.price, product.comparePrice);
  const inWishlist = isInWishlist(product._id);
  const sizes      = [...new Set(product.variants?.map((v) => v.size))].slice(0, 4);
  const lowStock   = product.variants?.some((v) => v.stock > 0 && v.stock <= 3);

  /* 3-D tilt via Framer Motion */
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [6, -6]), {
    stiffness: 300, damping: 30,
  });
  const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-8, 8]), {
    stiffness: 300, damping: 30,
  });

  const handleMouseMove = (e) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    mouseX.set((e.clientX - rect.left) / rect.width - 0.5);
    mouseY.set((e.clientY - rect.top)  / rect.height - 0.5);
  };

  const handleMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
  };

  const handleAdd = (e) => {
    e.preventDefault();
    const v = product.variants?.[0];
    if (!v) return;
    addToCart(product, v.size, v.color);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  const handleWishlist = (e) => {
    e.preventDefault();
    toggle(product, isAuthenticated());
  };

  return (
    <motion.div
      ref={cardRef}
      initial={{ opacity: 0, y: 30, scale: 0.97 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.5, delay: index * 0.05, ease: [0.22, 1, 0.36, 1] }}
      style={{
        perspective: '1200px',
        rotateX,
        rotateY,
        transformStyle: 'preserve-3d',
      }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      <Link
        to={`/products/${product.slug}`}
        className="block rounded-xl overflow-hidden transition-all duration-300 group"
        style={{
          background: '#FFFFFF',
          border: '1px solid #E8E8E8',
          boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
        }}
        onMouseEnter={e => {
          e.currentTarget.style.borderColor = '#d0d0d0';
          e.currentTarget.style.boxShadow = '0 20px 60px rgba(0,0,0,0.1)';
        }}
        onMouseLeave={e => {
          e.currentTarget.style.borderColor = '#E8E8E8';
          e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.06)';
        }}
      >
        {/* Image */}
        <div
          className="relative product-img-wrap aspect-[4/5]"
          style={{ background: '#F8F8F8' }}
        >
          <img
            src={getImageUrl(product.images?.[0]?.url)}
            alt={product.name}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.target.src = 'https://placehold.co/400x500/F8F8F8/AAAAAA?text=VELOQ';
            }}
          />

          {/* Badges top-left */}
          <div className="absolute top-2 left-2 flex flex-col gap-1">
            {discount > 0 && (
              <span
                className="text-[10px] font-black px-2 py-0.5 rounded-md leading-tight shadow-sm"
                style={{ background: '#C8FF00', color: '#0A0A0A' }}
              >
                {discount}% OFF
              </span>
            )}
            {product.isNewArrival && !discount && (
              <span
                className="text-[10px] font-black px-2 py-0.5 rounded-md leading-tight"
                style={{ background: '#0A0A0A', color: '#ffffff' }}
              >
                NEW
              </span>
            )}
            {product.isBestSeller && (
              <span
                className="text-[10px] font-black px-2 py-0.5 rounded-md leading-tight"
                style={{ background: '#FF3366', color: '#fff' }}
              >
                BESTSELLER
              </span>
            )}
            {lowStock && !discount && (
              <span
                className="text-[10px] font-black px-2 py-0.5 rounded-md leading-tight"
                style={{ background: '#FF6600', color: '#fff' }}
              >
                LOW STOCK
              </span>
            )}
          </div>

          {/* Wishlist heart */}
          <button
            onClick={handleWishlist}
            className={clsx(
              'absolute top-2 right-2 w-7 h-7 rounded-full flex items-center justify-center transition-all duration-200 shadow-sm'
            )}
            style={{
              background: inWishlist ? '#FF3366' : '#FFFFFF',
              color: inWishlist ? '#fff' : '#666',
              border: '1px solid ' + (inWishlist ? '#FF3366' : '#E8E8E8'),
            }}
          >
            <FiHeart className={clsx('text-xs', inWishlist && 'fill-current')} />
          </button>
        </div>

        {/* Info block */}
        <div className="px-2.5 pt-2 pb-0">
          <p
            className="text-[10px] uppercase tracking-widest font-medium truncate"
            style={{ color: '#AAAAAA' }}
          >
            {product.brand || 'VELOQ'}
          </p>
          <h3
            className="text-[13px] font-semibold truncate leading-snug mt-0.5"
            style={{ color: '#0A0A0A', fontFamily: "'Plus Jakarta Sans', sans-serif" }}
          >
            {product.name}
          </h3>

          {/* Rating — lime stars */}
          {product.avgRating > 0 && (
            <div className="flex items-center gap-1 mt-0.5">
              <div className="flex">
                {[1, 2, 3, 4, 5].map((s) => (
                  <FiStar
                    key={s}
                    className="text-[9px]"
                    style={{
                      color: s <= Math.round(product.avgRating) ? '#C8FF00' : '#E8E8E8',
                      fill: s <= Math.round(product.avgRating) ? '#C8FF00' : 'none',
                    }}
                  />
                ))}
              </div>
              <span className="text-[10px]" style={{ color: '#AAAAAA' }}>
                ({product.numReviews})
              </span>
            </div>
          )}

          {/* Price row */}
          <div className="mt-1">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-sm font-bold" style={{ color: '#0A0A0A' }}>
                {formatPrice(product.price)}
              </span>
              {product.comparePrice > product.price && (
                <span
                  className="text-[11px] line-through"
                  style={{ color: '#AAAAAA' }}
                >
                  {formatPrice(product.comparePrice)}
                </span>
              )}
            </div>
            {product.comparePrice > product.price && (
              <p
                className="text-[10px] font-bold mt-0.5"
                style={{ color: '#C8FF00' }}
              >
                Save {formatPrice(product.comparePrice - product.price)}
              </p>
            )}
          </div>

          {/* Size pills */}
          {sizes.length > 0 && (
            <div className="flex gap-1 mt-1.5 flex-wrap">
              {sizes.map((size) => (
                <span
                  key={size}
                  className="text-[9px] px-1.5 py-0.5 rounded-sm leading-tight"
                  style={{ border: '1px solid #E8E8E8', color: '#AAAAAA' }}
                >
                  {size.replace('UK ', '')}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Add to Cart — lime full-width button */}
        <button
          onClick={handleAdd}
          style={{
            borderRadius: '0 0 12px 12px',
            background: added ? '#0A0A0A' : '#C8FF00',
            color: added ? '#C8FF00' : '#0A0A0A',
            transition: 'all 0.2s',
          }}
          className="w-full mt-2.5 h-9 text-[11px] font-black uppercase tracking-wider flex items-center justify-center gap-1.5"
          onMouseEnter={e => {
            if (!added) {
              e.currentTarget.style.background = '#A8D800';
              e.currentTarget.style.boxShadow = '0 0 20px rgba(200,255,0,0.4)';
              e.currentTarget.style.transform = 'translateY(-1px)';
            }
          }}
          onMouseLeave={e => {
            if (!added) {
              e.currentTarget.style.background = '#C8FF00';
            }
            e.currentTarget.style.boxShadow = 'none';
            e.currentTarget.style.transform = 'none';
          }}
        >
          {added ? (
            <><FiCheck className="text-xs" /> Added!</>
          ) : (
            <><FiShoppingCart className="text-xs" /> Add to Cart</>
          )}
        </button>
      </Link>
    </motion.div>
  );
}
