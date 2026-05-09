import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { FiPlus, FiEdit, FiTrash2, FiSearch, FiFilter } from 'react-icons/fi';
import api from '../../utils/api';
import { formatPrice, formatDate } from '../../utils/helpers';
import { PageLoader } from '../../components/common/LoadingSpinner';
import Pagination from '../../components/common/Pagination';
import toast from 'react-hot-toast';
import clsx from 'clsx';

export default function AdminProducts() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [selected, setSelected] = useState([]);
  const queryClient = useQueryClient();

  const query = new URLSearchParams({ page, limit: 15, ...(search && { search }), ...(status && { status }) }).toString();

  const { data, isLoading } = useQuery({
    queryKey: ['adminProducts', query],
    queryFn: () => api.get(`/products?${query}&admin=true`),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => api.delete(`/products/${id}`),
    onSuccess: () => { queryClient.invalidateQueries(['adminProducts']); toast.success('Product deleted'); },
    onError: (err) => toast.error(err.message),
  });

  const bulkMutation = useMutation({
    mutationFn: ({ action, productIds }) => api.put('/products/bulk-action', { action, productIds }),
    onSuccess: () => { queryClient.invalidateQueries(['adminProducts']); setSelected([]); toast.success('Bulk action done'); },
  });

  const handleBulk = (action) => {
    if (!selected.length) return toast.error('No products selected');
    bulkMutation.mutate({ action, productIds: selected });
  };

  const toggleSelect = (id) => {
    setSelected((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);
  };

  const toggleAll = () => {
    setSelected(selected.length === data?.products?.length ? [] : data?.products?.map((p) => p._id) || []);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Products</h1>
        <Link to="/admin/products/new" className="btn-primary flex items-center gap-2 text-sm px-4 py-2">
          <FiPlus /> Add Product
        </Link>
      </div>

      {/* Filters */}
      <div className="card p-4 flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-48">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search products..."
            className="input-field pl-9 py-2 text-sm"
          />
        </div>
        <select value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }} className="input-field py-2 text-sm w-auto">
          <option value="">All Status</option>
          <option value="active">Active</option>
          <option value="draft">Draft</option>
          <option value="archived">Archived</option>
        </select>

        {selected.length > 0 && (
          <div className="flex items-center gap-2 ml-auto">
            <span className="text-sm text-gray-500">{selected.length} selected</span>
            <button onClick={() => handleBulk('active')} className="px-3 py-1.5 text-xs font-medium bg-green-100 text-green-700 rounded-lg hover:bg-green-200">
              Set Active
            </button>
            <button onClick={() => handleBulk('draft')} className="px-3 py-1.5 text-xs font-medium bg-yellow-100 text-yellow-700 rounded-lg hover:bg-yellow-200">
              Set Draft
            </button>
            <button onClick={() => handleBulk('delete')} className="px-3 py-1.5 text-xs font-medium bg-red-100 text-red-700 rounded-lg hover:bg-red-200">
              Delete
            </button>
          </div>
        )}
      </div>

      {isLoading ? <PageLoader /> : (
        <div className="card overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="p-4 w-10">
                  <input type="checkbox" checked={selected.length === data?.products?.length && data?.products?.length > 0}
                    onChange={toggleAll} className="accent-brand-black" />
                </th>
                <th className="p-4 text-left font-semibold text-gray-500">Product</th>
                <th className="p-4 text-left font-semibold text-gray-500 hidden md:table-cell">Category</th>
                <th className="p-4 text-right font-semibold text-gray-500">Price</th>
                <th className="p-4 text-center font-semibold text-gray-500 hidden lg:table-cell">Status</th>
                <th className="p-4 text-center font-semibold text-gray-500 hidden lg:table-cell">Stock</th>
                <th className="p-4 text-right font-semibold text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody>
              {data?.products?.map((product) => (
                <tr key={product._id} className="border-b last:border-0 hover:bg-gray-50 transition-colors">
                  <td className="p-4">
                    <input type="checkbox" checked={selected.includes(product._id)}
                      onChange={() => toggleSelect(product._id)} className="accent-brand-black" />
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={product.images?.[0]?.url || 'https://placehold.co/40x40/f5f5f5/999?text=V'}
                        alt={product.name}
                        className="w-12 h-12 object-cover rounded-xl bg-gray-100 flex-shrink-0"
                      />
                      <div>
                        <p className="font-semibold line-clamp-1">{product.name}</p>
                        <p className="text-xs text-gray-400">{product.sku || product._id.slice(-8)}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4 hidden md:table-cell capitalize text-gray-500">{product.category}</td>
                  <td className="p-4 text-right font-semibold">
                    {formatPrice(product.price)}
                    {product.comparePrice > product.price && (
                      <p className="text-xs text-gray-400 line-through">{formatPrice(product.comparePrice)}</p>
                    )}
                  </td>
                  <td className="p-4 text-center hidden lg:table-cell">
                    <span className={clsx('badge text-xs px-2 py-1',
                      product.status === 'active' ? 'bg-green-100 text-green-700' :
                      product.status === 'draft' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-gray-100 text-gray-500')}>
                      {product.status}
                    </span>
                  </td>
                  <td className="p-4 text-center hidden lg:table-cell text-gray-500">
                    {product.variants?.reduce((s, v) => s + v.stock, 0) || 0}
                  </td>
                  <td className="p-4">
                    <div className="flex items-center justify-end gap-2">
                      <Link to={`/admin/products/${product._id}/edit`}
                        className="p-2 hover:bg-blue-50 text-blue-500 rounded-lg transition-colors">
                        <FiEdit className="text-sm" />
                      </Link>
                      <button
                        onClick={() => { if (confirm('Delete this product?')) deleteMutation.mutate(product._id); }}
                        className="p-2 hover:bg-red-50 text-red-400 rounded-lg transition-colors">
                        <FiTrash2 className="text-sm" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {data?.products?.length === 0 && (
            <div className="text-center py-16 text-gray-400">No products found</div>
          )}
        </div>
      )}
      <Pagination currentPage={page} totalPages={data?.pagination?.pages} onPageChange={setPage} />
    </div>
  );
}
