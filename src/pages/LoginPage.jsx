import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import useAuthStore from '../store/authStore';
import { FiEye, FiEyeOff, FiArrowRight } from 'react-icons/fi';

export default function LoginPage() {
  const [showPass, setShowPass] = useState(false);
  const { login, isLoading } = useAuthStore();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirect = searchParams.get('redirect') || '/';
  const { register, handleSubmit, formState: { errors } } = useForm();

  const onSubmit = async (data) => {
    const result = await login(data.email, data.password);
    if (result.success) navigate(result.role === 'admin' ? '/admin' : redirect);
  };

  return (
    <div className="min-h-screen bg-void flex">
      {/* Left decorative panel */}
      <div className="hidden lg:flex flex-1 bg-ink items-center justify-center relative overflow-hidden">
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 50, repeat: Infinity, ease: 'linear' }}
          className="absolute w-[500px] h-[500px] rounded-full border border-white/5" />
        <motion.div animate={{ rotate: -360 }} transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
          className="absolute w-[300px] h-[300px] rounded-full border border-white/8" />
        <div className="relative z-10 text-center px-12">
          <h1 className="font-display text-[8rem] leading-none tracking-tight text-white">VELOQ</h1>
          <p className="text-white/30 text-sm tracking-[0.4em] uppercase mt-2">Step Into Your Era</p>
          <div className="flex gap-4 justify-center mt-10">
            {['Free Delivery', '100% Authentic', 'Easy Returns'].map((s) => (
              <div key={s} className="border border-white/10 rounded-xl px-4 py-2.5 text-center">
                <p className="text-white/60 text-xs font-semibold">{s}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right form */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 bg-white">
        <motion.div initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }}
          className="w-full max-w-md">
          <Link to="/" className="font-display text-3xl tracking-[0.2em] text-ink mb-10 block lg:hidden">VELOQ</Link>

          <h1 className="text-3xl font-bold text-ink mb-1">Welcome back</h1>
          <p className="text-mid text-sm mb-8">
            New here?{' '}
            <Link to="/register" className="text-blue-600 hover:underline font-semibold">Create account</Link>
          </p>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-ink mb-1 block">Email</label>
              <input
                {...register('email', { required: 'Required', pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Invalid email' } })}
                className="input-field" placeholder="your@email.com" type="email"
              />
              {errors.email && <p className="text-sale text-xs mt-1">{errors.email.message}</p>}
            </div>

            <div>
              <label className="text-xs font-semibold text-ink mb-1 block">Password</label>
              <div className="relative">
                <input
                  {...register('password', { required: 'Required', minLength: { value: 6, message: 'Min 6 characters' } })}
                  className="input-field pr-11" placeholder="••••••••"
                  type={showPass ? 'text' : 'password'}
                />
                <button type="button" onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-mid hover:text-ink transition-colors">
                  {showPass ? <FiEyeOff /> : <FiEye />}
                </button>
              </div>
              {errors.password && <p className="text-sale text-xs mt-1">{errors.password.message}</p>}
            </div>

            <button type="submit" disabled={isLoading}
              className="w-full btn-primary py-3.5 text-sm mt-2 flex items-center justify-center gap-2 disabled:opacity-60">
              {isLoading ? 'Signing in...' : <> Sign In <FiArrowRight /> </>}
            </button>
          </form>
        </motion.div>
      </div>
    </div>
  );
}
