import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useForm, useFieldArray } from 'react-hook-form';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useDropzone } from 'react-dropzone';
import { FiUpload, FiX, FiPlus, FiTrash2, FiChevronLeft, FiSave, FiExternalLink } from 'react-icons/fi';
import api from '../../utils/api';
import { PageLoader } from '../../components/common/LoadingSpinner';
import { getImageUrl } from '../../utils/helpers';
import toast from 'react-hot-toast';
import clsx from 'clsx';

const SIZES = ['UK 6', 'UK 7', 'UK 8', 'UK 9', 'UK 10', 'UK 11', 'UK 12'];
const CATEGORIES = ['sneakers', 'casual', 'formal', 'sports', 'slippers', 'clogs', 'boots', 'loafers'];

function Card({ title, children, className = '' }) {
  return (
    <div className={clsx('bg-white border border-gray-200 rounded-xl', className)}>
      {title && <div className="px-5 py-4 border-b border-gray-100"><h3 className="font-semibold text-sm text-gray-800">{title}</h3></div>}
      <div className="p-5">{children}</div>
    </div>
  );
}

const labelCls = 'block text-sm font-medium text-gray-700 mb-1';
const errCls   = 'text-red-500 text-xs mt-1';

export default function AdminProductForm() {
  const { id } = useParams();
  const isEditing = !!id;
  const navigate  = useNavigate();
  const queryClient = useQueryClient();
  const [images, setImages]     = useState([]);
  const [uploading, setUploading] = useState(false);
  const [selectedCollections, setSelectedCollections] = useState([]);

  const { data: collectionsData } = useQuery({
    queryKey: ['allCollections'],
    queryFn: () => api.get('/collections/admin/all'),
  });

  const { register, handleSubmit, control, reset, formState: { errors } } = useForm({
    defaultValues: { status: 'active', variants: [{ size: 'UK 8', color: 'Black', colorHex: '#000000', stock: 10 }] },
  });

  const { fields: variantFields, append: appendVariant, remove: removeVariant } = useFieldArray({ control, name: 'variants' });

  const { data: productData, isLoading } = useQuery({
    queryKey: ['editProduct', id],
    queryFn: () => api.get(`/products/${id}`),
    enabled: isEditing,
  });

  useEffect(() => {
    if (productData?.product) {
      const p = productData.product;
      reset({
        name: p.name, description: p.description, shortDescription: p.shortDescription,
        category: p.category, brand: p.brand, price: p.price,
        comparePrice: p.comparePrice, costPrice: p.costPrice, sku: p.sku,
        weight: p.weight, material: p.material, careInstructions: p.careInstructions,
        seoTitle: p.seoTitle, seoDescription: p.seoDescription,
        tags: p.tags?.join(', '), status: p.status || 'active',
        isFeatured: p.isFeatured, isBestSeller: p.isBestSeller, isNewArrival: p.isNewArrival,
        variants: p.variants,
      });
      setImages(p.images || []);
      setSelectedCollections((p.collections || []).map(c => c._id || c));
    }
  }, [productData]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: { 'image/*': ['.jpeg', '.jpg', '.png', '.webp'] },
    maxFiles: 10,
    onDrop: async (files) => {
      setUploading(true);
      const fd = new FormData();
      files.forEach((f) => fd.append('images', f));
      try {
        const data = await api.post('/upload/products', fd);
        setImages((prev) => [...prev, ...data.images]);
        toast.success(`${data.images.length} image(s) uploaded`);
      } catch (err) { toast.error(err.message || 'Upload failed'); }
      finally { setUploading(false); }
    },
  });

  const saveMutation = useMutation({
    mutationFn: (d) => isEditing ? api.put(`/products/${id}`, d) : api.post('/products', d),
    onSuccess: () => {
      queryClient.invalidateQueries(['adminProducts']);
      toast.success(isEditing ? 'Product updated!' : 'Product created!');
      navigate('/admin/products');
    },
    onError: (err) => toast.error(err.message),
  });

  const onSubmit = (data) => {
    saveMutation.mutate({
      ...data, images,
      collections: selectedCollections,
      tags: data.tags ? data.tags.split(',').map((t) => t.trim()).filter(Boolean) : [],
      price: Number(data.price),
      comparePrice: data.comparePrice ? Number(data.comparePrice) : undefined,
      costPrice:    data.costPrice    ? Number(data.costPrice)    : undefined,
      variants: data.variants?.map((v) => ({ ...v, stock: Number(v.stock) })),
    });
  };

  if (isLoading) return <PageLoader />;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top bar */}
      <div className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <Link to="/admin/products" className="text-gray-500 hover:text-gray-800 transition-colors">
            <FiChevronLeft className="text-xl" />
          </Link>
          <h1 className="font-semibold text-gray-900 text-base">
            {isEditing ? 'Edit Product' : 'Add New Product'}
          </h1>
          {isEditing && (
            <Link to={`/products/${productData?.product?.slug}`} target="_blank"
              className="text-xs text-blue-600 flex items-center gap-1 hover:underline">
              View on site <FiExternalLink className="text-xs" />
            </Link>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button type="button" onClick={() => navigate('/admin/products')}
            className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
            Discard
          </button>
          <button form="product-form" type="submit" disabled={saveMutation.isPending}
            className="px-5 py-2 bg-gray-900 text-white text-sm font-semibold rounded-lg hover:bg-gray-700 transition-colors flex items-center gap-2 disabled:opacity-60">
            <FiSave className="text-sm" />
            {saveMutation.isPending ? 'Saving...' : isEditing ? 'Save Changes' : 'Save Product'}
          </button>
        </div>
      </div>

      <form id="product-form" onSubmit={handleSubmit(onSubmit)}>
        <div className="max-w-6xl mx-auto px-6 py-6 grid grid-cols-1 lg:grid-cols-3 gap-5">

          {/* ── LEFT COLUMN ── */}
          <div className="lg:col-span-2 space-y-5">

            {/* Title + Description */}
            <Card>
              <div className="space-y-4">
                <div>
                  <label className={labelCls}>Product Title *</label>
                  <input {...register('name', { required: 'Title is required' })}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none"
                    placeholder="e.g. VELOQ Runner Pro Black" />
                  {errors.name && <p className={errCls}>{errors.name.message}</p>}
                </div>
                <div>
                  <label className={labelCls}>Description *</label>
                  <textarea {...register('description', { required: 'Description is required' })}
                    rows={6} placeholder="Full product description — features, material, fit, etc."
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none resize-none" />
                  {errors.description && <p className={errCls}>{errors.description.message}</p>}
                </div>
                <div>
                  <label className={labelCls}>Short Description</label>
                  <textarea {...register('shortDescription')} rows={2}
                    placeholder="One-line summary shown on product cards"
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none resize-none" />
                </div>
              </div>
            </Card>

            {/* Media */}
            <Card title="Media">
              <div {...getRootProps()}
                className={clsx('border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors',
                  isDragActive ? 'border-gray-900 bg-gray-50' : 'border-gray-300 hover:border-gray-400')}>
                <input {...getInputProps()} />
                <FiUpload className="text-3xl text-gray-300 mx-auto mb-2" />
                <p className="text-sm font-medium text-gray-600">
                  {isDragActive ? 'Drop images here' : 'Drag & drop product images here'}
                </p>
                <p className="text-xs text-gray-400 mt-1">or click to browse · JPEG, PNG, WebP · Max 10 images</p>
                {uploading && <p className="text-xs text-blue-600 mt-2 animate-pulse">Uploading images...</p>}
              </div>
              {images.length > 0 && (
                <div className="grid grid-cols-4 sm:grid-cols-6 gap-2 mt-4">
                  {images.map((img, i) => (
                    <div key={i} className="relative group aspect-square rounded-lg overflow-hidden border border-gray-200">
                      <img src={getImageUrl(img.url)} alt="" className="w-full h-full object-cover" />
                      <button type="button" onClick={() => setImages(images.filter((_, idx) => idx !== i))}
                        className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white rounded-full text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <FiX className="text-[10px]" />
                      </button>
                      {i === 0 && (
                        <div className="absolute bottom-1 left-1 text-[9px] bg-gray-900 text-white px-1.5 py-0.5 rounded">Main</div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </Card>

            {/* Pricing */}
            <Card title="Pricing">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className={labelCls}>Selling Price (₹) *</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">₹</span>
                    <input type="number" {...register('price', { required: 'Price required', min: 0 })}
                      className="w-full border border-gray-300 rounded-lg pl-7 pr-4 py-2.5 text-sm focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none"
                      placeholder="2999" />
                  </div>
                  {errors.price && <p className={errCls}>{errors.price.message}</p>}
                </div>
                <div>
                  <label className={labelCls}>Compare at / MRP (₹)</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">₹</span>
                    <input type="number" {...register('comparePrice')}
                      className="w-full border border-gray-300 rounded-lg pl-7 pr-4 py-2.5 text-sm focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none"
                      placeholder="3999" />
                  </div>
                  <p className="text-[11px] text-gray-400 mt-1">Strikethrough price — shows discount %</p>
                </div>
                <div>
                  <label className={labelCls}>Cost Price (₹)</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">₹</span>
                    <input type="number" {...register('costPrice')}
                      className="w-full border border-gray-300 rounded-lg pl-7 pr-4 py-2.5 text-sm focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none"
                      placeholder="1500" />
                  </div>
                  <p className="text-[11px] text-gray-400 mt-1">Internal — not shown to customers</p>
                </div>
              </div>
            </Card>

            {/* Inventory / Variants */}
            <Card title="Inventory — Size, Color & Stock">
              <div className="space-y-2">
                <div className="hidden sm:grid grid-cols-5 gap-2 text-xs font-semibold text-gray-500 uppercase tracking-wide px-1">
                  <span>Size</span><span>Color Name</span><span>Color</span><span>Stock</span><span></span>
                </div>
                {variantFields.map((field, idx) => (
                  <div key={field.id} className="grid grid-cols-2 sm:grid-cols-5 gap-2 items-center bg-gray-50 border border-gray-100 p-3 rounded-xl">
                    <div>
                      <label className="sm:hidden text-[10px] font-medium text-gray-500 uppercase mb-0.5 block">Size</label>
                      <select {...register(`variants.${idx}.size`)}
                        className="w-full border border-gray-300 rounded-lg px-2 py-2 text-sm focus:ring-2 focus:ring-gray-900 outline-none bg-white">
                        {SIZES.map((s) => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="sm:hidden text-[10px] font-medium text-gray-500 uppercase mb-0.5 block">Color</label>
                      <input {...register(`variants.${idx}.color`)}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-gray-900 outline-none"
                        placeholder="Black" />
                    </div>
                    <div>
                      <label className="sm:hidden text-[10px] font-medium text-gray-500 uppercase mb-0.5 block">Color Hex</label>
                      <div className="flex items-center gap-2">
                        <input type="color" {...register(`variants.${idx}.colorHex`)}
                          className="w-10 h-9 rounded border border-gray-300 cursor-pointer p-0.5" />
                        <input {...register(`variants.${idx}.colorHex`)}
                          className="flex-1 border border-gray-300 rounded-lg px-2 py-2 text-xs focus:ring-2 focus:ring-gray-900 outline-none"
                          placeholder="#000000" />
                      </div>
                    </div>
                    <div>
                      <label className="sm:hidden text-[10px] font-medium text-gray-500 uppercase mb-0.5 block">Stock</label>
                      <input type="number" {...register(`variants.${idx}.stock`)} min={0}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-gray-900 outline-none"
                        placeholder="10" />
                    </div>
                    <button type="button" onClick={() => removeVariant(idx)}
                      className="flex items-center justify-center w-full h-9 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                      <FiTrash2 className="text-sm" />
                    </button>
                  </div>
                ))}
              </div>
              <button type="button" onClick={() => appendVariant({ size: 'UK 8', color: 'Black', colorHex: '#000000', stock: 10 })}
                className="mt-3 flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800 font-medium transition-colors">
                <FiPlus className="text-base" /> Add Variant
              </button>
            </Card>

            {/* Additional Info */}
            <Card title="Additional Information">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>Material</label>
                  <input {...register('material')}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-gray-900 outline-none"
                    placeholder="Leather, Mesh, Rubber sole..." />
                </div>
                <div>
                  <label className={labelCls}>Weight (grams)</label>
                  <input type="number" {...register('weight')}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-gray-900 outline-none"
                    placeholder="400" />
                </div>
                <div className="sm:col-span-2">
                  <label className={labelCls}>Care Instructions</label>
                  <textarea {...register('careInstructions')} rows={2}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-gray-900 outline-none resize-none"
                    placeholder="Wipe with a clean, dry cloth. Avoid exposure to water..." />
                </div>
              </div>
            </Card>

            {/* SEO */}
            <Card title="Search Engine Optimization (SEO)">
              <div className="space-y-3">
                <div>
                  <label className={labelCls}>Meta Title</label>
                  <input {...register('seoTitle')}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-gray-900 outline-none"
                    placeholder="VELOQ Runner Pro – Buy Online India" />
                </div>
                <div>
                  <label className={labelCls}>Meta Description</label>
                  <textarea {...register('seoDescription')} rows={2}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-gray-900 outline-none resize-none"
                    placeholder="Buy premium sneakers online at VELOQ. Free delivery above ₹999..." />
                </div>
              </div>
            </Card>
          </div>

          {/* ── RIGHT SIDEBAR ── */}
          <div className="space-y-5">

            {/* Status */}
            <Card title="Status">
              <select {...register('status')}
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-gray-900 outline-none bg-white">
                <option value="active">🟢  Active — visible on site</option>
                <option value="draft">🟡  Draft — hidden from customers</option>
                <option value="archived">🔴  Archived — removed from listing</option>
              </select>
            </Card>

            {/* Product Organization */}
            <Card title="Product Organization">
              <div className="space-y-3">
                <div>
                  <label className={labelCls}>Category *</label>
                  <select {...register('category', { required: true })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-gray-900 outline-none bg-white capitalize">
                    <option value="">Select category...</option>
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c} className="capitalize">{c.charAt(0).toUpperCase() + c.slice(1)}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={labelCls}>Brand</label>
                  <input {...register('brand')}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-gray-900 outline-none"
                    placeholder="VELOQ" />
                </div>
                <div>
                  <label className={labelCls}>SKU</label>
                  <input {...register('sku')}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-gray-900 outline-none"
                    placeholder="VLQ-001" />
                </div>
                <div>
                  <label className={labelCls}>Tags</label>
                  <input {...register('tags')}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-gray-900 outline-none"
                    placeholder="sneakers, running, casual" />
                  <p className="text-[11px] text-gray-400 mt-1">Comma se alag karo</p>
                </div>
              </div>
            </Card>

            {/* Labels */}
            <Card title="Labels & Badges">
              <div className="space-y-2">
                {[
                  { field: 'isNewArrival', label: 'New Arrival', color: 'bg-blue-50 border-blue-200 text-blue-700' },
                  { field: 'isBestSeller', label: 'Best Seller', color: 'bg-amber-50 border-amber-200 text-amber-700' },
                  { field: 'isFeatured',   label: 'Featured',    color: 'bg-purple-50 border-purple-200 text-purple-700' },
                ].map(({ field, label, color }) => (
                  <label key={field}
                    className={clsx('flex items-center gap-3 px-3 py-2.5 rounded-lg border cursor-pointer transition-colors', color)}>
                    <input type="checkbox" {...register(field)} className="w-4 h-4 rounded cursor-pointer" />
                    <span className="text-sm font-medium">{label}</span>
                  </label>
                ))}
              </div>
            </Card>

            {/* Collections */}
            <Card title="Collections">
              {collectionsData?.collections?.length ? (
                <div className="space-y-1 max-h-52 overflow-y-auto pr-1">
                  {collectionsData.collections.map(col => (
                    <label key={col._id}
                      className={clsx('flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer transition-colors border',
                        selectedCollections.includes(col._id)
                          ? 'bg-gray-900 border-gray-900 text-white'
                          : 'border-transparent hover:bg-gray-50 text-gray-800'
                      )}>
                      <input
                        type="checkbox"
                        checked={selectedCollections.includes(col._id)}
                        onChange={(e) => setSelectedCollections(prev =>
                          e.target.checked ? [...prev, col._id] : prev.filter(id => id !== col._id)
                        )}
                        className="w-4 h-4 accent-gray-900 flex-shrink-0"
                      />
                      <span className="text-sm font-medium truncate">{col.name}</span>
                    </label>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-gray-500">No collections yet. <a href="/admin/collections" className="text-blue-600 underline">Create one</a></p>
              )}
            </Card>

            {/* Tips */}
            <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
              <p className="text-xs font-semibold text-blue-700 mb-2">Tips</p>
              <ul className="text-xs text-blue-600 space-y-1 list-disc list-inside">
                <li>MRP se zyada price set karo — discount % dikhega</li>
                <li>Pehli image main/thumbnail hogi</li>
                <li>Har size ke liye alag variant add karo</li>
                <li>Active status set karo tab hi site pe dikhega</li>
              </ul>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
