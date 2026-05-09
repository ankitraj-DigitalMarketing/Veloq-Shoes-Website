import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { FiCheck, FiCreditCard, FiTruck, FiMapPin, FiChevronRight } from 'react-icons/fi';
import { MdQrCode2 } from 'react-icons/md';
import api from '../utils/api';
import useCartStore from '../store/cartStore';
import useAuthStore from '../store/authStore';
import { formatPrice, getImageUrl } from '../utils/helpers';
import toast from 'react-hot-toast';
import clsx from 'clsx';

const STEPS = ['Address', 'Payment', 'Review'];
const INDIAN_STATES = ['Maharashtra','Delhi','Karnataka','Tamil Nadu','Gujarat','Rajasthan','West Bengal','Uttar Pradesh','Telangana','Kerala','Punjab','Haryana','Madhya Pradesh','Andhra Pradesh','Bihar','Odisha','Assam','Jharkhand','Uttarakhand','Himachal Pradesh','Goa','Chhattisgarh','Jammu & Kashmir','Other'];

export default function CheckoutPage() {
  const [step, setStep] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState('razorpay');
  const [utrNumber, setUtrNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [savedAddress, setSavedAddress] = useState(null);
  const { items, getSubtotal, discount, coupon, clearCart } = useCartStore();
  const { user } = useAuthStore();
  const navigate = useNavigate();

  const { data: settingsData } = useQuery({
    queryKey: ['publicSettings'],
    queryFn: () => api.get('/settings/public'),
    staleTime: 5 * 60 * 1000,
  });
  const settings = settingsData?.settings || {};
  const upiEnabled = settings.upiPaymentEnabled && settings.upiQrCode;

  const PAYMENT_METHODS = [
    { id: 'razorpay', label: 'UPI / Card / Net Banking', desc: 'PhonePe, GPay, Paytm, Cards, EMI', icon: FiCreditCard },
    ...(upiEnabled ? [{ id: 'upi_qr', label: 'Pay via QR Code', desc: `Scan & pay · ${settings.upiId || ''}`, icon: MdQrCode2 }] : []),
    { id: 'cod', label: 'Cash on Delivery', desc: 'Pay when you receive your order', icon: FiTruck },
  ];

  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: { fullName: user?.name || '', phone: user?.phone || '' }
  });

  const subtotal = getSubtotal();
  const shippingCharge = subtotal >= 999 ? 0 : 99;
  const total = subtotal - discount + shippingCharge;

  const onAddressSubmit = (data) => { setSavedAddress(data); setStep(1); };

  const loadRazorpayScript = () =>
    new Promise((resolve) => {
      if (window.Razorpay) return resolve(true);
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });

  const handlePlaceOrder = async () => {
    setLoading(true);
    try {
      const orderData = {
        items: items.map((i) => ({ product: i.product, size: i.size, color: i.color, quantity: i.quantity })),
        shippingAddress: savedAddress,
        paymentMethod: paymentMethod === 'upi_qr' ? 'upi' : paymentMethod,
        couponCode: coupon?.code,
        ...(paymentMethod === 'upi_qr' && { utrNumber }),
      };
      const { order } = await api.post('/orders', orderData);
      if (paymentMethod === 'cod' || paymentMethod === 'upi_qr') {
        clearCart();
        navigate(`/order-confirmation/${order._id}`);
        return;
      }

      const loaded = await loadRazorpayScript();
      if (!loaded) throw new Error('Razorpay SDK failed to load');

      const { razorpayOrderId, amount, currency, keyId } = await api.post('/payment/create-order', { orderId: order._id });
      const rzp = new window.Razorpay({
        key: keyId, amount, currency,
        name: 'VELOQ',
        description: `Order #${order.orderNumber}`,
        order_id: razorpayOrderId,
        handler: async (response) => {
          try {
            await api.post('/payment/verify', {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              orderId: order._id,
            });
            clearCart();
            navigate(`/order-confirmation/${order._id}`);
          } catch { toast.error('Payment verification failed. Contact support.'); }
        },
        prefill: { name: savedAddress.fullName, contact: savedAddress.phone, email: user?.email },
        theme: { color: '#111827' },
        modal: { ondismiss: () => { toast.error('Payment cancelled'); setLoading(false); } },
      });
      rzp.open();
    } catch (err) {
      toast.error(err.message || 'Failed to place order');
      setLoading(false);
    }
  };

  const labelClass = 'text-xs font-semibold text-ink mb-1 block';
  const errorClass = 'text-sale text-xs mt-1';

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <h1 className="text-2xl font-bold text-ink">Checkout</h1>
      </motion.div>

      {/* Step Indicator */}
      <div className="flex items-center mb-8">
        {STEPS.map((s, i) => (
          <div key={s} className="flex items-center flex-1">
            <div className="flex items-center gap-2">
              <div className={clsx(
                'w-8 h-8 rounded-full border-2 flex items-center justify-center text-xs font-bold transition-all duration-300',
                i < step ? 'bg-neon border-neon text-white' : i === step ? 'bg-ink border-ink text-white' : 'border-gray-200 text-mid'
              )}>
                {i < step ? <FiCheck /> : i + 1}
              </div>
              <span className={clsx('text-xs font-semibold hidden sm:block transition-colors',
                i === step ? 'text-ink' : i < step ? 'text-neon' : 'text-mid')}>{s}</span>
            </div>
            {i < STEPS.length - 1 && (
              <div className={clsx('flex-1 h-px mx-3 transition-all duration-500', i < step ? 'bg-neon' : 'bg-gray-200')} />
            )}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <AnimatePresence mode="wait">
            {/* Step 0: Address */}
            {step === 0 && (
              <motion.div key="address" initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }} transition={{ duration: 0.25 }}>
                <form onSubmit={handleSubmit(onAddressSubmit)} className="bg-white border border-gray-200 rounded-xl p-6">
                  <div className="flex items-center gap-2 mb-5">
                    <FiMapPin className="text-mid text-sm" />
                    <h2 className="font-bold text-base text-ink">Delivery Address</h2>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="sm:col-span-2">
                      <label className={labelClass}>Full Name *</label>
                      <input {...register('fullName', { required: 'Required' })} className="input-field" placeholder="Enter your full name" />
                      {errors.fullName && <p className={errorClass}>{errors.fullName.message}</p>}
                    </div>
                    <div>
                      <label className={labelClass}>Phone *</label>
                      <input {...register('phone', { required: 'Required', pattern: { value: /^[6-9]\d{9}$/, message: 'Invalid phone' } })}
                        className="input-field" placeholder="10-digit mobile" type="tel" />
                      {errors.phone && <p className={errorClass}>{errors.phone.message}</p>}
                    </div>
                    <div>
                      <label className={labelClass}>Pincode *</label>
                      <input {...register('pincode', { required: 'Required', pattern: { value: /^\d{6}$/, message: '6-digit code' } })}
                        className="input-field" placeholder="6-digit pincode" maxLength={6} />
                      {errors.pincode && <p className={errorClass}>{errors.pincode.message}</p>}
                    </div>
                    <div className="sm:col-span-2">
                      <label className={labelClass}>Address Line 1 *</label>
                      <input {...register('addressLine1', { required: 'Required' })} className="input-field" placeholder="House no., Street, Area" />
                      {errors.addressLine1 && <p className={errorClass}>{errors.addressLine1.message}</p>}
                    </div>
                    <div className="sm:col-span-2">
                      <label className={labelClass}>Address Line 2</label>
                      <input {...register('addressLine2')} className="input-field" placeholder="Landmark, Colony (optional)" />
                    </div>
                    <div>
                      <label className={labelClass}>City *</label>
                      <input {...register('city', { required: 'Required' })} className="input-field" placeholder="City" />
                      {errors.city && <p className={errorClass}>{errors.city.message}</p>}
                    </div>
                    <div>
                      <label className={labelClass}>State *</label>
                      <select {...register('state', { required: 'Required' })} className="input-field">
                        <option value="">Select State</option>
                        {INDIAN_STATES.map((s) => <option key={s} value={s}>{s}</option>)}
                      </select>
                      {errors.state && <p className={errorClass}>{errors.state.message}</p>}
                    </div>
                  </div>
                  <button type="submit" className="w-full btn-primary mt-6 py-3.5 text-sm flex items-center justify-center gap-2">
                    Continue to Payment <FiChevronRight />
                  </button>
                </form>
              </motion.div>
            )}

            {/* Step 1: Payment */}
            {step === 1 && (
              <motion.div key="payment" initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }} transition={{ duration: 0.25 }}>
                <div className="bg-white border border-gray-200 rounded-xl p-6">
                  <div className="flex items-center gap-2 mb-5">
                    <FiCreditCard className="text-mid text-sm" />
                    <h2 className="font-bold text-base text-ink">Payment Method</h2>
                  </div>
                  <div className="space-y-3 mb-6">
                    {PAYMENT_METHODS.map(({ id, label, desc, icon: Icon }) => (
                      <label key={id} className={clsx(
                        'flex items-center gap-4 p-4 border rounded-xl cursor-pointer transition-all',
                        paymentMethod === id ? 'border-ink bg-gray-50' : 'border-gray-200 hover:border-gray-300'
                      )}>
                        <input type="radio" name="payment" value={id} checked={paymentMethod === id}
                          onChange={() => setPaymentMethod(id)} className="sr-only" />
                        <div className={clsx('w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0',
                          paymentMethod === id ? 'border-ink' : 'border-gray-300')}>
                          {paymentMethod === id && <div className="w-2.5 h-2.5 rounded-full bg-ink" />}
                        </div>
                        <Icon className={clsx('text-lg flex-shrink-0', paymentMethod === id ? 'text-ink' : 'text-mid')} />
                        <div className="flex-1">
                          <p className={clsx('font-semibold text-sm', paymentMethod === id ? 'text-ink' : 'text-mid')}>{label}</p>
                          <p className="text-xs text-mid mt-0.5">{desc}</p>
                        </div>
                        {paymentMethod === id && <FiCheck className="text-neon flex-shrink-0" />}
                      </label>
                    ))}
                  </div>
                  {/* UPI QR Code panel */}
                  <AnimatePresence>
                    {paymentMethod === 'upi_qr' && upiEnabled && (
                      <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden">
                        <div className="border border-green-200 bg-green-50 rounded-xl p-4 mb-4">
                          <p className="text-xs font-semibold text-green-800 mb-3">Scan karo aur Pay karo — phir UTR number enter karo</p>
                          <div className="flex flex-col sm:flex-row items-center gap-4">
                            <div className="bg-white p-2 rounded-xl border border-green-200 flex-shrink-0">
                              <img src={getImageUrl(settings.upiQrCode)} alt="QR Code"
                                className="w-40 h-40 object-contain" />
                            </div>
                            <div className="flex-1 space-y-2 text-center sm:text-left">
                              <p className="text-sm font-semibold text-gray-800">{settings.upiName}</p>
                              <p className="text-sm text-gray-600 font-mono bg-white border border-gray-200 rounded-lg px-3 py-2 inline-block">
                                {settings.upiId}
                              </p>
                              <p className="text-xs text-gray-500">PhonePe / Paytm / GPay / Any UPI app se scan karo</p>
                              <p className="text-lg font-bold text-gray-900">{formatPrice(total)}</p>
                            </div>
                          </div>
                          <div className="mt-4">
                            <label className="text-xs font-semibold text-gray-700 mb-1 block">
                              UTR / Transaction Reference Number *
                            </label>
                            <input
                              value={utrNumber}
                              onChange={(e) => setUtrNumber(e.target.value)}
                              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-green-500 outline-none"
                              placeholder="12-digit UTR number (payment ke baad milega)"
                            />
                            <p className="text-[11px] text-gray-400 mt-1">Payment successful hone ke baad UPI app mein UTR milega</p>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <div className="flex gap-3">
                    <button onClick={() => setStep(0)} className="flex-1 py-3 border border-gray-200 rounded-xl text-xs font-semibold text-mid hover:border-gray-400 hover:text-ink transition-all">
                      ← Back
                    </button>
                    <button
                      onClick={() => {
                        if (paymentMethod === 'upi_qr' && !utrNumber.trim()) {
                          toast.error('UTR number enter karo'); return;
                        }
                        setStep(2);
                      }}
                      className="flex-1 btn-primary py-3 text-sm flex items-center justify-center gap-2">
                      Review Order <FiChevronRight />
                    </button>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Step 2: Confirm */}
            {step === 2 && (
              <motion.div key="confirm" initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }} transition={{ duration: 0.25 }} className="space-y-3">
                <div className="bg-white border border-gray-200 rounded-xl p-5">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <FiMapPin className="text-mid text-sm" />
                      <h2 className="font-semibold text-sm text-ink">Delivery Address</h2>
                    </div>
                    <button onClick={() => setStep(0)} className="text-xs text-blue-600 hover:underline">Edit</button>
                  </div>
                  {savedAddress && (
                    <div className="text-sm text-mid space-y-0.5">
                      <p className="font-semibold text-ink">{savedAddress.fullName}</p>
                      <p>{savedAddress.addressLine1}{savedAddress.addressLine2 && `, ${savedAddress.addressLine2}`}</p>
                      <p>{savedAddress.city}, {savedAddress.state} – {savedAddress.pincode}</p>
                      <p>📞 {savedAddress.phone}</p>
                    </div>
                  )}
                </div>

                <div className="bg-white border border-gray-200 rounded-xl p-5">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <FiCreditCard className="text-mid text-sm" />
                      <h2 className="font-semibold text-sm text-ink">Payment</h2>
                    </div>
                    <button onClick={() => setStep(1)} className="text-xs text-blue-600 hover:underline">Edit</button>
                  </div>
                  <p className="text-sm text-mid">{paymentMethod === 'cod' ? 'Cash on Delivery' : 'Online Payment (Razorpay)'}</p>
                </div>

                <div className="bg-white border border-gray-200 rounded-xl p-5">
                  <h2 className="font-semibold text-sm text-ink mb-3">Order Items</h2>
                  <div className="space-y-3">
                    {items.map((item) => (
                      <div key={`${item.product}-${item.size}-${item.color}`} className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-lg overflow-hidden bg-gray-50 border border-gray-100 flex-shrink-0">
                          <img src={item.image || ''} alt={item.name} className="w-full h-full object-cover" onError={(e) => { e.target.style.display = 'none'; }} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium text-ink truncate">{item.name}</p>
                          <p className="text-[10px] text-mid mt-0.5">{item.size} · {item.color} · Qty: {item.quantity}</p>
                        </div>
                        <p className="text-sm font-semibold text-ink flex-shrink-0">{formatPrice(item.price * item.quantity)}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex gap-3">
                  <button onClick={() => setStep(1)} className="flex-1 py-3 border border-gray-200 rounded-xl text-xs font-semibold text-mid hover:border-gray-400 hover:text-ink transition-all">
                    ← Back
                  </button>
                  <button onClick={handlePlaceOrder} disabled={loading}
                    className="flex-1 btn-primary py-3.5 text-sm disabled:opacity-60">
                    {loading ? 'Processing...' : `Place Order · ${formatPrice(total)}`}
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Summary Sidebar */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <div className="bg-white border border-gray-200 rounded-xl p-5 sticky top-32">
            <h2 className="font-bold text-sm text-ink mb-4">Order Summary</h2>
            <div className="space-y-2.5 text-sm">
              <div className="flex justify-between">
                <span className="text-mid">Subtotal</span>
                <span className="text-ink font-medium">{formatPrice(subtotal)}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-neon">
                  <span>Discount</span>
                  <span>−{formatPrice(discount)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-mid">Shipping</span>
                <span className={shippingCharge === 0 ? 'text-neon font-medium' : 'text-ink'}>
                  {shippingCharge === 0 ? 'FREE' : formatPrice(shippingCharge)}
                </span>
              </div>
              <div className="border-t border-gray-100 pt-2.5 flex justify-between font-bold text-base">
                <span className="text-ink">Total</span>
                <span className="text-ink">{formatPrice(total)}</span>
              </div>
            </div>
            <div className="mt-4 space-y-2 border-t border-gray-100 pt-4">
              {items.slice(0, 3).map((item) => (
                <div key={`${item.product}-${item.size}`} className="flex items-center gap-2">
                  <div className="w-9 h-9 rounded-lg overflow-hidden bg-gray-50 border border-gray-100 flex-shrink-0">
                    <img src={item.image || ''} alt="" className="w-full h-full object-cover" onError={(e) => { e.target.style.display = 'none'; }} />
                  </div>
                  <p className="text-xs text-mid truncate flex-1">{item.name}</p>
                  <p className="text-xs text-mid flex-shrink-0">×{item.quantity}</p>
                </div>
              ))}
              {items.length > 3 && <p className="text-xs text-mid text-center">+{items.length - 3} more items</p>}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
