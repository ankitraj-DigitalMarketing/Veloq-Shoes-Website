import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { FiFilter, FiGrid, FiList, FiX, FiChevronDown, FiChevronUp } from 'react-icons/fi';
import { HiAdjustments } from 'react-icons/hi';
import api from '../utils/api';
import ProductCard from '../components/common/ProductCard';
import Pagination from '../components/common/Pagination';
import clsx from 'clsx';

const SORT_OPTIONS = [
  { value: '-createdAt', label: 'Newest' },
  { value: 'price-asc',  label: 'Price: Low → High' },
  { value: 'price-desc', label: 'Price: High → Low' },
  { value: 'rating',     label: 'Top Rated' },
  { value: 'bestseller', label: 'Best Seller' },
];

const SIZES = ['UK 6', 'UK 7', 'UK 8', 'UK 9', 'UK 10', 'UK 11', 'UK 12'];
const COLORS = ['Black', 'White', 'Red', 'Blue', 'Green', 'Grey', 'Brown'];

/* ── Skeleton card ── */
function SkeletonCard() {
  return (
    <div className="bg-white border border-gray-100 rounded-xl overflow-hidden">
      <div className="aspect-[4/5] skeleton" />
      <div className="p-2.5 space-y-2">
        <div className="skeleton h-2.5 w-16 rounded" />
        <div className="skeleton h-3 w-4/5 rounded" />
        <div className="skeleton h-3 w-1/2 rounded" />
        <div className="skeleton h-3 w-1/3 rounded" />
      </div>
      <div className="skeleton h-9 rounded-b-xl" />
    </div>
  );
}

