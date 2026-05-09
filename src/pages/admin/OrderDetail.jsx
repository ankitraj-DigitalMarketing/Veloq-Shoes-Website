import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { FiArrowLeft } from 'react-icons/fi';
import api from '../../utils/api';
import { formatPrice, formatDate, ORDER_STATUS_COLORS } from '../../utils/helpers';
import { PageLoader } from '../../components/common/LoadingSpinner';
import toast from 'react-hot-toast';
import clsx from 'clsx';

const ORDER_STATUSES = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'returned'];

export default function AdminOrderDetail() {
  const { id } = useParams();
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['adminOrder', id],
    queryFn: () => api.get(`/admin/orders/${id}`),
  });

  const { register, handleSubmit } = useForm();

  const updateMutation = useMutation({
    mutationFn: (data) => api.put(`/admin/orders/${id}/status`, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['adminOrder', id]);
      toast.success('Order updated');
    },
    onError: (err) => toast.error(err.message),
  });

  if (isLoading) return <PageLoader />;
  const order = data?.order;

  return (
    <div className="max-w-5xl space-y-6">
      <div className="flex items-center gap-4">
        <Link to="/admin/orders" className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
          <FiArrowLeft className="text-xl" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold">{order?.orderNumber}</h1>
          <p className="text-gray-400 text-sm">{formatDate(order?.createdAt)}</p>
        </div>
        <span className={clsx('badge ml-auto text-sm px-4 py-1.5 capitalize font-semibold', ORDER_STATUS_COLORS[order?.orderStatus])}>
          {order?.orderStatus}
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Items */}
          <div className="card p-6">
            <h2 className="font-bold text-lg mb-4">Order Items</h2>
            {order?.items?.map((item, i) => (
              <div key={i} className="flex items-center gap-4 py-3 border-b last:border-0">
                <img src={item.image || 'https://placehold.co/60x60/f5f5f5/999?text=V'} alt={item.name}
                  className="w-16 h-16 object-cover rounded-xl bg-gray-100" />
                <div className="flex-1">
                  <p className="font-semibold">{item.name}</p>
                  <p className="text-sm text-gray-400">{item.size} · {item.color} · Qty: {item.quantity}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold">{formatPrice(item.price * item.quantity)}</p>
                  <p className="text-xs text-gray-400">{formatPrice(item.price)} each</p>
                </div>
              </div>
            ))}
            <div className="mt-4 pt-4 border-t space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-gray-500">Subtotal</span><span>{formatPrice(order?.subtotal)}</span></div>
              {order?.discount > 0 && <div className="flex justify-between text-green-600"><span>Discount</span><span>−{formatPrice(order.discount)}</span></div>}
              <div className="flex justify-between"><span className="text-gray-500">Shipping</span><span>{order?.shippingCharge === 0 ? 'FREE' : formatPrice(order?.shippingCharge)}</span></div>
              <div className="flex justify-between font-bold text-base border-t pt-2"><span>Total</span><span>{formatPrice(order?.total)}</span></div>
            </div>
          </div>

          {/* Update Status */}
          <div className="card p-6">
            <h2 className="font-bold text-lg mb-4">Update Order</h2>
            <form onSubmit={handleSubmit(updateMutation.mutate)} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-1 block">Order Status</label>
                  <select {...register('orderStatus')} defaultValue={order?.orderStatus} className="input-field">
                    {ORDER_STATUSES.map((s) => <option key={s} value={s} className="capitalize">{s}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">Courier Name</label>
                  <input {...register('courierName')} defaultValue={order?.courierName} className="input-field" placeholder="Delhivery, Bluedart..." />
                </div>
                <div className="md:col-span-2">
                  <label className="text-sm font-medium mb-1 block">Tracking Number</label>
                  <input {...register('trackingNumber')} defaultValue={order?.trackingNumber} className="input-field" placeholder="AWB12345678" />
                </div>
                <div className="md:col-span-2">
                  <label className="text-sm font-medium mb-1 block">Notes</label>
                  <textarea {...register('notes')} defaultValue={order?.notes} rows={2} className="input-field resize-none" placeholder="Internal notes..." />
                </div>
              </div>
              <button type="submit" disabled={updateMutation.isPending} className="btn-primary">
                {updateMutation.isPending ? 'Saving...' : 'Update Order'}
              </button>
            </form>
          </div>
        </div>

        <div className="space-y-6">
          {/* Customer */}
          <div className="card p-6">
            <h2 className="font-bold mb-3">Customer</h2>
            <p className="font-semibold">{order?.user?.name}</p>
            <p className="text-sm text-gray-400">{order?.user?.email}</p>
            <p className="text-sm text-gray-400">{order?.user?.phone}</p>
          </div>

          {/* Shipping */}
          <div className="card p-6">
            <h2 className="font-bold mb-3">Delivery Address</h2>
            <p className="text-sm leading-relaxed">
              <strong>{order?.shippingAddress?.fullName}</strong><br />
              {order?.shippingAddress?.addressLine1}<br />
              {order?.shippingAddress?.addressLine2 && <>{order.shippingAddress.addressLine2}<br /></>}
              {order?.shippingAddress?.city}, {order?.shippingAddress?.state}<br />
              {order?.shippingAddress?.pincode}<br />
              📞 {order?.shippingAddress?.phone}
            </p>
          </div>

          {/* Payment */}
          <div className="card p-6">
            <h2 className="font-bold mb-3">Payment</h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Method</span>
                <span className="capitalize font-medium">{order?.paymentMethod}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Status</span>
                <span className={clsx('font-medium', order?.paymentStatus === 'paid' ? 'text-green-600' : 'text-yellow-600')}>
                  {order?.paymentStatus}
                </span>
              </div>
              {order?.razorpayPaymentId && (
                <div className="text-xs text-gray-400 break-all">ID: {order.razorpayPaymentId}</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
