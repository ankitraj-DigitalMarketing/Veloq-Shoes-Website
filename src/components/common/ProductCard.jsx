import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiHeart, FiShoppingCart, FiStar, FiCheck } from 'react-icons/fi';
import { formatPrice, getDiscountPercent, getImageUrl } from '../../utils/helpers';
import useCartStore from '../../store/cartStore';
import useWishlistStore from '../../store/wishlistStore';
import useAuthStore from '../../store/authStore';
import clsx from 'clsx';

export default function ProductCard({ product, index = 0 }) {
  const [added, setAdded] = useState(false);

  const { addToCart } = useCartStore();
  const { toggle, isInWishlist } = useWishlistStore();
  const { isAuthenticated } = useAuthStore();

  const discount = getDiscountPercent(product.price, product.comparePrice);
  const inWishlist = isInWishlist(product._id);
  const sizes = [...new Set(product.variants?.map((v) => v.size))].slice(0, 4);
  const lowStock = product.variants?.some((v) => v.stock > 0 && v.stock <= 3);

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
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.35, delay: index * 0.05 }}
      whileHover={{ scale: 1.015, transition: { duration: 0.2 } }}
    >
      <Link
        to={`/products/${product.slug}`}
        className="block bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-lg hover:border-gray-300 transition-all duration-300"
      >
        {/* Image */}
        <div className="relative product-img-wrap aspect-[4/5] bg-gray-50">
          <img
            src={getImageUrl(product.images?.[0]?.url)}
            alt={product.name}
            className="w-full h-full object-cover"
            onError={(e) => { e.target.src = 'https://placehold.co/400x500/f3f4f6/9ca3af?text=VELOQ'; }}
          />

          {/* Badges top-left */}
          <div className="absolute top-2 left-2 flex flex-col gap-1">
            {discount > 0 && (
              <span className="text-[10px] font-black px-2 py-0.5 bg-red-500 text-white rounded-md leading-tight shadow-sm">
                {discount}% OFF
              </span>
            )}
            {product.isNewArrival && !discount && (
              <span className="text-[10px] font-black px-2 py-0.5 bg-gray-900 text-white rounded-md leading-tight">
                NEW
              </span>
            )}
            {product.isBestSeller && (
              <span className="text-[10px] font-black px-2 py-0.5 bg-amber-400 text-black rounded-md leading-tight">
                BESTSELLER
              </span>
            )}
            {lowStock && !discount && (
              <span className="text-[10px] font-black px-2 py-0.5 bg-orange-500 text-white rounded-md leading-tight">
                LOW STOCK
              </span>
            )}
          </div>

          {/* Wishlist heart — always visible top-right */}
          <button
            onClick={handleWishlist}
            className={clsx(
              'absolute top-2 right-2 w-7 h-7 rounded-full flex items-center justify-center transition-all duration-200 shadow-sm',
              inWishlist
                ? 'bg-red-500 text-white'
                : 'bg-white/95 text-gray-400 hover:text-red-500 hover:bg-white'
            )}
          >
            <FiHeart className={clsx('text-xs', inWishlist && 'fill-current')} />
          </button>
        </div>

        {/* Info block */}
        <div className="px-2.5 pt-2 pb-0">
          <p className="text-[10px] text-gray-400 uppercase tracking-widest font-medium truncate">
            {product.brand || 'VELOQ'}
          </p>
          <h3 className="text-[13px] font-semibold text-ink truncate leading-snug mt-0.5">
            {product.name}
          </h3>

          {/* Rating */}
          {product.avgRating > 0 && (
            <div className="flex items-center gap-1 mt-0.5">
              <div className="flex">
                {[1, 2, 3, 4, 5].map((s) => (
                  <FiStar
                    key={s}
                    className={clsx(
                      'text-[9px]',
                      s <= Math.round(product.avgRating)
                        ? 'text-amber-400 fill-current'
                        : 'text-gray-200'
                    )}
                  />
                ))}
              </div>
              <span className="text-[10px] text-gray-400">({product.numReviews})</span>
            </div>
          )}

          {/* Price row */}
          <div className="mt-1">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-sm font-bold text-gray-900">{formatPrice(product.price)}</span>
              {product.comparePrice > product.price && (
                <span className="text-[11px] text-gray-400 line-through">{formatPrice(product.comparePrice)}</span>
              )}
            </div>
            {product.comparePrice > product.price && (
              <p className="text-[10px] font-bold text-green-600 mt-0.5">
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
                  className="text-[9px] text-gray-500 border border-gray-200 px-1.5 py-0.5 rounded-sm leading-tight"
                >
                  {size.replace('UK ', '')}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Add to Cart — full-width flush bottom, no top radius */}
        <button
          onClick={handleAdd}
          style={{ borderRadius: '0 0 12px 12px' }}
          className={clsx(
            'w-full mt-2.5 h-9 text-[11px] font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all duration-200',
            added
              ? 'bg-green-600 text-white'
              : 'bg-ink text-white hover:bg-gray-800'
          )}
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
