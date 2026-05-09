import { useState, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { FiPlus, FiEdit, FiTrash2, FiX, FiUpload, FiImage } from 'react-icons/fi';
import api from '../../utils/api';
import { PageLoader } from '../../components/common/LoadingSpinner';
import toast from 'react-hot-toast';

function ImageUploadField({ value, onChange, label = 'Image' }) {
  const fileRef = useRef(null);
  const [uploading, setUploading] = useState(false);

  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('image', file);
    setUploading(true);
    try {
      const res = await api.post('/upload/single', formData);
      onChange(res.url || res);
      toast.success('Image uploaded');
    } catch {
      toast.error('Upload failed');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  return (
    <div>
      <label className="text-sm font-medium mb-1 block">{label}</label>
      <div className="flex gap-2">
        <div className="relative flex-1">
          <FiImage className="absolute left-3 top-1/2 -translate-y-1/2 text-mid text-sm pointer-events-none" />
          <input
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            className="input-field text-sm pl-9"
            placeholder="Paste URL or upload image"
          />
        </div>
        <button type="button" onClick={() => fileRef.current?.click()} disabled={uploading}
          className="flex items-center gap-1.5 px-3 py-2.5 border border-gray-200 rounded-lg text-xs font-semibold text-ink hover:border-ink hover:bg-gray-50 transition-all disabled:opacity-60 flex-shrink-0">
          <FiUpload className="text-sm" />
          {uploading ? 'Uploading...' : 'Upload'}
        </button>
      </div>
      <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
      {value && (
        <div className="mt-2 rounded-lg overflow-hidden border border-gray-100 h-16 bg-gray-50">
          <img src={value} alt="preview" className="w-full h-full object-cover"
            onError={(e) => { e.target.style.display = 'none'; }} />
        </div>
      )}
    </div>
  );
}

export default function AdminCollections() {
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [imageUrl, setImageUrl] = useState('');
  const [bannerImageUrl, setBannerImageUrl] = useState('');
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['adminCollections'],
    queryFn: () => api.get('/collections/admin/all'),
  });

  const { register, handleSubmit, reset } = useForm();

  const saveMutation = useMutation({
    mutationFn: (formData) => {
      const payload = { ...formData, image: imageUrl, bannerImage: bannerImageUrl };
      return editingId
        ? api.put(`/collections/${editingId}`, payload)
        : api.post('/collections', payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['adminCollections']);
      toast.success(editingId ? 'Collection updated' : 'Collection created');
      setShowForm(false);
      setEditingId(null);
      setImageUrl('');
      setBannerImageUrl('');
      reset();
    },
    onError: (err) => toast.error(err.message),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => api.delete(`/collections/${id}`),
    onSuccess: () => { queryClient.invalidateQueries(['adminCollections']); toast.success('Collection deleted'); },
  });

  const handleEdit = (collection) => {
    setEditingId(collection._id);
    setImageUrl(collection.image || '');
    setBannerImageUrl(collection.bannerImage || '');
    reset({
      name: collection.name,
      description: collection.description,
      displayOrder: collection.displayOrder,
      isActive: collection.isActive,
    });
    setShowForm(true);
  };

  const handleNew = () => {
    setEditingId(null);
    setImageUrl('');
    setBannerImageUrl('');
    reset();
    setShowForm(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Collections</h1>
        <button onClick={handleNew} className="btn-primary flex items-center gap-2 text-sm px-4 py-2">
          <FiPlus /> New Collection
        </button>
      </div>

      {showForm && (
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-lg">{editingId ? 'Edit Collection' : 'New Collection'}</h2>
            <button onClick={() => setShowForm(false)}><FiX /></button>
          </div>
          <form onSubmit={handleSubmit(saveMutation.mutate)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-1 block">Name *</label>
                <input {...register('name', { required: true })} className="input-field" placeholder="Men's Collection" />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Display Order</label>
                <input type="number" {...register('displayOrder')} className="input-field" placeholder="1" />
              </div>
              <div className="md:col-span-2">
                <label className="text-sm font-medium mb-1 block">Description</label>
                <textarea {...register('description')} rows={2} className="input-field resize-none" placeholder="Collection description..." />
              </div>

              {/* Image upload */}
              <div className="md:col-span-2">
                <ImageUploadField label="Collection Image (thumbnail)" value={imageUrl} onChange={setImageUrl} />
              </div>
              <div className="md:col-span-2">
                <ImageUploadField label="Banner Image (collection page header)" value={bannerImageUrl} onChange={setBannerImageUrl} />
              </div>

              <div className="flex items-center gap-2">
                <input type="checkbox" {...register('isActive')} id="isActive" className="w-4 h-4 accent-ink" />
                <label htmlFor="isActive" className="text-sm font-medium">Active</label>
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
                <th className="p-4 text-left font-semibold text-gray-500">Name</th>
                <th className="p-4 text-left font-semibold text-gray-500 hidden md:table-cell">Slug</th>
                <th className="p-4 text-center font-semibold text-gray-500 hidden sm:table-cell">Image</th>
                <th className="p-4 text-center font-semibold text-gray-500">Products</th>
                <th className="p-4 text-center font-semibold text-gray-500">Status</th>
                <th className="p-4 text-right font-semibold text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody>
              {data?.collections?.map((col) => (
                <tr key={col._id} className="border-b last:border-0 hover:bg-gray-50">
                  <td className="p-4 font-semibold">{col.name}</td>
                  <td className="p-4 text-gray-400 hidden md:table-cell font-mono text-xs">{col.slug}</td>
                  <td className="p-4 text-center hidden sm:table-cell">
                    {col.image ? (
                      <img src={col.image} alt={col.name} className="w-10 h-10 object-cover rounded-lg mx-auto border border-gray-100" />
                    ) : (
                      <span className="text-gray-300 text-xs">—</span>
                    )}
                  </td>
                  <td className="p-4 text-center text-gray-500">{col.products?.length || 0}</td>
                  <td className="p-4 text-center">
                    <span className={`badge text-xs ${col.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                      {col.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex justify-end gap-2">
                      <button onClick={() => handleEdit(col)} className="p-2 hover:bg-blue-50 text-blue-500 rounded-lg">
                        <FiEdit className="text-sm" />
                      </button>
                      <button onClick={() => { if (confirm('Delete this collection?')) deleteMutation.mutate(col._id); }}
                        className="p-2 hover:bg-red-50 text-red-400 rounded-lg">
                        <FiTrash2 className="text-sm" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
