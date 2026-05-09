import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { motion, AnimatePresence } from 'framer-motion';
import { FiUser, FiMapPin, FiLock, FiPlus, FiTrash2, FiLogOut, FiPackage } from 'react-icons/fi';
import useAuthStore from '../store/authStore';
import api from '../utils/api';
import toast from 'react-hot-toast';
import clsx from 'clsx';
import { Link } from 'react-router-dom';

const TABS = [
  { id: 'profile',   label: 'Profile',    icon: FiUser },
  { id: 'addresses', label: 'Addresses',  icon: FiMapPin },
  { id: 'password',  label: 'Security',   icon: FiLock },
];

export default function AccountPage() {
  const [activeTab, setActiveTab] = useState('profile');
  const [addingAddress, setAddingAddress] = useState(false);
  const { user, fetchMe, logout } = useAuthStore();

  const profileForm = useForm({ defaultValues: { name: user?.name, phone: user?.phone } });
  const passwordForm = useForm();
  const addressForm = useForm();

  const onProfileSave = async (data) => {
    try {
      await api.put('/auth/profile', data);
      await fetchMe();
      toast.success('Profile updated!');
    } catch (err) {
      toast.error(err.message);
    }
  };

  const onPasswordChange = async (data) => {
    try {
      await api.put('/auth/change-password', data);
      passwordForm.reset();
      toast.success('Password changed!');
    } catch (err) {
      toast.error(err.message);
    }
  };

  const onAddAddress = async (data) => {
    try {
      await api.post('/auth/address', data);
      await fetchMe();
      addressForm.reset();
      setAddingAddress(false);
      toast.success('Address added!');
    } catch (err) {
      toast.error(err.message);
    }
  };

  const deleteAddress = async (addressId) => {
    try {
      await api.delete(`/auth/address/${addressId}`);
      await fetchMe();
      toast.success('Address deleted');
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <h1 className="text-2xl font-bold text-ink">My Account</h1>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
        {/* Sidebar */}
        <div className="md:col-span-1">
          <div className="bg-white border border-gray-200 rounded-xl p-4">
            <div className="text-center border-b border-gray-100 mb-4 pb-4">
              <div className="w-14 h-14 bg-ink rounded-full flex items-center justify-center text-xl font-bold text-white mx-auto mb-2">
                {user?.name?.[0]?.toUpperCase()}
              </div>
              <p className="font-semibold text-sm text-ink">{user?.name}</p>
              <p className="text-xs text-mid mt-0.5 truncate">{user?.email}</p>
            </div>

            {TABS.map(({ id, label, icon: Icon }) => (
              <button key={id} onClick={() => setActiveTab(id)}
                className={clsx('w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-semibold text-left transition-all mb-0.5',
                  activeTab === id ? 'bg-ink text-white' : 'text-mid hover:text-ink hover:bg-gray-50')}>
                <Icon className="text-base flex-shrink-0" />{label}
              </button>
            ))}

            <div className="border-t border-gray-100 mt-3 pt-3">
              <Link to="/orders">
                <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-semibold text-mid hover:text-ink hover:bg-gray-50 transition-all mb-0.5 text-left">
                  <FiPackage className="text-base flex-shrink-0" />My Orders
                </button>
              </Link>
              <button onClick={logout}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-semibold text-red-500 hover:bg-red-50 transition-all text-left">
                <FiLogOut className="text-base flex-shrink-0" />Sign Out
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="md:col-span-3">
          <AnimatePresence mode="wait">
            {activeTab === 'profile' && (
              <motion.div key="profile" initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }} transition={{ duration: 0.2 }}
                className="bg-white border border-gray-200 rounded-xl p-6">
                <h2 className="font-bold text-lg text-ink mb-6">Edit Profile</h2>
                <form onSubmit={profileForm.handleSubmit(onProfileSave)} className="space-y-4 max-w-md">
                  <div>
                    <label className="text-xs font-semibold text-ink mb-1 block">Full Name</label>
                    <input {...profileForm.register('name', { required: true })} className="input-field" />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-ink mb-1 block">Email</label>
                    <input value={user?.email} disabled className="input-field opacity-50 cursor-not-allowed" />
                    <p className="text-mid text-[10px] mt-1">Email cannot be changed</p>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-ink mb-1 block">Phone</label>
                    <input {...profileForm.register('phone')} className="input-field" placeholder="10-digit mobile" />
                  </div>
                  <button type="submit" className="btn-primary px-6 py-2.5 text-sm inline-flex">Save Changes</button>
                </form>
              </motion.div>
            )}

            {activeTab === 'addresses' && (
              <motion.div key="addresses" initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }} transition={{ duration: 0.2 }}
                className="bg-white border border-gray-200 rounded-xl p-6">
                <div className="flex items-center justify-between mb-5">
                  <h2 className="font-bold text-lg text-ink">Saved Addresses</h2>
                  <button onClick={() => setAddingAddress(true)}
                    className="flex items-center gap-2 px-3 py-2 border border-gray-200 rounded-lg text-xs font-semibold text-mid hover:border-ink hover:text-ink transition-all">
                    <FiPlus /> Add New
                  </button>
                </div>

                {user?.addresses?.length === 0 && !addingAddress && (
                  <div className="text-center py-12">
                    <FiMapPin className="text-3xl text-gray-200 mx-auto mb-2" />
                    <p className="text-mid text-sm">No saved addresses yet</p>
                  </div>
                )}

                <div className="space-y-3 mb-4">
                  <AnimatePresence>
                    {user?.addresses?.map((addr, i) => (
                      <motion.div key={addr._id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ delay: i * 0.05 }}
                        className="border border-gray-200 rounded-lg p-4 relative group hover:border-gray-300 transition-colors">
                        {addr.isDefault && (
                          <span className="text-[9px] text-neon bg-green-50 border border-green-200 px-2 py-0.5 rounded-full font-bold uppercase mb-1 inline-block">Default</span>
                        )}
                        <p className="font-semibold text-sm text-ink">{addr.fullName}</p>
                        <p className="text-xs text-mid mt-0.5">{addr.addressLine1}, {addr.city}</p>
                        <p className="text-xs text-mid">{addr.state} — {addr.pincode}</p>
                        <p className="text-xs text-mid mt-0.5">📞 {addr.phone}</p>
                        <button onClick={() => deleteAddress(addr._id)}
                          className="absolute top-3 right-3 text-mid hover:text-sale transition-colors opacity-0 group-hover:opacity-100">
                          <FiTrash2 className="text-sm" />
                        </button>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>

                <AnimatePresence>
                  {addingAddress && (
                    <motion.form initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                      onSubmit={addressForm.handleSubmit(onAddAddress)}
                      className="border border-gray-200 rounded-lg p-4 space-y-3">
                      <h3 className="font-semibold text-sm text-ink">New Address</h3>
                      <div className="grid grid-cols-2 gap-3">
                        <input {...addressForm.register('fullName', { required: true })} className="input-field col-span-2 text-sm py-2.5" placeholder="Full Name *" />
                        <input {...addressForm.register('phone', { required: true })} className="input-field text-sm py-2.5" placeholder="Phone *" />
                        <input {...addressForm.register('pincode', { required: true })} className="input-field text-sm py-2.5" placeholder="Pincode *" />
                        <input {...addressForm.register('addressLine1', { required: true })} className="input-field col-span-2 text-sm py-2.5" placeholder="Address Line 1 *" />
                        <input {...addressForm.register('city', { required: true })} className="input-field text-sm py-2.5" placeholder="City *" />
                        <input {...addressForm.register('state', { required: true })} className="input-field text-sm py-2.5" placeholder="State *" />
                      </div>
                      <div className="flex gap-2">
                        <button type="submit" className="btn-primary px-5 py-2.5 text-sm inline-flex">Save Address</button>
                        <button type="button" onClick={() => setAddingAddress(false)} className="btn-outline px-5 py-2.5 text-sm">Cancel</button>
                      </div>
                    </motion.form>
                  )}
                </AnimatePresence>
              </motion.div>
            )}

            {activeTab === 'password' && (
              <motion.div key="password" initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }} transition={{ duration: 0.2 }}
                className="bg-white border border-gray-200 rounded-xl p-6">
                <h2 className="font-bold text-lg text-ink mb-6">Change Password</h2>
                <form onSubmit={passwordForm.handleSubmit(onPasswordChange)} className="space-y-4 max-w-md">
                  <div>
                    <label className="text-xs font-semibold text-ink mb-1 block">Current Password</label>
                    <input {...passwordForm.register('currentPassword', { required: true })} className="input-field" type="password" placeholder="••••••••" />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-ink mb-1 block">New Password</label>
                    <input {...passwordForm.register('newPassword', { required: true, minLength: { value: 6, message: 'Min 6 characters' } })}
                      className="input-field" type="password" placeholder="Min 6 characters" />
                    {passwordForm.formState.errors.newPassword && (
                      <p className="text-sale text-xs mt-1">{passwordForm.formState.errors.newPassword.message}</p>
                    )}
                  </div>
                  <button type="submit" className="btn-primary px-6 py-2.5 text-sm inline-flex">Update Password</button>
                </form>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
