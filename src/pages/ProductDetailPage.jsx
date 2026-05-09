import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { FiHeart, FiShoppingCart, FiStar, FiTruck, FiRefreshCw, FiShare2 } from 'react-icons/fi';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Thumbs, Navigation } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/thumbs';
import api from '../utils/api';
import useCartStore from '../store/cartStore';
import useWishlistStore from '../store/wishlistStore';
import useAuthStore from '../store/authStore';
import ProductCard from '../components/common/ProductCard';
import { PageLoader } from '../components/common/LoadingSpinner';
import { formatPrice, getDiscountPercent, getImageUrl } from '../utils/helpers';
import clsx from 'clsx';
import toast from 'react-hot-toast';

const TABS = ['Description', 'Size Guide', 'Care', 'Shipping'];

export default function ProductDetailPage() {
  const { slug } = useParams();
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState('Description');
  const [thumbsSwiper, setThumbsSwiper] = useState(null);
  const [sizeGuideOpen, setSizeGuideOpen] = useState(false);

  const { addToCart } = useCartStore();
  const { toggle, isInWishlist } = useWishlistStore();
  const { isAuthenticated } = useAuthStore();

  const { data, isLoading } = useQuery({
    queryKey: ['product', slug],
    queryFn: () => api.get(`/products/${slug}`),
  });

  const { data: related } = useQuery({
    queryKey: ['related', data?.product?._id],
    queryFn: () => api.get(`/products/${data.product._id}/related`),
    enabled: !!data?.product?._id,
  });

  const product = data?.product;
  if (isLoading) return <PageLoader />;
  if (!product) return (
    <div className="min-h-[60vh] flex items-center justify-center text-center">
      <div>
        <p className="text-2xl font-bold text-mid mb-4">Product not found</p>
        <Link to="/products" className="btn-primary px-6 py-2.5 text-sm inline-flex">Browse Products</Link>
      </div>
    </div>
  );

  const discount = getDiscountPercent(product.price, product.comparePrice);
  const uniqueSizes = [...new Set(product.variants?.map((v) => v.size))];
  const availableColors = product.variants?.filter((v) => !selectedSize || v.size === selectedSize)
    .map((v) => ({ color: v.color, hex: v.colorHex, stock: v.stock }));
  const uniqueColors = [...new Map(availableColors?.map((c) => [c.color, c])).values()];

  const currentVariant = product.variants?.find((v) => v.size === selectedSize && v.color === selectedColor);

  const handleAddToCart = () => {
    if (!selectedSize) return toast.error('Please select a size');
    if (!selectedColor) return toast.error('Please select a color');
    if (currentVariant?.stock < quantity) return toast.error('Not enough stock');
    addToCart(product, selectedSize, selectedColor, quantity);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs text-mid mb-6">
        <Link to="/" className="hover:text-ink transition-colors">Home</Link>
        <span>/</span>
        <Link to="/products" className="hover:text-ink transition-colors">Products</Link>
        <span>/</span>
        <span className="text-ink font-medium line-clamp-1">{product.name}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
        {/* Image Gallery */}
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }}>
          <div className="rounded-xl overflow-hidden bg-gray-50 border border-gray-200 aspect-square mb-2">
            <Swiper
              modules={[Thumbs, Navigation]}
              thumbs={{ swiper: thumbsSwiper && !thumbsSwiper.destroyed ? thumbsSwiper : null }}
              navigation
              className="h-full"
            >
              {product.images?.map((img, i) => (
                <SwiperSlide key={i} className="!h-full">
                  <img src={getImageUrl(img.url)} alt={img.alt || product.name}
                    className="w-full h-full object-cover"
                    onError={(e) => { e.target.src = 'https://placehold.co/600x600/f3f4f6/9ca3af?text=VELOQ'; }}
                  />
                </SwiperSlide>
              ))}
              {!product.images?.length && (
                <SwiperSlide className="!h-full">
                  <div className="w-full h-full flex items-center justify-center"><span className="text-7xl opacity-20">👟</span></div>
                </SwiperSlide>
              )}
            </Swiper>
          </div>
          {product.images?.length > 1 && (
            <Swiper onSwiper={setThumbsSwiper} slidesPerView={5} spaceBetween={6} watchSlidesProgress>
              {product.images.map((img, i) => (
                <SwiperSlide key={i}>
                  <div className="rounded-lg overflow-hidden aspect-square cursor-pointer border border-gray-200 hover:border-gray-400 transition-colors">
                    <img src={getImageUrl(img.url)} alt="" className="w-full h-full object-cover" />
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>
          )}
        </motion.div>

        {/* Product Info */}
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, delay: 0.1 }} className="flex flex-col">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-mid text-[10px] tracking-widest uppercase mb-1">{product.brand || 'VELOQ'}</p>
              <h1 className="text-2xl md:text-3xl font-bold text-ink leading-snug">{product.name}</h1>
            </div>
            <div className="flex gap-2 flex-shrink-0">
              <button onClick={() => toggle(product, isAuthenticated())}
                className={clsx('w-9 h-9 rounded-lg border flex items-center justify-center transition-all',
                  isInWishlist(product._id) ? 'bg-sale/10 border-sale text-sale' : 'border-gray-200 text-mid hover:border-sale hover:text-sale')}>
                <FiHeart className={clsx('text-sm', isInWishlist(product._id) && 'fill-current')} />
              </button>
              <button onClick={() => navigator.share?.({ title: product.name, url: window.location.href })}
                className="w-9 h-9 rounded-lg border border-gray-200 text-mid hover:border-gray-400 hover:text-ink flex items-center justify-center transition-all">
                <FiShare2 className="text-sm" />
              </button>
            </div>
          </div>

          {/* Rating */}
          {product.numReviews > 0 && (
            <div className="flex items-center gap-2 mt-3">
              <div className="flex gap-0.5">
                {[1,2,3,4,5].map((s) => (
                  <FiStar key={s} className={clsx('text-xs', s <= Math.round(product.avgRating) ? 'text-gold fill-current' : 'text-gray-200')} />
                ))}
              </div>
              <span className="text-mid text-xs">{product.avgRating?.toFixed(1)} ({product.numReviews} reviews)</span>
            </div>
          )}

          {/* Price */}
          <div className="flex items-center gap-3 mt-5 pb-4 border-b border-gray-100">
            <span className="text-3xl font-bold text-ink">{formatPrice(product.price)}</span>
            {product.comparePrice > product.price && (
              <span className="text-mid line-through text-lg">{formatPrice(product.comparePrice)}</span>
            )}
            {discount > 0 && (
              <span className="px-2 py-0.5 bg-green-50 border border-green-200 text-neon text-xs font-bold rounded-lg">
                {discount}% OFF
              </span>
            )}
          </div>
          {product.comparePrice > product.price && (
            <p className="text-neon text-xs mt-1">You save {formatPrice(product.comparePrice - product.price)}</p>
          )}

          {/* Color Selection */}
          {uniqueColors.length > 0 && (
            <div className="mt-5">
              <p className="text-xs font-semibold text-ink mb-2">Color: <span className="text-mid font-normal">{selectedColor || 'Select'}</span></p>
              <div className="flex flex-wrap gap-2">
                {uniqueColors.map(({ color, stock }) => (
                  <button key={color} onClick={() => setSelectedColor(color)} disabled={stock === 0}
                    className={clsx('px-3.5 py-2 rounded-lg text-xs font-semibold border transition-all',
                      selectedColor === color ? 'bg-ink text-white border-ink'
                        : stock === 0 ? 'border-gray-100 text-gray-300 cursor-not-allowed'
                          : 'border-gray-200 text-mid hover:border-ink hover:text-ink')}>
                    {color}{stock === 0 && ' (Out)'}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Size Selection */}
          <div className="mt-5">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-semibold text-ink">Size (UK): <span className="text-mid font-normal">{selectedSize?.replace('UK ', '') || 'Select'}</span></p>
              <button onClick={() => setSizeGuideOpen(true)} className="text-xs text-blue-600 hover:underline">Size Guide</button>
            </div>
            <div className="flex flex-wrap gap-2">
              {uniqueSizes.map((size) => {
                const v = product.variants.find((v) => v.size === size && (!selectedColor || v.color === selectedColor));
                const inStock = v ? v.stock > 0 : false;
                return (
                  <button key={size} onClick={() => setSelectedSize(size)} disabled={!inStock}
                    className={clsx('w-12 py-2.5 rounded-lg text-xs font-bold border transition-all',
                      selectedSize === size ? 'bg-ink text-white border-ink'
                        : !inStock ? 'border-gray-100 text-gray-300 cursor-not-allowed line-through'
                          : 'border-gray-200 text-mid hover:border-ink hover:text-ink')}>
                    {size.replace('UK ', '')}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Quantity */}
          <div className="mt-5 flex items-center gap-4">
            <p className="text-xs font-semibold text-ink">Qty:</p>
            <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden">
              <button onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="w-9 h-9 hover:bg-gray-50 transition-colors text-mid hover:text-ink font-bold flex items-center justify-center text-lg">−</button>
              <span className="w-9 text-center text-sm font-bold text-ink">{quantity}</span>
              <button onClick={() => setQuantity(Math.min(currentVariant?.stock || 10, quantity + 1))}
                className="w-9 h-9 hover:bg-gray-50 transition-colors text-mid hover:text-ink font-bold flex items-center justify-center text-lg">+</button>
            </div>
            {currentVariant && <span className="text-xs text-mid">{currentVariant.stock} in stock</span>}
          </div>

          {/* CTA Buttons */}
          <div className="flex gap-3 mt-6">
            <button onClick={handleAddToCart}
              className="flex-1 py-3.5 border border-gray-300 rounded-xl text-sm font-semibold text-ink hover:border-ink hover:bg-gray-50 transition-all flex items-center justify-center gap-2">
              <FiShoppingCart /> Add to Cart
            </button>
            <button onClick={() => { handleAddToCart(); setTimeout(() => window.location.href = '/checkout', 100); }}
              className="flex-1 py-3.5 bg-ink text-white rounded-xl text-sm font-bold hover:bg-gray-800 transition-colors">
              Buy Now
            </button>
          </div>

          {/* Trust Badges */}
          <div className="grid grid-cols-2 gap-2 mt-4">
            {[{ icon: FiTruck, text: 'Free delivery above ₹999' }, { icon: FiRefreshCw, text: '30-day easy returns' }].map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-2 bg-gray-50 border border-gray-100 rounded-lg p-2.5">
                <Icon className="text-mid flex-shrink-0 text-sm" />
                <span className="text-xs text-mid">{text}</span>
              </div>
            ))}
          </div>

          {/* Tabs */}
          <div className="mt-8 border-t border-gray-100 pt-6">
            <div className="flex gap-5 border-b border-gray-100 mb-4">
              {TABS.map((tab) => (
                <button key={tab} onClick={() => setActiveTab(tab)}
                  className={clsx('pb-3 text-xs font-semibold border-b-2 transition-all uppercase tracking-wide -mb-px',
                    activeTab === tab ? 'border-ink text-ink' : 'border-transparent text-mid hover:text-ink')}>
                  {tab}
                </button>
              ))}
            </div>
            <AnimatePresence mode="wait">
              <motion.div key={activeTab} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}
                className="text-sm text-mid leading-relaxed">
                {activeTab === 'Description' && <p>{product.description}</p>}
                {activeTab === 'Size Guide' && (
                  <table className="w-full text-xs border-collapse">
                    <thead><tr>{['UK','EU','US','CM'].map((h) => <th key={h} className="border border-gray-100 p-2 font-semibold text-ink text-left">{h}</th>)}</tr></thead>
                    <tbody>
                      {[['6','39','7','24.5'],['7','40','8','25.5'],['8','41','9','26'],['9','42','10','27'],['10','43','11','27.5'],['11','44','12','28.5'],['12','45','13','29']].map((row) => (
                        <tr key={row[0]} className="hover:bg-gray-50"><td className="border border-gray-100 p-2">{row[0]}</td><td className="border border-gray-100 p-2">{row[1]}</td><td className="border border-gray-100 p-2">{row[2]}</td><td className="border border-gray-100 p-2">{row[3]}</td></tr>
                      ))}
                    </tbody>
                  </table>
                )}
                {activeTab === 'Care' && <p>{product.careInstructions || 'Wipe with a clean, dry cloth. Avoid prolonged exposure to water. Store in a cool, dry place.'}</p>}
                {activeTab === 'Shipping' && (
                  <ul className="space-y-2">
                    <li>• Standard Delivery: 5-7 business days</li>
                    <li>• Express Delivery: 2-3 business days</li>
                    <li>• Free shipping on orders above ₹999</li>
                    <li>• Same-day dispatch for orders placed before 2 PM</li>
                  </ul>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </motion.div>
      </div>

      {/* Reviews */}
      <section className="mt-12 border-t border-gray-100 pt-10">
        <h2 className="text-xl font-bold text-ink mb-6">Customer Reviews</h2>
        {!product.reviews?.length ? (
          <div className="text-center py-12 bg-white border border-gray-100 rounded-xl">
            <FiStar className="text-3xl text-gray-200 mx-auto mb-3" />
            <p className="text-mid text-sm">No reviews yet. Be the first to review!</p>
          </div>
        ) : (
          <div className="grid gap-3 md:grid-cols-2">
            {product.reviews.map((review, i) => (
              <motion.div key={review._id} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.07 }}
                className="bg-white border border-gray-100 rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-xs font-bold text-ink">
                      {review.name?.[0]?.toUpperCase()}
                    </div>
                    <span className="font-semibold text-sm text-ink">{review.name}</span>
                  </div>
                  <div className="flex gap-0.5">
                    {[1,2,3,4,5].map((s) => <FiStar key={s} className={clsx('text-xs', s <= review.rating ? 'text-gold fill-current' : 'text-gray-200')} />)}
                  </div>
                </div>
                <p className="text-sm text-mid leading-relaxed">{review.comment}</p>
              </motion.div>
            ))}
          </div>
        )}
      </section>

      {/* Related Products */}
      {related?.products?.length > 0 && (
        <section className="mt-12 border-t border-gray-100 pt-10">
          <h2 className="text-xl font-bold text-ink mb-6">You Might Also Like</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {related.products.slice(0, 4).map((p, i) => (
              <motion.div key={p._id} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }}>
                <ProductCard product={p} />
              </motion.div>
            ))}
          </div>
        </section>
      )}

      {/* Size Guide Modal */}
      <AnimatePresence>
        {sizeGuideOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
            onClick={() => setSizeGuideOpen(false)}>
            <motion.div initial={{ scale: 0.95, y: 16 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95 }}
              className="bg-white border border-gray-200 rounded-2xl p-6 max-w-md w-full shadow-card-lg"
              onClick={(e) => e.stopPropagation()}>
              <div className="flex justify-between mb-5">
                <h3 className="text-lg font-bold text-ink">Size Guide</h3>
                <button onClick={() => setSizeGuideOpen(false)} className="text-mid hover:text-ink text-2xl leading-none">×</button>
              </div>
              <table className="w-full text-sm border-collapse">
                <thead><tr>{['UK','EU','US','India','CM'].map((h) => <th key={h} className="border border-gray-100 p-2 font-semibold text-ink text-left text-xs">{h}</th>)}</tr></thead>
                <tbody>
                  {[['6','39','7','6','24.5'],['7','40','8','7','25.5'],['8','41','9','8','26'],['9','42','10','9','27'],['10','43','11','10','27.5'],['11','44','12','11','28.5'],['12','45','13','12','29']].map((row) => (
                    <tr key={row[0]} className="hover:bg-gray-50">
                      {row.map((c, i) => <td key={i} className="border border-gray-100 p-2 text-mid text-xs">{c}</td>)}
                    </tr>
                  ))}
                </tbody>
              </table>
              <p className="text-xs text-mid mt-3">Tip: Measure your foot and add 0.5cm for a comfortable fit.</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
