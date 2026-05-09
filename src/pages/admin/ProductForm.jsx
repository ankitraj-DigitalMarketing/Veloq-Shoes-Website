import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm, useFieldArray } from 'react-hook-form';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useDropzone } from 'react-dropzone';
import { FiUpload, FiX, FiPlus, FiTrash2 } from 'react-icons/fi';
import api from '../../utils/api';
import { PageLoader } from '../../components/common/LoadingSpinner';
import toast from 'react-hot-toast';

const SIZES = ['UK 6', 'UK 7', 'UK 8', 'UK 9', 'UK 10', 'UK 11', 'UK 12'];

export default function AdminProductForm() {
  const { id } = useParams();
  const isEditing = !!id;
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [images, setImages] = useState([]);
  const [uploading, setUploading] = useState(false);

  const { register, handleSubmit, control, reset, formState: { errors } } = useForm({
    defaultValues: {
      variants: [{ size: 'UK 8', color: 'Black', stock: 10 }],
    },
  });

  const { fields: variantFields, append: appendVariant, remove: removeVariant } = useFieldArray({
    control, name: 'variants',
  });

  const { data: productData, isLoading: loadingProduct } = useQuery({
    queryKey: ['editProduct', id],
    queryFn: () => api.get(`/products/${id}`),
    enabled: isEditing,
  });

  useEffect(() => {
    if (productData?.product) {
      const p = productData.product;
      reset({
        name: p.name,
        description: p.description,
        shortDescription: p.shortDescription,
        category: p.category,
        brand: p.brand,
        price: p.price,
        comparePrice: p.comparePrice,
        costPrice: p.costPrice,
        sku: p.sku,
        weight: p.weight,
        material: p.material,
        careInstructions: p.careInstructions,
        seoTitle: p.seoTitle,
        seoDescription: p.seoDescription,
        tags: p.tags?.join(', '),
        status: p.status,
        isFeatured: p.isFeatured,
        isBestSeller: p.isBestSeller,
        isNewArrival: p.isNewArrival,
        variants: p.variants,
      });
      setImages(p.images || []);
    }
  }, [productData]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: { 'image/*': ['.jpeg', '.jpg', '.png', '.webp'] },
    maxFiles: 10,
    onDrop: async (acceptedFiles) => {
      setUploading(true);
      const formData = new FormData();
      acceptedFiles.forEach((f) => formData.append('images', f));
      try {
        const data = await api.post('/upload/products', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        setImages((prev) => [...prev, ...data.images]);
        toast.success(`${data.images.length} image(s) uploaded`);
      } catch (err) {
        toast.error(err.message || 'Upload failed');
      } finally {
        setUploading(false);
      }
    },
  });

  const saveMutation = useMutation({
    mutationFn: (data) =>
      isEditing ? api.put(`/products/${id}`, data) : api.post('/products', data),
    onSuccess: () => {
      queryClient.invalidateQueries(['adminProducts']);
      toast.success(isEditing ? 'Product updated!' : 'Product created!');
      navigate('/admin/products');
    },
    onError: (err) => toast.error(err.message),
  });

  const onSubmit = (data) => {
    const productData = {
      ...data,
      images,
      tags: data.tags ? data.tags.split(',').map((t) => t.trim()) : [],
      price: Number(data.price),
      comparePrice: data.comparePrice ? Number(data.comparePrice) : undefined,
      costPrice: data.costPrice ? Number(data.costPrice) : undefined,
      variants: data.variants?.map((v) => ({ ...v, stock: Number(v.stock) })),
    };
    saveMutation.mutate(productData);
  };

  if (loadingProduct) return <PageLoader />;

  return (
    <div className="max-w-4xl space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{isEditing ? 'Edit Product' : 'Add New Product'}</h1>
        <button onClick={() => navigate('/admin/products')} className="btn-outline text-sm px-4 py-2">Cancel</button>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Basic Info */}
        <div className="card p-6 space-y-4">
          <h2 className="font-bold text-lg">Basic Information</h2>
          <div>
            <label className="text-sm font-medium mb-1 block">Product Name *</label>
            <input {...register('name', { required: 'Required' })} className="input-field" placeholder="e.g. VELOQ Runner Pro" />
            {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium mb-1 block">Category *</label>
              <select {...register('category', { required: true })} className="input-field">
                <option value="">Select...</option>
                {['men', 'women', 'kids', 'sports', 'casual', 'formal'].map((c) => (
                  <option key={c} value={c} className="capitalize">{c}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Brand</label>
              <input {...register('brand')} className="input-field" placeholder="VELOQ" />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">SKU</label>
              <input {...register('sku')} className="input-field" placeholder="VLQ-001" />
            </div>
          </div>
          <div>
            <label className="text-sm font-medium mb-1 block">Description *</label>
            <textarea {...register('description', { required: 'Required' })} rows={5}
              className="input-field resize-none" placeholder="Full product description..." />
            {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description.message}</p>}
          </div>
          <div>
            <label className="text-sm font-medium mb-1 block">Short Description</label>
            <textarea {...register('shortDescription')} rows={2}
              className="input-field resize-none" placeholder="Brief summary for listing pages..." />
          </div>
        </div>

        {/* Images */}
        <div className="card p-6">
          <h2 className="font-bold text-lg mb-4">Product Images</h2>
          <div {...getRootProps()} className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-colors ${isDragActive ? 'border-brand-black bg-gray-50' : 'border-gray-300 hover:border-gray-400'}`}>
            <input {...getInputProps()} />
            <FiUpload className="text-4xl text-gray-300 mx-auto mb-3" />
            <p className="font-medium text-gray-600">{isDragActive ? 'Drop files here' : 'Drag & drop images here'}</p>
            <p className="text-sm text-gray-400 mt-1">or click to browse. Max 10 images, 5MB each. JPEG, PNG, WebP</p>
            {uploading && <p className="text-sm text-blue-500 mt-2 animate-pulse">Uploading...</p>}
          </div>
          {images.length > 0 && (
            <div className="grid grid-cols-5 gap-3 mt-4">
              {images.map((img, i) => (
                <div key={i} className="relative group">
                  <img src={img.url} alt="" className="w-full aspect-square object-cover rounded-xl bg-gray-100" />
                  <button type="button"
                    onClick={() => setImages(images.filter((_, idx) => idx !== i))}
                    className="absolute top-1 right-1 w-6 h-6 bg-red-500 text-white rounded-full text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <FiX />
                  </button>
                  {i === 0 && <span className="absolute bottom-1 left-1 text-xs bg-brand-black text-white px-1.5 py-0.5 rounded">Main</span>}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Pricing */}
        <div className="card p-6 space-y-4">
          <h2 className="font-bold text-lg">Pricing</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium mb-1 block">Selling Price (₹) *</label>
              <input type="number" {...register('price', { required: 'Required', min: 0 })} className="input-field" placeholder="2999" />
              {errors.price && <p className="text-red-500 text-xs mt-1">{errors.price.message}</p>}
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Compare at (MRP) (₹)</label>
              <input type="number" {...register('comparePrice')} className="input-field" placeholder="3999" />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Cost Price (₹)</label>
              <input type="number" {...register('costPrice')} className="input-field" placeholder="1500" />
            </div>
          </div>
        </div>

        {/* Variants */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-lg">Variants (Size + Color + Stock)</h2>
            <button type="button" onClick={() => appendVariant({ size: 'UK 8', color: 'Black', stock: 10 })}
              className="btn-outline text-sm px-3 py-1.5 flex items-center gap-1">
              <FiPlus className="text-xs" /> Add Variant
            </button>
          </div>
          <div className="space-y-3">
            {variantFields.map((field, idx) => (
              <div key={field.id} className="grid grid-cols-3 md:grid-cols-5 gap-3 items-end bg-gray-50 p-3 rounded-xl">
                <div>
                  <label className="text-xs font-medium mb-1 block">Size</label>
                  <select {...register(`variants.${idx}.size`)} className="input-field py-2 text-sm">
                    {SIZES.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-medium mb-1 block">Color</label>
                  <input {...register(`variants.${idx}.color`)} className="input-field py-2 text-sm" placeholder="Black" />
                </div>
                <div>
                  <label className="text-xs font-medium mb-1 block">Color Hex</label>
                  <input {...register(`variants.${idx}.colorHex`)} type="color" className="input-field py-1 text-sm h-10" />
                </div>
                <div>
                  <label className="text-xs font-medium mb-1 block">Stock</label>
                  <input type="number" {...register(`variants.${idx}.stock`)} className="input-field py-2 text-sm" min={0} />
                </div>
                <div className="flex items-end">
                  <button type="button" onClick={() => removeVariant(idx)}
                    className="w-full h-10 flex items-center justify-center text-red-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors">
                    <FiTrash2 />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Additional Info */}
        <div className="card p-6 space-y-4">
          <h2 className="font-bold text-lg">Additional Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-1 block">Material</label>
              <input {...register('material')} className="input-field" placeholder="Leather, Mesh, etc." />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Weight (grams)</label>
              <input type="number" {...register('weight')} className="input-field" placeholder="400" />
            </div>
          </div>
          <div>
            <label className="text-sm font-medium mb-1 block">Care Instructions</label>
            <textarea {...register('careInstructions')} rows={2} className="input-field resize-none" placeholder="Wipe with clean cloth..." />
          </div>
          <div>
            <label className="text-sm font-medium mb-1 block">Tags (comma separated)</label>
            <input {...register('tags')} className="input-field" placeholder="sneakers, running, casual" />
          </div>
        </div>

        {/* SEO */}
        <div className="card p-6 space-y-4">
          <h2 className="font-bold text-lg">SEO</h2>
          <div>
            <label className="text-sm font-medium mb-1 block">Meta Title</label>
            <input {...register('seoTitle')} className="input-field" placeholder="VELOQ Runner Pro – Buy Online India" />
          </div>
          <div>
            <label className="text-sm font-medium mb-1 block">Meta Description</label>
            <textarea {...register('seoDescription')} rows={2} className="input-field resize-none" placeholder="Buy premium sneakers online..." />
          </div>
        </div>

        {/* Status & Flags */}
        <div className="card p-6">
          <h2 className="font-bold text-lg mb-4">Status & Labels</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label className="text-sm font-medium mb-1 block">Status</label>
              <select {...register('status')} className="input-field">
                <option value="active">Active</option>
                <option value="draft">Draft</option>
                <option value="archived">Archived</option>
              </select>
            </div>
            {[
              { field: 'isFeatured', label: 'Featured' },
              { field: 'isBestSeller', label: 'Best Seller' },
              { field: 'isNewArrival', label: 'New Arrival' },
            ].map(({ field, label }) => (
              <div key={field} className="flex items-center gap-2 bg-gray-50 rounded-xl p-4">
                <input type="checkbox" {...register(field)} className="accent-brand-black w-4 h-4" id={field} />
                <label htmlFor={field} className="text-sm font-medium cursor-pointer">{label}</label>
              </div>
            ))}
          </div>
        </div>

        <div className="flex gap-4">
          <button type="submit" disabled={saveMutation.isPending} className="btn-primary px-8 py-3 text-base">
            {saveMutation.isPending ? 'Saving...' : isEditing ? 'Update Product' : 'Create Product'}
          </button>
          <button type="button" onClick={() => navigate('/admin/products')} className="btn-outline px-8 py-3">
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
