import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import api from '../utils/api';
import toast from 'react-hot-toast';

const useWishlistStore = create(
  persist(
    (set, get) => ({
      items: [],

      toggle: async (product, isLoggedIn) => {
        const items = get().items;
        const isIn = items.some((i) => i._id === product._id || i === product._id);

        if (isLoggedIn) {
          try {
            await api.post(`/auth/wishlist/${product._id}`);
          } catch {}
        }

        if (isIn) {
          set({ items: items.filter((i) => (i._id || i) !== product._id) });
          toast.success('Removed from wishlist');
        } else {
          set({ items: [...items, product] });
          toast.success('Added to wishlist!');
        }
      },

      isInWishlist: (productId) => get().items.some((i) => (i._id || i) === productId),

      clearWishlist: () => set({ items: [] }),
    }),
    { name: 'veloq-wishlist' }
  )
);

export default useWishlistStore;
