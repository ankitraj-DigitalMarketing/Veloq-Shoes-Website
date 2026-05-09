import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { FiFilter, FiGrid, FiList, FiX, FiSliders } from 'react-icons/fi';
import api from '../utils/api';
import ProductCard from '../components/common/ProductCard';
import Pagination from '../components/common/Pagination';
import { PageLoader } from '../components/common/LoadingSpinner';
import clsx from 'clsx';

const SORT_OPTIONS = [
  { value: '-createdAt', label: 'Newest' },
  { value: 'price-asc',  label: 'Price: Low to High' },
  { value: 'price-desc', label: 'Price: High to Low' },
  { value: 'rating',     label: 'Top Rated' },
  { value: 'bestseller', label: 'Best Seller' },
];

const SIZES = ['UK 6', 'UK 7', 'UK 8', 'UK 9', 'UK 10', 'UK 11', 'UK 12'];
const COLORS = ['Black', 'White', 'Red', 'Blue', 'Green', 'Grey', 'Brown'];

export default function ProductListPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [viewMode, setViewMode] = useState('grid');

  const page = Number(searchParams.get('page')) || 1;
  const sort = searchParams.get('sort') || '-createdAt';
  const search = searchParams.get('search') || '';
  const selectedSizes = searchParams.get('size')?.split(',').filter(Boolean) || [];
  const selectedColors = searchParams.get('color')?.split(',').filter(Boolean) || [];
  const minPrice = searchParams.get('minPrice') || '';
  const maxPrice = searchParams.get('maxPrice') || '';
  const newArrival = searchParams.get('newArrival') || '';
  const bestSeller = searchParams.get('bestSeller') || '';

  const queryString = new URLSearchParams({
    page, limit: 12, sort,
    ...(search && { search }),
    ...(selectedSizes.length && { size: selectedSizes[0] }),
    ...(selectedColors.length && { color: selectedColors[0] }),
    ...(minPrice && { minPrice }),
    ...(maxPrice && { maxPrice }),
    ...(newArrival && { newArrival }),
    ...(bestSeller && { bestSeller }),
  }).toString();

  const { data, isLoading } = useQuery({
    queryKey: ['products', queryString],
    queryFn: () => api.get(`/products?${queryString}`),
  });

  const updateParam = (key, value) => {
    const params = new URLSearchParams(searchParams);
    if (value) params.set(key, value); else params.delete(key);
    params.set('page', '1');
    setSearchParams(params);
  };

  const toggleArrayParam = (key, value) => {
    const params = new URLSearchParams(searchParams);
    const current = params.get(key)?.split(',').filter(Boolean) || [];
    const updated = current.includes(value) ? current.filter((v) => v !== value) : [...current, value];
    if (updated.length) params.set(key, updated.join(',')); else params.delete(key);
    params.set('page', '1');
    setSearchParams(params);
  };

  const clearFilters = () => setSearchParams({ page: '1' });
  const activeFilterCount = [selectedSizes.length, selectedColors.length, minPrice].filter(Boolean).length;

  const FilterPanel = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-ink text-[10px] font-bold tracking-[0.2em] uppercase mb-3">Size</h3>
        <div className="flex flex-wrap gap-2">
          {SIZES.map((size) => (
            <button key={size} onClick={() => toggleArrayParam('size', size)}
              className={clsx(
                'w-12 py-1.5 text-xs font-semibold rounded-lg transition-all border',
                selectedSizes.includes(size)
                  ? 'bg-ink text-white border-ink'
                  : 'border-gray-200 text-mid hover:border-ink hover:text-ink'
              )}
            >
              {size.replace('UK ', '')}
            </button>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-ink text-[10px] font-bold tracking-[0.2em] uppercase mb-3">Color</h3>
        <div className="flex flex-wrap gap-2">
          {COLORS.map((color) => (
            <button key={color} onClick={() => toggleArrayParam('color', color)}
              className={clsx(
                'px-3 py-1.5 text-xs font-medium rounded-lg transition-all border',
                selectedColors.includes(color)
                  ? 'bg-ink text-white border-ink'
                  : 'border-gray-200 text-mid hover:border-ink hover:text-ink'
              )}
            >
              {color}
            </button>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-ink text-[10px] font-bold tracking-[0.2em] uppercase mb-3">Price Range</h3>
        <div className="flex gap-2">
          <input type="number" placeholder="Min ₹" className="input-field text-sm py-2" value={minPrice} onChange={(e) => updateParam('minPrice', e.target.value)} />
          <input type="number" placeholder="Max ₹" className="input-field text-sm py-2" value={maxPrice} onChange={(e) => updateParam('maxPrice', e.target.value)} />
        </div>
      </div>

      {activeFilterCount > 0 && (
        <button onClick={clearFilters}
          className="w-full py-2.5 text-xs font-semibold border border-gray-200 rounded-lg text-mid hover:border-ink hover:text-ink transition-all">
          Clear All Filters
        </button>
      )}
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between mb-5 gap-4 flex-wrap"
      >
        <div>
          <h1 className="text-2xl font-bold text-ink">
            {search ? `Results: "${search}"` : 'All Products'}
          </h1>
          {data && <p className="text-mid text-xs mt-0.5">{data.pagination?.total} products found</p>}
        </div>

        <div className="flex items-center gap-2">
          <button onClick={() => setFiltersOpen(!filtersOpen)}
            className="md:hidden flex items-center gap-2 px-3 py-2 border border-gray-200 rounded-lg text-xs font-semibold text-mid hover:text-ink hover:border-gray-400 transition-all">
            <FiSliders />
            Filters {activeFilterCount > 0 && `(${activeFilterCount})`}
          </button>

          <select value={sort} onChange={(e) => updateParam('sort', e.target.value)}
            className="border border-gray-200 text-ink text-xs rounded-lg px-3 py-2 outline-none hover:border-gray-400 transition-all bg-white cursor-pointer">
            {SORT_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>

          <div className="hidden md:flex border border-gray-200 rounded-lg overflow-hidden">
            <button onClick={() => setViewMode('grid')}
              className={clsx('p-2 transition-colors', viewMode === 'grid' ? 'bg-ink text-white' : 'text-mid hover:text-ink')}>
              <FiGrid className="text-sm" />
            </button>
            <button onClick={() => setViewMode('list')}
              className={clsx('p-2 transition-colors', viewMode === 'list' ? 'bg-ink text-white' : 'text-mid hover:text-ink')}>
              <FiList className="text-sm" />
            </button>
          </div>
        </div>
      </motion.div>

      <div className="flex gap-6">
        {/* Desktop Sidebar */}
        <aside className="hidden md:block w-52 flex-shrink-0">
          <div className="sticky top-32 bg-white border border-gray-200 rounded-xl p-4">
            <div className="flex items-center justify-between mb-4">
              <p className="font-bold text-sm text-ink">Filters</p>
              {activeFilterCount > 0 && (
                <span className="text-[10px] bg-ink text-white rounded-full px-2 py-0.5 font-bold">{activeFilterCount}</span>
              )}
            </div>
            <FilterPanel />
          </div>
        </aside>

        {/* Mobile Drawer */}
        <AnimatePresence>
          {filtersOpen && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 md:hidden">
              <div className="absolute inset-0 bg-black/50" onClick={() => setFiltersOpen(false)} />
              <motion.div
                initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
                transition={{ type: 'spring', damping: 30, stiffness: 300 }}
                className="absolute right-0 top-0 bottom-0 w-80 bg-white border-l border-gray-200 p-5 overflow-y-auto"
              >
                <div className="flex items-center justify-between mb-6">
                  <h2 className="font-bold text-lg text-ink">Filters</h2>
                  <button onClick={() => setFiltersOpen(false)} className="text-mid hover:text-ink transition-colors"><FiX className="text-xl" /></button>
                </div>
                <FilterPanel />
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Product Grid */}
        <div className="flex-1 min-w-0">
          {isLoading ? (
            <PageLoader />
          ) : data?.products?.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-5xl mb-4 opacity-30">👟</p>
              <h3 className="text-xl font-bold text-ink mb-2">No products found</h3>
              <p className="text-mid text-sm mb-6">Try adjusting your filters or search query.</p>
              <button onClick={clearFilters} className="btn-primary px-6 py-2.5 text-sm inline-flex">Clear Filters</button>
            </div>
          ) : (
            <>
              <div className={clsx('grid gap-3', viewMode === 'grid' ? 'grid-cols-2 md:grid-cols-3' : 'grid-cols-1')}>
                {data?.products?.map((p, i) => (
                  <motion.div key={p._id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04, duration: 0.35 }}>
                    <ProductCard product={p} />
                  </motion.div>
                ))}
              </div>
              <Pagination currentPage={page} totalPages={data?.pagination?.pages} onPageChange={(p) => updateParam('page', p)} />
            </>
          )}
        </div>
      </div>
    </div>
  );
}