/* ── Sidebar section with collapse ── */
function SidebarSection({ title, children }) {
  const [open, setOpen] = useState(true);
  return (
    <div className="border-b border-gray-100 pb-4 mb-4 last:border-0 last:mb-0 last:pb-0">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center justify-between w-full mb-2"
      >
        <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-ink">{title}</span>
        {open ? <FiChevronUp className="text-xs text-mid" /> : <FiChevronDown className="text-xs text-mid" />}
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function ProductListPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [bottomSheetOpen, setBottomSheetOpen] = useState(false);
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
  const activeFilterCount = [selectedSizes.length, selectedColors.length, minPrice, newArrival, bestSeller].filter(Boolean).length;

  /* ── Shared filter panel content ── */
  const FilterPanel = ({ onApply }) => (
    <div>
      <SidebarSection title="Size">
        <div className="flex flex-wrap gap-1.5">
          {SIZES.map((size) => (
            <button
              key={size}
              onClick={() => toggleArrayParam('size', size)}
              className={clsx(
                'w-11 py-1.5 text-xs font-semibold rounded-lg border transition-all',
                selectedSizes.includes(size)
                  ? 'bg-ink text-white border-ink'
                  : 'border-gray-200 text-mid hover:border-ink hover:text-ink'
              )}
            >
              {size.replace('UK ', '')}
            </button>
          ))}
        </div>
      </SidebarSection>

      <SidebarSection title="Color">
        <div className="flex flex-wrap gap-1.5">
          {COLORS.map((color) => (
            <button
              key={color}
              onClick={() => toggleArrayParam('color', color)}
              className={clsx(
                'px-3 py-1.5 text-xs font-medium rounded-lg border transition-all',
                selectedColors.includes(color)
                  ? 'bg-ink text-white border-ink'
                  : 'border-gray-200 text-mid hover:border-ink hover:text-ink'
              )}
            >
              {color}
            </button>
          ))}
        </div>
      </SidebarSection>

      <SidebarSection title="Price Range">
        <div className="flex gap-2">
          <input
            type="number"
            placeholder="Min ₹"
            className="input-field text-sm py-2"
            value={minPrice}
            onChange={(e) => updateParam('minPrice', e.target.value)}
          />
          <input
            type="number"
            placeholder="Max ₹"
            className="input-field text-sm py-2"
            value={maxPrice}
            onChange={(e) => updateParam('maxPrice', e.target.value)}
          />
        </div>
      </SidebarSection>

      <SidebarSection title="Category">
        <div className="space-y-1">
          {[{ label: 'New Arrivals', key: 'newArrival' }, { label: 'Best Sellers', key: 'bestSeller' }].map(({ label, key }) => (
            <label key={key} className="flex items-center gap-2 cursor-pointer group">
              <input
                type="checkbox"
                checked={!!searchParams.get(key)}
                onChange={(e) => updateParam(key, e.target.checked ? '1' : '')}
                className="w-4 h-4 rounded border-gray-300 accent-ink cursor-pointer"
              />
              <span className="text-xs text-mid group-hover:text-ink transition-colors">{label}</span>
            </label>
          ))}
        </div>
      </SidebarSection>

      {activeFilterCount > 0 && (
        <button
          onClick={() => { clearFilters(); onApply?.(); }}
          className="w-full mt-2 py-2.5 text-xs font-semibold border border-gray-200 rounded-lg text-mid hover:border-ink hover:text-ink transition-all"
        >
          Clear All Filters ({activeFilterCount})
        </button>
      )}
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">

      {/* ── Page title ── */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-4">
        <h1 className="text-xl font-bold text-ink">
          {search ? `Results for "${search}"` : 'All Products'}
        </h1>
        {data && (
          <p className="text-xs text-mid mt-0.5">
            {data.pagination?.total ?? 0} products found
          </p>
        )}
      </motion.div>

      {/* ── Mobile: horizontal filter pills ── */}
      <div className="md:hidden mb-3 overflow-x-auto scrollbar-hide">
        <div className="flex items-center gap-2 pb-1" style={{ minWidth: 'max-content' }}>
          {/* All Filters button */}
          <button
            onClick={() => setBottomSheetOpen(true)}
            className={clsx(
              'flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border flex-shrink-0 transition-all',
              activeFilterCount > 0
                ? 'bg-ink text-white border-ink'
                : 'border-gray-300 text-mid hover:border-gray-400 hover:text-ink'
            )}
          >
            <HiAdjustments className="text-sm" />
            Filters {activeFilterCount > 0 && `(${activeFilterCount})`}
          </button>

          {/* Sort pill */}
          <select
            value={sort}
            onChange={(e) => updateParam('sort', e.target.value)}
            className="flex-shrink-0 border border-gray-300 text-ink text-xs rounded-full px-3 py-1.5 outline-none bg-white cursor-pointer"
          >
            {SORT_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>

          {/* Active size pills */}
          {selectedSizes.map((size) => (
            <button
              key={size}
              onClick={() => toggleArrayParam('size', size)}
              className="flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-semibold bg-ink text-white border border-ink flex-shrink-0"
            >
              {size} <FiX className="text-[10px]" />
            </button>
          ))}

          {/* Active color pills */}
          {selectedColors.map((color) => (
            <button
              key={color}
              onClick={() => toggleArrayParam('color', color)}
              className="flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-semibold bg-ink text-white border border-ink flex-shrink-0"
            >
              {color} <FiX className="text-[10px]" />
            </button>
          ))}
        </div>
      </div>

      {/* ── Desktop: sort + view toggle bar ── */}
      <div className="hidden md:flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <select
            value={sort}
            onChange={(e) => updateParam('sort', e.target.value)}
            className="border border-gray-200 text-ink text-xs rounded-lg px-3 py-2 outline-none hover:border-gray-400 transition-all bg-white cursor-pointer"
          >
            {SORT_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </div>

        <div className="flex border border-gray-200 rounded-lg overflow-hidden">
          <button
            onClick={() => setViewMode('grid')}
            className={clsx('p-2 transition-colors', viewMode === 'grid' ? 'bg-ink text-white' : 'text-mid hover:text-ink')}
          >
            <FiGrid className="text-sm" />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={clsx('p-2 transition-colors', viewMode === 'list' ? 'bg-ink text-white' : 'text-mid hover:text-ink')}
          >
            <FiList className="text-sm" />
          </button>
        </div>
      </div>

      <div className="flex gap-6">
        {/* ── Desktop sidebar ── */}
        <aside className="hidden md:block w-52 flex-shrink-0">
          <div className="sticky top-32 bg-white border border-gray-200 rounded-xl p-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-1.5">
                <FiFilter className="text-mid text-xs" />
                <p className="font-bold text-sm text-ink">Filters</p>
              </div>
              {activeFilterCount > 0 && (
                <span className="text-[10px] bg-ink text-white rounded-full px-2 py-0.5 font-bold">
                  {activeFilterCount}
                </span>
              )}
            </div>
            <FilterPanel />
          </div>
        </aside>

        {/* ── Product grid ── */}
        <div className="flex-1 min-w-0">
          {isLoading ? (
            <div className={clsx('grid gap-3', viewMode === 'grid' ? 'grid-cols-2 md:grid-cols-3' : 'grid-cols-1')}>
              {Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)}
            </div>
          ) : data?.products?.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-5xl mb-4 opacity-30">👟</p>
              <h3 className="text-xl font-bold text-ink mb-2">No products found</h3>
              <p className="text-mid text-sm mb-6">Try adjusting your filters or search query.</p>
              <button onClick={clearFilters} className="btn-primary px-6 py-2.5 text-sm inline-flex">
                Clear Filters
              </button>
            </div>
          ) : (
            <>
              <div className={clsx('grid gap-3', viewMode === 'grid' ? 'grid-cols-2 md:grid-cols-3' : 'grid-cols-1')}>
                {data?.products?.map((p, i) => (
                  <ProductCard key={p._id} product={p} index={i} />
                ))}
              </div>
              <Pagination
                currentPage={page}
                totalPages={data?.pagination?.pages}
                onPageChange={(p) => updateParam('page', p)}
              />
            </>
          )}
        </div>
      </div>

      {/* ── Mobile: bottom sheet filter ── */}
      <AnimatePresence>
        {bottomSheetOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 md:hidden"
          >
            <div
              className="absolute inset-0 bg-black/50"
              onClick={() => setBottomSheetOpen(false)}
            />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 280 }}
              className="absolute bottom-0 left-0 right-0 bg-white rounded-t-2xl max-h-[85vh] flex flex-col"
            >
              {/* Sheet header */}
              <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 flex-shrink-0">
                <h2 className="font-bold text-base text-ink">Filters</h2>
                <button
                  onClick={() => setBottomSheetOpen(false)}
                  className="w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center"
                >
                  <FiX className="text-ink" />
                </button>
              </div>

              {/* Scrollable content */}
              <div className="flex-1 overflow-y-auto p-5">
                <FilterPanel onApply={() => setBottomSheetOpen(false)} />
              </div>

              {/* Apply button */}
              <div className="p-4 border-t border-gray-100 flex-shrink-0">
                <button
                  onClick={() => setBottomSheetOpen(false)}
                  className="w-full btn-primary py-3.5 text-sm"
                >
                  Show {data?.pagination?.total ?? ''} Products
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
