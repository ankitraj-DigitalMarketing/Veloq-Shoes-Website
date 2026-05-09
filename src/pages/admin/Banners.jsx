import { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { FiImage, FiSave, FiTrash2, FiEye, FiEyeOff, FiUpload, FiX } from 'react-icons/fi';
import api from '../../utils/api';
import toast from 'react-hot-toast';

const SLOT_META = [
  { pos: 1, label: 'Banner 1 — Hero (Full Width)', desc: 'Main hero banner at top of homepage' },
  { pos: 2, label: 'Banner 2 — Left Small',        desc: 'Left small banner below hero' },
  { pos: 3, label: 'Banner 3 — Right Small',       desc: 'Right small banner below hero' },
  { pos: 4, label: 'Banner 4 — Bottom Strip',      desc: 'Full-width promotional strip' },
];

const EMPTY_BANNER = {
  title: '', subtitle: '', image: '',
  buttonText: 'Shop Now', buttonLink: '/products',
  bgColor: '#111827', textDark: false, isActive: true,
};

function makeForms(banners) {
  const f = { 1: { ...EMPTY_BANNER }, 2: { ...EMPTY_BANNER }, 3: { ...EMPTY_BANNER }, 4: { ...EMPTY_BANNER } };
  (banners || []).forEach((b) => {
    if (b && b.position >= 1 && b.position <= 4) f[b.position] = { ...EMPTY_BANNER, ...b };
  });
  return f;
}

function ImageUploadField({ value, onChange }) {
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
      <label className="text-xs font-semibold text-ink mb-1 block">Banner Image</label>
      <div className="flex gap-2">
        <div className="relative flex-1">
          <FiImage className="absolute left-3 top-1/2 -translate-y-1/2 text-mid text-sm pointer-events-none" />
          <input
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="input-field text-sm py-2.5 pl-9"
            placeholder="https://... or upload below"
          />
        </div>
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          disabled={uploading}
          className="flex items-center gap-1.5 px-4 py-2.5 border border-gray-200 rounded-lg text-xs font-semibold text-ink hover:border-ink hover:bg-gray-50 transition-all disabled:opacity-60 flex-shrink-0"
        >
          <FiUpload className="text-sm" />
          {uploading ? 'Uploading...' : 'Upload'}
        </button>
        {value && (
          <button
            type="button"
            onClick={() => onChange('')}
            className="w-10 h-10 flex items-center justify-center border border-gray-200 rounded-lg text-mid hover:border-red-300 hover:text-red-500 transition-all flex-shrink-0"
          >
            <FiX className="text-sm" />
          </button>
        )}
      </div>
      <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
      {value && (
        <div className="mt-2 rounded-lg overflow-hidden border border-gray-100 h-20 bg-gray-50 relative">
          <img src={value} alt="preview" className="w-full h-full object-cover" onError={(e) => { e.target.style.display = 'none'; }} />
        </div>
      )}
    </div>
  );
}

