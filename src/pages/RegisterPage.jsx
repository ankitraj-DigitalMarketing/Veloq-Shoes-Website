import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import useAuthStore from '../store/authStore';
import { FiEye, FiEyeOff, FiArrowRight } from 'react-icons/fi';

export default function RegisterPage() {
  const [showPass, setShowPass] = useState(false);
  const { register: registerUser, isLoading } = useAuthStore();
  const navigate = useNavigate();
  const { register, handleSubmit, watch, formState: { errors } } = useForm();

  const onSubmit = async (data) => {
    const result = await registerUser(data.name, data.email, data.password, data.phone);
    if (result.success) navigate('/');
  };

  return (
    <div className="min-h-screen bg-void flex">
      {/* Left panel */}
      <div className="hidden lg:flex flex-1 bg-ink items-center justify-center relative overflow-hidden">
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 50, repeat: Infinity, ease: 'linear' }}
          className="absolute w-[500px] h-[500px] rounded-full border border-white/5" />
        <div className="relative z-10 text-center px-12">
          <h1 className="font-display text-[7rem] leading-none tracking-tight text-white">VELOQ</h1>
          <p className="text-white/30 text-sm tracking-[0.4em] uppercase mt-2">Join the Movement</p>
          <div className="grid grid-cols-3 gap-3 mt-10">
            {['9+ Styles', '500+ Customers', '4.9★ Rated'].map((s) => (
              <div key={s} className="border border-white/10 rounded-xl p-3 text-center">
                <p className="text-white/70 text-xs font-semibold">{s}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right form */}
      <div className="flex-1 flex items-center justify-center px-6 py-10 bg-white overflow-y-auto">
        <motion.div initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }}
          className="w-full max-w-md">
          <Link to="/" className="font-display text-3xl tracking-[0.2em] text-ink mb-8 block lg:hidden">VELOQ</Link>

          <h1 className="text-3xl font-bold text-ink mb-1">Create Account</h1>
          <p className="text-mid text-sm mb-7">
            Already a member?{' '}
            <Link to="/login" className="text-blue-600 hover:underline font-semibold">Sign in</Link>
          </p>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-ink mb-1 block">Full Name</label>
              <input {...register('name', { required: 'Required', minLength: { value: 2, message: 'Min 2 characters' } })}
                className="input-field" placeholder="Your name" />
              {errors.name && <p className="text-sale text-xs mt-1">{errors.name.message}</p>}
            </div>
            <div>
              <label className="text-xs font-semibold text-ink mb-1 block">Email</label>
              <input {...register('email', { required: 'Required', pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Invalid email' } })}
                className="input-field" placeholder="your@email.com" type="email" />
              {errors.email && <p className="text-sale text-xs mt-1">{errors.email.message}</p>}
            </div>
            <div>
              <label className="text-xs font-semibold text-ink mb-1 block">Phone (Optional)</label>
              <input {...register('phone')} className="input-field" placeholder="10-digit number" type="tel" />
            </div>
            <div>
              <label className="text-xs font-semibold text-ink mb-1 block">Password</label>
              <div className="relative">
                <input {...register('password', { required: 'Required', minLength: { value: 6, message: 'Min 6 characters' } })}
                  className="input-field pr-11" placeholder="Min 6 characters" type={showPass ? 'text' : 'password'} />
                <button type="button" onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-mid hover:text-ink transition-colors">
                  {showPass ? <FiEyeOff /> : <FiEye />}
                </button>
              </div>
              {errors.password && <p className="text-sale text-xs mt-1">{errors.password.message}</p>}
            </div>
            <div>
              <label className="text-xs font-semibold text-ink mb-1 block">Confirm Password</label>
              <input {...register('confirmPassword', {
                required: 'Required',
                validate: (v) => v === watch('password') || 'Passwords do not match',
              })} className="input-field" placeholder="Repeat password" type="password" />
              {errors.confirmPassword && <p className="text-sale text-xs mt-1">{errors.confirmPassword.message}</p>}
            </div>

            <button type="submit" disabled={isLoading}
              className="w-full btn-primary py-3.5 text-sm mt-2 flex items-center justify-center gap-2 disabled:opacity-60">
              {isLoading ? 'Creating account...' : <> Create Account <FiArrowRight /> </>}
            </button>
          </form>
        </motion.div>
      </div>
    </div>
  );
}
