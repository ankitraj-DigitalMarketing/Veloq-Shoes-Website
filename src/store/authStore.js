import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import api from '../utils/api';
import toast from 'react-hot-toast';

const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isLoading: false,

      login: async (email, password) => {
        set({ isLoading: true });
        try {
          const data = await api.post('/auth/login', { email, password });
          localStorage.setItem('veloq_token', data.token);
          set({ user: data.user, token: data.token, isLoading: false });
          toast.success(`Welcome back, ${data.user.name}!`);
          return { success: true, role: data.user.role };
        } catch (err) {
          set({ isLoading: false });
          toast.error(err.message || 'Login failed');
          return { success: false };
        }
      },

      register: async (name, email, password, phone) => {
        set({ isLoading: true });
        try {
          const data = await api.post('/auth/register', { name, email, password, phone });
          localStorage.setItem('veloq_token', data.token);
          set({ user: data.user, token: data.token, isLoading: false });
          toast.success('Account created successfully!');
          return { success: true };
        } catch (err) {
          set({ isLoading: false });
          toast.error(err.message || 'Registration failed');
          return { success: false };
        }
      },

      logout: () => {
        localStorage.removeItem('veloq_token');
        set({ user: null, token: null });
        toast.success('Logged out successfully');
      },

      fetchMe: async () => {
        try {
          const data = await api.get('/auth/me');
          set({ user: data.user });
        } catch {
          set({ user: null, token: null });
          localStorage.removeItem('veloq_token');
        }
      },

      isAuthenticated: () => !!get().token,
      isAdmin: () => get().user?.role === 'admin',
    }),
    { name: 'veloq-auth', partialize: (state) => ({ user: state.user, token: state.token }) }
  )
);

export default useAuthStore;
