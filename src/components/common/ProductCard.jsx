import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiHeart, FiShoppingCart, FiStar } from 'react-icons/fi';
import { formatPrice, getDiscountPercent, getImageUrl } from '../../utils/helpers';
import useCartStore from '../../store/cartStore';
import useWishlistStore from '../../store/wishlistStore';
import useAuthStore from '../../store/authStore';
import clsx from 'clsx';

export default function ProductCard({ product, index = 0 }) {
  const [hovered, setHovered] = useState(false);
  const [imgIdx, setImgIdx] = useState(0);

  const { addToCart } = useCartStore();
  const { toggle, isInWishlist } = useWishlistStore();
  const { isAuthenticated } = useAuthStore();

  const discount = getDiscountPercent(product.price, product.comparePrice);
  const inWishlist = isInWishlist(product._id);

  const handleQuickAdd = (e) => {
    e.preventDefault();
    const v = product.variants?.[0];
    if (v) addToCart(product, v.size, v.color);
  };

  const handleWishlist = (e) => {
    e.preventDefault();
    toggle(product, isAuthenticated());
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.4, delay: index * 0.06, ease: [0.25, 0.46, 0.45, 0.94] }}
    >
      <Link
        to={`/products/${product.slug}`}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => { setHovered(false); setImgIdx(0); }}
        className="block group bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-card-lg hover:border-gray-300 transition-all duration-300"
      >
        {/* Image */}
        <div className="relative product-img-wrap aspect-[4/5] bg-gray-50">
          <img
            src={getImageUrl(product.images?.[imgIdx]?.url)}
            alt={product.name}
            className="w-full h-full object-cover"
            onError={(e) => { e.target.src = 'https://placehold.co/400x500/f3f4f6/9ca3af?text=VELOQ'; }}
          />

          {/* Badges */}
          <div className="absolute top-2 left-2 flex flex-col gap-1">
            {discount > 0 && (
              <span className="badge bg-sale text-white text-[9px] font-black px-2 py-0.5">
                -{discount}%
              </span>
            )}
            {product.isNewArrival && !discount && (
              <span className="badge bg-ink text-white text-[9px] font-black px-2 py-0.5">
                NEW
              </span>
            )}
            {product.isBestSeller && (
              <span className="badge bg-gold text-black text-[9px] font-black px-2 py-0.5">
                BESTSELLER
              </span>
            )}
          </div>

          {/* Wishlist */}
          <button
            onClick={handleWishlist}
            className={clsx(
              'absolute top-2 right-2 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200',
              inWishlist
                ? 'bg-sale text-white opacity-100'
                : 'bg-white/90 text-mid hover:text-sale opacity-0 group-hover:opacity-100 shadow-sm'
            )}
          >
            <FiHeart className={clsx('text-xs', inWishlist && 'fill-current')} />
          </button>

          {/* Image dots */}
          {product.images?.length > 1 && hovered && (
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
              {product.images.slice(0, 4).map((_, i) => (
                <button
                  key={i}
                  onClick={(e) => { e.preventDefault(); setImgIdx(i); }}
                  className={clsx('w-1.5 h-1.5 rounded-full transition-all', i === imgIdx ? 'bg-ink w-3' : 'bg-gray-400')}
                />
              ))}
            </div>
          )}

          {/* Quick Add */}
          <AnimatePresence>
            {hovered && (
              <motion.div
                initial={{ y: 40, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 40, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="absolute bottom-0 left-0 right-0"
              >
                <button
                  onClick={handleQuickAdd}
                  className="w-full bg-ink text-white py-3 text-[11px] font-bold tracking-[0.12em] uppercase flex items-center justify-center gap-2 hover:bg-gray-800 transition-colors"
                >
                  <FiShoppingCart className="text-sm" />
                  Add to Cart
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Info */}
        <div className="p-3">
          <p className="text-mid text-[10px] uppercase tracking-wider mb-0.5">{product.brand || 'VELOQ'}</p>
          <h3 className="text-ink text-sm font-semibold line-clamp-1 group-hover:text-dark transition-colors">
            {product.name}
          </h3>

          {product.avgRating > 0 && (
            <div className="flex items-center gap-1 mt-1">
              {[1,2,3,4,5].map((s) => (
                <FiStar key={s} className={clsx('text-[9px]', s <= Math.round(product.avgRating) ? 'text-gold fill-current' : 'text-gray-200')} />
              ))}
              <span className="text-[10px] text-mid ml-0.5">({product.numReviews})</span>
            </div>
          )}

          <div className="flex items-center gap-2 mt-1.5">
            <span className="text-ink font-bold text-sm">{formatPrice(product.price)}</span>
            {product.comparePrice > product.price && (
              <span className="text-mid text-xs line-through">{formatPrice(product.comparePrice)}</span>
            )}
          </div>

          {/* Sizes */}
          {product.variants?.length > 0 && (
            <div className="flex gap-1 mt-1.5 flex-wrap">
              {[...new Set(product.variants.map((v) => v.size))].slice(0, 5).map((size) => (
                <span key={size} className="text-[9px] text-mid border border-gray-200 px-1.5 py-0.5 rounded">
                  {size.replace('UK ', '')}
                </span>
              ))}
            </div>
          )}
        </div>
      </Link>
    </motion.div>
  );
}
