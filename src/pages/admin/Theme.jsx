import { useEffect, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { FiPlus, FiTrash2, FiEye, FiEyeOff, FiMove } from 'react-icons/fi';
import api from '../../utils/api';
import { PageLoader } from '../../components/common/LoadingSpinner';
import toast from 'react-hot-toast';

const DEFAULT_MARQUEE = [
  "Premium Men's Footwear",
  'Free Delivery ₹999+',
  '100% Authentic',
  'New Arrivals Weekly',
  'Sneakers',
  'Casual Shoes',
  'Slippers & Clogs',
  'Express Shipping',
];

const DEFAULT_FEATURE_BAR = [
  { icon: '🚚', title: 'Free Delivery',  subtitle: 'Above ₹999' },
  { icon: '🔄', title: '30-Day Returns', subtitle: 'Easy exchange' },
  { icon: '✅', title: '100% Authentic', subtitle: 'Every product' },
  { icon: '⚡', title: 'Fast Dispatch',  subtitle: 'Order by 2 PM' },
];

const HOMEPAGE_SECTIONS = [
  { key: 'homepageShowNewArrivals', label: 'New Arrivals',  desc: 'Show new arrival products section' },
  { key: 'homepageShowBestSellers', label: 'Best Sellers',  desc: 'Show best selling products section' },
  { key: 'homepageShowCollections', label: 'Collections',   desc: 'Show shop by collection section' },
  { key: 'homepageShowTrending',    label: 'Trending Styles', desc: 'Show trending styles horizontal scroll' },
  { key: 'homepageShowWhyUs',       label: 'Why VELOQ',    desc: 'Show the "VELOQ Difference" dark section' },
  { key: 'homepageShowReviews',     label: 'Reviews',       desc: 'Show customer reviews section' },
];

function Section({ title, desc, children }) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6 space-y-4">
      <div className="border-b border-gray-100 pb-3">
        <h2 className="font-bold text-base text-gray-900">{title}</h2>
        {desc && <p className="text-sm text-gray-600 mt-0.5">{desc}</p>}
      </div>
      {children}
    </div>
  );
}

