import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import api from '../utils/api';
import ProductCard from '../components/common/ProductCard';
import { PageLoader } from '../components/common/LoadingSpinner';
import { getImageUrl } from '../utils/helpers';

export default function CollectionPage() {
  const { slug } = useParams();
  const { data, isLoading } = useQuery({
    queryKey: ['collection', slug],
    queryFn: () => api.get(`/collections/${slug}`),
  });

  if (isLoading) return <PageLoader />;
  const collection = data?.collection;

  return (
    <div>
      {/* Banner */}
      {collection?.bannerImage ? (
        <div className="h-48 md:h-64 relative overflow-hidden">
          <img src={getImageUrl(collection.bannerImage)} alt={collection.name} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
            className="absolute bottom-0 left-0 right-0 p-6 md:p-10">
            <p className="text-white/60 text-[10px] tracking-widest uppercase mb-1">Collection</p>
            <h1 className="font-display text-4xl md:text-6xl text-white tracking-tight">{collection?.name?.toUpperCase()}</h1>
          </motion.div>
        </div>
      ) : (
        <div className="bg-ink py-10 px-4">
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="max-w-7xl mx-auto">
            <p className="text-white/40 text-[10px] tracking-widest uppercase mb-1">Collection</p>
            <h1 className="font-display text-4xl md:text-5xl text-white tracking-tight">{collection?.name?.toUpperCase()}</h1>
          </motion.div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        {collection?.description && (
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
            className="text-mid text-sm mb-6 max-w-2xl leading-relaxed">
            {collection.description}
          </motion.p>
        )}

        {collection?.products?.length === 0 ? (
          <div className="text-center py-16 text-mid text-sm">No products in this collection yet.</div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {collection?.products?.map((p, i) => (
              <motion.div key={p._id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                <ProductCard product={p} />
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
