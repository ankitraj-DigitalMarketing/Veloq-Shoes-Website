import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { FiPlus, FiEdit, FiTrash2, FiX } from 'react-icons/fi';
import api from '../../utils/api';
import { formatDate } from '../../utils/helpers';
import { PageLoader } from '../../components/common/LoadingSpinner';
import toast from 'react-hot-toast';
import clsx from 'clsx';

export default function AdminCoupons() {
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['adminCoupons'],
    queryFn: () => api.get('/admin/coupons'),
  });

  const { register, handleSubmit, reset } = useForm();

  const saveMutation = useMutation({
    mutationFn: (data) =>
      editingId ? api.put(`/admin/coupons/${editingId}`, data) : api.post('/admin/coupons', data),
    onSuccess: () => {
      queryClient.invalidateQueries(['adminCoupons']);
      toast.success(editingId ? 'Coupon updated' : 'Coupon created');
      setShowForm(false);
      setEditingId(null);
      reset();
    },
    onError: (err) => toast.error(err.message),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => api.delete(`/admin/coupons/${id}`),
    onSuccess: () => { queryClient.invalidateQueries(['adminCoupons']); toast.success('Coupon deleted'); },
  });

  const handleEdit = (coupon) => {
    setEditingId(coupon._id);
    reset({
      code: coupon.code,
      description: coupon.description,
      discountType: coupon.discountType,
      discountValue: coupon.discountValue,
      minOrderValue: coupon.minOrderValue,
      maxDiscountAmount: coupon.maxDiscountAmount,
      usageLimit: coupon.usageLimit,
      isActive: coupon.isActive,
      expiryDate: coupon.expiryDate?.slice(0, 10),
    });
    setShowForm(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Coupons</h1>
        <button onClick={() => { setShowForm(true); setEditingId(null); reset(); }}
          className="btn-primary flex items-center gap-2 text-sm px-4 py-2">
          <FiPlus /> Create Coupon
        </button>
      </div>

      {showForm && (
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-lg">{editingId ? 'Edit Coupon' : 'New Coupon'}</h2>
            <button onClick={() => { setShowForm(false); setEditingId(null); }}><FiX /></button>
          </div>
          <form onSubmit={handleSubmit(saveMutation.mutate)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium mb-1 block">Code *</label>
                <input {...register('code', { required: true })} className="input-field uppercase" placeholder="SAVE20" />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Discount Type *</label>
                <select {...register('discountType', { required: true })} className="input-field">
                  <option value="percentage">Percentage (%)</option>
                  <option value="flat">Flat Amount (₹)</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Discount Value *</label>
                <input type="number" {...register('discountValue', { required: true, min: 0 })} className="input-field" placeholder="20" />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Min Order Value (₹)</label>
                <input type="number" {...register('minOrderValue')} className="input-field" placeholder="499" />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Max Discount (₹)</label>
                <input type="number" {...register('maxDiscountAmount')} className="input-field" placeholder="500" />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Usage Limit</label>
                <input type="number" {...register('usageLimit')} className="input-field" placeholder="100 (blank = unlimited)" />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Expiry Date *</label>
                <input type="date" {...register('expiryDate', { required: true })} className="input-field" />
              </div>
              <div className="md:col-span-2">
                <label className="text-sm font-medium mb-1 block">Description</label>
                <input {...register('description')} className="input-field" placeholder="20% off on orders above ₹499" />
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" {...register('isActive')} id="couponActive" defaultChecked className="accent-brand-black" />
                <label htmlFor="couponActive" className="text-sm font-medium">Active</label>
              </div>
            </div>
            <div className="flex gap-3">
              <button type="submit" disabled={saveMutation.isPending} className="btn-primary text-sm">
                {saveMutation.isPending ? 'Saving...' : editingId ? 'Update' : 'Create'}
              </button>
              <button type="button" onClick={() => setShowForm(false)} className="btn-outline text-sm">Cancel</button>
            </div>
          </form>
        </div>
      )}

      {isLoading ? <PageLoader /> : (
        <div className="card overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="p-4 text-left font-semibold text-gray-500">Code</th>
                <th className="p-4 text-left font-semibold text-gray-500 hidden md:table-cell">Discount</th>
                <th className="p-4 text-left font-semibold text-gray-500 hidden lg:table-cell">Usage</th>
                <th className="p-4 text-left font-semibold text-gray-500 hidden lg:table-cell">Expires</th>
                <th className="p-4 text-center font-semibold text-gray-500">Status</th>
                <th className="p-4 text-right font-semibold text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody>
              {data?.coupons?.map((coupon) => (
                <tr key={coupon._id} className="border-b last:border-0 hover:bg-gray-50">
                  <td className="p-4">
                    <span className="font-mono font-bold text-brand-black bg-gray-100 px-3 py-1 rounded-lg">{coupon.code}</span>
                    {coupon.description && <p className="text-xs text-gray-400 mt-1">{coupon.description}</p>}
                  </td>
                  <td className="p-4 hidden md:table-cell">
                    {coupon.discountType === 'percentage' ? `${coupon.discountValue}%` : `₹${coupon.discountValue}`}
                    {coupon.minOrderValue > 0 && <p className="text-xs text-gray-400">Min: ₹{coupon.minOrderValue}</p>}
                  </td>
                  <td className="p-4 hidden lg:table-cell text-gray-500">
                    {coupon.usedCount}/{coupon.usageLimit || '∞'}
                  </td>
                  <td className="p-4 hidden lg:table-cell text-gray-500">{formatDate(coupon.expiryDate)}</td>
                  <td className="p-4 text-center">
                    <span className={clsx('badge text-xs', coupon.isActive && new Date(coupon.expiryDate) > new Date() ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600')}>
                      {coupon.isActive && new Date(coupon.expiryDate) > new Date() ? 'Active' : 'Expired/Inactive'}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex justify-end gap-2">
                      <button onClick={() => handleEdit(coupon)} className="p-2 hover:bg-blue-50 text-blue-500 rounded-lg"><FiEdit className="text-sm" /></button>
                      <button onClick={() => { if (confirm('Delete?')) deleteMutation.mutate(coupon._id); }} className="p-2 hover:bg-red-50 text-red-400 rounded-lg"><FiTrash2 className="text-sm" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {data?.coupons?.length === 0 && (
            <div className="text-center py-16 text-gray-400">No coupons created yet</div>
          )}
        </div>
      )}
    </div>
  );
}
