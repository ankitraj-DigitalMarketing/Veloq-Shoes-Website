import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiHeart } from 'react-icons/fi';
import useWishlistStore from '../store/wishlistStore';
import ProductCard from '../components/common/ProductCard';

export default function WishlistPage() {
  const { items } = useWishlistStore();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <h1 className="text-2xl font-bold text-ink">My Wishlist</h1>
        <p className="text-mid text-sm mt-0.5">{items.length} saved items</p>
      </motion.div>

      {items.length === 0 ? (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="flex flex-col items-center justify-center py-24 text-center">
          <div className="w-20 h-20 bg-gray-100 rounded-2xl flex items-center justify-center mb-6">
            <FiHeart className="text-4xl text-mid" />
          </div>
          <h2 className="text-xl font-bold text-ink mb-2">Your wishlist is empty</h2>
          <p className="text-mid text-sm mb-8">Save your favorite shoes here</p>
          <Link to="/products" className="btn-primary px-8 py-3 text-sm inline-flex">Browse Products</Link>
        </motion.div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {items.map((item, i) => (
            <motion.div key={item._id || item} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
              <ProductCard product={typeof item === 'object' ? item : { _id: item }} />
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