export default function AdminBanners() {
  const queryClient = useQueryClient();
  const [forms, setForms] = useState(makeForms([]));
  const [saving, setSaving] = useState(null);

  const { data, isLoading } = useQuery({
    queryKey: ['adminBanners'],
    queryFn: () => api.get('/banners/all'),
  });

  useEffect(() => {
    if (data) {
      const list = data?.banners || (Array.isArray(data) ? data : []);
      setForms(makeForms(list.filter(Boolean)));
    }
  }, [data]);

  const saveMutation = useMutation({
    mutationFn: ({ position, payload }) => api.put(`/banners/${position}`, payload),
    onSuccess: (_, { position }) => {
      toast.success(`Banner ${position} saved!`);
      setSaving(null);
      queryClient.invalidateQueries({ queryKey: ['adminBanners'] });
      queryClient.invalidateQueries({ queryKey: ['banners'] });
    },
    onError: (err) => { toast.error(err.message || 'Failed to save'); setSaving(null); },
  });

  const deleteMutation = useMutation({
    mutationFn: (position) => api.delete(`/banners/${position}`),
    onSuccess: (_, position) => {
      toast.success(`Banner ${position} cleared`);
      setForms((prev) => ({ ...prev, [position]: { ...EMPTY_BANNER } }));
      queryClient.invalidateQueries({ queryKey: ['adminBanners'] });
      queryClient.invalidateQueries({ queryKey: ['banners'] });
    },
    onError: (err) => toast.error(err.message || 'Failed to delete'),
  });

  const update = (pos, field, value) =>
    setForms((prev) => ({ ...prev, [pos]: { ...prev[pos], [field]: value } }));

  const handleSave = (pos) => {
    if (!forms[pos].title.trim()) return toast.error('Title is required');
    setSaving(pos);
    saveMutation.mutate({ position: pos, payload: forms[pos] });
  };

  const handleDelete = (pos) => {
    if (!window.confirm(`Clear Banner ${pos}? This will remove it from the homepage.`)) return;
    deleteMutation.mutate(pos);
  };

  if (isLoading) return (
    <div className="p-8 flex items-center justify-center min-h-[300px]">
      <div className="text-center">
        <div className="w-8 h-8 border-2 border-gray-200 border-t-ink rounded-full animate-spin mx-auto mb-3" />
        <p className="text-mid text-sm">Loading banners...</p>
      </div>
    </div>
  );

  return (
    <div className="p-6 max-w-5xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-ink">Homepage Banners</h1>
        <p className="text-mid text-sm mt-1">Manage 4 banner slots displayed on the homepage</p>
      </div>

      {/* Layout preview */}
      <div className="bg-white border border-gray-200 rounded-xl p-4 mb-6">
        <p className="text-[10px] font-bold text-ink uppercase tracking-wider mb-3">Homepage Layout</p>
        <div className="space-y-1.5">
          <div className="w-full h-9 bg-ink/10 rounded-lg flex items-center justify-center text-xs font-semibold text-ink">
            Banner 1 — Hero (Full Width)
          </div>
          <div className="grid grid-cols-2 gap-1.5">
            <div className="h-7 bg-blue-50 border border-blue-100 rounded-lg flex items-center justify-center text-[11px] font-semibold text-blue-600">Banner 2 — Left</div>
            <div className="h-7 bg-blue-50 border border-blue-100 rounded-lg flex items-center justify-center text-[11px] font-semibold text-blue-600">Banner 3 — Right</div>
          </div>
          <div className="w-full h-7 bg-green-50 border border-green-100 rounded-lg flex items-center justify-center text-[11px] font-semibold text-green-600">
            Banner 4 — Bottom Strip
          </div>
        </div>
      </div>

      <div className="space-y-5">
        {SLOT_META.map(({ pos, label, desc }) => {
          const form    = forms[pos] || { ...EMPTY_BANNER };
          const isSaving = saving === pos;

          return (
            <motion.div key={pos}
              initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: (pos - 1) * 0.07 }}
              className="bg-white border border-gray-200 rounded-xl overflow-hidden"
            >
              {/* Header */}
              <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100 bg-gray-50">
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-full bg-ink text-white text-[10px] font-black flex items-center justify-center flex-shrink-0">{pos}</span>
                  <div>
                    <p className="font-bold text-sm text-ink">{label}</p>
                    <p className="text-mid text-[11px]">{desc}</p>
                  </div>
                </div>
                <button
                  onClick={() => update(pos, 'isActive', !form.isActive)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all flex-shrink-0 ${
                    form.isActive ? 'border-green-200 bg-green-50 text-green-700' : 'border-gray-200 text-mid bg-white hover:border-gray-400'
                  }`}
                >
                  {form.isActive ? <FiEye className="text-xs" /> : <FiEyeOff className="text-xs" />}
                  {form.isActive ? 'Active' : 'Hidden'}
                </button>
              </div>

              <div className="p-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-ink mb-1 block">Title *</label>
                    <input value={form.title} onChange={(e) => update(pos, 'title', e.target.value)}
                      className="input-field text-sm py-2.5" placeholder="e.g. New Season Drop" />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-ink mb-1 block">Subtitle</label>
                    <input value={form.subtitle} onChange={(e) => update(pos, 'subtitle', e.target.value)}
                      className="input-field text-sm py-2.5" placeholder="e.g. Men's Footwear 2025" />
                  </div>

                  {/* Image upload field */}
                  <div className="md:col-span-2">
                    <ImageUploadField
                      value={form.image}
                      onChange={(url) => update(pos, 'image', url)}
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-ink mb-1 block">Button Text</label>
                    <input value={form.buttonText} onChange={(e) => update(pos, 'buttonText', e.target.value)}
                      className="input-field text-sm py-2.5" placeholder="Shop Now" />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-ink mb-1 block">Button Link</label>
                    <input value={form.buttonLink} onChange={(e) => update(pos, 'buttonLink', e.target.value)}
                      className="input-field text-sm py-2.5" placeholder="/products" />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-ink mb-1 block">Background Color</label>
                    <div className="flex gap-2 items-center">
                      <input type="color" value={form.bgColor} onChange={(e) => update(pos, 'bgColor', e.target.value)}
                        className="w-10 h-10 rounded-lg border border-gray-200 cursor-pointer p-1 flex-shrink-0" />
                      <input value={form.bgColor} onChange={(e) => update(pos, 'bgColor', e.target.value)}
                        className="input-field text-sm py-2.5 flex-1 font-mono" placeholder="#111827" />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-ink mb-1 block">Text Color</label>
                    <div className="flex gap-2">
                      {[
                        { val: false, label: 'White Text', dark: true },
                        { val: true,  label: 'Dark Text',  dark: false },
                      ].map(({ val, label: lbl, dark }) => (
                        <button key={String(val)} onClick={() => update(pos, 'textDark', val)}
                          className={`flex-1 py-2.5 rounded-lg text-xs font-semibold border transition-all ${
                            dark ? 'bg-ink text-white border-ink' : 'bg-white text-ink border-gray-300'
                          } ${form.textDark === val ? 'ring-2 ring-offset-1 ring-ink opacity-100' : 'opacity-40'}`}>
                          {lbl}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Live preview */}
                {form.title && (
                  <div className="mt-4 rounded-xl overflow-hidden relative flex items-center px-6 py-5"
                    style={{ backgroundColor: form.bgColor || '#111827', minHeight: 100 }}>
                    {form.image && (
                      <img src={form.image} alt="" className="absolute inset-0 w-full h-full object-cover"
                        onError={(e) => { e.target.style.display = 'none'; }} />
                    )}
                    <div className={`absolute inset-0 ${form.image ? 'bg-black/30' : ''}`} />
                    <div className="relative z-10">
                      {form.subtitle && (
                        <p className={`text-[10px] uppercase tracking-widest font-semibold mb-1 ${form.textDark ? 'text-gray-500' : 'text-white/60'}`}>
                          {form.subtitle}
                        </p>
                      )}
                      <p className={`font-display text-2xl font-black ${form.textDark ? 'text-ink' : 'text-white'}`}>
                        {form.title}
                      </p>
                      {form.buttonText && (
                        <span className={`inline-block mt-2 text-xs font-bold px-3 py-1.5 rounded-lg ${form.textDark ? 'bg-ink text-white' : 'bg-white text-ink'}`}>
                          {form.buttonText}
                        </span>
                      )}
                    </div>
                    <span className={`absolute top-2 right-2 text-[9px] font-bold px-2 py-0.5 rounded ${
                      form.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-mid'
                    }`}>
                      {form.isActive ? 'LIVE' : 'HIDDEN'}
                    </span>
                  </div>
                )}

                <div className="flex gap-2 mt-4">
                  <button onClick={() => handleSave(pos)} disabled={isSaving}
                    className="inline-flex items-center gap-2 btn-primary py-2.5 px-5 text-sm disabled:opacity-60">
                    <FiSave className="text-sm" />
                    {isSaving ? 'Saving...' : 'Save Banner'}
                  </button>
                  <button onClick={() => handleDelete(pos)}
                    className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 rounded-lg text-xs font-semibold text-mid hover:border-red-300 hover:text-red-500 transition-all">
                    <FiTrash2 className="text-sm" /> Clear
                  </button>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