export default function AdminTheme() {
  const queryClient = useQueryClient();
  const [marqueeItems, setMarqueeItems] = useState([]);
  const [newMarquee, setNewMarquee] = useState('');
  const [featureBar, setFeatureBar] = useState([]);
  const [sections, setSections] = useState({});

  const { data, isLoading } = useQuery({
    queryKey: ['adminSettings'],
    queryFn: () => api.get('/admin/settings'),
  });

  useEffect(() => {
    if (data?.settings) {
      const s = data.settings;
      setMarqueeItems(s.marqueeItems?.length ? s.marqueeItems : [...DEFAULT_MARQUEE]);
      setFeatureBar(s.featureBar?.length ? s.featureBar : [...DEFAULT_FEATURE_BAR]);
      const sectionState = {};
      HOMEPAGE_SECTIONS.forEach(({ key }) => {
        sectionState[key] = s[key] !== false;
      });
      setSections(sectionState);
    }
  }, [data]);

  const saveMutation = useMutation({
    mutationFn: (payload) => api.put('/admin/settings', payload),
    onSuccess: () => {
      queryClient.invalidateQueries(['adminSettings']);
      queryClient.invalidateQueries(['publicSettings']);
      toast.success('Theme saved!');
    },
    onError: (err) => toast.error(err.message),
  });

  const handleSave = () => {
    saveMutation.mutate({ marqueeItems, featureBar, ...sections });
  };

  const addMarquee = () => {
    if (!newMarquee.trim()) return;
    setMarqueeItems(prev => [...prev, newMarquee.trim()]);
    setNewMarquee('');
  };

  const removeMarquee = (i) => setMarqueeItems(prev => prev.filter((_, idx) => idx !== i));

  const updateFeature = (i, field, val) => {
    setFeatureBar(prev => prev.map((item, idx) => idx === i ? { ...item, [field]: val } : item));
  };

  const addFeature = () => {
    if (featureBar.length >= 6) return toast.error('Max 6 feature items');
    setFeatureBar(prev => [...prev, { icon: '⭐', title: 'New Feature', subtitle: 'Description' }]);
  };

  const removeFeature = (i) => setFeatureBar(prev => prev.filter((_, idx) => idx !== i));

  if (isLoading) return <PageLoader />;

  return (
    <div className="max-w-3xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Theme Customizer</h1>
          <p className="text-gray-600 text-sm mt-1">Customize your homepage sections, ticker, and feature strips</p>
        </div>
        <button onClick={handleSave} disabled={saveMutation.isPending}
          className="btn-primary px-6 py-2.5 text-sm">
          {saveMutation.isPending ? 'Saving...' : 'Save Theme'}
        </button>
      </div>

      {/* Homepage Sections Toggle */}
      <Section title="Homepage Sections" desc="Toggle which sections appear on your homepage">
        <div className="space-y-2">
          {HOMEPAGE_SECTIONS.map(({ key, label, desc }) => (
            <div key={key}
              className={`flex items-center justify-between p-3 rounded-xl border transition-colors cursor-pointer ${
                sections[key] ? 'border-gray-900 bg-gray-50' : 'border-gray-200 bg-white'
              }`}
              onClick={() => setSections(prev => ({ ...prev, [key]: !prev[key] }))}
            >
              <div className="flex items-center gap-3">
                {sections[key]
                  ? <FiEye className="text-gray-900 text-base flex-shrink-0" />
                  : <FiEyeOff className="text-gray-400 text-base flex-shrink-0" />
                }
                <div>
                  <p className="text-sm font-semibold text-gray-900">{label}</p>
                  <p className="text-xs text-gray-500">{desc}</p>
                </div>
              </div>
              <div className={`w-10 h-5 rounded-full transition-colors flex-shrink-0 relative ${sections[key] ? 'bg-gray-900' : 'bg-gray-300'}`}>
                <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all ${sections[key] ? 'left-5' : 'left-0.5'}`} />
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* Marquee Ticker */}
      <Section title="Marquee Ticker" desc="Scrolling text strip shown between homepage sections">
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {marqueeItems.map((item, i) => (
            <div key={i} className="flex items-center gap-2">
              <FiMove className="text-gray-300 text-sm flex-shrink-0 cursor-grab" />
              <input
                value={item}
                onChange={(e) => setMarqueeItems(prev => prev.map((m, idx) => idx === i ? e.target.value : m))}
                className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:border-gray-400 outline-none"
              />
              <button onClick={() => removeMarquee(i)} className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                <FiTrash2 className="text-sm" />
              </button>
            </div>
          ))}
        </div>
        <div className="flex gap-2 mt-2">
          <input
            value={newMarquee}
            onChange={(e) => setNewMarquee(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && addMarquee()}
            placeholder="Add new marquee item..."
            className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:border-gray-400 outline-none"
          />
          <button onClick={addMarquee}
            className="flex items-center gap-1.5 px-4 py-2 bg-gray-900 text-white text-sm font-semibold rounded-lg hover:bg-gray-700 transition-colors">
            <FiPlus className="text-sm" /> Add
          </button>
        </div>
        <div className="bg-gray-50 border border-gray-100 rounded-xl py-2.5 px-4 overflow-hidden mt-2">
          <p className="text-[11px] text-gray-500 font-semibold mb-1 uppercase tracking-wider">Preview:</p>
          <p className="text-xs text-gray-700 truncate">
            {marqueeItems.map((item, i) => (
              <span key={i}> · {item}</span>
            ))}
          </p>
        </div>
      </Section>

      {/* Feature / USP Bar */}
      <Section title="Feature Strip (USP Bar)" desc="4 trust badges shown on homepage — e.g. Free Delivery, Authentic, etc.">
        <div className="space-y-3">
          {featureBar.map((item, i) => (
            <div key={i} className="flex items-center gap-3 bg-gray-50 border border-gray-100 rounded-xl p-3">
              <input
                value={item.icon}
                onChange={(e) => updateFeature(i, 'icon', e.target.value)}
                className="w-14 border border-gray-200 rounded-lg px-2 py-2 text-center text-lg bg-white focus:border-gray-400 outline-none"
                placeholder="🚚"
                maxLength={2}
              />
              <div className="flex-1 grid grid-cols-2 gap-2">
                <input
                  value={item.title}
                  onChange={(e) => updateFeature(i, 'title', e.target.value)}
                  className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:border-gray-400 outline-none bg-white"
                  placeholder="Feature title"
                />
                <input
                  value={item.subtitle}
                  onChange={(e) => updateFeature(i, 'subtitle', e.target.value)}
                  className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:border-gray-400 outline-none bg-white"
                  placeholder="Subtitle"
                />
              </div>
              <button onClick={() => removeFeature(i)}
                className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                <FiTrash2 className="text-sm" />
              </button>
            </div>
          ))}
        </div>
        {featureBar.length < 6 && (
          <button onClick={addFeature}
            className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800 font-medium transition-colors mt-2">
            <FiPlus className="text-base" /> Add Feature Item
          </button>
        )}

        {/* Preview */}
        <div className="border border-gray-100 rounded-xl p-4 bg-white mt-2">
          <p className="text-[11px] text-gray-500 font-semibold mb-3 uppercase tracking-wider">Preview:</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {featureBar.map((item, i) => (
              <div key={i} className="flex items-center gap-2">
                <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center text-lg flex-shrink-0">
                  {item.icon}
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-900">{item.title || '—'}</p>
                  <p className="text-[10px] text-gray-500">{item.subtitle || '—'}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Section>

      {/* Banner Tips */}
      <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
        <p className="text-sm font-semibold text-blue-800 mb-1">Hero Banners</p>
        <p className="text-xs text-blue-700">
          Hero slider aur small banners ko <strong>Banners</strong> section se manage karo.
          Wahan har banner ke liye image, title, subtitle, aur button set kar sakte ho.
        </p>
        <a href="/admin/banners" className="inline-block mt-2 text-xs font-semibold text-blue-700 underline">
          Go to Banners →
        </a>
      </div>

      <div className="pb-6">
        <button onClick={handleSave} disabled={saveMutation.isPending}
          className="btn-primary px-8 py-3 text-base w-full sm:w-auto">
          {saveMutation.isPending ? 'Saving...' : 'Save All Theme Settings'}
        </button>
      </div>
    </div>
  );
}
