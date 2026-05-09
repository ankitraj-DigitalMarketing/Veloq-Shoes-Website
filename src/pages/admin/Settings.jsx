import { useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import api from '../../utils/api';
import { PageLoader } from '../../components/common/LoadingSpinner';
import toast from 'react-hot-toast';

function Section({ title, desc, children }) {
  return (
    <div className="card p-6 space-y-4">
      <div className="border-b border-gray-100 pb-3 mb-2">
        <h2 className="font-bold text-lg text-ink">{title}</h2>
        {desc && <p className="text-sm text-mid mt-0.5">{desc}</p>}
      </div>
      {children}
    </div>
  );
}

export default function AdminSettings() {
  const queryClient = useQueryClient();
  const { register, handleSubmit, reset, watch } = useForm();

  const { data, isLoading } = useQuery({
    queryKey: ['adminSettings'],
    queryFn: () => api.get('/admin/settings'),
  });

  useEffect(() => {
    if (data?.settings) reset(data.settings);
  }, [data]);

  const saveMutation = useMutation({
    mutationFn: (data) => api.put('/admin/settings', data),
    onSuccess: () => {
      queryClient.invalidateQueries(['adminSettings']);
      queryClient.invalidateQueries(['publicSettings']);
      toast.success('Settings saved successfully');
    },
    onError: (err) => toast.error(err.message),
  });

  if (isLoading) return <PageLoader />;

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Store Settings</h1>
        <p className="text-mid text-sm mt-1">Customize your VELOQ store from here</p>
      </div>

      <form onSubmit={handleSubmit(saveMutation.mutate)} className="space-y-6">

        {/* ── ANNOUNCEMENT BAR ── */}
        <Section title="Announcement Bar" desc="Top bar text displayed on every page of the website">
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-100 mb-2">
            <input type="checkbox" {...register('announcementEnabled')} id="announcementEnabled" className="w-4 h-4 accent-ink" />
            <label htmlFor="announcementEnabled" className="text-sm font-medium">Show announcement bar</label>
          </div>
          <div>
            <label className="text-sm font-medium mb-1 block">Announcement Text</label>
            <input {...register('announcementText')} className="input-field"
              placeholder="Free delivery on orders above ₹999 · 100% Authentic" />
            <p className="text-[11px] text-mid mt-1">This text appears in the black bar at the very top of your site.</p>
          </div>
        </Section>

        {/* ── STORE INFO ── */}
        <Section title="Store Information" desc="Basic details about your store">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-1 block">Store Name</label>
              <input {...register('storeName')} className="input-field" placeholder="VELOQ" />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Currency</label>
              <input {...register('currency')} className="input-field" placeholder="INR" />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Currency Symbol</label>
              <input {...register('currencySymbol')} className="input-field" placeholder="₹" />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">GST Rate (%)</label>
              <input type="number" {...register('gstRate')} className="input-field" placeholder="18" />
            </div>
          </div>
        </Section>

        {/* ── CONTACT INFO ── */}
        <Section title="Contact Information" desc="Displayed in your store footer and emails">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-1 block">Contact Email</label>
              <input type="email" {...register('contactEmail')} className="input-field" placeholder="hello@veloq.in" />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Contact Phone</label>
              <input {...register('contactPhone')} className="input-field" placeholder="+91 98765 43210" />
            </div>
            <div className="md:col-span-2">
              <label className="text-sm font-medium mb-1 block">Store Address</label>
              <textarea {...register('address')} rows={2} className="input-field resize-none"
                placeholder="123, Fashion Street, Mumbai, Maharashtra 400001" />
            </div>
          </div>
        </Section>

        {/* ── ABOUT ── */}
        <Section title="About Store" desc="Short description of your store (used in SEO and About section)">
          <div>
            <label className="text-sm font-medium mb-1 block">About Text</label>
            <textarea {...register('aboutText')} rows={3} className="input-field resize-none"
              placeholder="VELOQ is India's premium men's footwear brand offering curated sneakers, casual shoes and slippers with fast delivery and 100% authentic products." />
          </div>
        </Section>

        {/* ── SHIPPING ── */}
        <Section title="Shipping" desc="Configure delivery charges and free shipping threshold">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-1 block">Free Shipping Above (₹)</label>
              <input type="number" {...register('freeShippingThreshold')} className="input-field" placeholder="999" />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Standard Shipping Charge (₹)</label>
              <input type="number" {...register('shippingCharge')} className="input-field" placeholder="99" />
            </div>
          </div>
        </Section>

        {/* ── PAYMENT ── */}
        <Section title="Payment Gateway (Razorpay)" desc="Get API keys from your Razorpay Dashboard">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-1 block">Key ID</label>
              <input {...register('razorpayKeyId')} className="input-field" placeholder="rzp_test_xxxxxxxxx" />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Key Secret</label>
              <input type="password" {...register('razorpayKeySecret')} className="input-field" placeholder="••••••••••" />
            </div>
          </div>
        </Section>

        {/* ── EMAIL ── */}
        <Section title="Email (SMTP)" desc="For order confirmations and transactional emails">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-1 block">SMTP Host</label>
              <input {...register('emailHost')} className="input-field" placeholder="smtp.gmail.com" />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">SMTP Port</label>
              <input type="number" {...register('emailPort')} className="input-field" placeholder="587" />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Email Username</label>
              <input {...register('emailUser')} className="input-field" placeholder="you@gmail.com" />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Email Password / App Password</label>
              <input type="password" {...register('emailPass')} className="input-field" placeholder="••••••••" />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">From Name / Email</label>
              <input {...register('emailFrom')} className="input-field" placeholder="VELOQ &lt;noreply@veloq.in&gt;" />
            </div>
          </div>
        </Section>

        {/* ── SOCIAL LINKS ── */}
        <Section title="Social Media" desc="Your brand's social media profile URLs">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {['instagram', 'facebook', 'twitter', 'youtube'].map((platform) => (
              <div key={platform}>
                <label className="text-sm font-medium mb-1 block capitalize">{platform}</label>
                <input {...register(`socialLinks.${platform}`)} className="input-field"
                  placeholder={`https://${platform}.com/veloq`} />
              </div>
            ))}
          </div>
        </Section>

        {/* ── SEO ── */}
        <Section title="SEO" desc="Meta tags for search engine optimization">
          <div>
            <label className="text-sm font-medium mb-1 block">Meta Title</label>
            <input {...register('metaTitle')} className="input-field" placeholder="VELOQ – Premium Men's Footwear India" />
          </div>
          <div>
            <label className="text-sm font-medium mb-1 block">Meta Description</label>
            <textarea {...register('metaDescription')} rows={2} className="input-field resize-none"
              placeholder="Shop premium shoes online in India. Best prices on sneakers, casual & formal shoes with free delivery." />
          </div>
        </Section>

        <button type="submit" disabled={saveMutation.isPending}
          className="btn-primary px-8 py-3 text-base w-full sm:w-auto">
          {saveMutation.isPending ? 'Saving...' : 'Save All Settings'}
        </button>
      </form>
    </div>
  );
}
